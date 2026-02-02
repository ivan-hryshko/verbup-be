import { App } from '@slack/bolt'
import { FeedbackEntity } from '../feedback/feedback.entity'
import { DailyStatsEntity } from '../statistics/daily-stats.entity'
import ENVS from '../../config/envs'

export interface ISlackService {
  readonly slackApp: App
  sendFeedbackMessage(feedback: FeedbackEntity): Promise<void>
  sendDailyStatsNotification(success: boolean, stats?: DailyStatsEntity, error?: Error): Promise<void>
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

  async sendDailyStatsNotification(success: boolean, stats?: DailyStatsEntity, error?: Error): Promise<void> {
    let text: string

    if (success && stats) {
      text = `
📊 *Daily Stats Report - ${stats.stat_date}*
*Status:* SUCCESS

*Registrations:* ${stats.registrations} new users
*Words Progress:*
  • Total: ${stats.words_progress_saved} words saved
  • Unique users: ${stats.unique_users_progress}
  • By difficulty: Easy: ${stats.words_progress_easy} | Medium: ${stats.words_progress_medium} | Hard: ${stats.words_progress_hard}

*Environment:* ${ENVS.NODE_ENV}
`
    } else {
      text = `
📊 *Daily Stats Report*
❌ *Status:* FAILED

*Error:* ${error?.message || 'Stats collection failed or did not run'}

*Environment:* ${ENVS.NODE_ENV}
`
    }

    await this.slackApp.client.chat.postMessage({
      token: ENVS.SLACK_BOT_TOCKEN,
      channel: ENVS.SLACK_LOGS_CHANNEL,
      text,
    })
  }
}
