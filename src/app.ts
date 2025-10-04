import express from 'express'
import cookieParser from 'cookie-parser'
import apiV1routes from './routes/api-v1.routes'
import { swaggerDocs } from './utils/swagger'
import { errorHandler } from './middlewares/errorHandler'
import './types/express'
import cors from 'cors'
import ENVS from './config/envs'

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

const allowedOrigins = [ENVS.FRONTEND_ORIGIN, 'http://localhost:5173']
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true)

      // TODO: temporary
      return callback(null, true)
      // if (allowedOrigins.includes(origin)) {
      //   return callback(null, true)
      // } else {
      //   return callback(new Error('Not allowed by CORS'), false)
      // }
    },
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(express.json())
app.use('/api/v1/docs', swaggerDocs())

app.get('/', (req, res) => {
  res.send('Hello verbup')
})

app.use('/api/v1', apiV1routes)
app.use(errorHandler)

export default app
