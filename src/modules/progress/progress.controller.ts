import { NextFunction, Request, Response } from 'express'
import { ProgressService } from './progress.service'

export class ProgressController {
  private readonly progressService: ProgressService

  constructor() {
    this.progressService = new ProgressService()
  }

  async save(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const progress = await this.progressService.save(req.body)
    res.status(200).json({ data: progress })
  }

  async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const progress = await this.progressService.list(req.query)
    res.status(200).json({ data: progress })
  }
}
