import createHttpError from "http-errors"
import { S3Service } from "../s3/s3.service"

type IrrWordsaddImageDto = {
  wordId: number
  file: Express.Multer.File
}

export class IrrWordsService {
  private readonly s3Service = new S3Service()

  async list(payload: any): Promise<[]> {
    const words: any = []
    return words
  }


  validateAddImage(data: unknown): IrrWordsaddImageDto {
    if (typeof data !== 'object' || data === null) {
      throw createHttpError(400, 'Payload must be a non-null object')
    }

    const wordId = Number((data as any)?.wordId)
    const file = (data as any)?.file

    if (typeof wordId !== 'number') {
      throw createHttpError(400, '"wordId" must be a number')
    }

    if (typeof file !== 'object' || file === null) {
      throw createHttpError(400, '"file" must be a valid uploaded file')
    }

    // Optional deeper check for multer file:
    if (typeof file.originalname !== 'string' || typeof file.buffer !== 'object') {
      throw createHttpError(400, '"file" is not a valid multer file object')
    }

    return { wordId, file }
  }

  async addImage(data: unknown): Promise<unknown> {
    console.log('data :>> ', data);
    const dto = this.validateAddImage(data)
    const filename = `irr-words/${dto.file.originalname}`

    await this.s3Service.upload(dto.file, filename)

    return data
  }
}
