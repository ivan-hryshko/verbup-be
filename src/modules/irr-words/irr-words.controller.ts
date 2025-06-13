import { Request, Response } from 'express'
import { Logger } from '../../utils/logger'
import { IrrWordsService } from './irr-words.service'

export class IrrWordsEnController {
  private readonly irrWordsService = new IrrWordsService()

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const words = await this.irrWordsService.list({ ...req.body })
      // const userRes = await UsersResponse.create()

      res.status(200).json({ data: { words } })
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(400).json({ message: 'User with given email already exists' })
      } else {
        Logger.error('Error creating user:', error)
        res.status(500).json({ message: 'Error creating user', error })
      }
    }
  }

  addImage = async (req: Request, res: Response): Promise<any> => {
    const progress = await this.irrWordsService.addImage({...req.body, file: req.file})
    res.status(200).json({ data: progress })
  }
  getImage = async (req: Request, res: Response): Promise<any> => {
    const progress = await this.irrWordsService.getImage({...req.query})
    res.status(200).json({ data: progress })
  }
}
