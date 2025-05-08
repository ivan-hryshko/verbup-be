import { ValidationErrorItem } from "sequelize"
import { User } from "../../models/users.model"
import { generateToken } from "../../utils/jwt"
import { UsersRequestCreate } from "./users.request"
import { UsersRepository } from "./users.repository"


export class UsersService {
  static async create(dto: UsersRequestCreate): Promise<User> {
    const user = await UsersRepository.create(dto)
    return user
  }

  public static generateTokenForUser(user: User) {
    const token = generateToken(user.toJSON())
    return token
  }
}