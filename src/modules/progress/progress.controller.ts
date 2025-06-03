import { NextFunction, Request, Response } from 'express'
import { ProgressService } from './progress.service'

export class ProgressController {
  static async save(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const progress = await ProgressService.save(req.body)
    res.status(200).json({ data: progress })
  }

  static async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const progress = await ProgressService.list(req.query)
    res.status(200).json({ data: progress })
  }
}
