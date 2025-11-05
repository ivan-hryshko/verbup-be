import { setupTestContext, cleanupTestContext, TestContext } from './test-setup'
import { DailyStatsEntity } from '../daily-stats.entity'

describe('DailyStatsService - Main Operations', () => {
  let context: TestContext

  beforeEach(() => {
    context = setupTestContext()
  })

  afterEach(() => {
    cleanupTestContext()
  })

  describe('collectStats', () => {
    it('should collect and save statistics successfully', async () => {
      context.mockUserRepository.count.mockResolvedValue(12)
      context.mockStatsRepository.findOne.mockResolvedValue(null)
      context.mockStatsRepository.create.mockReturnValue({} as DailyStatsEntity)
      context.mockStatsRepository.save.mockResolvedValue({} as DailyStatsEntity)

      await context.service.collectStats()

      expect(context.mockUserRepository.count).toHaveBeenCalled()
      expect(context.mockStatsRepository.findOne).toHaveBeenCalled()
      expect(context.mockStatsRepository.create).toHaveBeenCalled()
      expect(context.mockStatsRepository.save).toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error')
      context.mockUserRepository.count.mockRejectedValue(error)

      await context.service.collectStats()

      expect(console.error).toHaveBeenCalledWith('❌ Error collecting daily stats:', error)
    })

    it('should log progress during collection', async () => {
      context.mockUserRepository.count.mockResolvedValue(8)
      context.mockStatsRepository.findOne.mockResolvedValue(null)
      context.mockStatsRepository.create.mockReturnValue({} as DailyStatsEntity)
      context.mockStatsRepository.save.mockResolvedValue({} as DailyStatsEntity)

      await context.service.collectStats()

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('📊 Collecting stats for'))
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('📈 Found 8 new registrations'))
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Created stats for'))
    })
  })
})
