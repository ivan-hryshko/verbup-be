import createHttpError from 'http-errors'
import crypto from 'crypto'
import { UserEntity } from '../users/users.entity'
import { verifyPassword } from '../../utils/hash'
import { UsersService } from '../users/users.service'
import { SessionService } from '../sessions/session.service'
import { generateAccessToken } from '../sessions/constants'
import { UsersRepository } from '../users/users.repository'
import { MailService } from '../mail/mail.service'

export interface IAuthService {
  register(data: Partial<UserEntity>): Promise<{ message: string }>
  login(
    email: string,
    password: string,
    currentRefreshToken?: string,
  ): Promise<{ accessToken: string; refreshToken: string }>
  verifyEmail(token: string): Promise<{ message: string }>
}

export class AuthService implements IAuthService {
  private readonly usersRepository = new UsersRepository()
  private readonly usersService = new UsersService()
  private readonly sessionService = new SessionService()
  private readonly mailService = new MailService()

  async register(data: Partial<UserEntity>) {
    if (!data.email || !data.password) throw createHttpError(400, 'Email and password are required')
    const verificationToken = crypto.randomUUID()
    const user = await this.usersService.create({
      ...data,
      isActive: false,
      emailVerificationToken: verificationToken,
    })
    await this.mailService.sendVerificationEmail(
      user.email,
      user.username ?? 'user',
      verificationToken,
    )

    return { message: 'User created. Please check email to verify account.' }
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findByVerificationToken(token)

    if (!user) throw createHttpError(400, 'Invalid verification token')

    const now = new Date()

    if (user.emailVerificationTokenExpiresAt && user.emailVerificationTokenExpiresAt < now) {
      if (!user.isActive) {
        const newToken = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        user.emailVerificationToken = newToken
        user.emailVerificationTokenExpiresAt = expiresAt
        await this.usersRepository.update(user)
        await this.mailService.sendVerificationEmail(user.email, user.username, newToken)

        return { message: 'Verification token expired. A new email has been sent.' }
      } else {
        return { message: 'User already verified.' }
      }
    }

    user.isActive = true
    user.emailVerificationToken = null
    user.emailVerificationTokenExpiresAt = null
    await this.usersRepository.update(user)

    return { message: 'Email successfully verified. You can now log in.' }
  }

  async login(email: string, password: string, currentRefreshToken?: string) {
    const user = await this.usersRepository.findByEmailWithPassword(email)
    if (!user) throw createHttpError(404, 'User not found')
    if (!email || !password) throw createHttpError(400, 'Email and password are required')
    if (!user.isActive) {
      throw createHttpError(403, 'Please verify your email before login')
    }
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid password')
    }
    const session = await this.sessionService.create(user.id, currentRefreshToken)
    const accessToken = generateAccessToken(user.id)
    const publicUser = await this.usersRepository.findByEmailPublic(email)
    return {
      accessToken,
      refreshToken: session.refreshToken,
      user: publicUser,
    }
  }

  async logout(refreshToken: string) {
    await this.sessionService.deleteByRefreshToken(refreshToken)
    return { message: 'Logout successful' }
  }
}
