import { Router } from 'express'
import irrWordsEnRoutes from '../modules/irr-words/irr-words.route'
import usersRoutes from '../modules/users/users.route'
import authRoutes from '../modules/auth/auth.route'
import feedbackRoutes from '../modules/feedback/feedback.route'
import gamesRoutes from '../modules/games/games.route'
import progressRoutes from '../modules/progress/progress.route'
import statisticsRoutes from '../modules/statistics/daily-stats.route'

const routes = Router()

routes.use('/irr-words', irrWordsEnRoutes)
routes.use('/users', usersRoutes)
routes.use('/auth', authRoutes)
routes.use('/feedback', feedbackRoutes)
routes.use('/games', gamesRoutes)
routes.use('/progress', progressRoutes)
routes.use('/statistics', statisticsRoutes)

export default routes
