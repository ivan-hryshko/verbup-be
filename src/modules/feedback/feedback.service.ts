import createHttpError from 'http-errors'
import { App } from '@slack/bolt'
import { FeedbackEntity } from './feedback.entity'
import { FeedbackRepository } from './feedback.repository'
import ENVS from '../../config/envs'
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

    const slackApp = new App({
      signingSecret: ENVS.SLACK_SIGNIN_SECRET,
      token: ENVS.SLACK_BOT_TOCKEN,
    })

    const message = `
*New Feedback Received* 🎉
● *Environment:* ${ENVS.APP_ENV}
● *Rating:* ${feedback.rating}
● *Comment:* ${feedback.comment}
● *UserID:* ${feedback.userId}
`

    await slackApp.client.chat.postMessage({
      token: ENVS.SLACK_BOT_TOCKEN,
      channel: ENVS.SLACK_CHANNEL,
      text: message,
    })
    return feedback
  }

  async getAll(): Promise<FeedbackEntity[]> {
    return this.feedbackRepository.findAll()
  }
}
