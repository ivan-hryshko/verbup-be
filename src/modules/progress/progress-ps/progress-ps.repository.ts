// modules/irr-words-en/irr-words.repository.ts
import { Repository } from 'typeorm'
import AppDataSource from '../../../config/app-data-source'
import { ProgressPsEntity } from './progress-ps.entity'
import { ProgressSaveParams, ProgressStatus } from '../progress.types'
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
      .addSelect(['word.basic'])
      .getMany()
  }

  async saveProgress(params: ProgressSaveParams): Promise<ProgressPsEntity[]> {
    const preparedWords = params.words.map((param) => {
      return {
        user: { id: params.userId },
        word: { id: param.wordId },
        status: param.status,
      }
    })
    const progress = this.repo.create(preparedWords)
    return this.repo.save(progress)
  }
}
