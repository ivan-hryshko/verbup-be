import app from './app'
import ENVS from './config/envs'
import postgresSource from './config/app-data-source'

const startServer = async () => {
  try {
    await postgresSource.initialize()
    console.log('📦 Data Source has been initialized!')

    app.listen(ENVS.APP_PORT, () => {
      console.log(`VerbUp app listening at http://localhost:${ENVS.APP_PORT}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

startServer()
