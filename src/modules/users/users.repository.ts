import { Repository } from 'typeorm'
import { UserEntity } from './users.entity'
import appDataSource from '../../config/app-data-source'

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>
  findById(id: number): Promise<UserEntity | null>
  findAll(): Promise<UserEntity[]>
  create(user: Partial<UserEntity>): Promise<UserEntity>
  update(user: UserEntity): Promise<UserEntity>
  delete(user: UserEntity): Promise<any>
}
export class UsersRepository implements IUserRepository {
  private readonly repo: Repository<UserEntity>

  constructor() {
    this.repo = appDataSource.getRepository(UserEntity)
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email } })
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } })
  }

  async findAll(): Promise<UserEntity[]> {
    return this.repo.find()
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser = this.repo.create(user)
    return this.repo.save(newUser)
  }

  async update(user: UserEntity): Promise<UserEntity> {
    return this.repo.save(user)
  }

  async delete(user: UserEntity): Promise<any> {
    return this.repo.remove(user)
  }
}
