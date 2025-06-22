import { IS3Service } from "../s3.service"
export class S3Service implements IS3Service {
  upload = jest.fn().mockResolvedValue(undefined)
  getFile = jest.fn().mockResolvedValue('https://mocked-s3-url.com/fake-file')
}
