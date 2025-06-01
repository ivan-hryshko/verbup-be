import { Request, Response } from 'express'
import { Logger } from '../../utils/logger'
import { GamesService } from './games.service'

const gameService = new GamesService();
export class GamesController {
  static getWords = async (req: Request, res: Response): Promise<void> => {
    try {
      const words = await gameService.getWords({...req.query})
      // const userRes = await UsersResponse.create()

      res.status(200).json({ data: { words }})
    } catch (error: any) {
      Logger.error('Error creating user:', error)
      res.status(500).json({ message: 'Error get game words' })
    }
  }
}
