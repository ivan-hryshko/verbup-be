import { Repository } from 'typeorm'
import { UserEntity } from './users.entity'
import appDataSource from '../../config/app-data-source'

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>
  findById(id: number): Promise<UserEntity | null>
  findAll(): Promise<UserEntity[]>
  create(user: Partial<UserEntity>): Promise<UserEntity>
  update(user: UserEntity): Promise<UserEntity>
  delete(user: UserEntity): Promise<void>
  findByEmailWithPassword(email: string): Promise<UserEntity | null>
  findByEmailPublic(email: string): Promise<UserEntity | null>
  findByVerificationToken(token: string): Promise<UserEntity | null>
}
export class UsersRepository implements IUserRepository {
  private readonly userRepo: Repository<UserEntity>

  constructor() {
    this.userRepo = appDataSource.getRepository(UserEntity)
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { email } })
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id } })
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepo.find()
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser = this.userRepo.create(user)
    return this.userRepo.save(newUser)
  }

  async update(user: UserEntity): Promise<UserEntity> {
    return this.userRepo.save(user)
  }

  async delete(user: UserEntity): Promise<void> {
    this.userRepo.remove(user)
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'isActive'],
    })
  }

  async findByEmailPublic(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'avatar', 'created_at'],
    })
  }

  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { emailVerificationToken: token },
    })
  }
}
