import { Router } from 'express'
import irrWordsEnRoutes from '../modules/irr-words-en/irr-words-en.route'
import usersRoutes from '../modules/users/users.route'

const routes = Router()

routes.use('/irr-words/:lang', irrWordsEnRoutes)
routes.use('/users', usersRoutes)

export default routes
