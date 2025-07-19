import { Router } from 'express'
import { FeedbackController } from './feedback.controller'
import { ctrlWrapper } from '../../middlewares/ctrlWrapper'

const router = Router()
const feedbackController = new FeedbackController()

router.post('/', ctrlWrapper(feedbackController.create))
// router.get('/', ctrlWrapper(feedbackController.getAll))

export default router
