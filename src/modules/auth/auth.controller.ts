import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { SessionService } from '../sessions/session.service'

export class AuthController {
  private readonly authService = new AuthService()
  private readonly sessionService = new SessionService()

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body)
    res.status(201).json(result)
  }

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query
    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: 'Verification token is required' })
      return
    }
    const result = await this.authService.verifyEmail(token)
    res.status(200).json(result)
  }

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body
    const currentRefreshToken = req.cookies?.refreshToken
    const { accessToken, refreshToken, user } = await this.authService.login(
      email,
      password,
      currentRefreshToken,
    )
    const isLocalhost = req.hostname.includes('localhost')
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      secure: !isLocalhost, // на локалці false, на проді true
      sameSite: isLocalhost ? 'lax' : 'none',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })
    res.status(200).json({ message: 'Login successfull', accessToken, user })
  }

  refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      res.status(401).json({ message: 'No refresh token provided' })
      return
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await this.sessionService.refresh(refreshToken)

    const isLocalhost = req.hostname.includes('localhost')

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      secure: !isLocalhost, // на локалці false, на проді true
      sameSite: isLocalhost ? 'lax' : 'none',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    })
    res.status(200).json({ message: 'Access token refreshed', accessToken })
  }
}
