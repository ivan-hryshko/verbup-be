import { Request, Response } from 'express'
import { FeedbackService } from './feedback.service'
import { getUserFromToken } from '../sessions/constants'

export class FeedbackController {
  private readonly service = new FeedbackService()

  create = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserFromToken(req.get('Authorization'))?.id ?? null
    const feedback = await this.service.create({
      ...req.body,
      userId,
    })
    res.status(201).json(feedback)
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    const feedbacks = await this.service.getAll()
    res.status(200).json(feedbacks)
  }
}
