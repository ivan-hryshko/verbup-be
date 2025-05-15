import { Router } from "express"
import irrWordsEnRoutes from "../modules/irr-words-en/irr-words-en.route"

const routes = Router()

routes.use('/irr-words/:lang', irrWordsEnRoutes)

export default routes
