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
  SelectQueryBuilder: jest.fn(),
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
import { ProgressPsEntity } from '../../progress/progress-ps/progress-ps.entity'
import { ProgressPpEntity } from '../../progress/progress-pp/progress-pp.entity'
import appDataSource from '../../../config/app-data-source'
import type { Repository } from 'typeorm'

export interface TestContext {
  service: DailyStatsService
  mockUserRepository: jest.Mocked<Repository<UserEntity>>
  mockStatsRepository: jest.Mocked<Repository<DailyStatsEntity>>
  mockProgressPsRepository: jest.Mocked<any>
  mockProgressPpRepository: jest.Mocked<any>
}

export function setupTestContext(): TestContext {
  // Create mock query builder
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  }

  // Create mock repositories
  const mockUserRepository = {
    count: jest.fn(),
  } as any

  const mockStatsRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  } as any

  const mockProgressPsRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  }

  const mockProgressPpRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  }

  // Mock appDataSource.getRepository to return our mocks
  ;(appDataSource.getRepository as jest.Mock) = jest.fn((entity: any) => {
    if (entity === UserEntity) return mockUserRepository
    if (entity === DailyStatsEntity) return mockStatsRepository
    if (entity === ProgressPsEntity) return mockProgressPsRepository
    if (entity === ProgressPpEntity) return mockProgressPpRepository
    return null
  })

  const service = new DailyStatsService()

  // Mock console methods to avoid cluttering test output
  jest.spyOn(console, 'log').mockImplementation()
  jest.spyOn(console, 'error').mockImplementation()

  return {
    service,
    mockUserRepository,
    mockStatsRepository,
    mockProgressPsRepository,
    mockProgressPpRepository,
  }
}

export function cleanupTestContext() {
  jest.clearAllMocks()
}
