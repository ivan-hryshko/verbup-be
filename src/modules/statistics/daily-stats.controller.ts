import { Request, Response } from 'express'
import { DailyStatsService } from './daily-stats.service'

export class DailyStatsController {
  private readonly service = new DailyStatsService()

  getStats = async (req: Request, res: Response): Promise<void> => {
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10

    // Validate offset and limit
    if (
      isNaN(offset) ||
      isNaN(limit) ||
      offset < 0 ||
      limit < 1 ||
      limit > 100
    ) {
      res.status(400).json({
        error: 'Invalid pagination parameters. Offset must be >= 0, limit must be between 1 and 100',
      })
      return
    }

    const result = await this.service.getStats(offset, limit)
    res.status(200).json(result)
  }
}
