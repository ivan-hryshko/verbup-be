import { Request, Response } from 'express'
import { DailyStatsController } from '../daily-stats.controller'
import { DailyStatsService } from '../daily-stats.service'

jest.mock('../daily-stats.service')

describe('DailyStatsController', () => {
  let controller: DailyStatsController
  let mockService: jest.Mocked<DailyStatsService>
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    // Create mock service
    mockService = new DailyStatsService() as jest.Mocked<DailyStatsService>

    // Create mock request and response objects
    mockRequest = {
      query: {},
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }

    // Create controller instance
    controller = new DailyStatsController()

    // Replace the service with our mock
    ;(controller as any).service = mockService
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getStats', () => {
    it('should return stats with default pagination when no query params provided', async () => {
      const mockData = {
        data: [
          {
            id: 1,
            stat_date: '2025-11-05',
            registrations: 10,
            words_progress_saved: 100,
            unique_users_progress: 20,
            words_progress_easy: 30,
            words_progress_medium: 40,
            words_progress_hard: 30,
          },
        ],
        total: 1,
      }

      mockService.getStats = jest.fn().mockResolvedValue(mockData)

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).toHaveBeenCalledWith(0, 10)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockData)
    })

    it('should return stats with custom offset and limit', async () => {
      mockRequest.query = {
        offset: '20',
        limit: '50',
      }

      const mockData = {
        data: [],
        total: 100,
      }

      mockService.getStats = jest.fn().mockResolvedValue(mockData)

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).toHaveBeenCalledWith(20, 50)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockData)
    })

    it('should handle offset=0 correctly', async () => {
      mockRequest.query = {
        offset: '0',
        limit: '10',
      }

      const mockData = { data: [], total: 0 }
      mockService.getStats = jest.fn().mockResolvedValue(mockData)

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).toHaveBeenCalledWith(0, 10)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
    })

    it('should return 400 error when offset is negative', async () => {
      mockRequest.query = {
        offset: '-1',
        limit: '10',
      }

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid pagination parameters. Offset must be >= 0, limit must be between 1 and 100',
      })
    })

    it('should return 400 error when limit is less than 1', async () => {
      mockRequest.query = {
        offset: '0',
        limit: '0',
      }

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid pagination parameters. Offset must be >= 0, limit must be between 1 and 100',
      })
    })

    it('should return 400 error when limit is greater than 100', async () => {
      mockRequest.query = {
        offset: '0',
        limit: '101',
      }

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid pagination parameters. Offset must be >= 0, limit must be between 1 and 100',
      })
    })

    it('should handle limit at maximum boundary (100)', async () => {
      mockRequest.query = {
        offset: '0',
        limit: '100',
      }

      const mockData = { data: [], total: 0 }
      mockService.getStats = jest.fn().mockResolvedValue(mockData)

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).toHaveBeenCalledWith(0, 100)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
    })

    it('should handle limit at minimum boundary (1)', async () => {
      mockRequest.query = {
        offset: '0',
        limit: '1',
      }

      const mockData = { data: [], total: 0 }
      mockService.getStats = jest.fn().mockResolvedValue(mockData)

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).toHaveBeenCalledWith(0, 1)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
    })

    it('should handle large offset values', async () => {
      mockRequest.query = {
        offset: '1000',
        limit: '10',
      }

      const mockData = { data: [], total: 500 }
      mockService.getStats = jest.fn().mockResolvedValue(mockData)

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).toHaveBeenCalledWith(1000, 10)
      expect(mockResponse.status).toHaveBeenCalledWith(200)
    })

    it('should parse query parameters correctly', async () => {
      mockRequest.query = {
        offset: '5',
        limit: '15',
      }

      const mockData = { data: [], total: 0 }
      mockService.getStats = jest.fn().mockResolvedValue(mockData)

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockService.getStats).toHaveBeenCalledWith(5, 15)
    })

    it('should handle non-numeric offset gracefully', async () => {
      mockRequest.query = {
        offset: 'invalid',
        limit: '10',
      }

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      // NaN should fail validation
      expect(mockResponse.status).toHaveBeenCalledWith(400)
    })

    it('should handle non-numeric limit gracefully', async () => {
      mockRequest.query = {
        offset: '0',
        limit: 'invalid',
      }

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      // NaN should fail validation
      expect(mockResponse.status).toHaveBeenCalledWith(400)
    })

    it('should return complete stats data structure', async () => {
      const mockData = {
        data: [
          {
            id: 1,
            stat_date: '2025-11-05',
            registrations: 12,
            words_progress_saved: 150,
            unique_users_progress: 45,
            words_progress_easy: 50,
            words_progress_medium: 60,
            words_progress_hard: 40,
            games_finished: 0,
            games_finished_easy: 0,
            games_finished_medium: 0,
            games_finished_hard: 0,
            users_completed_platform: 0,
            created_at: new Date('2025-11-06T02:00:00.000Z'),
          },
          {
            id: 2,
            stat_date: '2025-11-04',
            registrations: 8,
            words_progress_saved: 120,
            unique_users_progress: 38,
            words_progress_easy: 40,
            words_progress_medium: 50,
            words_progress_hard: 30,
            games_finished: 0,
            games_finished_easy: 0,
            games_finished_medium: 0,
            games_finished_hard: 0,
            users_completed_platform: 0,
            created_at: new Date('2025-11-05T02:00:00.000Z'),
          },
        ],
        total: 365,
      }

      mockService.getStats = jest.fn().mockResolvedValue(mockData)

      await controller.getStats(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith(mockData)
      expect(mockData.data).toHaveLength(2)
      expect(mockData.total).toBe(365)
    })
  })
})
