import appDataSource from '../../config/app-data-source'
import { UserEntity } from './users.entity'

const userRepository = appDataSource.getRepository(UserEntity)

export class UsersService {
  static async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const existingUser = await userRepository.findOne({
      where: { email: data.email },
    })
    if (existingUser) {
      throw new Error('User already exists')
    }
    const newUser = userRepository.create(data)
    return await userRepository.save(newUser)
  }

  static async getAll(): Promise<UserEntity[]> {
    return await userRepository.find()
  }

  static async getById(id: number): Promise<UserEntity | null> {
    const user = userRepository.findOne({ where: { id } })
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  static async update(
    id: number,
    data: Partial<UserEntity>
  ): Promise<UserEntity> {
    const user = await userRepository.findOne({ where: { id } })
    if (!user) {
      throw new Error('User not found')
    }
    Object.assign(user, data)
    return await userRepository.save(user)
  }

  static async delete(id: number): Promise<void> {
    const user = await userRepository.findOne({ where: { id } })
    if (!user) {
      throw new Error('User not found')
    }
    await userRepository.remove(user)
  }
}
