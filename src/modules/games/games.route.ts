import { Router } from "express"
// import {IrrWordsEnController} from "./irr-words-en.controller"
import { GamesController } from "./games.controller"

const router = Router()

router.get('/words', GamesController.getWords)

export default router