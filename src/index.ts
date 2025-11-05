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

    app.listen(ENVS.PORT, () => {
      console.log(`VerbUp app listening at http://localhost:${ENVS.PORT}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

startServer()
