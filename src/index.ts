import app from './app'
import ENVS from './config/envs'

const startServer = async () => {
  try {
    app.listen(ENVS.APP_PORT, () => {
      console.log(`VerbUp app listening at http://localhost:${ENVS.APP_PORT}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

startServer()