import createHttpError from 'http-errors'
import { S3Client, PutObjectCommand, PutObjectCommandInput, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

  async getFile(filename: string): Promise<any> {
    const getObjectParams: GetObjectCommandInput = {
      Bucket: ENVS.BUCKET_NAME,
      Key: filename,
    }

    const command = new GetObjectCommand(getObjectParams)
    const MINUTES_10 = 60 * 10
    const url = await getSignedUrl(this.s3, command, { expiresIn: MINUTES_10 })

    return url
  }
}
