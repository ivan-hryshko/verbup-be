import appDataSource from '../../config/app-data-source'
import { UserEntity } from '../users/users.entity'
import { verifyPassword } from '../../utils/hash'
import { UsersService } from '../users/users.service'

const userRepository = appDataSource.getRepository(UserEntity)

export class AuthService {
  static async register(data: Partial<UserEntity>) {
    await UsersService.create(data)
    await this.login(data.email!, data.password!)
  }

  static async login(email: string, password: string) {
    const user = await userRepository.findOne({
      where: { email },
    })
    if (!user) {
      throw new Error('User not found')
    }
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid password')
    }
  }
}
