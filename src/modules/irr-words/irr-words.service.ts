import createHttpError from "http-errors"
import { S3Service } from "../s3/s3.service"
import { IrrWordRepository } from "./irr-words.repository"
import { IrrWordLang } from "./irr-words.types"

type IrrWordsaddImageDto = {
  wordBasic: string
  file: Express.Multer.File
}

export class IrrWordsService {
  private readonly s3Service = new S3Service()
  private readonly irrWordRepository = new IrrWordRepository()

  async list(payload: any): Promise<[]> {
    const words: any = []
    return words
  }


  async validateAddImage(data: unknown): Promise<IrrWordsaddImageDto> {
    if (typeof data !== 'object' || data === null) {
      throw createHttpError(400, 'Payload must be a non-null object')
    }

    const file = (data as any)?.file

    if (typeof file !== 'object' || file === null) {
      throw createHttpError(400, '"file" must be a valid uploaded file')
    }

    // Optional deeper check for multer file:
    if (typeof file.originalname !== 'string' || typeof file.buffer !== 'object') {
      throw createHttpError(400, '"file" is not a valid multer file object')
    }

    const wordBasic = (data as any)?.wordBasic

    if (typeof wordBasic !== 'string') {
      throw createHttpError(400, '"wordId" must be a number')
    }
    const word = await this.irrWordRepository.getWordsByBase({ lang: IrrWordLang.EN, basic: wordBasic })
    if (!word) {
      throw createHttpError(400, 'word with "wordBasic" key not exist')
    }

    return { wordBasic, file }
  }

  async addImage(data: unknown): Promise<unknown> {
    console.log('data :>> ', data);
    const dto = await this.validateAddImage(data)
    const filename = `irr-words/${dto.file.originalname}`

    // await this.s3Service.upload(dto.file, filename)

    // save image name to irr word.
    // get word/

    return data
  }
}
