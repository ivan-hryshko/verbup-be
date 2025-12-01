import createHttpError from 'http-errors'
import { IrrWordRepository } from '../../irr-words/irr-words.repository'
import { IrrWordLang, IrrWordLevel, IrrWordType } from '../../irr-words/irr-words.types'
import { GameWord, GameWordType } from '../games.type'
import { UsersRepository } from '../../users/users.repository'

interface GetWordsDto {
  level?: string
  count?: string | number
  lang?: string
  userId?: number | null
  irrWordType?: GameWordType
}

interface ValidatedGetWordsDto {
  level: IrrWordLevel
  count: number
  lang: IrrWordLang
  userId: number
  irrWordType: GameWordType
}

interface WordSelection {
  priorityWords: GameWord[]
  fillerWords: GameWord[]
}

export class GetWordService {
  private irrWordRepo: IrrWordRepository
  private readonly usersRepository = new UsersRepository()
  private readonly PROGRESS_STATUSES = ['mistake', 'in_progress']

  constructor() {
    this.irrWordRepo = new IrrWordRepository()
  }

  async validate(dto: GetWordsDto): Promise<ValidatedGetWordsDto> {
    const { count, lang, irrWordType } = dto
    if (!dto?.level || !['easy', 'medium', 'hard'].includes(dto?.level)) {
      throw createHttpError(400, 'Invalid or missing "level" param')
    }

    const wordCount = Number(count)
    if (!wordCount || isNaN(wordCount) || wordCount <= 0) {
      throw createHttpError(400, 'Invalid or missing "count" param')
    }

    if (!lang || !['en', 'uk'].includes(lang)) {
      throw createHttpError(400, 'Invalid or missing "lang" param')
    }
    if (!irrWordType || !Object.values(GameWordType).includes(irrWordType)) {
      throw createHttpError(400, 'Invalid or missing "irrWordType" param')
    }

    const userId = Number(dto.userId)
    if (!userId || isNaN(userId) || userId <= 0) {
      throw createHttpError(401, 'Invalid Authorization header')
    }
    const user = await this.usersRepository.findById(userId)
    if (!user) throw createHttpError(404, `User with id: ${dto.userId} not found`)

    return {
      level: dto.level as IrrWordLevel,
      count: wordCount,
      lang: lang as IrrWordLang,
      userId,
      irrWordType,
    }
  }

  async execute(dto: GetWordsDto): Promise<GameWord[]> {
    const validatedDto = await this.validate(dto)
    const { irrWordType } = validatedDto

    let wordSelection: WordSelection

    if (irrWordType === GameWordType.PS) {
      wordSelection = await this.getPsWords(validatedDto)
    } else if (irrWordType === GameWordType.PP) {
      wordSelection = await this.getPpWords(validatedDto)
    } else {
      wordSelection = await this.getMixedWords(validatedDto)
    }

    const finalWords = this.combineAndLimitWords(
      wordSelection.priorityWords,
      wordSelection.fillerWords,
      validatedDto.count,
    )

    return this.formatWords(finalWords)
  }

  /**
   * Get Past Simple words with cross-type priority
   * Priority: PP progress → PS progress → not learned → all
   */
  private async getPsWords(dto: ValidatedGetWordsDto): Promise<WordSelection> {
    const { level, count, lang, userId } = dto

    // Priority 1: Words with PP progress (cross-type priority)
    const wordsWithPpProgress = await this.getWordsWithProgress(
      IrrWordType.PP,
      IrrWordType.PS,
      level,
      lang,
      userId,
    )

    let priorityWords = [...wordsWithPpProgress]

    // Priority 2: Words with PS progress
    if (priorityWords.length < count) {
      const wordsWithPsProgress = await this.getWordsWithProgress(
        IrrWordType.PS,
        IrrWordType.PS,
        level,
        lang,
        userId,
      )
      priorityWords = this.mergeWithoutDuplicates(priorityWords, wordsWithPsProgress)
    }

    // Filler: Not learned PS words
    const fillerWords = await this.getFillerWords(
      IrrWordType.PS,
      priorityWords,
      level,
      lang,
      userId,
      count,
    )

    return { priorityWords, fillerWords }
  }

  /**
   * Get Past Participle words with cross-type priority
   * Priority: PS progress → PP progress → not learned → all
   */
  private async getPpWords(dto: ValidatedGetWordsDto): Promise<WordSelection> {
    const { level, count, lang, userId } = dto

    // Priority 1: Words with PS progress (cross-type priority)
    const wordsWithPsProgress = await this.getWordsWithProgress(
      IrrWordType.PS,
      IrrWordType.PP,
      level,
      lang,
      userId,
    )

    let priorityWords = [...wordsWithPsProgress]

    // Priority 2: Words with PP progress
    if (priorityWords.length < count) {
      const wordsWithPpProgress = await this.getWordsWithProgress(
        IrrWordType.PP,
        IrrWordType.PP,
        level,
        lang,
        userId,
      )
      priorityWords = this.mergeWithoutDuplicates(priorityWords, wordsWithPpProgress)
    }

    // Filler: Not learned PP words
    const fillerWords = await this.getFillerWords(
      IrrWordType.PP,
      priorityWords,
      level,
      lang,
      userId,
      count,
    )

    return { priorityWords, fillerWords }
  }

  /**
   * Get mixed words (both PS and PP) with priority
   * Priority: PS progress + PP progress → not learned → all
   */
  private async getMixedWords(dto: ValidatedGetWordsDto): Promise<WordSelection> {
    const { level, count, lang, userId } = dto

    // Priority: Both PS and PP words with progress
    const [psWithProgress, ppWithProgress] = await Promise.all([
      this.getWordsWithProgress(IrrWordType.PS, IrrWordType.PS, level, lang, userId),
      this.getWordsWithProgress(IrrWordType.PP, IrrWordType.PP, level, lang, userId),
    ])

    const priorityWords = [...psWithProgress, ...ppWithProgress]

    // Filler: Not learned words from both types
    let fillerWords: GameWord[] = []

    if (priorityWords.length < count) {
      const [additionalPsWords, additionalPpWords] = await Promise.all([
        this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PS, level, lang, userId),
        this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PP, level, lang, userId),
      ])

      const newPsWords = this.filterExistingWords(additionalPsWords, priorityWords)
      const newPpWords = this.filterExistingWords(additionalPpWords, priorityWords)
      fillerWords = [...newPsWords, ...newPpWords]
    }

    // Fallback: All words if nothing found
    if (priorityWords.length === 0 && fillerWords.length === 0) {
      const [allPsWords, allPpWords] = await Promise.all([
        this.irrWordRepo.getAllWordsByType(IrrWordType.PS, level, lang),
        this.irrWordRepo.getAllWordsByType(IrrWordType.PP, level, lang),
      ])
      fillerWords = [...allPsWords, ...allPpWords]
    }

    return { priorityWords, fillerWords }
  }

  /**
   * Fetch words with mistake or in_progress status
   */
  private async getWordsWithProgress(
    progressType: IrrWordType,
    returnType: IrrWordType,
    level: IrrWordLevel,
    lang: IrrWordLang,
    userId: number,
  ): Promise<GameWord[]> {
    return this.irrWordRepo.getWordsByProgressStatus(
      progressType,
      returnType,
      level,
      lang,
      userId,
      this.PROGRESS_STATUSES,
    )
  }

  /**
   * Get filler words for a specific type
   * Tries not-learned words first, then falls back to all words
   */
  private async getFillerWords(
    type: IrrWordType,
    priorityWords: GameWord[],
    level: IrrWordLevel,
    lang: IrrWordLang,
    userId: number,
    count: number,
  ): Promise<GameWord[]> {
    if (priorityWords.length >= count) {
      return []
    }

    // Try not learned words first
    const notLearnedWords = await this.irrWordRepo.getNotLearnedWordsByType(
      type,
      level,
      lang,
      userId,
    )
    const filtered = this.filterExistingWords(notLearnedWords, priorityWords)

    if (filtered.length > 0 || priorityWords.length > 0) {
      return filtered
    }

    // Fallback: get all words
    return this.irrWordRepo.getAllWordsByType(type, level, lang)
  }

  /**
   * Combine priority and filler words, ensuring priority words come first
   */
  private combineAndLimitWords(
    priorityWords: GameWord[],
    fillerWords: GameWord[],
    count: number,
  ): GameWord[] {
    const remainingSlots = count - priorityWords.length
    const shuffledFillers = this.shuffleArray(fillerWords).slice(0, remainingSlots)
    return [...priorityWords, ...shuffledFillers].slice(0, count)
  }

  /**
   * Format words by including only relevant fields based on type
   */
  private formatWords(words: GameWord[]): GameWord[] {
    return words.map((word) => {
      const base = {
        id: word.id,
        basic: word.basic,
        basicSound: word.basicSound,
        image: word.image,
        type: word.type,
      }

      if (word.type === IrrWordType.PS) {
        return {
          ...base,
          pastSimple: word.pastSimple,
          psSound: word.psSound,
        }
      } else {
        return {
          ...base,
          pastParticiple: word.pastParticiple,
          ppSound: word.ppSound,
        }
      }
    })
  }

  /**
   * Merge two word arrays without duplicates
   */
  private mergeWithoutDuplicates(existing: GameWord[], newWords: GameWord[]): GameWord[] {
    const filtered = this.filterExistingWords(newWords, existing)
    return [...existing, ...filtered]
  }

  /**
   * Filter out words that already exist in the existing array
   */
  private filterExistingWords(words: GameWord[], existingWords: GameWord[]): GameWord[] {
    return words.filter((word) => !existingWords.find((existing) => existing.id === word.id))
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5)
  }
}
