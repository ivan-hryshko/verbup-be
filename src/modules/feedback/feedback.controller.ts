import { Request, Response } from 'express'
import { FeedbackService } from './feedback.service'

export class FeedbackController {
  private readonly service = new FeedbackService()

  create = async (req: Request, res: Response): Promise<void> => {
    const user = req.user ? { id: req.user.id } : null
    const feedback = await this.service.create({
      ...req.body,
      user,
    })
    res.status(201).json(feedback)
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    const feedbacks = await this.service.getAll()
    res.status(200).json(feedbacks)
  }
}
