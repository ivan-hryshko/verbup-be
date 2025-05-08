import { Request, Response } from 'express'
import { Logger } from '../../utils/logger'
// import { UsersValidator } from './validator/users.validator'
import { UsersService } from './users.service'
import { UsersResponse } from './users.response'

export class UsersController {
  static create = async (req: Request, res: Response): Promise<void> => {
    // const dto = UsersValidator.create(req, res)

    try {
      const user = await UsersService.create({...req.body})
      // const token = UsersService.generateTokenForUser(user)
      // const userRes = await UsersResponse.create(token)
      const userRes = await UsersResponse.create()

      res.status(200).json(userRes)
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
