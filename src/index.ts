import app from './app'
// import ENV_VARIABLES from './config/envs'
const ENV_VARIABLES = {
  APP_PORT: 8000
}

const startServer = async () => {
  try {
    app.listen(ENV_VARIABLES.APP_PORT, () => {
      console.log(`Movies app listening at http://localhost:${ENV_VARIABLES.APP_PORT}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

startServer()