import appDataSource from '../../config/app-data-source'
import { hashPassword } from '../../utils/hash'
import { UserEntity } from './users.entity'

const userRepository = appDataSource.getRepository(UserEntity)

export class UsersService {
  static async create(
    data: Partial<UserEntity>
  ): Promise<Omit<UserEntity, 'password'>> {
    const existingUser = await userRepository.findOne({
      where: { email: data.email },
    })
    if (existingUser) {
      throw new Error('User already exists')
    }
    const hashedPassword = await hashPassword(data.password!)
    const newUser = userRepository.create({ ...data, password: hashedPassword })
    const savedUser = await userRepository.save(newUser)
    const { password, ...userWithoutPassword } = savedUser
    return userWithoutPassword
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

  static async delete(id: number): Promise<any> {
    const user = await userRepository.findOne({ where: { id } })
    if (!user) {
      throw new Error('User not found')
    }
    return await userRepository.remove(user)
  }
}
