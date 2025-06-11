import { Router } from 'express'
import { UsersController } from './users.controller'
import { ctrlWrapper } from '../../middlewares/ctrlWrapper'
import { authenticate } from '../../middlewares/authenticate'

const router = Router()
const usersController = new UsersController()

router.use(authenticate)

// router.post('/', ctrlWrapper(usersController.create))
// router.get('/', ctrlWrapper(usersController.getAll))
router.get('/', ctrlWrapper(usersController.getById))
router.patch('/', ctrlWrapper(usersController.update))
router.delete('/', ctrlWrapper(usersController.delete))

export default router
