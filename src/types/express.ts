/// <reference types="express" />

// Add RequestValidation Interface on to Express's Request Interface.
import { UserEntity } from '../modules/users/users.entity'

declare global {
  namespace Express {
    interface Request {
      user: UserEntity
      flash(type: string, message: any): void
    }
  }
}

export {}
