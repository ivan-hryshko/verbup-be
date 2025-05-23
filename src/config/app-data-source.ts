import { DataSource } from 'typeorm'
import ENVS from './envs'
import { IrrWordEntity } from '../modules/irr-words-en/irr-words.entity'
import { UserEntity } from '../modules/users/users.entity'

console.log('ENVS :>> ', ENVS)

const entities = [IrrWordEntity, UserEntity]

const appDataSource = new DataSource({
  type: 'postgres',
  host: ENVS.PG_HOST,
  port: parseInt(ENVS.PG_PORT || '5432'),
  username: ENVS.PG_USERNAME,
  password: ENVS.PG_PASSWORD,
  database: ENVS.PG_DATABASE,
  entities,
  logging: true,
  synchronize: true,
})

export default appDataSource
