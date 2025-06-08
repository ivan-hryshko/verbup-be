import { Router } from "express"
// import {IrrWordsEnController} from "./irr-words-en.controller"
import { GamesController } from "./games.controller"
import { ctrlWrapper } from "../../utils/ctrlWrapper"

const router = Router()
const gamesController = new GamesController()


router.get('/words', ctrlWrapper(gamesController.getWords))

export default router