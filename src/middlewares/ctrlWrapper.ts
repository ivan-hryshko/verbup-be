import { Request, Response, NextFunction } from 'express'

export function ctrlWrapper(
  ctrl: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ctrl(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
