import { Request, Response } from 'express'
import { UsersService } from './users.service'

export class UsersController {
  private readonly service = new UsersService()

  create = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.service.create(req.body)
    return res.status(201).json(user)
  }

  getAll = async (req: Request, res: Response): Promise<Response> => {
    const users = await this.service.getAll()
    return res.status(200).json(users)
  }

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.user
    const user = await this.service.getById(Number(id))
    return res.status(200).json(user)
  }

  update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.user
    const user = await this.service.update(Number(id), req.body)
    return res.status(200).json(user)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.user
    await this.service.delete(Number(id))
    res.status(204).send()
  }
}
