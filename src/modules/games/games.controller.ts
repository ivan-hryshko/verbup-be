import { Request, Response } from 'express'
import { GetWordService } from './services/get-words.service'
import { getUserFromToken } from '../sessions/constants'
import { StartTrainingService } from '../trainings/services/start-training.service'

export class GamesController {
  private readonly getWordService: GetWordService
  private readonly startTrainingService: StartTrainingService

  constructor() {
    this.getWordService = new GetWordService()
    this.startTrainingService = new StartTrainingService()
  }

  getWords = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserFromToken(req.get('Authorization'))?.id ?? null

    const words = await this.getWordService.execute({ ...req.query, userId })
    // const userRes = await UsersResponse.create()

    res.status(200).json({ data: { words } })
  }

  startTraining = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserFromToken(req.get('Authorization'))?.id ?? null

    const result = await this.startTrainingService.execute({ ...req.query, userId })

    res.status(200).json({ data: result })
  }
}
