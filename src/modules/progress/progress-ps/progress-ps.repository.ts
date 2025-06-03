// modules/irr-words-en/irr-words.repository.ts
import { Repository } from 'typeorm';
import AppDataSource from '../../../config/app-data-source';
import { ProgressPsEntity } from './progress-ps.entity';
import { ProgressStatus } from '../progress.types';

type SavePsParams = {
  wordId: number
  userId: number
  status: ProgressStatus
}

export interface IProgressPsRepository{
  getProgressByUserId(userId: number): Promise<ProgressPsEntity[]>
  savePsProgress(params: SavePsParams): void
}



export class ProgressPsRepository implements IProgressPsRepository {
  private repo: Repository<ProgressPsEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(ProgressPsEntity);
  }

  async getProgressByUserId(userId: number): Promise<ProgressPsEntity[]> {
    return this.repo
      .createQueryBuilder('progressPs')
      .where('progressPs.userId = :userId', { userId })
      .innerJoin('progressPs.word', 'word')
      .addSelect(['word.id', 'word.basic'])
      .getMany();
  }

  async savePsProgress(params: SavePsParams): Promise<ProgressPsEntity> {
    const prepared = {
      user: { id: params.userId },
      word: { id: params.wordId },
      status: params.status,
    }
    const newWord = this.repo.create(prepared);
    return this.repo.save(newWord);
  }
}
