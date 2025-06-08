import { Request, Response } from 'express'
import { Logger } from '../../utils/logger'
import { GamesService } from './games.service'

export class GamesController {
  private readonly gameService: GamesService;

  constructor() {
    this.gameService = new GamesService();
  }

  getWords = async (req: Request, res: Response): Promise<void> => {
    const words = await this.gameService.getWords({...req.query})
    // const userRes = await UsersResponse.create()

    res.status(200).json({ data: { words }})
  }
}
