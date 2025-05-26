import { Router } from 'express'
import irrWordsEnRoutes from '../modules/irr-words-en/irr-words-en.route'
import usersRoutes from '../modules/users/users.route'
import authRoutes from '../modules/auth/auth.route'

const routes = Router()

routes.use('/irr-words/:lang', irrWordsEnRoutes)
routes.use('/users', usersRoutes)
routes.use('auth', authRoutes)

export default routes
