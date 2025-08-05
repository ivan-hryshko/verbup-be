import { FeedbackService } from '../feedback.service'
import { FeedbackRepository } from '../feedback.repository'
import { FeedbackEntity } from '../feedback.entity'

jest.mock('./feedback.repository')

describe('FeedbackService - create', () => {
  let service: FeedbackService
  let mockRepo: jest.Mocked<FeedbackRepository>

  const mockFeedback: FeedbackEntity = {
    id: 1,
    comment: 'Great service!',
    rating: 5,
    userId: null,
    created_at: new Date(),
  }

  beforeEach(() => {
    mockRepo = new FeedbackRepository() as jest.Mocked<FeedbackRepository>

    service = new FeedbackService()
    ;(service as any).feedbackRepository = mockRepo
  })

  it('should throw error if comment is missing', async () => {
    await expect(service.create({ rating: 5 })).rejects.toThrow('Comment and rating are required')
  })

  it('should throw error if rating is missing', async () => {
    await expect(service.create({ comment: 'No rating here' })).rejects.toThrow(
      'Comment and rating are required',
    )
  })

  it('should create feedback when data is valid', async () => {
    mockRepo.create.mockResolvedValue(mockFeedback)

    const result = await service.create({ comment: 'Great service!', rating: 5 })

    expect(mockRepo.create).toHaveBeenCalledWith({ comment: 'Great service!', rating: 5 })
    expect(result).toEqual(mockFeedback)
  })
})
