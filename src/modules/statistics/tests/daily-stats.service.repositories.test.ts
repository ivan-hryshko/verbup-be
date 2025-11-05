import { setupTestContext, cleanupTestContext, TestContext } from './test-setup'
import { UserEntity } from '../../users/users.entity'
import { DailyStatsEntity } from '../daily-stats.entity'
import { ProgressPsEntity } from '../../progress/progress-ps/progress-ps.entity'
import { ProgressPpEntity } from '../../progress/progress-pp/progress-pp.entity'
import appDataSource from '../../../config/app-data-source'

describe('DailyStatsService - Repositories', () => {
  let context: TestContext

  beforeEach(() => {
    context = setupTestContext()
  })

  afterEach(() => {
    cleanupTestContext()
  })

  describe('getUserRepository', () => {
    it('should return UserEntity repository', () => {
      const result = (context.service as any).getUserRepository()

      expect(appDataSource.getRepository).toHaveBeenCalledWith(UserEntity)
      expect(result).toBe(context.mockUserRepository)
    })
  })

  describe('getStatsRepository', () => {
    it('should return DailyStatsEntity repository', () => {
      const result = (context.service as any).getStatsRepository()

      expect(appDataSource.getRepository).toHaveBeenCalledWith(DailyStatsEntity)
      expect(result).toBe(context.mockStatsRepository)
    })
  })

  describe('getProgressPsRepository', () => {
    it('should return ProgressPsEntity repository', () => {
      const result = (context.service as any).getProgressPsRepository()

      expect(appDataSource.getRepository).toHaveBeenCalledWith(ProgressPsEntity)
      expect(result).toBe(context.mockProgressPsRepository)
    })
  })

  describe('getProgressPpRepository', () => {
    it('should return ProgressPpEntity repository', () => {
      const result = (context.service as any).getProgressPpRepository()

      expect(appDataSource.getRepository).toHaveBeenCalledWith(ProgressPpEntity)
      expect(result).toBe(context.mockProgressPpRepository)
    })
  })
})
