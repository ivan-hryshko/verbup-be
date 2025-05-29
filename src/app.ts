import express from 'express'
import apiV1routes from './routes/api-v1.routes'
import cookieParser from 'cookie-parser'
// import postgresSource from './config/app-data-source'

const app = express()

// postgresSource
//   .initialize()
//   .then(() => {
//       console.log("Data Source has been initialized!")
//   })
//   .catch((err) => {
//       console.error("Error during Data Source initialization:", err)
//   })
app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello verbup')
})

app.use('/api/v1', apiV1routes)

export default app
