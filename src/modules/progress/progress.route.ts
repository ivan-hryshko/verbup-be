import { Router } from 'express'
import { ctrlWrapper } from '../../middlewares/ctrlWrapper'
import { ProgressController } from './progress.controller'

const router = Router()
const progressController = new ProgressController()

router.post('/', ctrlWrapper(progressController.save))
router.get('/', ctrlWrapper(progressController.list))
router.get('/short', ctrlWrapper(progressController.short))
// router.post('/pp', ctrlWrapper(UsersController.getAll))

export default router
