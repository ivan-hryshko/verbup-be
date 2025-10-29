import createHttpError from 'http-errors'
import { enumValues } from '../../utils/enumsHelp'
import { IrrWordLevelEnum, IrrWordType } from '../irr-words/irr-words.types'
import { ProgressPpRepository } from './progress-pp/progress-pp.repository'
import { ProgressPsRepository } from './progress-ps/progress-ps.repository'
import { ProgressStatus } from './progress.types'
import { UsersRepository } from '../users/users.repository'
import { IrrWordRepository } from '../irr-words/irr-words.repository'
import { ProgressPpEntity } from './progress-pp/progress-pp.entity'
import { ProgressPsEntity } from './progress-ps/progress-ps.entity'
import { ProgressRepository } from './progress.repository'

export type ProgressSaveDtoWords = {
  wordId: number
  type: IrrWordType
  status: ProgressStatus
  correct: boolean
}
export type ProgressSaveDto = {
  userId: number
  words: ProgressSaveDtoWords[]
}
type ProgressListDto = {
  userId?: number
}
type WordInput = {
  wordId: string
  type: string
  status: string
}

type SaveProgressInput = {
  userId: string
  words: WordInput[]
}
export class ProgressService {
  private readonly progressPsRepository: ProgressPsRepository
  private readonly progressPpRepository: ProgressPpRepository
  private readonly progressRepository: ProgressRepository
  private readonly usersRepository = new UsersRepository()

  constructor() {
    this.progressPsRepository = new ProgressPsRepository()
    this.progressPpRepository = new ProgressPpRepository()
    this.progressRepository = new ProgressRepository()
  }

  async validateSave(dto: ProgressSaveDto) {
    const validTypes = enumValues(IrrWordType)
    const validStatuses = enumValues(ProgressStatus)

    if (!dto.userId) {
      throw createHttpError(400, 'Invalid or missing "userId" param')
    }
    const user = await this.usersRepository.findById(dto.userId)
    if (!user) throw createHttpError(404, `User with id: ${dto.userId} not found`)

    for (const word of dto.words) {
      if (!word?.type || !validTypes.includes(word?.type)) {
        throw createHttpError(400, `Invalid type: ${word.type} at word: ${word}`)
      }
      if (typeof word?.correct !== 'boolean') {
        throw createHttpError(400, `Invalid param "correct": ${word?.correct} at word: ${JSON.stringify(word)}`)
      }
    }
  }

  async save(dto: ProgressSaveDto): Promise<any> {
    await this.validateSave(dto)

    const preparedWordsPromises = dto.words.map(async (word: ProgressSaveDtoWords) => {
      const progressGetParams = { userId: dto.userId, wordId: word.wordId }
      const progress = await this.progressRepository.getWordProgress(word.type, progressGetParams)
      const newStatus = this.getNextProgressStatus(progress?.status, word.correct)

      word.status = newStatus
      return word
    })
    const preparedWords = await Promise.all(preparedWordsPromises)
    const saveProgresPromises = preparedWords.map(async (word: ProgressSaveDtoWords) => {
      const saveParams = {
        userId: dto.userId,
        words: [{ wordId: word.wordId, status: word.status }],
      }
      await this.progressRepository.saveProgress(word.type, saveParams)
      return { wordId: word.wordId, status:  word.status, type: word.type }
    })
    const result = await Promise.all(saveProgresPromises)
    return result
  }

  getNextProgressStatus(status: ProgressStatus | undefined, correct: boolean): ProgressStatus {
    if (!status) {
      return ProgressStatus.IN_PROGRESS
    }

    let newStatus = status

    if (correct) {
      if (status === ProgressStatus.MISTAKE) {
        newStatus = ProgressStatus.IN_PROGRESS
      } else if (status === ProgressStatus.IN_PROGRESS) {
        newStatus =  ProgressStatus.STUDIED
      } else if (status === ProgressStatus.STUDIED) {
        newStatus =  ProgressStatus.STUDIED
      }
    } else {
      newStatus = ProgressStatus.MISTAKE
    }
    return newStatus
  }
  async validateList(dto: ProgressListDto) {
    if (!dto.userId) {
      throw createHttpError(400, 'Invalid or missing "userId" param')
    }
    const user = await this.usersRepository.findById(dto.userId)
    if (!user) throw createHttpError(404, `User with id: ${dto.userId} not found`)
  }

  async list(dto: any): Promise<any> {
    await this.validateList(dto)
    const { userId } = dto

    const progressPs = await this.progressPsRepository.getProgressByUserId(dto.userId)
    const progressPp = await this.progressPpRepository.getProgressByUserId(userId)

    return {
      progressPs,
      progressPp,
    }
  }

  async short(dto: { userId: number }): Promise<any> {
    await this.validateList(dto)
    const { userId } = dto

    const progressPs = await this.progressPsRepository.getProgressByStatus(userId, ProgressStatus.STUDIED)
    const progressPp = await this.progressPpRepository.getProgressByStatus(userId, ProgressStatus.STUDIED)
    
    return {
      general: this.calculateProgressByLevel(progressPs, progressPp),
      easy: this.calculateProgressByLevel(progressPs, progressPp, IrrWordLevelEnum.EASY),
      medium: this.calculateProgressByLevel(progressPs, progressPp, IrrWordLevelEnum.MEDIUM),
      hard: this.calculateProgressByLevel(progressPs, progressPp, IrrWordLevelEnum.HARD),
    }
  }

  calculateProgressByLevel(progressPs: ProgressPsEntity[], progressPp: ProgressPpEntity[], level?: IrrWordLevelEnum) {
    let psWords = progressPs
    let ppWords = progressPp

    if (level) {
      psWords = progressPs.filter(p => p.word.level === level)
      ppWords = progressPp.filter(p => p.word.level === level)
    }

    let generalTotal = 0

    const psWordIds = psWords.map(p => p.word.id)
    const ppWordIds = ppWords.map(p => p.word.id)

    ppWordIds.forEach(id => {
      if (psWordIds.includes(id)) {
        generalTotal = generalTotal + 1
      }
    })

    return {
      ps: psWords.length,
      pp: ppWords.length,
      total: generalTotal
    }
  }
}
