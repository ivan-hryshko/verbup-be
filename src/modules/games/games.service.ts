import createHttpError from 'http-errors'
import { IrrWordRepository } from '../irr-words/irr-words.repository'
import { IrrWordLang, IrrWordLevel, IrrWordType } from '../irr-words/irr-words.types'
import { GameWord } from './games.type'
import { UsersRepository } from '../users/users.repository'

interface GetWordsDto {
  level?: string
  count?: string | number
  lang?: string
  userId?: number
}

export class GamesService {
  private irrWordRepo: IrrWordRepository
  private readonly usersRepository = new UsersRepository()

  constructor() {
    this.irrWordRepo = new IrrWordRepository()
  }

  async validateGetWords(dto: GetWordsDto) {
    const { count, lang } = dto
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

    const userId = Number(dto.userId)
    if (!userId || isNaN(userId) || userId <= 0) {
      throw createHttpError(400, 'Invalid or missing "userId" param')
    }
    const user = await this.usersRepository.findById(userId)
    if (!user) throw createHttpError(404, `User with id: ${dto.userId} not found`)

    return {
      level: dto.level as IrrWordLevel,
      count: wordCount,
      lang: lang as IrrWordLang,
      userId,
    }
  }

  async getWords(dto: GetWordsDto): Promise<GameWord[]> {
    const { level, count, lang, userId } = await this.validateGetWords(dto)

    const psWords = await this.irrWordRepo.getAvailableWordsByType(
      IrrWordType.PS,
      level,
      lang,
      userId,
    )
    const ppWords = await this.irrWordRepo.getAvailableWordsByType(
      IrrWordType.PP,
      level,
      lang,
      userId,
    )

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
