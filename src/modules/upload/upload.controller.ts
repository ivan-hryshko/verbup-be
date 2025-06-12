import { Request, Response } from 'express'
import { UploadService } from './upload.service'

export class UploadController {
  private readonly uploadService = new UploadService()

  addImage = async (req: Request, res: Response): Promise<any> => {
    const progress = await this.uploadService.addImage(req.body)
    res.status(200).json({ data: progress })
  }
}
