import createHttpError from "http-errors"
import { S3Service } from "../s3/s3.service"
import { IrrWordRepository } from "./irr-words.repository"
import { IrrWordLang } from "./irr-words.types"
import { IrrWordEntity } from "./irr-words.entity"

type IrrWordsaddImageDto = {
  wordBasic: string
  file: Express.Multer.File,
  word: IrrWordEntity
}
type IrrWordsGetImageDto = {
  wordBasic: string
  word: IrrWordEntity
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
      throw createHttpError(400, '"wordBasic" must be a string')
    }
    const word = await this.irrWordRepository.getWordsByBase({ lang: IrrWordLang.EN, basic: wordBasic })
    if (!word) {
      throw createHttpError(400, 'word with "wordBasic" key not exist')
    }

    return { wordBasic, file, word }
  }

  async addImage(data: unknown): Promise<unknown> {
    console.log('data :>> ', data);
    const dto = await this.validateAddImage(data)
    const filename = `irr-words/${dto.file.originalname}`

    await this.s3Service.upload(dto.file, filename)

    dto.word.image = filename
    await this.irrWordRepository.save(dto.word)

    return data
  }

  async validateGetImage(data: unknown): Promise<IrrWordsGetImageDto> {
    if (typeof data !== 'object' || data === null) {
      throw createHttpError(400, 'Payload must be a non-null object')
    }

    const wordBasic = (data as any)?.wordBasic

    if (typeof wordBasic !== 'string') {
      throw createHttpError(400, '"wordBasic" must be a string')
    }
    const word = await this.irrWordRepository.getWordsByBase({ lang: IrrWordLang.EN, basic: wordBasic })
    if (!word) {
      throw createHttpError(400, 'word with "wordBasic" key not exist')
    }

    return { wordBasic, word }
  }

  async getImage(data: unknown): Promise<unknown> {
    const dto = await this.validateGetImage(data)
    const filename = dto.word.image
    if (!filename) {
      throw createHttpError(400, 'word not contain image')
    }

    const url = await this.s3Service.getFile(filename)
    dto.word.image = url
    return dto.word
  }
}
