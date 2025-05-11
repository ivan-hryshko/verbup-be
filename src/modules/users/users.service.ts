import { UsersRequestCreate } from "./users.request"
import { UsersRepository } from "./users.repository"


export class UsersService {
  static async create(payload: any): Promise<{}> {
    // const user = await UsersRepository.create()
    const user = {}
    return user
  }

  // public static generateTokenForUser(user: User) {
  //   const token = generateToken(user.toJSON())
  //   return token
  // }
}