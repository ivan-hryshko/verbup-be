import createHttpError from 'http-errors'
import { UserEntity } from '../users/users.entity'
import { verifyPassword } from '../../utils/hash'
import { UsersService } from '../users/users.service'
import { SessionService } from '../sessions/session.service'
import { generateAccessToken } from '../sessions/constants'
import { UsersRepository } from '../users/users.repository'

export interface IAuthService {
  register(data: Partial<UserEntity>): Promise<{ accessToken: string; refreshToken: string }>
  login(
    email: string,
    password: string,
    currentRefreshToken?: string,
  ): Promise<{ accessToken: string; refreshToken: string }>
}

export class AuthService implements IAuthService {
  private readonly usersRepository = new UsersRepository()
  private readonly usersService = new UsersService()
  private readonly sessionService = new SessionService()

  async register(data: Partial<UserEntity>) {
    const plainPassword = data.password!
    if (!data.email || !data.password) throw createHttpError(400, 'Email and password are required')

    await this.usersService.create(data)
    const { accessToken, refreshToken } = await this.login(data.email!, plainPassword)

    return { accessToken, refreshToken }
  }

  async login(email: string, password: string, currentRefreshToken?: string) {
    const user = await this.usersRepository.findByEmailWithPassword(email)
    if (!user) throw createHttpError(404, 'User not found')
    if (!email || !password) throw createHttpError(400, 'Email and password are required')
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid password')
    }
    const session = await this.sessionService.create(user.id, currentRefreshToken)
    const accessToken = generateAccessToken(user.id)
    return {
      accessToken,
      refreshToken: session.refreshToken,
    }
  }
}
