import createHttpError from 'http-errors'
import { enumValues } from '../../utils/enumsHelp'
import { IrrWordType } from '../irr-words/irr-words.types'
import { UsersRepository } from '../users/users.repository'
import multer from 'multer'
// import { S3Client}

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
  private upload: multer.Multer

  constructor() {
    const storage = multer.memoryStorage()
    const upload = multer({ storage: storage })
  }
  // async validateSave(dto: ProgressSaveDto) {
  //   const validTypes = enumValues(IrrWordType)
  //   const validStatuses = enumValues(ProgressStatus)

  //   if (!dto.userId) {
  //     throw createHttpError(400, 'Invalid or missing "userId" param')
  //   }
  //   const user = await this.usersRepository.findById(dto.userId)
  //   if (!user) throw createHttpError(404, `User with id: ${dto.userId} not found`)

  //   for (const word of dto.words) {
  //     if (!word?.type || !validTypes.includes(word?.type)) {
  //       throw createHttpError(400, `Invalid type: ${word.type} at word: ${word}`)
  //     }
  //     if (!word?.status || !validStatuses.includes(word?.status)) {
  //       throw createHttpError(400, `Invalid status: ${word.status} at word: ${word}`)
  //     }
  //   }
  // }

  async addImage(data: unknown): Promise<any> {
    // await this.validateSave(dto)

    console.log('data :>> ', data);
    return data
  }
}
