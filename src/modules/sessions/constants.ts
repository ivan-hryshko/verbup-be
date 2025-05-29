import jwt from 'jsonwebtoken'

export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'access_secret'
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEM_SECRET || 'refresh_secret'

export const FIFTEEN_MINUTES = 1000 * 60 * 15
export const THREE_DAYS = 1000 * 60 * 60 * 24 * 3

export const generateAccessToken = (userId: number): string => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  })
}

export const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: '3d',
  })
}
