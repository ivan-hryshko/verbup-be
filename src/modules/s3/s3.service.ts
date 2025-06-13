import createHttpError from 'http-errors'
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3'
import ENVS from '../../config/envs'

export class S3Service {
  private readonly s3: S3Client

  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: ENVS.AWS_ACCESS_KEY,
        secretAccessKey: ENVS.AWS_SECRET_KEY,
      },
      region: ENVS.BUCKET_REGION
    })
  }

  async upload(file: Express.Multer.File, filename: string): Promise<any> {
    const putParams: PutObjectCommandInput = {
      Bucket: ENVS.BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    }
    const command = new PutObjectCommand(putParams)

    await this.s3.send(command)
  }
}
