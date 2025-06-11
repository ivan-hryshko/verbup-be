import appDataSource from '../../config/app-data-source'
import { SessionEntity } from './session.entity'
import { generateAccessToken, generateRefreshToken, THREE_DAYS } from './constants'
import { UserEntity } from '../users/users.entity'
import { SessionRepository } from './session.repository'
import createHttpError from 'http-errors'
// import { LessThan } from 'typeorm'

export interface ISessionService {
  create(userId: number, currentRefreshToken?: string): Promise<SessionEntity>
  refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>
  // cleanExpiredSessions(): Promise<any>
}

export class SessionService implements ISessionService {
  private readonly sessionRepo = new SessionRepository()

  async create(userId: number, currentRefreshToken?: string): Promise<SessionEntity> {
    if (currentRefreshToken) {
      const existingSession = await this.sessionRepo.findByRefreshToken(currentRefreshToken)
      if (existingSession) {
        existingSession.refreshToken = generateRefreshToken(userId)
        existingSession.expiresAt = new Date(Date.now() + THREE_DAYS)
        return await this.sessionRepo.save(existingSession)
      }
    }
    const refreshToken = generateRefreshToken(userId)
    const expiresAt = new Date(Date.now() + THREE_DAYS)
    const session = await this.sessionRepo.create({
      refreshToken,
      expiresAt: expiresAt,
      user: { id: userId } as UserEntity,
    })
    return await this.sessionRepo.save(session)
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.sessionRepo.findByRefreshToken(refreshToken)
    if (!session) throw createHttpError(404, 'Session not found')
    const now = new Date()
    if (session.expiresAt < now) throw createHttpError(401, 'Session expired')
    const newAccessToken = generateAccessToken(session.user.id)
    const newRefreshToken = generateRefreshToken(session.user.id)
    session.refreshToken = newRefreshToken
    session.expiresAt = new Date(Date.now() + THREE_DAYS)
    await this.sessionRepo.save(session)
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }

  //  async cleanExpiredSessions(): Promise<any> {
  //   await this.sessionRepo.delete({
  //     expiresAt: LessThan(new Date()),
  //   })
  // }
}
