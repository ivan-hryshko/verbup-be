import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'

export class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const user = await AuthService.register(req.body)
    return res.status(201).json(user)
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body
    await AuthService.login(email, password)
    return res.status(200).json({ message: 'Login successfull' })
  }
}
