import express from 'express'
import cookieParser from 'cookie-parser'
import apiV1routes from './routes/api-v1.routes'
import { swaggerDocs } from './utils/swagger'
import { errorHandler } from './middlewares/errorHandler'
import './types/express'

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
app.use('/api/v1/docs', swaggerDocs())

app.get('/', (req, res) => {
  res.send('Hello verbup')
})

app.use('/api/v1', apiV1routes)
app.use(errorHandler)

export default app
