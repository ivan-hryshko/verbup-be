// modules/irr-words-en/irr-words.repository.ts
import { Repository } from 'typeorm'
import AppDataSource from '../../config/app-data-source'
import { IrrWordEntity } from './irr-words.entity'
import { IrrWordLang, IrrWordLevel, IrrWordType } from './irr-words.types'
import { GameWord } from '../games/games.type'

export type GetRandomWordsByLevelParams = {
  level: IrrWordLevel
  count: number
  lang: IrrWordLang
  userId: number
}
export type GetWordsByBaseParams = {
  basic: string
  lang: IrrWordLang
}
export type GetWordsAll = {
  lang?: IrrWordLang
}

export class IrrWordRepository {
  private repo: Repository<IrrWordEntity>

  constructor() {
    this.repo = AppDataSource.getRepository(IrrWordEntity)
  }

  async findAll(params: GetWordsAll): Promise<IrrWordEntity[]> {
    let qb = this.repo.createQueryBuilder('word')
    if (params?.lang) {
      qb = qb.where('word.lang = :lang', { lang: params.lang })
    }
    return qb.getMany()
  }

  async findByBaseForm(base_form: string): Promise<IrrWordEntity | null> {
    return this.repo.findOneBy({ basic: base_form })
  }

  async getWordsByBase(params: GetWordsByBaseParams): Promise<IrrWordEntity | null> {
    return this.repo
      .createQueryBuilder('word')
      .where('word.lang = :lang', { lang: params.lang })
      .andWhere('word.basic = :basic', { basic: params.basic })
      .getOne()
  }
  async getRandomWordsByLevel(params: GetRandomWordsByLevelParams): Promise<IrrWordEntity[]> {
    return this.repo
      .createQueryBuilder('word')
      .leftJoin(
        'word.progressPs',
        'progressPs',
        'progressPs.userId = :userId AND progressPs.status = :studied',
        { userId: params.userId, studied: 'studied' },
      )
      .leftJoin(
        'word.progressPp',
        'progressPp',
        'progressPp.userId = :userId AND progressPp.status = :studied',
        { userId: params.userId, studied: 'studied' },
      )
      .where('word.level = :level', { level: params.level })
      .andWhere('word.lang = :lang', { lang: params.lang })
      .andWhere('progressPs.id IS NULL')
      .andWhere('progressPp.id IS NULL')
      .orderBy('RANDOM()') // PostgreSQL syntax
      .limit(params.count)
      .getMany()
  }

  async getAvailableWordsByType(
    type: IrrWordType,
    level: string,
    lang: string,
    userId: number,
  ): Promise<GameWord[]> {
    const qb = this.repo.createQueryBuilder('word')

    if (type === 'ps') {
      qb.leftJoin(
        'word.progressPs',
        'progressPs',
        'progressPs.userId = :userId AND progressPs.status = :studied',
        { userId, studied: 'studied' },
      )
        .andWhere('progressPs.id IS NULL')
        .addSelect(['word.pastSimple', 'word.psSound'])
    } else {
      qb.leftJoin(
        'word.progressPp',
        'progressPp',
        'progressPp.userId = :userId AND progressPp.status = :studied',
        { userId, studied: 'studied' },
      )
        .andWhere('progressPp.id IS NULL')
        .addSelect(['word.pastParticiple', 'word.ppSound'])
    }

    return qb
      .where('word.level = :level', { level })
      .andWhere('word.lang = :lang', { lang })
      .getMany()
      .then((words) =>
        words.map((word) => ({
          ...word,
          type,
        })),
      )
  }

  async save(word: Partial<IrrWordEntity>): Promise<IrrWordEntity> {
    const newWord = this.repo.create(word)
    return this.repo.save(newWord)
  }

  async saveMany(words: Partial<IrrWordEntity>[]): Promise<IrrWordEntity[]> {
    const newWords = this.repo.create(words)
    return this.repo.save(newWords)
  }

  async deleteById(id: number): Promise<void> {
    await this.repo.delete(id)
  }
}
