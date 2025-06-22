import createHttpError from 'http-errors'
import { omit } from 'lodash'
import { hashPassword } from '../../utils/hash'
import { UserEntity } from './users.entity'
import { UsersRepository } from './users.repository'

export interface IUsersService {
  create(data: Partial<UserEntity>): Promise<Omit<UserEntity, 'password'>>
  getAll(): Promise<UserEntity[]>
  getById(id: number): Promise<UserEntity | null>
  update(id: number, data: Partial<UserEntity>): Promise<UserEntity>
  delete(id: number): Promise<void>
}
export class UsersService implements IUsersService {
  private readonly usersRepository = new UsersRepository()

  async create(data: Partial<UserEntity>): Promise<Omit<UserEntity, 'password'>> {
    const existingUser = await this.usersRepository.findByEmail(data.email!)
    if (existingUser) throw createHttpError(409, 'User already exists')

    const hashedPassword = await hashPassword(data.password!)
    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
    })
    return omit(user, 'password')
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

  async delete(id: number): Promise<void> {
    const user = await this.usersRepository.findById(id)
    if (!user) throw createHttpError(404, 'User not found')

    this.usersRepository.delete(user)
  }
}
