import { Repository } from 'typeorm'
import { SessionEntity } from './session.entity'
import appDataSource from '../../config/app-data-source'

export interface ISessionRepository {
  create(data: Partial<SessionEntity>): Promise<SessionEntity>
  findByRefreshToken(refreshToken: string): Promise<SessionEntity | null>
  save(session: SessionEntity): Promise<SessionEntity>
  //   delete(expiresAt: Date): Promise<any>
}

export class SessionRepository implements ISessionRepository {
  private readonly sessionRepo: Repository<SessionEntity>

  constructor() {
    this.sessionRepo = appDataSource.getRepository(SessionEntity)
  }

  async create(data: Partial<SessionEntity>): Promise<SessionEntity> {
    const session = this.sessionRepo.create(data)
    return this.sessionRepo.save(session)
  }

  async save(session: SessionEntity): Promise<SessionEntity> {
    return this.sessionRepo.save(session)
  }

  async findByRefreshToken(refreshToken: string): Promise<SessionEntity | null> {
    return this.sessionRepo.findOne({
      where: { refreshToken },
      relations: ['user'],
    })
  }

  //   async delete(expiresAt: Date): Promise<any> {
  //     return this.sessionRepo.delete({ expiresAt })
  //   }
}
