import appDataSource from '../../config/app-data-source'
import { UserEntity } from './users.entity'

export class UsersService {
  static async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const userRepository = appDataSource.getRepository(UserEntity)
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
    const userRepository = appDataSource.getRepository(UserEntity)
    return await userRepository.find()
  }

  static async getById(id: number): Promise<UserEntity | null> {
    const userRepository = appDataSource.getRepository(UserEntity)
    const user = userRepository.findOne({ where: { id } })
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }
}
