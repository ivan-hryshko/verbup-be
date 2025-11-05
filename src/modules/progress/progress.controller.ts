import { Request, Response } from 'express'
import { ProgressService } from './progress.service'
import { getUserFromToken } from '../sessions/constants'

export class ProgressController {
  private readonly progressService = new ProgressService()

  list = async (req: Request, res: Response): Promise<any> => {
    const userId = getUserFromToken(req.get('Authorization'))?.id ?? null
    const progress = await this.progressService.list({ ...req.query, userId })
    res.status(200).json({ data: progress })
  }
  short = async (req: Request, res: Response): Promise<any> => {
    const userId = getUserFromToken(req.get('Authorization'))?.id ?? null
    if (userId) {
      const progress = await this.progressService.short({ userId })
      res.status(200).json({ data: progress })
    } else {
      
    }
  }

  save = async (req: Request, res: Response): Promise<any> => {
    const userId = getUserFromToken(req.get('Authorization'))?.id ?? null
    const progress = await this.progressService.save({ ...req.body, userId })
    res.status(200).json({ data: progress })
  }
}
