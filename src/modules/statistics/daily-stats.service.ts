import cron from 'node-cron'
import { DailyStatsEntity } from './daily-stats.entity'

export interface IDailyStatsService {
  startCollectStats(cron: string): void
  collectStats(): void
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

  collectStats(): void {
    const stats = new DailyStatsEntity()
    console.log('stats :>> ', stats);
  }
}
