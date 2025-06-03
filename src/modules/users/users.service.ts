import { hashPassword } from '../../utils/hash'
import { UserEntity } from './users.entity'
import { UsersRepository } from './users.repository'

export interface IUsersService {
  create(data: Partial<UserEntity>): Promise<Omit<UserEntity, 'password'>>
  getAll(): Promise<UserEntity[]>
  getById(id: number): Promise<UserEntity | null>
  update(id: number, data: Partial<UserEntity>): Promise<UserEntity>
  delete(id: number): Promise<any>
}
export class UsersService implements IUsersService {
  private readonly repo = new UsersRepository()

  async create(
    data: Partial<UserEntity>
  ): Promise<Omit<UserEntity, 'password'>> {
    const existingUser = await this.repo.findByEmail(data.email!)
    if (existingUser) {
      throw new Error('User already exists')
    }
    const hashedPassword = await hashPassword(data.password!)
    const newUser = await this.repo.create({
      ...data,
      password: hashedPassword,
    })
    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  async getAll(): Promise<UserEntity[]> {
    return this.repo.findAll()
  }

  async getById(id: number): Promise<UserEntity | null> {
    const user = await this.repo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  async update(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.repo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    Object.assign(user, data)
    return this.repo.update(user)
  }

  async delete(id: number): Promise<any> {
    const user = await this.repo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    return this.repo.delete(user)
  }
}
