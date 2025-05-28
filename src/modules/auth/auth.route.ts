import { Router } from 'express'
import { ctrlWrapper } from '../../utils/ctrlWrapper'
import { AuthController } from './auth.controller'

const router = Router()

router.post('/register', ctrlWrapper(AuthController.register))
router.post('/login', ctrlWrapper(AuthController.login))
router.post('/refresh', ctrlWrapper(AuthController.refresh))

export default router
