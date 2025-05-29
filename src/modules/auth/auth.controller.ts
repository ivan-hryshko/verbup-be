import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'
import { SessionService } from '../sessions/session.service'

export class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { accessToken, refreshToken } = await AuthService.register(req.body)

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })

    return res.status(201).json({
      message: 'Registration successful',
      accessToken,
    })
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' })
    }
    const currentRefreshToken = req.cookies?.refreshToken
    const { accessToken, refreshToken } = await AuthService.login(
      email,
      password,
      currentRefreshToken
    )
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })
    return res.status(200).json({ message: 'Login successfull', accessToken })
  }

  static async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token provided' })
      return
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await SessionService.refresh(refreshToken)
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })
    res.status(200).json({ accessToken })
  }
}
