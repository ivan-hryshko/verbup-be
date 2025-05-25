import { NextFunction, Request, Response } from 'express'
import { UsersService } from './users.service'

export class UsersController {
  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const user = await UsersService.create(req.body)
    res.status(201).json(user)
  }

  static async getAll(req: Request, res: Response) {
    const users = await UsersService.getAll()
    res.status(200).json(users)
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params
    const user = await UsersService.getById(Number(id))
    res.status(200).json(user)
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params
    const user = await UsersService.update(Number(id), req.body)
    res.status(200).json(user)
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params
    await UsersService.delete(Number(id))
    res.status(204).send()
  }
}
