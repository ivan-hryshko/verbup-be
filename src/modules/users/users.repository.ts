export type UserCreteParams = {
  email: string
  name: string
  password: string
}

export class UsersRepository {
  static async create(params: UserCreteParams) {
    const user = {}
    return user
  }
}
