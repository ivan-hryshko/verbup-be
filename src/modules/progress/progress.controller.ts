import { Request, Response } from 'express'
import { ProgressService } from './progress.service'

export class ProgressController {
  private readonly progressService = new ProgressService()

  list = async (req: Request, res: Response): Promise<any> => {
    const progress = await this.progressService.list(req.query)
    res.status(200).json({ data: progress })
  }

  save = async (req: Request, res: Response): Promise<any> => {
    const progress = await this.progressService.save(req.body)
    res.status(200).json({ data: progress })
  }
}
