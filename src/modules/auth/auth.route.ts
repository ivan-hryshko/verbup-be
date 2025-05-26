import { Router } from 'express'
import { ctrlWrapper } from '../../utils/ctrlWrapper'
import { AuthController } from './auth.controller'

const router = Router()

router.post('/register', ctrlWrapper(AuthController.register))
router.post('/login', ctrlWrapper(AuthController.login))

export default router
