import { Router } from 'express'
// import {IrrWordsEnController} from "./irr-words-en.controller"
import { GamesController } from './games.controller'
import { ctrlWrapper } from '../../middlewares/ctrlWrapper'

const router = Router()
const gamesController = new GamesController()

router.get('/words', ctrlWrapper(gamesController.getWords))
router.get('/start', ctrlWrapper(gamesController.startTraining))

export default router
