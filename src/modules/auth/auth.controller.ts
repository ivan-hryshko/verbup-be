import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'
import { SessionService } from '../sessions/session.service'

export class AuthController {
  private readonly authService = new AuthService()
  private readonly sessionService = new SessionService()

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const { accessToken, refreshToken } = await this.authService.register(
      req.body
    )

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

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    const currentRefreshToken = req.cookies?.refreshToken
    const { accessToken, refreshToken } = await this.authService.login(
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

  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const refreshToken = req.cookies?.refreshToken
    const { accessToken, refreshToken: newRefreshToken } =
      await this.sessionService.refresh(refreshToken)
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })
    res.status(200).json({ accessToken })
  }
}
