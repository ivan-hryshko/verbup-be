import { setupTestContext, cleanupTestContext, TestContext } from './test-setup'
import { Between } from 'typeorm'
import { IrrWordLevelEnum } from '../../irr-words/irr-words.types'

describe('DailyStatsService - Data Collection', () => {
  let context: TestContext

  beforeEach(() => {
    context = setupTestContext()
  })

  afterEach(() => {
    cleanupTestContext()
  })

  describe('countRegistrations', () => {
    it('should call repository.count with correct date range', async () => {
      const startDate = new Date('2025-11-04T00:00:00Z')
      const endDate = new Date('2025-11-05T00:00:00Z')

      context.mockUserRepository.count.mockResolvedValue(5)

      const result = await (context.service as any).countRegistrations(startDate, endDate)

      expect(context.mockUserRepository.count).toHaveBeenCalledWith({
        where: {
          created_at: Between(startDate, endDate),
        },
      })
      expect(result).toBe(5)
    })

    it('should return 0 when no registrations found', async () => {
      const startDate = new Date('2025-11-04T00:00:00Z')
      const endDate = new Date('2025-11-05T00:00:00Z')

      context.mockUserRepository.count.mockResolvedValue(0)

      const result = await (context.service as any).countRegistrations(startDate, endDate)

      expect(result).toBe(0)
    })
  })

  describe('collectProgressStats', () => {
    it('should collect progress statistics correctly', async () => {
      const startDate = new Date('2025-11-04T00:00:00Z')
      const endDate = new Date('2025-11-05T00:00:00Z')

      const mockPsRecords = [
        { user: { id: 1 }, word: { level: IrrWordLevelEnum.EASY } },
        { user: { id: 1 }, word: { level: IrrWordLevelEnum.MEDIUM } },
        { user: { id: 2 }, word: { level: IrrWordLevelEnum.EASY } },
      ]

      const mockPpRecords = [
        { user: { id: 2 }, word: { level: IrrWordLevelEnum.HARD } },
        { user: { id: 3 }, word: { level: IrrWordLevelEnum.MEDIUM } },
      ]

      const mockQueryBuilderPs = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockPsRecords),
      }

      const mockQueryBuilderPp = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockPpRecords),
      }

      context.mockProgressPsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilderPs)
      context.mockProgressPpRepository.createQueryBuilder.mockReturnValue(mockQueryBuilderPp)

      const result = await (context.service as any).collectProgressStats(startDate, endDate)

      expect(result.totalWords).toBe(5)
      expect(result.uniqueUsers).toBe(3)
      expect(result.easy).toBe(2)
      expect(result.medium).toBe(2)
      expect(result.hard).toBe(1)
    })

    it('should return zeros when no progress found', async () => {
      const startDate = new Date('2025-11-04T00:00:00Z')
      const endDate = new Date('2025-11-05T00:00:00Z')

      const result = await (context.service as any).collectProgressStats(startDate, endDate)

      expect(result.totalWords).toBe(0)
      expect(result.uniqueUsers).toBe(0)
      expect(result.easy).toBe(0)
      expect(result.medium).toBe(0)
      expect(result.hard).toBe(0)
    })

    it('should handle records without word level', async () => {
      const startDate = new Date('2025-11-04T00:00:00Z')
      const endDate = new Date('2025-11-05T00:00:00Z')

      const mockPsRecords = [
        { user: { id: 1 }, word: {} },
        { user: { id: 2 }, word: null },
      ]

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockPsRecords),
      }

      context.mockProgressPsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)
      context.mockProgressPpRepository.createQueryBuilder.mockReturnValue({
        ...mockQueryBuilder,
        getMany: jest.fn().mockResolvedValue([]),
      })

      const result = await (context.service as any).collectProgressStats(startDate, endDate)

      expect(result.totalWords).toBe(2)
      expect(result.uniqueUsers).toBe(2)
      expect(result.easy).toBe(0)
      expect(result.medium).toBe(0)
      expect(result.hard).toBe(0)
    })
  })
})
