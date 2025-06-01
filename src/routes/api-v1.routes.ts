import { Router } from 'express'
import irrWordsEnRoutes from '../modules/irr-words-en/irr-words-en.route'
import usersRoutes from '../modules/users/users.route'
import authRoutes from '../modules/auth/auth.route'
import gamesRoutes from '../modules/games/games.route'

const routes = Router()

routes.use('/irr-words/:lang', irrWordsEnRoutes)
routes.use('/users', usersRoutes)
routes.use('/auth', authRoutes)
routes.use('/games', gamesRoutes)

export default routes
