import path from 'path'
import fs from 'fs'
import swaggerUI from 'swagger-ui-express'
import createHttpError from 'http-errors'
import { NextFunction, Request, Response } from 'express'

export const swaggerDocs = () => {
  try {
    const swaggerPath = path.resolve(__dirname, '../swagger/swagger.json')
    const swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc)]
  } catch (err) {
    return (req: Request, res: Response, next: NextFunction) =>
      next(createHttpError(500, 'Can`t load swagger docs'))
  }
}
