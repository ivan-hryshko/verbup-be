import { Router } from 'express'
import { DailyStatsController } from './daily-stats.controller'
import { ctrlWrapper } from '../../middlewares/ctrlWrapper'

const router = Router()
const dailyStatsController = new DailyStatsController()

router.get('/', ctrlWrapper(dailyStatsController.getStats))
// router.post('/collect', ctrlWrapper(dailyStatsController.collectStatsManual))
// router.post('/notify', ctrlWrapper(dailyStatsController.sendNotificationManual))

export default router
