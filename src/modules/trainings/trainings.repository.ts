import { Repository } from 'typeorm'
import appDataSource from '../../config/app-data-source'
import { TrainingEntity } from './trainings.entity'
import { TrainingWordEntity } from './training-words.entity'

export class TrainingsRepository {
  private repository: Repository<TrainingEntity>
  private trainingWordsRepository: Repository<TrainingWordEntity>

  constructor() {
    this.repository = appDataSource.getRepository(TrainingEntity)
    this.trainingWordsRepository = appDataSource.getRepository(TrainingWordEntity)
  }

  async create(data: {
    userId: number
    mode: string
    type: string
    level: string
    questionCount: number
  }): Promise<TrainingEntity> {
    const training = this.repository.create({
      userId: data.userId,
      mode: data.mode,
      type: data.type,
      level: data.level,
      startTime: new Date(),
      endTime: null,
      questionCount: data.questionCount,
    })

    return this.repository.save(training)
  }

  async addTrainingWords(trainingId: number, irrWordIds: number[]): Promise<TrainingWordEntity[]> {
    const trainingWords = irrWordIds.map((irrWordId) =>
      this.trainingWordsRepository.create({
        trainingId,
        irrWordId,
        wasCorrect: null,
      }),
    )

    return this.trainingWordsRepository.save(trainingWords)
  }

  async findById(id: number): Promise<TrainingEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['trainingWords', 'trainingWords.irrWord'],
    })
  }

  async updateEndTime(id: number, endTime: Date): Promise<void> {
    await this.repository.update(id, { endTime })
  }

  async updateWordResult(trainingWordId: number, wasCorrect: boolean): Promise<void> {
    await this.trainingWordsRepository.update(trainingWordId, { wasCorrect })
  }
}
