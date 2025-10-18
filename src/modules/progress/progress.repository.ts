import { IrrWordType } from '../irr-words/irr-words.types'
import { ProgressPsRepository } from './progress-ps/progress-ps.repository'
import { ProgressPpRepository } from './progress-pp/progress-pp.repository'
import { IProgressRepositoryGeneral } from './progress.interface'
import { ProgressGetWordParams, ProgressSaveParams } from './progress.types'
import { ProgressPsEntity } from './progress-ps/progress-ps.entity'
import { ProgressPpEntity } from './progress-pp/progress-pp.entity'

export class ProgressRepository implements IProgressRepositoryGeneral {
  private readonly progressPsRepository: ProgressPsRepository
  private readonly progressPpRepository: ProgressPpRepository

  constructor() {
    this.progressPsRepository = new ProgressPsRepository()
    this.progressPpRepository = new ProgressPpRepository()
  }

  async saveProgress(type: IrrWordType, params: ProgressSaveParams): Promise<void> {
    if (type === IrrWordType.PS) {
      return this.progressPsRepository.saveProgress(params)
    }
    if (type === IrrWordType.PP) {
      return this.progressPpRepository.saveProgress(params)
    }
  }
  async getWordProgress(type: IrrWordType, params: ProgressGetWordParams): Promise<ProgressPsEntity | ProgressPpEntity | null> {
    if (type === IrrWordType.PS) {
      return this.progressPsRepository.getWordProgress(params)
    }
    if (type === IrrWordType.PP) {
      return this.progressPpRepository.getWordProgress(params)
    }
    return null
  }
}
