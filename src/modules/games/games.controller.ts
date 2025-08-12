import { Request, Response } from 'express'
import { GamesService } from './games.service'
import { getUserFromToken } from '../sessions/constants'

export class GamesController {
  private readonly gameService: GamesService

  constructor() {
    this.gameService = new GamesService()
  }

  getWords = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserFromToken(req.get('Authorization'))?.id ?? null

    const words = await this.gameService.getWords({ ...req.query, userId })
    // const userRes = await UsersResponse.create()

    res.status(200).json({ data: { words } })
  }
}
