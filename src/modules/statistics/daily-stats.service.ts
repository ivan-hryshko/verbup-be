import cron from 'node-cron'
import { Between, Repository } from 'typeorm'
import { DailyStatsEntity } from './daily-stats.entity'
import { UserEntity } from '../users/users.entity'
import appDataSource from '../../config/app-data-source'

export interface IDailyStatsService {
  startCollectStats(cron: string): void
  collectStats(): Promise<void>
}

interface DateRange {
  start: Date
  end: Date
}

export class DailyStatsService implements IDailyStatsService {
  cron: string

  startCollectStats(cronString: string) {
    this.cron = cronString
    cron.schedule(this.cron, async () => {
      console.log('⏰ Running daily stats cron...')
      await this.collectStats()
    })
  }

  async collectStats(): Promise<void> {
    try {
      const { start: yesterday, end: today } = this.getYesterdayDateRange()
      const statDate = this.formatStatDate(yesterday)

      console.log(`📊 Collecting stats for ${statDate}...`)

      const registrations = await this.countRegistrations(yesterday, today)
      console.log(`📈 Found ${registrations} new registrations`)

      await this.saveOrUpdateStats(statDate, registrations)
    } catch (error) {
      console.error('❌ Error collecting daily stats:', error)
    }
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

  private async saveOrUpdateStats(statDate: string, registrations: number): Promise<void> {
    const statsRepository = this.getStatsRepository()
    const existingStats = await statsRepository.findOne({
      where: { stat_date: statDate },
    })

    if (existingStats) {
      await this.updateExistingStats(existingStats, registrations, statDate)
    } else {
      await this.createNewStats(statDate, registrations)
    }
  }

  private async updateExistingStats(
    stats: DailyStatsEntity,
    registrations: number,
    statDate: string,
  ): Promise<void> {
    stats.registrations = registrations
    const statsRepository = this.getStatsRepository()
    await statsRepository.save(stats)
    console.log(`✅ Updated stats for ${statDate}`)
  }

  private async createNewStats(statDate: string, registrations: number): Promise<void> {
    const statsRepository = this.getStatsRepository()
    const stats = statsRepository.create({
      stat_date: statDate,
      registrations,
      games_finished: 0,
      games_finished_easy: 0,
      games_finished_medium: 0,
      games_finished_hard: 0,
      users_completed_platform: 0,
    })
    await statsRepository.save(stats)
    console.log(`✅ Created stats for ${statDate}`)
  }

  private getUserRepository(): Repository<UserEntity> {
    return appDataSource.getRepository(UserEntity)
  }

  private getStatsRepository(): Repository<DailyStatsEntity> {
    return appDataSource.getRepository(DailyStatsEntity)
  }
}
