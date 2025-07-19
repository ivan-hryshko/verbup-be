import createHttpError from 'http-errors'
import { FeedbackEntity } from './feedback.entity'
import { FeedbackRepository } from './feedback.repository'

export interface IFeedbackService {
  create(data: Partial<FeedbackEntity>): Promise<FeedbackEntity>
  getAll(): Promise<FeedbackEntity[]>
}

export class FeedbackService implements IFeedbackService {
  private readonly feedbackRepository = new FeedbackRepository()

  async create(data: Partial<FeedbackEntity>): Promise<FeedbackEntity> {
    if (!data.comment || !data.rating) {
      throw createHttpError(400, 'Comment and rating are required')
    }

    const feedback = await this.feedbackRepository.create(data)
    return feedback
  }

  async getAll(): Promise<FeedbackEntity[]> {
    return this.feedbackRepository.findAll()
  }
}
