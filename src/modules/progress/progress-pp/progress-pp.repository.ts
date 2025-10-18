import { InsertResult, Repository } from 'typeorm'
import AppDataSource from '../../../config/app-data-source'
import { ProgressPpEntity } from './progress-pp.entity'
import { ProgressGetWordParams, ProgressSaveParams } from '../progress.types'
import { IProgressRepository } from '../progress.interface'

export class ProgressPpRepository implements IProgressRepository<ProgressPpEntity> {
  private repo: Repository<ProgressPpEntity>

  constructor() {
    this.repo = AppDataSource.getRepository(ProgressPpEntity)
  }

  async getProgressByUserId(userId: number): Promise<ProgressPpEntity[]> {
    return this.repo
      .createQueryBuilder('progressPp')
      .where('progressPp.userId = :userId', { userId })
      .innerJoin('progressPp.word', 'word')
      .addSelect(['word.id', 'word.basic'])
      .getMany()
  }

  async getProgressByStatus(userId: number, status: string): Promise<ProgressPpEntity[]> {
    return this.repo
      .createQueryBuilder('progressPp')
      .where('progressPp.userId = :userId', { userId })
      .andWhere('progressPp.status = :status', { status })
      .innerJoin('progressPp.word', 'word')
      .addSelect(['word.id', 'word.basic', 'word.level'])
      .getMany()
  }

  async saveProgress(params: ProgressSaveParams): Promise<void> {
    const preparedWords = params.words.map((param) => {
      return {
        user: { id: params.userId },
        word: { id: param.wordId },
        status: param.status,
      }
    })

    await this.repo.upsert(preparedWords, {
      conflictPaths: ['user', 'word'],
      skipUpdateIfNoValuesChanged: true,
    })
  }

    async getWordProgress(params: ProgressGetWordParams): Promise<ProgressPpEntity | null> {
      const { userId, wordId } = params
      return this.repo
        .createQueryBuilder('progressPs')
        .where('progressPs.userId = :userId', { userId })
        .andWhere('progressPs.wordId = :wordId', { wordId })
        .getOne()
    }
}
