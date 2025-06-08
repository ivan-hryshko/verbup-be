// modules/irr-words-en/irr-words.repository.ts
import { Repository } from 'typeorm';
import AppDataSource from '../../config/app-data-source';
import { IrrWordEntity } from './irr-words.entity';
import { IrrWordLang, IrrWordLevel } from './irr-words.types';

export type GetRandomWordsByLevelParams = {
  level: IrrWordLevel
  count: number
  lang: IrrWordLang
  userId: number
}

export class IrrWordRepository {
  private repo: Repository<IrrWordEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(IrrWordEntity);
  }

  async findAll(): Promise<IrrWordEntity[]> {
    return this.repo.find();
  }

  async findByBaseForm(base_form: string): Promise<IrrWordEntity | null> {
    return this.repo.findOneBy({ basic: base_form });
  }

  async getRandomWordsByLevel(params: GetRandomWordsByLevelParams): Promise<IrrWordEntity[]> {
return this.repo
    .createQueryBuilder('word')
    .leftJoin('word.progressPs', 'progressPs', 'progressPs.userId = :userId AND progressPs.status = :studied', { userId: params.userId, studied: 'studied' })
    .leftJoin('word.progressPp', 'progressPp', 'progressPp.userId = :userId AND progressPp.status = :studied', { userId: params.userId, studied: 'studied' })
    .where('word.level = :level', { level: params.level })
    .andWhere('word.lang = :lang', { lang: params.lang })
    .andWhere('progressPs.id IS NULL')
    .andWhere('progressPp.id IS NULL')
    .orderBy('RANDOM()') // PostgreSQL syntax
    .limit(params.count)
    .getMany();
  }

  async save(word: Partial<IrrWordEntity>): Promise<IrrWordEntity> {
    const newWord = this.repo.create(word);
    return this.repo.save(newWord);
  }

  async saveMany(words: Partial<IrrWordEntity>[]): Promise<IrrWordEntity[]> {
    const newWords = this.repo.create(words);
    return this.repo.save(newWords);
  }

  async deleteById(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
