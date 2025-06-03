import { Router } from 'express'
import { ctrlWrapper } from '../../utils/ctrlWrapper'
import { ProgressController } from './progress.controller'

const router = Router()

router.post('/', ctrlWrapper(ProgressController.save))
router.get('/', ctrlWrapper(ProgressController.list))
// router.post('/pp', ctrlWrapper(UsersController.getAll))

export default router
