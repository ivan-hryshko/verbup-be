import express from 'express'
import apiV1routes from './routes/api-v1.routes'

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello verbup')
})

// app.use('/api/v1', apiV1routes)

export default app
