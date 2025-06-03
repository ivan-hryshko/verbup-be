import { Router } from 'express'
import { ctrlWrapper } from '../../utils/ctrlWrapper'
import { AuthController } from './auth.controller'

const router = Router()
const authController = new AuthController()

router.post('/register', ctrlWrapper(authController.register))
router.post('/login', ctrlWrapper(authController.login))
router.post('/refresh', ctrlWrapper(authController.refresh))

export default router
