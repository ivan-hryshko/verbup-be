import { hashPassword } from '../../utils/hash'
import { UserEntity } from './users.entity'
import { UsersRepository } from './users.repository'
import createHttpError from 'http-errors'

export interface IUsersService {
  create(data: Partial<UserEntity>): Promise<Omit<UserEntity, 'password'>>
  getAll(): Promise<UserEntity[]>
  getById(id: number): Promise<UserEntity | null>
  update(id: number, data: Partial<UserEntity>): Promise<UserEntity>
  delete(id: number): Promise<any>
}
export class UsersService implements IUsersService {
  private readonly usersRepository = new UsersRepository()

  async create(
    data: Partial<UserEntity>
  ): Promise<Omit<UserEntity, 'password'>> {
    const existingUser = await this.usersRepository.findByEmail(data.email!)
    if (existingUser) throw createHttpError(409, 'User already exists')

    const hashedPassword = await hashPassword(data.password!)
    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
    })
    const { password, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  async getAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll()
  }

  async getById(id: number): Promise<UserEntity | null> {
    const user = await this.usersRepository.findById(id)
    if (!user) throw createHttpError(404, 'User not found')

    return user
  }

  async update(id: number, data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.usersRepository.findById(id)
    if (!user) throw createHttpError(404, 'User not found')

    Object.assign(user, data)
    return this.usersRepository.update(user)
  }

  async delete(id: number): Promise<any> {
    const user = await this.usersRepository.findById(id)
    if (!user) throw createHttpError(404, 'User not found')

    return this.usersRepository.delete(user)
  }
}
