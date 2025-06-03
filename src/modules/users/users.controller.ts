import { NextFunction, Request, Response } from 'express'
import { UsersService } from './users.service'

export class UsersController {
  private readonly service = new UsersService()

  async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    const user = await this.service.create(req.body)
    res.status(201).json(user)
  }

  async getAll(req: Request, res: Response) {
    const users = await this.service.getAll()
    res.status(200).json(users)
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params
    const user = await this.service.getById(Number(id))
    res.status(200).json(user)
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const user = await this.service.update(Number(id), req.body)
    res.status(200).json(user)
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params
    await this.service.delete(Number(id))
    res.status(204).send()
  }
}
