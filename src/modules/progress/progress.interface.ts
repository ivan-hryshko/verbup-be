import { ProgressSaveParams } from './progress.types'

export interface IProgressRepository<T> {
  getProgressByUserId(userId: number): Promise<T[]>
  getProgressByStatus(userId: number, status: string): Promise<T[]>
  saveProgress(params: ProgressSaveParams): Promise<void>
}
