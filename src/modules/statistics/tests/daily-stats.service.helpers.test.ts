import { setupTestContext, cleanupTestContext, TestContext } from './test-setup'

describe('DailyStatsService - Helpers', () => {
  let context: TestContext

  beforeEach(() => {
    context = setupTestContext()
  })

  afterEach(() => {
    cleanupTestContext()
  })

  describe('getYesterdayDateRange', () => {
    it('should return correct date range for yesterday', () => {
      const result = (context.service as any).getYesterdayDateRange()

      const expectedYesterday = new Date()
      expectedYesterday.setDate(expectedYesterday.getDate() - 1)
      expectedYesterday.setHours(0, 0, 0, 0)

      const expectedToday = new Date()
      expectedToday.setHours(0, 0, 0, 0)

      expect(result.start.getTime()).toBe(expectedYesterday.getTime())
      expect(result.end.getTime()).toBe(expectedToday.getTime())
    })

    it('should return dates with time set to midnight', () => {
      const result = (context.service as any).getYesterdayDateRange()

      expect(result.start.getHours()).toBe(0)
      expect(result.start.getMinutes()).toBe(0)
      expect(result.start.getSeconds()).toBe(0)
      expect(result.start.getMilliseconds()).toBe(0)

      expect(result.end.getHours()).toBe(0)
      expect(result.end.getMinutes()).toBe(0)
      expect(result.end.getSeconds()).toBe(0)
      expect(result.end.getMilliseconds()).toBe(0)
    })
  })

  describe('formatStatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const testDate = new Date('2025-11-05T14:30:00Z')
      const result = (context.service as any).formatStatDate(testDate)

      expect(result).toBe('2025-11-05')
    })

    it('should handle dates with single-digit months and days', () => {
      const testDate = new Date('2025-01-05T00:00:00Z')
      const result = (context.service as any).formatStatDate(testDate)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
