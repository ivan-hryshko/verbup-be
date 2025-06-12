import createHttpError from 'http-errors'
import { enumValues } from '../../utils/enumsHelp'
import { IrrWordType } from '../irr-words-en/irr-words.types'
import { UsersRepository } from '../users/users.repository'

export type ProgressSaveDto = {
  userId: number
  words:
    {
      wordId: number
      type: IrrWordType
    }[],
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
export class UploadService {
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

  async addImage(dto: ProgressSaveDto): Promise<any> {
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
}
