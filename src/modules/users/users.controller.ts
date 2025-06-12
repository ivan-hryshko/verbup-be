import { NextFunction, Request, Response } from 'express'
import { UsersService } from './users.service'

export class UsersController {
  private readonly service = new UsersService()

  create = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = await this.service.create(req.body)
    res.status(201).json(user)
  }

  getAll = async (req: Request, res: Response) => {
    const users = await this.service.getAll()
    res.status(200).json(users)
  }

  getById = async (req: Request, res: Response) => {
    const { id } = req.user
    const user = await this.service.getById(Number(id))
    res.status(200).json(user)
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.user
    const user = await this.service.update(Number(id), req.body)
    res.status(200).json(user)
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.user
    await this.service.delete(Number(id))
    res.status(204).send()
  }
}
