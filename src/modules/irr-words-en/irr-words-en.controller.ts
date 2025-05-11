import { Request, Response } from 'express'
import { Logger } from '../../utils/logger'
import { IrrWordsEnService } from './irr-words-en.service'

export class IrrWordsEnController {
  static list = async (req: Request, res: Response): Promise<void> => {
    try {
      const words = await IrrWordsEnService.list({...req.body})
      // const userRes = await UsersResponse.create()

      res.status(200).json({ data: { words }})
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(400).json({ message: 'User with given email already exists' })
      } else {
        Logger.error('Error creating user:', error)
        res.status(500).json({ message: 'Error creating user', error })
      }
    }
  }
}
