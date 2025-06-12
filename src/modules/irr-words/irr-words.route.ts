import { Router } from 'express'
import multer from 'multer'
import { IrrWordsEnController } from './irr-words.controller'
import { ctrlWrapper } from '../../middlewares/ctrlWrapper'

const router = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const irrWordsEnController = new IrrWordsEnController()

router.get('/:lang/list', ctrlWrapper(irrWordsEnController.list))
router.post('/image', upload.single('image'), ctrlWrapper(irrWordsEnController.addImage))


export default router
