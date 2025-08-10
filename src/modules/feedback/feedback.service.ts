import createHttpError from 'http-errors'
import { FeedbackEntity } from './feedback.entity'
import { FeedbackRepository } from './feedback.repository'
import { SlackService } from '../slack/slack.service'
import ENVS from '../../config/envs'
export interface IFeedbackService {
  isSlacCredsExist: boolean
  create(data: Partial<FeedbackEntity>): Promise<FeedbackEntity>
  getAll(): Promise<FeedbackEntity[]>
}

export class FeedbackService implements IFeedbackService {
  isSlacCredsExist: boolean
  private readonly feedbackRepository = new FeedbackRepository()
  private readonly slackService

  constructor() {
    this.isSlacCredsExist = Boolean(ENVS.SLACK_BOT_TOCKEN)
    if (this.isSlacCredsExist) {
      this.slackService = new SlackService()
    }
  }

  async create(data: Partial<FeedbackEntity>): Promise<FeedbackEntity> {
    if (!data.comment || !data.rating) {
      throw createHttpError(400, 'Comment and rating are required')
    }

    const feedback = await this.feedbackRepository.create(data)
    if (this.isSlacCredsExist) {
      await this.slackService?.sendFeedbackMessage(feedback)
    }
    return feedback
  }

  async getAll(): Promise<FeedbackEntity[]> {
    return this.feedbackRepository.findAll()
  }
}
