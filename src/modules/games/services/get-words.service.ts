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

export class GetWordService {
  private irrWordRepo: IrrWordRepository
  private readonly usersRepository = new UsersRepository()

  constructor() {
    this.irrWordRepo = new IrrWordRepository()
  }

  async validate(dto: GetWordsDto) {
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
    const { level, count, lang, userId, irrWordType } = await this.validate(dto)

    let priorityWords: GameWord[] = []
    let fillerWords: GameWord[] = []

    if (irrWordType === GameWordType.PS) {
      // For PS: prefer words with MISTAKE or IN_PROGRESS status
      // First check progressPp, then progressPs
      const wordsWithPpProgress = await this.irrWordRepo.getWordsByProgressStatus(
        IrrWordType.PP,
        IrrWordType.PS,
        level,
        lang,
        userId,
        ['mistake', 'in_progress']
      )

      priorityWords = [...wordsWithPpProgress]

      // If not enough priority words, get words with PS progress
      if (priorityWords.length < count) {
        const wordsWithPsProgress = await this.irrWordRepo.getWordsByProgressStatus(
          IrrWordType.PS,
          IrrWordType.PS,
          level,
          lang,
          userId,
          ['mistake', 'in_progress']
        )
        // Filter out words already included
        const newWords = wordsWithPsProgress.filter(w => !priorityWords.find(pw => pw.id === w.id))
        priorityWords = [...priorityWords, ...newWords]
      }

      // If still not enough, add not learned PS words as fillers
      if (priorityWords.length < count) {
        const additionalPsWords = await this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PS, level, lang, userId)
        // Filter out words already included in priority
        fillerWords = additionalPsWords.filter(w => !priorityWords.find(pw => pw.id === w.id))
      }

      // If still not enough filler words, get all words
      if (priorityWords.length === 0 && fillerWords.length === 0) {
        fillerWords = await this.irrWordRepo.getAllWordsByType(IrrWordType.PS, level, lang)
      }
    }
    else if (irrWordType === GameWordType.PP) {
      // For PP: prefer words with MISTAKE or IN_PROGRESS status
      // First check progressPs, then progressPp
      const wordsWithPsProgress = await this.irrWordRepo.getWordsByProgressStatus(
        IrrWordType.PS,
        IrrWordType.PP,
        level,
        lang,
        userId,
        ['mistake', 'in_progress']
      )

      priorityWords = [...wordsWithPsProgress]

      // If not enough priority words, get words with PP progress
      if (priorityWords.length < count) {
        const wordsWithPpProgress = await this.irrWordRepo.getWordsByProgressStatus(
          IrrWordType.PP,
          IrrWordType.PP,
          level,
          lang,
          userId,
          ['mistake', 'in_progress']
        )
        // Filter out words already included
        const newWords = wordsWithPpProgress.filter(w => !priorityWords.find(pw => pw.id === w.id))
        priorityWords = [...priorityWords, ...newWords]
      }

      // If still not enough, add not learned PP words as fillers
      if (priorityWords.length < count) {
        const additionalPpWords = await this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PP, level, lang, userId)
        // Filter out words already included in priority
        fillerWords = additionalPpWords.filter(w => !priorityWords.find(pw => pw.id === w.id))
      }

      // If still not enough filler words, get all words
      if (priorityWords.length === 0 && fillerWords.length === 0) {
        fillerWords = await this.irrWordRepo.getAllWordsByType(IrrWordType.PP, level, lang)
      }
    }
    else if (irrWordType === GameWordType.MIXED) {
      // For MIXED: prefer words with MISTAKE or IN_PROGRESS from both PS and PP
      const psWithProgress = await this.irrWordRepo.getWordsByProgressStatus(
        IrrWordType.PS,
        IrrWordType.PS,
        level,
        lang,
        userId,
        ['mistake', 'in_progress']
      )

      const ppWithProgress = await this.irrWordRepo.getWordsByProgressStatus(
        IrrWordType.PP,
        IrrWordType.PP,
        level,
        lang,
        userId,
        ['mistake', 'in_progress']
      )

      priorityWords = [...psWithProgress, ...ppWithProgress]

      // If not enough priority words, add regular not learned words as fillers
      if (priorityWords.length < count) {
        const additionalPsWords = await this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PS, level, lang, userId)
        const additionalPpWords = await this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PP, level, lang, userId)

        // Filter out words already included in priority
        const newPsWords = additionalPsWords.filter(w => !priorityWords.find(pw => pw.id === w.id))
        const newPpWords = additionalPpWords.filter(w => !priorityWords.find(pw => pw.id === w.id))

        fillerWords = [...newPsWords, ...newPpWords]
      }

      // If still not enough filler words, get all words
      if (priorityWords.length === 0 && fillerWords.length === 0) {
        const allPsWords = await this.irrWordRepo.getAllWordsByType(IrrWordType.PS, level, lang)
        const allPpWords = await this.irrWordRepo.getAllWordsByType(IrrWordType.PP, level, lang)
        fillerWords = [...allPsWords, ...allPpWords]
      }
    }

    // Combine priority words with shuffled filler words
    // Priority words always come first, then fill remaining slots with random filler words
    const remainingSlots = count - priorityWords.length
    const shuffledFillers = fillerWords.sort(() => Math.random() - 0.5).slice(0, remainingSlots)
    const finalWords = [...priorityWords, ...shuffledFillers].slice(0, count)

    // Clean up word types
    return finalWords.map((word) => {
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
}
