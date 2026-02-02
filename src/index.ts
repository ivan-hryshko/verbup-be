console.log('at index')
import app from './app'
import ENVS from './config/envs'
import postgresSource from './config/app-data-source'
import { DailyStatsService } from './modules/statistics/daily-stats.service'

const startServer = async () => {
  try {
    console.log('📦 before Data Source initialization„')
    await postgresSource.initialize()
    console.log('📦 Data Source has been initialized!')

    // Initialize daily statistics cron job
    const dailyStatsService = new DailyStatsService()
    // Cron runs at 2:00 AM every day (recommended time for daily batch jobs)
    // Format: minute hour day month weekday
    // '0 2 * * *' = At 02:00 AM every day
    dailyStatsService.startCollectStats('0 2 * * *')
    console.log('📊 Daily stats cron job initialized (runs at 2:00 AM)')

    // Initialize daily statistics notification cron (runs at 9:00 AM)
    dailyStatsService.startStatsNotification('0 9 * * *')
    console.log('📤 Daily stats notification cron job initialized (runs at 9:00 AM)')

    app.listen(ENVS.PORT, () => {
      console.log(`VerbUp app listening at http://localhost:${ENVS.PORT}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

startServer()
