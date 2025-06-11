import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import { verify } from 'jsonwebtoken'
import { SessionEntity } from '../modules/sessions/session.entity'
import appDataSource from '../config/app-data-source'
import ENVS from '../config/envs'
import { UserEntity } from '../modules/users/users.entity'

const sessionRepository = appDataSource.getRepository(SessionEntity)

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    return next(createHttpError(401, 'Please provide Authorization header'))
  }

  const [bearer, token] = authHeader.split(' ')
  if (bearer !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Auth header should be of type Bearer'))
  }

  const payload = verify(token, ENVS.JWT_ACCESS_SECRET!) as {
    userId: number
  }

  const session = await sessionRepository.findOne({
    where: { user: { id: payload.userId } },
    relations: ['user'],
  })

  if (!session) {
    return next(createHttpError(401, 'Session not found'))
  }

  if (session.expiresAt < new Date()) {
    return next(createHttpError(410, 'Access token expired'))
  }

  req.user = session.user as UserEntity
  next()
}
