import { InsertResult } from 'typeorm'
import { ProgressSaveParams } from './progress.types'

export interface IProgressRepository<T> {
  getProgressByUserId(userId: number): Promise<T[]>
  saveProgress(params: ProgressSaveParams): Promise<InsertResult>
}
