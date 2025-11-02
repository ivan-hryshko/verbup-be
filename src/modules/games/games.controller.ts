import { Request, Response } from 'express'
import { GetWordService } from './services/get-words.service'
import { getUserFromToken } from '../sessions/constants'

export class GamesController {
  private readonly getWordService: GetWordService

  constructor() {
    this.getWordService = new GetWordService()
  }

  getWords = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserFromToken(req.get('Authorization'))?.id ?? null

    const words = await this.getWordService.execute({ ...req.query, userId })
    // const userRes = await UsersResponse.create()

    res.status(200).json({ data: { words } })
  }
}
