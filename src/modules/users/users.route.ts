import { Router } from 'express'
import { UsersController } from './users.controller'
import { ctrlWrapper } from '../../utils/ctrlWrapper'

const router = Router()

router.post('/', ctrlWrapper(UsersController.create))
router.get('/', ctrlWrapper(UsersController.getAll))
router.get('/:id', ctrlWrapper(UsersController.getById))
router.patch('/:id', ctrlWrapper(UsersController.update))
router.delete('/:id', ctrlWrapper(UsersController.delete))

export default router
