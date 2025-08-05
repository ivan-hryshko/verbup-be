import dotenv from 'dotenv'
import { TsNavigator } from '../utils/ts-navigator'
import { getRequiredEnvVar } from '../utils/envsHelper'

const APP_ENV = process.env.APP_ENV || 'development'
if (!APP_ENV) {
  console.error('APP_ENV is not defined in the environment variables')
}
if (APP_ENV === 'test') {
  dotenv.config({ path: TsNavigator.fromRoot('.env.test.local') })
} else {
  dotenv.config({ path: TsNavigator.fromRoot('.env.development.local') })
}

const APP_PORT = getRequiredEnvVar('APP_PORT', 8000)
const JWT_ACCESS_SECRET = getRequiredEnvVar('JWT_ACCESS_SECRET', '')
const JWT_REFRESH_SECRET = getRequiredEnvVar('JWT_REFRESH_SECRET', '')
const BUCKET_NAME = getRequiredEnvVar('BUCKET_NAME', '')
const BUCKET_REGION = getRequiredEnvVar('BUCKET_REGION', '')
const AWS_ACCESS_KEY = getRequiredEnvVar('AWS_ACCESS_KEY', '')
const AWS_SECRET_KEY = getRequiredEnvVar('AWS_SECRET_KEY', '')

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
  BUCKET_NAME,
  BUCKET_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
}

export default ENVS
