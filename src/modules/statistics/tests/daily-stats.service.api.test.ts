import { setupTestContext, cleanupTestContext, TestContext } from './test-setup'

describe('DailyStatsService - API', () => {
  let context: TestContext

  beforeEach(() => {
    context = setupTestContext()
  })

  afterEach(() => {
    cleanupTestContext()
  })

  describe('getStats', () => {
    it('should return paginated stats with default values', async () => {
      const mockStats = [
        {
          id: 1,
          stat_date: '2025-11-05',
          registrations: 10,
        } as any,
      ]

      context.mockStatsRepository.findAndCount = jest.fn().mockResolvedValue([mockStats, 1])

      const result = await context.service.getStats()

      expect(context.mockStatsRepository.findAndCount).toHaveBeenCalledWith({
        order: { stat_date: 'DESC' },
        skip: 0,
        take: 10,
      })
      expect(result.data).toEqual(mockStats)
      expect(result.total).toBe(1)
    })

    it('should return paginated stats with custom offset and limit', async () => {
      const mockStats = [
        {
          id: 2,
          stat_date: '2025-11-04',
          registrations: 5,
        } as any,
      ]

      context.mockStatsRepository.findAndCount = jest.fn().mockResolvedValue([mockStats, 100])

      const result = await context.service.getStats(20, 50)

      expect(context.mockStatsRepository.findAndCount).toHaveBeenCalledWith({
        order: { stat_date: 'DESC' },
        skip: 20,
        take: 50,
      })
      expect(result.data).toEqual(mockStats)
      expect(result.total).toBe(100)
    })

    it('should return empty array when no stats found', async () => {
      context.mockStatsRepository.findAndCount = jest.fn().mockResolvedValue([[], 0])

      const result = await context.service.getStats(0, 10)

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should order results by stat_date DESC', async () => {
      const mockStats = [
        { id: 2, stat_date: '2025-11-05' } as any,
        { id: 1, stat_date: '2025-11-04' } as any,
      ]

      context.mockStatsRepository.findAndCount = jest.fn().mockResolvedValue([mockStats, 2])

      const result = await context.service.getStats()

      expect(context.mockStatsRepository.findAndCount).toHaveBeenCalledWith({
        order: { stat_date: 'DESC' },
        skip: 0,
        take: 10,
      })
      expect(result.data[0].stat_date).toBe('2025-11-05')
      expect(result.data[1].stat_date).toBe('2025-11-04')
    })
  })
})
