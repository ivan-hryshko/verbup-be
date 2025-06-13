import { Router } from 'express'
import { ctrlWrapper } from '../../middlewares/ctrlWrapper'
import { UploadController } from './upload.controller'

const router = Router()
const uploadController = new UploadController()

router.post('/image', ctrlWrapper(uploadController.addImage))

export default router
