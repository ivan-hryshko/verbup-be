import appDataSource from '../../config/app-data-source'
import { IrrWordType } from '../irr-words-en/irr-words.types';
import { ProgressPsRepository } from './progress-ps/progress-ps.repository';
import { ProgressStatus } from './progress.types';


const progressPsRepository = new ProgressPsRepository();
type SaveReqArgs = {
  userId: number
  words: [{
    wordId: number
    type: IrrWordType,
    status: ProgressStatus,
  }]
}
export class ProgressService {
  
  static async save(data: SaveReqArgs): Promise<any> {
    // check user
    // check word
    // check status

  const psWords = data.words
    .filter(word => word.type === 'ps')
    .map(word => ({
      wordId: Number(word.wordId),
      status: word.status,
  }));

    // check ps
    // const progressPs = await progressPsRepository.saveProgress(psWords)
  const progressPs = await progressPsRepository.saveProgress({
    userId: Number(data.userId),
    words: psWords,
  });
    // check pp
    // const progressPP = await progressPpRepository.saveProgress(ppWords)

    return [progressPs]
  }

  static async list(data: any): Promise<any> {
    const { userId } = data
    // check user

    // check ps
    const progressPs = await progressPsRepository.getProgressByUserId(userId)
    // check pp
    return [progressPs]
  }
}
