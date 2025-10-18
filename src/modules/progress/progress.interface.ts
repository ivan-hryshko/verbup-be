import { IrrWordType } from '../irr-words/irr-words.types'
import { ProgressPpEntity } from './progress-pp/progress-pp.entity'
import { ProgressPsEntity } from './progress-ps/progress-ps.entity'
import { ProgressGetWordParams, ProgressSaveParams } from './progress.types'

export interface IProgressRepository<T> {
  getProgressByUserId(userId: number): Promise<T[]>
  getProgressByStatus(userId: number, status: string): Promise<T[]>
  saveProgress(params: ProgressSaveParams): Promise<void>
  getWordProgress(params: ProgressGetWordParams): Promise<ProgressPsEntity | ProgressPpEntity | null>
}
export interface IProgressRepositoryGeneral {
  saveProgress(type: IrrWordType, params: ProgressSaveParams): Promise<void>
  getWordProgress(type: IrrWordType, params: ProgressGetWordParams): Promise<ProgressPsEntity | ProgressPpEntity | null>
}
