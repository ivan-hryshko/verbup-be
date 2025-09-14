import createHttpError from 'http-errors'
import { enumValues } from '../../utils/enumsHelp'
import { IrrWordType } from '../irr-words/irr-words.types'
import { ProgressPpRepository } from './progress-pp/progress-pp.repository'
import { ProgressPsRepository } from './progress-ps/progress-ps.repository'
import { ProgressStatus } from './progress.types'
import { UsersRepository } from '../users/users.repository'

export type ProgressSaveDto = {
  userId: number
  words: {
    wordId: number
    type: IrrWordType
    status: ProgressStatus
  }[]
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
  private readonly usersRepository = new UsersRepository()

  constructor() {
    this.progressPsRepository = new ProgressPsRepository()
    this.progressPpRepository = new ProgressPpRepository()
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
      if (!word?.status || !validStatuses.includes(word?.status)) {
        throw createHttpError(400, `Invalid status: ${word.status} at word: ${word}`)
      }
    }
  }

  async save(dto: ProgressSaveDto): Promise<any> {
    await this.validateSave(dto)

    const psWords = dto.words
      .filter((word) => word.type === 'ps')
      .map((word) => ({
        wordId: Number(word.wordId),
        status: word.status,
      }))
    const ppWords = dto.words
      .filter((word) => word.type === 'pp')
      .map((word) => ({
        wordId: Number(word.wordId),
        status: word.status,
      }))

    const progressPs = await this.progressPsRepository.saveProgress({
      userId: Number(dto.userId),
      words: psWords,
    })
    const progressPp = await this.progressPpRepository.saveProgress({
      userId: Number(dto.userId),
      words: ppWords,
    })

    return [...progressPs, ...progressPp]
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

    const progressPs = await this.progressPsRepository.getProgressByUserId(dto.userId)
    const progressPp = await this.progressPpRepository.getProgressByUserId(userId)

    return {
      // general: number
      // easy: 
      // medium:
      // hard:  
    }
  }
}
