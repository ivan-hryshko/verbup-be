import { setupTestContext, cleanupTestContext, TestContext } from './test-setup'
import { DailyStatsEntity } from '../daily-stats.entity'

describe('DailyStatsService - Data Persistence', () => {
  let context: TestContext

  beforeEach(() => {
    context = setupTestContext()
  })

  afterEach(() => {
    cleanupTestContext()
  })

  describe('saveOrUpdateStats', () => {
    it('should update existing stats when record exists', async () => {
      const statDate = '2025-11-04'
      const registrations = 10
      const progressStats = { totalWords: 50, uniqueUsers: 10, easy: 20, medium: 20, hard: 10 }
      const existingStats = {
        id: 1,
        stat_date: statDate,
        registrations: 5,
        games_finished: 0,
      } as DailyStatsEntity

      context.mockStatsRepository.findOne.mockResolvedValue(existingStats)
      context.mockStatsRepository.save.mockResolvedValue(existingStats)

      await (context.service as any).saveOrUpdateStats(statDate, registrations, progressStats)

      expect(context.mockStatsRepository.findOne).toHaveBeenCalledWith({
        where: { stat_date: statDate },
      })
      expect(existingStats.registrations).toBe(10)
      expect(existingStats.words_progress_saved).toBe(50)
      expect(existingStats.unique_users_progress).toBe(10)
      expect(context.mockStatsRepository.save).toHaveBeenCalledWith(existingStats)
    })

    it('should create new stats when record does not exist', async () => {
      const statDate = '2025-11-04'
      const registrations = 7
      const progressStats = { totalWords: 30, uniqueUsers: 5, easy: 10, medium: 10, hard: 10 }
      const newStats = {
        id: 1,
        stat_date: statDate,
        registrations,
        games_finished: 0,
      } as DailyStatsEntity

      context.mockStatsRepository.findOne.mockResolvedValue(null)
      context.mockStatsRepository.create.mockReturnValue(newStats)
      context.mockStatsRepository.save.mockResolvedValue(newStats)

      await (context.service as any).saveOrUpdateStats(statDate, registrations, progressStats)

      expect(context.mockStatsRepository.findOne).toHaveBeenCalledWith({
        where: { stat_date: statDate },
      })
      expect(context.mockStatsRepository.create).toHaveBeenCalledWith({
        stat_date: statDate,
        registrations,
        words_progress_saved: 30,
        unique_users_progress: 5,
        words_progress_easy: 10,
        words_progress_medium: 10,
        words_progress_hard: 10,
        games_finished: 0,
        games_finished_easy: 0,
        games_finished_medium: 0,
        games_finished_hard: 0,
        users_completed_platform: 0,
      })
      expect(context.mockStatsRepository.save).toHaveBeenCalledWith(newStats)
    })
  })

  describe('updateExistingStats', () => {
    it('should update all statistics and save', async () => {
      const stats = {
        id: 1,
        stat_date: '2025-11-04',
        registrations: 5,
      } as DailyStatsEntity
      const registrations = 15
      const progressStats = { totalWords: 40, uniqueUsers: 8, easy: 15, medium: 15, hard: 10 }

      context.mockStatsRepository.save.mockResolvedValue(stats)

      await (context.service as any).updateExistingStats(stats, registrations, progressStats, '2025-11-04')

      expect(stats.registrations).toBe(15)
      expect(stats.words_progress_saved).toBe(40)
      expect(stats.unique_users_progress).toBe(8)
      expect(stats.words_progress_easy).toBe(15)
      expect(stats.words_progress_medium).toBe(15)
      expect(stats.words_progress_hard).toBe(10)
      expect(context.mockStatsRepository.save).toHaveBeenCalledWith(stats)
    })
  })

  describe('createNewStats', () => {
    it('should create stats with correct values and defaults', async () => {
      const statDate = '2025-11-04'
      const registrations = 3
      const progressStats = { totalWords: 25, uniqueUsers: 4, easy: 8, medium: 9, hard: 8 }
      const newStats = {
        id: 1,
        stat_date: statDate,
        registrations,
      } as DailyStatsEntity

      context.mockStatsRepository.create.mockReturnValue(newStats)
      context.mockStatsRepository.save.mockResolvedValue(newStats)

      await (context.service as any).createNewStats(statDate, registrations, progressStats)

      expect(context.mockStatsRepository.create).toHaveBeenCalledWith({
        stat_date: statDate,
        registrations,
        words_progress_saved: 25,
        unique_users_progress: 4,
        words_progress_easy: 8,
        words_progress_medium: 9,
        words_progress_hard: 8,
        games_finished: 0,
        games_finished_easy: 0,
        games_finished_medium: 0,
        games_finished_hard: 0,
        users_completed_platform: 0,
      })
      expect(context.mockStatsRepository.save).toHaveBeenCalledWith(newStats)
    })
  })
})
