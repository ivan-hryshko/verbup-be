import { Router } from 'express'
import { UsersController } from './users.controller'
import { ctrlWrapper } from '../../utils/ctrlWrapper'

const router = Router()
const usersController = new UsersController()

router.post('/', ctrlWrapper(usersController.create))
router.get('/', ctrlWrapper(usersController.getAll))
router.get('/:id', ctrlWrapper(usersController.getById))
router.patch('/:id', ctrlWrapper(usersController.update))
router.delete('/:id', ctrlWrapper(usersController.delete))

export default router
