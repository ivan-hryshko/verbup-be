import { Router } from 'express'
import { IrrWordsEnController } from './irr-words-en.controller'

const router = Router()

router.get('/list', IrrWordsEnController.list)

export default router
