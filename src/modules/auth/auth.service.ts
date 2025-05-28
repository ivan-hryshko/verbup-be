import appDataSource from '../../config/app-data-source'
import { UserEntity } from '../users/users.entity'
import { verifyPassword } from '../../utils/hash'
import { UsersService } from '../users/users.service'
import { SessionService } from '../sessions/session.service'
import { generateAccessToken } from '../sessions/constants'

const userRepository = appDataSource.getRepository(UserEntity)

export class AuthService {
  static async register(data: Partial<UserEntity>) {
    await UsersService.create(data)
    const { accessToken, refreshToken } = await this.login(
      data.email!,
      data.password!
    )

    return { accessToken, refreshToken }
  }

  static async login(
    email: string,
    password: string,
    currentRefreshToken?: string
  ) {
    const user = await userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    })
    if (!user) {
      throw new Error('User not found')
    }
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid password')
    }
    const session = await SessionService.create(user.id, currentRefreshToken)
    const accessToken = generateAccessToken(user.id)
    return {
      accessToken,
      refreshToken: session.refreshToken,
    }
  }
}
