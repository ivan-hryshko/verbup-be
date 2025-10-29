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

    let psWords: GameWord[] = []
    let ppWords: GameWord[] = []

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

      psWords = [...wordsWithPpProgress]

      // If not enough, get words with PS progress
      if (psWords.length < count) {
        const wordsWithPsProgress = await this.irrWordRepo.getWordsByProgressStatus(
          IrrWordType.PS,
          IrrWordType.PS,
          level,
          lang,
          userId,
          ['mistake', 'in_progress']
        )
        // Filter out words already included
        const newWords = wordsWithPsProgress.filter(w => !psWords.find(pw => pw.id === w.id))
        psWords = [...psWords, ...newWords]
      }

      // If not enough, add not learned PS words
      if (psWords.length < count) {
        const additionalPsWords = await this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PS, level, lang, userId)
        // Filter out words already included
        const newWords = additionalPsWords.filter(w => !psWords.find(pw => pw.id === w.id))
        psWords = [...psWords, ...newWords]
      }

      // If still not enough, get all words
      if (psWords.length === 0) {
        psWords = await this.irrWordRepo.getAllWordsByType(IrrWordType.PS, level, lang)
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

      ppWords = [...wordsWithPsProgress]

      // If not enough, get words with PP progress
      if (ppWords.length < count) {
        const wordsWithPpProgress = await this.irrWordRepo.getWordsByProgressStatus(
          IrrWordType.PP,
          IrrWordType.PP,
          level,
          lang,
          userId,
          ['mistake', 'in_progress']
        )
        // Filter out words already included
        const newWords = wordsWithPpProgress.filter(w => !ppWords.find(pw => pw.id === w.id))
        ppWords = [...ppWords, ...newWords]
      }

      // If not enough, add not learned PP words
      if (ppWords.length < count) {
        const additionalPpWords = await this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PP, level, lang, userId)
        // Filter out words already included
        const newWords = additionalPpWords.filter(w => !ppWords.find(pw => pw.id === w.id))
        ppWords = [...ppWords, ...newWords]
      }

      // If still not enough, get all words
      if (ppWords.length === 0) {
        ppWords = await this.irrWordRepo.getAllWordsByType(IrrWordType.PP, level, lang)
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

      psWords = [...psWithProgress]
      ppWords = [...ppWithProgress]

      // If not enough words, add regular not learned words
      const totalWithProgress = psWords.length + ppWords.length
      if (totalWithProgress < count) {
        const additionalPsWords = await this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PS, level, lang, userId)
        const additionalPpWords = await this.irrWordRepo.getNotLearnedWordsByType(IrrWordType.PP, level, lang, userId)

        // Filter out words already included
        const newPsWords = additionalPsWords.filter(w => !psWords.find(pw => pw.id === w.id))
        const newPpWords = additionalPpWords.filter(w => !ppWords.find(pw => pw.id === w.id))

        psWords = [...psWords, ...newPsWords]
        ppWords = [...ppWords, ...newPpWords]
      }

      // If still not enough, get all words
      if (psWords.length === 0 && ppWords.length === 0) {
        psWords = await this.irrWordRepo.getAllWordsByType(IrrWordType.PS, level, lang)
        ppWords = await this.irrWordRepo.getAllWordsByType(IrrWordType.PP, level, lang)
      }
    }

    const allWords = [...psWords, ...ppWords]

    // Random shuffle and limit
    const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, count)

    // Clean up word types
    return shuffled.map((word) => {
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
