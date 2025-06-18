import { Request, Response } from 'express'
import { HttpError } from 'http-errors'
import { Logger } from './../utils/logger'

export const errorHandler = (err: HttpError | Error, req: Request, res: Response) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: err,
    })
    Logger.error('HttpError', err)

    return
  }
  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: err,
  })
  Logger.error('Uncought error', err)
}
