import createHttpError from "http-errors"
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3'
import ENVS from "../../config/envs"

type IrrWordsaddImageDto = {
  wordId: number
  file: Express.Multer.File
}

export class IrrWordsService {
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

    const s3 = new S3Client({
      credentials: {
        accessKeyId: ENVS.AWS_ACCESS_KEY,
        secretAccessKey: ENVS.AWS_SECRET_KEY,
      },
      region: ENVS.BUCKET_REGION
    })

    const putParams: PutObjectCommandInput = {
      Bucket: ENVS.BUCKET_NAME,
      Key: dto.file.originalname,
      Body: dto.file.buffer,
      ContentType: dto.file.mimetype,
    }
    const command = new PutObjectCommand(putParams)

    await s3.send(command)

    return data
  }
}
