// modules/irr-words-en/irr-words.repository.ts
import { Repository } from 'typeorm';
import AppDataSource from '../../config/app-data-source';
import { IrrWordEntity } from './irr-words.entity';
import { IrrWordLevel } from './irr-words.types';

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

  async getRandomWordsByLevel(level: IrrWordLevel, count: number): Promise<IrrWordEntity[]> {
    return this.repo
      .createQueryBuilder('word')
      .where('word.level = :level', { level })
      .orderBy('RANDOM()') // PostgreSQL syntax
      .limit(count)
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
