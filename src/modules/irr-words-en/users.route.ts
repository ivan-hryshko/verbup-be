import { Router } from "express"
import { UsersController } from "../users/users.controller"

const router = Router()

router.post('/', UsersController.create)

export default router