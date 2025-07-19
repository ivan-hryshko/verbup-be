import { Repository } from 'typeorm'
import { FeedbackEntity } from './feedback.entity'
import appDataSource from '../../config/app-data-source'

export interface IFeedbackRepository {
  findAll(): Promise<FeedbackEntity[]>
  create(feedback: Partial<FeedbackEntity>): Promise<FeedbackEntity>
}

export class FeedbackRepository implements IFeedbackRepository {
  private readonly feedbackRepo: Repository<FeedbackEntity>

  constructor() {
    this.feedbackRepo = appDataSource.getRepository(FeedbackEntity)
  }

  async findAll(): Promise<FeedbackEntity[]> {
    return this.feedbackRepo.find()
  }

  async create(feedback: Partial<FeedbackEntity>): Promise<FeedbackEntity> {
    const newFeedback = this.feedbackRepo.create(feedback)
    return this.feedbackRepo.save(newFeedback)
  }
}
