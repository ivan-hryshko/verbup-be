import { DataSource } from 'typeorm'
import ENVS from './envs'
import { IrrWordEntity } from '../modules/irr-words/irr-words.entity'
import { UserEntity } from '../modules/users/users.entity'
import { SessionEntity } from '../modules/sessions/session.entity'
import { ProgressPsEntity } from '../modules/progress/progress-ps/progress-ps.entity'
import { ProgressPpEntity } from '../modules/progress/progress-pp/progress-pp.entity'
import { FeedbackEntity } from '../modules/feedback/feedback.entity'
import { DailyStatsEntity } from '../modules/statistics/daily-stats.entity'

const entities = [
  UserEntity,
  SessionEntity,
  IrrWordEntity,
  ProgressPsEntity,
  ProgressPpEntity,
  FeedbackEntity,
  DailyStatsEntity,
]

let appDataSource: DataSource

if (process.env.NODE_ENV === 'production') {
  appDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities,
    logging: true,
    synchronize: false,
    migrations: ['dist/migrations/*.js'],
    ssl: {
      rejectUnauthorized: false,
    },
  })
} else {
  appDataSource = new DataSource({
    type: 'postgres',
    host: ENVS.PG_HOST,
    port: parseInt(ENVS.PG_PORT || '5432'),
    username: ENVS.PG_USERNAME,
    password: ENVS.PG_PASSWORD,
    database: ENVS.PG_DATABASE,
    entities,
    logging: true,
    synchronize: false,
    migrations: ['dist/migrations/*.js'],
  })
}

export async function createTypeOrmConn() {
  return appDataSource.initialize()
}

export default appDataSource
