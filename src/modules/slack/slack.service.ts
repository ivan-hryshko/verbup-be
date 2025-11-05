import { App } from '@slack/bolt'
import { FeedbackEntity } from '../feedback/feedback.entity'
import ENVS from '../../config/envs'

export interface ISlackService {
  readonly slackApp: App
  sendFeedbackMessage(feedback: FeedbackEntity): Promise<void>
}

export class SlackService implements ISlackService {
  readonly slackApp: App

  constructor() {
    this.slackApp = new App({
      signingSecret: ENVS.SLACK_SIGNIN_SECRET,
      token: ENVS.SLACK_BOT_TOCKEN,
    })
  }

  async sendFeedbackMessage(feedback: FeedbackEntity): Promise<void> {
    const text = `
*New Feedback Received* 🎉
● *Environment:* ${ENVS.NODE_ENV}
● *Rating:* ${feedback.rating}
● *Comment:* ${feedback.comment}
● *UserID:* ${feedback.userId}
`

    await this.slackApp.client.chat.postMessage({
      token: ENVS.SLACK_BOT_TOCKEN,
      channel: ENVS.SLACK_CHANNEL,
      text,
    })
  }
}
