import dotenv from 'dotenv'
import { TsNavigator } from '../utils/ts-navigator'

const APP_ENV = process.env.APP_ENV || 'development'
if (!APP_ENV) {
  console.error('APP_ENV is not defined in the environment variables')
}
if (APP_ENV === 'test') {
  dotenv.config({ path: TsNavigator.fromRoot('.env.test.local') })
} else {
  dotenv.config({ path: TsNavigator.fromRoot('.env.development.local') })
}

const APP_PORT = process.env.APP_PORT || 8000
if (!APP_PORT) {
  console.error('APP_PORT is not defined in the environment variables')
}
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || ''
if (!JWT_ACCESS_SECRET) {
  console.error('JWT_ACCESS_SECRET is not defined in the environment variables')
}
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ''
if (!JWT_REFRESH_SECRET) {
  console.error('JWT_REFRESH_SECRET is not defined in the environment variables')
}

const PG_HOST = process.env.PG_HOST
const PG_PORT = process.env.PG_PORT
const PG_USERNAME = process.env.PG_USERNAME
const PG_PASSWORD = process.env.PG_PASSWORD
const PG_DATABASE = process.env.PG_DATABASE

const ENVS = {
  APP_PORT,
  APP_ENV,
  PG_HOST,
  PG_DATABASE,
  PG_PORT,
  PG_USERNAME,
  PG_PASSWORD,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
}

export default ENVS
