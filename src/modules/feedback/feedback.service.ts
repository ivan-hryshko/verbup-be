import createHttpError from 'http-errors'
import { FeedbackEntity } from './feedback.entity'
import { FeedbackRepository } from './feedback.repository'
import { SlackService } from '../slack/slack.service'
export interface IFeedbackService {
  create(data: Partial<FeedbackEntity>): Promise<FeedbackEntity>
  getAll(): Promise<FeedbackEntity[]>
}

export class FeedbackService implements IFeedbackService {
  private readonly feedbackRepository = new FeedbackRepository()
  private readonly slackService = new SlackService()

  async create(data: Partial<FeedbackEntity>): Promise<FeedbackEntity> {
    if (!data.comment || !data.rating) {
      throw createHttpError(400, 'Comment and rating are required')
    }

    const feedback = await this.feedbackRepository.create(data)
    await this.slackService.sendFeedbackMessage(feedback)
    return feedback
  }

  async getAll(): Promise<FeedbackEntity[]> {
    return this.feedbackRepository.findAll()
  }
}
