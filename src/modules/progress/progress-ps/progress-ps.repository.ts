// modules/irr-words-en/irr-words.repository.ts
import { InsertResult, Repository } from 'typeorm'
import AppDataSource from '../../../config/app-data-source'
import { ProgressPsEntity } from './progress-ps.entity'
import { ProgressGetWordParams, ProgressSaveParams, ProgressStatus } from '../progress.types'
import { IProgressRepository } from '../progress.interface'

export class ProgressPsRepository implements IProgressRepository<ProgressPsEntity> {
  private repo: Repository<ProgressPsEntity>

  constructor() {
    this.repo = AppDataSource.getRepository(ProgressPsEntity)
  }

  async getProgressByUserId(userId: number): Promise<ProgressPsEntity[]> {
    return this.repo
      .createQueryBuilder('progressPs')
      .where('progressPs.userId = :userId', { userId })
      .innerJoin('progressPs.word', 'word')
      .addSelect(['word.id', 'word.basic'])
      .getMany()
  }

  async getProgressByStatus(userId: number, status: ProgressStatus): Promise<ProgressPsEntity[]> {
    return this.repo
      .createQueryBuilder('progressPs')
      .where('progressPs.userId = :userId', { userId })
      .andWhere('progressPs.status = :status', { status })
      .innerJoin('progressPs.word', 'word')
      .addSelect(['word.id', 'word.basic', 'word.level'])
      .getMany()
  }

  // get word progress by user
  async getWordProgress(params: ProgressGetWordParams): Promise<ProgressPsEntity | null> {
    const { userId, wordId } = params
    return this.repo
      .createQueryBuilder('progressPs')
      .where('progressPs.userId = :userId', { userId })
      .andWhere('progressPs.wordId = :wordId', { wordId })
      .getOne()
  }
  
  // count words

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
}
