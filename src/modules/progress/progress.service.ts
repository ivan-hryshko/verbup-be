import appDataSource from '../../config/app-data-source'
import { ProgressPsRepository } from './progress-ps/progress-ps.repository';


const progressPsRepository = new ProgressPsRepository();

export class ProgressService {
  
  static async save(data: any): Promise<any> {
    // check user
    // check word
    // check status

    // check ps
    const progressPs = await progressPsRepository.savePsProgress(data)
    // check pp
    return [progressPs]
  }
}
