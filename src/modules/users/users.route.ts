import { Router } from 'express'
import { UsersController } from './users.controller'
import { ctrlWrapper } from '../../utils/ctrlWrapper'

const router = Router()

router.post('/users', ctrlWrapper(UsersController.create))
router.get('/users', ctrlWrapper(UsersController.getAll))
router.get('/users/:id')
router.patch('/users/:id')
router.delete('users/:id')

export default router
