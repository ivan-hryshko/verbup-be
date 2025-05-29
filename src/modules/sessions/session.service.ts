import appDataSource from '../../config/app-data-source'
import { SessionEntity } from './session.entity'
import {
  generateAccessToken,
  generateRefreshToken,
  THREE_DAYS,
} from './constants'
import { UserEntity } from '../users/users.entity'
// import { LessThan } from 'typeorm'

const sessionRepository = appDataSource.getRepository(SessionEntity)

export class SessionService {
  static async create(
    userId: number,
    currentRefreshToken?: string
  ): Promise<SessionEntity> {
    if (currentRefreshToken) {
      const existingSession = await sessionRepository.findOne({
        where: { refreshToken: currentRefreshToken },
      })
      if (existingSession) {
        existingSession.refreshToken = generateRefreshToken(userId)
        existingSession.expiresAt = new Date(Date.now() + THREE_DAYS)
        console.log('Updating existing session for user:', userId)
        return await sessionRepository.save(existingSession)
      }
    }
    const refreshToken = generateRefreshToken(userId)
    const expiresAt = new Date(Date.now() + THREE_DAYS)
    const session = sessionRepository.create({
      refreshToken,
      expiresAt: expiresAt,
      user: { id: userId } as UserEntity,
    })
    console.log('Creating new session for user:', userId)
    return await sessionRepository.save(session)
  }

  static async refresh(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await sessionRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    })
    if (!session) {
      throw new Error('Session not found')
    }
    const now = new Date()
    if (session.expiresAt < now) {
      throw new Error('Session expired')
    }
    const newAccessToken = generateAccessToken(session.user.id)
    const newRefreshToken = generateRefreshToken(session.user.id)
    session.refreshToken = newRefreshToken
    session.expiresAt = new Date(Date.now() + THREE_DAYS)
    await sessionRepository.save(session)
    console.log('Refreshing session for refreshToken:', refreshToken)
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }

  // static async cleanExpiredSessions(): Promise<any> {
  //   await sessionRepository.delete({
  //     expiresAt: LessThan(new Date()),
  //   })
  // }
}
