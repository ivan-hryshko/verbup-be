import cron from 'node-cron'
import { Between, Repository } from 'typeorm'
import { DailyStatsEntity } from './daily-stats.entity'
import { UserEntity } from '../users/users.entity'
import { ProgressPsEntity } from '../progress/progress-ps/progress-ps.entity'
import { ProgressPpEntity } from '../progress/progress-pp/progress-pp.entity'
import { IrrWordLevelEnum } from '../irr-words/irr-words.types'
import appDataSource from '../../config/app-data-source'
import { SlackService } from '../slack/slack.service'
import ENVS from '../../config/envs'

export interface IDailyStatsService {
  startCollectStats(cron: string): void
  collectStats(): Promise<DailyStatsEntity | null>
  sendStatsNotification(): Promise<void>
  startStatsNotification(cron: string): void
  getStats(offset?: number, limit?: number): Promise<{ data: DailyStatsEntity[]; total: number }>
}

interface DateRange {
  start: Date
  end: Date
}

interface ProgressStats {
  totalWords: number
  uniqueUsers: number
  easy: number
  medium: number
  hard: number
}

export class DailyStatsService implements IDailyStatsService {
  cron: string
  private slackService?: SlackService

  constructor() {
    const isSlackCredsExist = !!ENVS.SLACK_BOT_TOCKEN
    if (isSlackCredsExist) {
      this.slackService = new SlackService()
    }
  }

  startCollectStats(cronString: string) {
    this.cron = cronString
    cron.schedule(this.cron, async () => {
      console.log('⏰ Running daily stats cron...')
      await this.collectStats()
    })
  }

  async collectStats(): Promise<DailyStatsEntity | null> {
    try {
      const { start: yesterday, end: today } = this.getYesterdayDateRange()
      const statDate = this.formatStatDate(yesterday)

      console.log(`📊 Collecting stats for ${statDate}...`)

      const registrations = await this.countRegistrations(yesterday, today)
      console.log(`📈 Found ${registrations} new registrations`)

      const progressStats = await this.collectProgressStats(yesterday, today)
      console.log(
        `📚 Found ${progressStats.totalWords} words progress (${progressStats.uniqueUsers} unique users)`,
      )
      console.log(
        `   By level: Easy=${progressStats.easy}, Medium=${progressStats.medium}, Hard=${progressStats.hard}`,
      )

      const stats = await this.saveOrUpdateStats(statDate, registrations, progressStats)
      return stats
    } catch (error) {
      console.error('❌ Error collecting daily stats:', error)
      return null
    }
  }

  async sendStatsNotification(): Promise<void> {
    try {
      const { start: yesterday } = this.getYesterdayDateRange()
      const statDate = this.formatStatDate(yesterday)

      const stats = await this.getStatsRepository().findOne({
        where: { stat_date: statDate },
      })

      if (!this.slackService) {
        console.log('⚠️ Slack service not configured, skipping notification')
        return
      }

      if (stats) {
        await this.slackService.sendDailyStatsNotification(true, stats)
        console.log('✅ Daily stats notification sent successfully')
      } else {
        const error = new Error('Stats collection failed or did not run')
        await this.slackService.sendDailyStatsNotification(false, undefined, error)
        console.log('❌ Daily stats notification sent (collection failed)')
      }
    } catch (error) {
      console.error('❌ Error sending stats notification:', error)
    }
  }

  startStatsNotification(cronString: string): void {
    cron.schedule(cronString, async () => {
      console.log('📤 Running daily stats notification cron...')
      await this.sendStatsNotification()
    })
  }

  private getYesterdayDateRange(): DateRange {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return { start: yesterday, end: today }
  }

  private formatStatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private async countRegistrations(startDate: Date, endDate: Date): Promise<number> {
    const userRepository = this.getUserRepository()
    return userRepository.count({
      where: {
        created_at: Between(startDate, endDate),
      },
    })
  }

  private async collectProgressStats(startDate: Date, endDate: Date): Promise<ProgressStats> {
    const progressPsRepo = this.getProgressPsRepository()
    const progressPpRepo = this.getProgressPpRepository()

    // Get all progress records created yesterday with word level information
    const progressPsRecords = await progressPsRepo
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.word', 'word')
      .leftJoinAndSelect('progress.user', 'user')
      .where('progress.createdAt >= :start', { start: startDate })
      .andWhere('progress.createdAt < :end', { end: endDate })
      .getMany()

    const progressPpRecords = await progressPpRepo
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.word', 'word')
      .leftJoinAndSelect('progress.user', 'user')
      .where('progress.createdAt >= :start', { start: startDate })
      .andWhere('progress.createdAt < :end', { end: endDate })
      .getMany()

    // Combine all records
    const allRecords = [...progressPsRecords, ...progressPpRecords]

    // Total words progress saved
    const totalWords = allRecords.length

    // Unique users
    const uniqueUserIds = new Set(allRecords.map((record) => record.user.id))
    const uniqueUsers = uniqueUserIds.size

    // Count by level
    const easy = allRecords.filter((record) => record.word?.level === IrrWordLevelEnum.EASY).length
    const medium = allRecords.filter((record) => record.word?.level === IrrWordLevelEnum.MEDIUM)
      .length
    const hard = allRecords.filter((record) => record.word?.level === IrrWordLevelEnum.HARD).length

    return {
      totalWords,
      uniqueUsers,
      easy,
      medium,
      hard,
    }
  }

  private async saveOrUpdateStats(
    statDate: string,
    registrations: number,
    progressStats: ProgressStats,
  ): Promise<DailyStatsEntity> {
    const statsRepository = this.getStatsRepository()
    const existingStats = await statsRepository.findOne({
      where: { stat_date: statDate },
    })

    if (existingStats) {
      return await this.updateExistingStats(existingStats, registrations, progressStats, statDate)
    } else {
      return await this.createNewStats(statDate, registrations, progressStats)
    }
  }

  private async updateExistingStats(
    stats: DailyStatsEntity,
    registrations: number,
    progressStats: ProgressStats,
    statDate: string,
  ): Promise<DailyStatsEntity> {
    stats.registrations = registrations
    stats.words_progress_saved = progressStats.totalWords
    stats.unique_users_progress = progressStats.uniqueUsers
    stats.words_progress_easy = progressStats.easy
    stats.words_progress_medium = progressStats.medium
    stats.words_progress_hard = progressStats.hard
    const statsRepository = this.getStatsRepository()
    const savedStats = await statsRepository.save(stats)
    console.log(`✅ Updated stats for ${statDate}`)
    return savedStats
  }

  private async createNewStats(
    statDate: string,
    registrations: number,
    progressStats: ProgressStats,
  ): Promise<DailyStatsEntity> {
    const statsRepository = this.getStatsRepository()
    const stats = statsRepository.create({
      stat_date: statDate,
      registrations,
      words_progress_saved: progressStats.totalWords,
      unique_users_progress: progressStats.uniqueUsers,
      words_progress_easy: progressStats.easy,
      words_progress_medium: progressStats.medium,
      words_progress_hard: progressStats.hard,
      games_finished: 0,
      games_finished_easy: 0,
      games_finished_medium: 0,
      games_finished_hard: 0,
      users_completed_platform: 0,
    })
    const savedStats = await statsRepository.save(stats)
    console.log(`✅ Created stats for ${statDate}`)
    return savedStats
  }

  private getUserRepository(): Repository<UserEntity> {
    return appDataSource.getRepository(UserEntity)
  }

  private getStatsRepository(): Repository<DailyStatsEntity> {
    return appDataSource.getRepository(DailyStatsEntity)
  }

  private getProgressPsRepository(): Repository<ProgressPsEntity> {
    return appDataSource.getRepository(ProgressPsEntity)
  }

  private getProgressPpRepository(): Repository<ProgressPpEntity> {
    return appDataSource.getRepository(ProgressPpEntity)
  }

  async getStats(
    offset: number = 0,
    limit: number = 10,
  ): Promise<{ data: DailyStatsEntity[]; total: number }> {
    const statsRepository = this.getStatsRepository()

    const [data, total] = await statsRepository.findAndCount({
      order: {
        stat_date: 'DESC',
      },
      skip: offset,
      take: limit,
    })

    return { data, total }
  }
}
