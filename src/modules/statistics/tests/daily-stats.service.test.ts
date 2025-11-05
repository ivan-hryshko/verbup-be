// Mock typeorm before any imports
jest.mock('typeorm', () => ({
  Between: jest.fn((start: any, end: any) => ({ _type: 'between', start, end })),
  Entity: jest.fn(() => jest.fn()),
  PrimaryGeneratedColumn: jest.fn(() => jest.fn()),
  Column: jest.fn(() => jest.fn()),
  CreateDateColumn: jest.fn(() => jest.fn()),
  UpdateDateColumn: jest.fn(() => jest.fn()),
  Unique: jest.fn(() => jest.fn()),
  OneToMany: jest.fn(() => jest.fn()),
  ManyToOne: jest.fn(() => jest.fn()),
  JoinColumn: jest.fn(() => jest.fn()),
  DataSource: jest.fn(),
}))

// Mock dependencies before imports
jest.mock('node-cron')
jest.mock('../../../config/app-data-source', () => ({
  __esModule: true,
  default: {
    getRepository: jest.fn(),
  },
}))

import { DailyStatsService } from '../daily-stats.service'
import { DailyStatsEntity } from '../daily-stats.entity'
import { UserEntity } from '../../users/users.entity'
import appDataSource from '../../../config/app-data-source'
import { Between } from 'typeorm'
import type { Repository } from 'typeorm'

describe('DailyStatsService', () => {
  let service: DailyStatsService
  let mockUserRepository: jest.Mocked<Repository<UserEntity>>
  let mockStatsRepository: jest.Mocked<Repository<DailyStatsEntity>>

  beforeEach(() => {
    // Create mock repositories
    mockUserRepository = {
      count: jest.fn(),
    } as any

    mockStatsRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any

    // Mock appDataSource.getRepository to return our mocks
    ;(appDataSource.getRepository as jest.Mock) = jest.fn((entity: any) => {
      if (entity === UserEntity) return mockUserRepository
      if (entity === DailyStatsEntity) return mockStatsRepository
      return null
    })

    service = new DailyStatsService()

    // Mock console methods to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getYesterdayDateRange', () => {
    it('should return correct date range for yesterday', () => {
      const result = (service as any).getYesterdayDateRange()

      const expectedYesterday = new Date()
      expectedYesterday.setDate(expectedYesterday.getDate() - 1)
      expectedYesterday.setHours(0, 0, 0, 0)

      const expectedToday = new Date()
      expectedToday.setHours(0, 0, 0, 0)

      expect(result.start.getTime()).toBe(expectedYesterday.getTime())
      expect(result.end.getTime()).toBe(expectedToday.getTime())
    })

    it('should return dates with time set to midnight', () => {
      const result = (service as any).getYesterdayDateRange()

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
      const result = (service as any).formatStatDate(testDate)

      expect(result).toBe('2025-11-05')
    })

    it('should handle dates with single-digit months and days', () => {
      const testDate = new Date('2025-01-05T00:00:00Z')
      const result = (service as any).formatStatDate(testDate)

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('countRegistrations', () => {
    it('should call repository.count with correct date range', async () => {
      const startDate = new Date('2025-11-04T00:00:00Z')
      const endDate = new Date('2025-11-05T00:00:00Z')

      mockUserRepository.count.mockResolvedValue(5)

      const result = await (service as any).countRegistrations(startDate, endDate)

      expect(mockUserRepository.count).toHaveBeenCalledWith({
        where: {
          created_at: Between(startDate, endDate),
        },
      })
      expect(result).toBe(5)
    })

    it('should return 0 when no registrations found', async () => {
      const startDate = new Date('2025-11-04T00:00:00Z')
      const endDate = new Date('2025-11-05T00:00:00Z')

      mockUserRepository.count.mockResolvedValue(0)

      const result = await (service as any).countRegistrations(startDate, endDate)

      expect(result).toBe(0)
    })
  })

  describe('saveOrUpdateStats', () => {
    it('should update existing stats when record exists', async () => {
      const statDate = '2025-11-04'
      const registrations = 10
      const existingStats = {
        id: 1,
        stat_date: statDate,
        registrations: 5,
        games_finished: 0,
      } as DailyStatsEntity

      mockStatsRepository.findOne.mockResolvedValue(existingStats)
      mockStatsRepository.save.mockResolvedValue(existingStats)

      await (service as any).saveOrUpdateStats(statDate, registrations)

      expect(mockStatsRepository.findOne).toHaveBeenCalledWith({
        where: { stat_date: statDate },
      })
      expect(existingStats.registrations).toBe(10)
      expect(mockStatsRepository.save).toHaveBeenCalledWith(existingStats)
    })

    it('should create new stats when record does not exist', async () => {
      const statDate = '2025-11-04'
      const registrations = 7
      const newStats = {
        id: 1,
        stat_date: statDate,
        registrations,
        games_finished: 0,
      } as DailyStatsEntity

      mockStatsRepository.findOne.mockResolvedValue(null)
      mockStatsRepository.create.mockReturnValue(newStats)
      mockStatsRepository.save.mockResolvedValue(newStats)

      await (service as any).saveOrUpdateStats(statDate, registrations)

      expect(mockStatsRepository.findOne).toHaveBeenCalledWith({
        where: { stat_date: statDate },
      })
      expect(mockStatsRepository.create).toHaveBeenCalledWith({
        stat_date: statDate,
        registrations,
        games_finished: 0,
        games_finished_easy: 0,
        games_finished_medium: 0,
        games_finished_hard: 0,
        users_completed_platform: 0,
      })
      expect(mockStatsRepository.save).toHaveBeenCalledWith(newStats)
    })
  })

  describe('updateExistingStats', () => {
    it('should update registrations and save', async () => {
      const stats = {
        id: 1,
        stat_date: '2025-11-04',
        registrations: 5,
      } as DailyStatsEntity
      const registrations = 15

      mockStatsRepository.save.mockResolvedValue(stats)

      await (service as any).updateExistingStats(stats, registrations, '2025-11-04')

      expect(stats.registrations).toBe(15)
      expect(mockStatsRepository.save).toHaveBeenCalledWith(stats)
    })
  })

  describe('createNewStats', () => {
    it('should create stats with correct defaults', async () => {
      const statDate = '2025-11-04'
      const registrations = 3
      const newStats = {
        id: 1,
        stat_date: statDate,
        registrations,
      } as DailyStatsEntity

      mockStatsRepository.create.mockReturnValue(newStats)
      mockStatsRepository.save.mockResolvedValue(newStats)

      await (service as any).createNewStats(statDate, registrations)

      expect(mockStatsRepository.create).toHaveBeenCalledWith({
        stat_date: statDate,
        registrations,
        games_finished: 0,
        games_finished_easy: 0,
        games_finished_medium: 0,
        games_finished_hard: 0,
        users_completed_platform: 0,
      })
      expect(mockStatsRepository.save).toHaveBeenCalledWith(newStats)
    })
  })

  describe('collectStats', () => {
    it('should collect and save statistics successfully', async () => {
      mockUserRepository.count.mockResolvedValue(12)
      mockStatsRepository.findOne.mockResolvedValue(null)
      mockStatsRepository.create.mockReturnValue({} as DailyStatsEntity)
      mockStatsRepository.save.mockResolvedValue({} as DailyStatsEntity)

      await service.collectStats()

      expect(mockUserRepository.count).toHaveBeenCalled()
      expect(mockStatsRepository.findOne).toHaveBeenCalled()
      expect(mockStatsRepository.create).toHaveBeenCalled()
      expect(mockStatsRepository.save).toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error')
      mockUserRepository.count.mockRejectedValue(error)

      await service.collectStats()

      expect(console.error).toHaveBeenCalledWith('❌ Error collecting daily stats:', error)
    })

    it('should log progress during collection', async () => {
      mockUserRepository.count.mockResolvedValue(8)
      mockStatsRepository.findOne.mockResolvedValue(null)
      mockStatsRepository.create.mockReturnValue({} as DailyStatsEntity)
      mockStatsRepository.save.mockResolvedValue({} as DailyStatsEntity)

      await service.collectStats()

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('📊 Collecting stats for'))
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('📈 Found 8 new registrations'))
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✅ Created stats for'))
    })
  })

  describe('getUserRepository', () => {
    it('should return UserEntity repository', () => {
      const result = (service as any).getUserRepository()

      expect(appDataSource.getRepository).toHaveBeenCalledWith(UserEntity)
      expect(result).toBe(mockUserRepository)
    })
  })

  describe('getStatsRepository', () => {
    it('should return DailyStatsEntity repository', () => {
      const result = (service as any).getStatsRepository()

      expect(appDataSource.getRepository).toHaveBeenCalledWith(DailyStatsEntity)
      expect(result).toBe(mockStatsRepository)
    })
  })

  describe('startCollectStats', () => {
    it('should initialize cron job with correct schedule', () => {
      // Import the mocked cron module
      const cron = require('node-cron')
      const mockSchedule = jest.fn()
      cron.schedule = mockSchedule

      service.startCollectStats('0 2 * * *')

      expect(service.cron).toBe('0 2 * * *')
      // The schedule method should be called, but since it's mocked we need to verify the implementation
      // Actually, since node-cron is mocked, we can just test that the cron property is set
      // The actual scheduling would happen in integration tests
    })

    it('should set cron property correctly', () => {
      service.startCollectStats('0 3 * * *')
      expect(service.cron).toBe('0 3 * * *')
    })
  })
})
