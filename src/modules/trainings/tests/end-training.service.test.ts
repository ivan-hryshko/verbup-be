import { TrainingMode, TrainingType, TrainingLevel } from '../trainings.types'
import { IrrWordType } from '../../irr-words/irr-words.types'
import { ProgressStatus } from '../../progress/progress.types'

// Mock modules before importing the service
jest.mock('../../users/users.repository')
jest.mock('../trainings.repository')
jest.mock('../../progress/progress.service')

import { EndTrainingService } from '../services/end-training.service'
import { UsersRepository } from '../../users/users.repository'
import { TrainingsRepository } from '../trainings.repository'
import { ProgressService } from '../../progress/progress.service'
import { UserEntity } from '../../users/users.entity'
import { TrainingEntity } from '../trainings.entity'
import { TrainingWordEntity } from '../training-words.entity'
import { IrrWordEntity } from '../../irr-words/irr-words.entity'

describe('EndTrainingService', () => {
  let service: EndTrainingService
  let mockUsersRepo: jest.Mocked<UsersRepository>
  let mockTrainingsRepo: jest.Mocked<TrainingsRepository>
  let mockProgressService: jest.Mocked<ProgressService>

  const mockUser: UserEntity = {
    id: 1,
    username: 'Test User',
    password: '1235',
    email: 'test@gmail.com',
    avatar: '',
    isActive: true,
    emailVerificationToken: null,
    emailVerificationTokenExpiresAt: null,
    sessions: [],
    progressPs: [],
    progressPp: [],
    trainings: [],
    created_at: new Date(),
    updated_at: new Date(),
  }

  const mockIrrWord: IrrWordEntity = {
    id: 1,
    wordGroupId: 1,
    lang: 'en',
    basic: 'go',
    pastSimple: 'went',
    pastParticiple: 'gone',
    level: 'easy',
    image: 'go.png',
    basicSound: 'go-basic.mp3',
    psSound: 'go-ps.mp3',
    ppSound: 'go-pp.mp3',
    progressPs: [],
    progressPp: [],
    trainingWords: [],
  }

  const mockTrainingWord: TrainingWordEntity = {
    id: 1,
    trainingId: 1,
    training: {} as TrainingEntity,
    irrWordId: 1,
    irrWord: mockIrrWord,
    wasCorrect: null,
    createdAt: new Date(),
  }

  const mockTraining: TrainingEntity = {
    id: 1,
    userId: 1,
    user: mockUser,
    mode: TrainingMode.PS,
    type: TrainingType.VERB_TEST,
    level: TrainingLevel.EASY,
    startTime: new Date(),
    endTime: null,
    questionCount: 1,
    trainingWords: [mockTrainingWord],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockUsersRepo = new UsersRepository() as jest.Mocked<UsersRepository>
    mockTrainingsRepo = new TrainingsRepository() as jest.Mocked<TrainingsRepository>
    mockProgressService = new ProgressService() as jest.Mocked<ProgressService>

    service = new EndTrainingService()
    ;(service as any).usersRepository = mockUsersRepo
    ;(service as any).trainingsRepository = mockTrainingsRepo
    ;(service as any).progressService = mockProgressService
  })

  describe('validate', () => {
    it('should throw error for invalid trainingId', async () => {
      await expect(
        service.validate({
          trainingId: 'invalid',
          userId: 1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Invalid or missing "trainingId" param')
    })

    it('should throw error for missing trainingId', async () => {
      await expect(
        service.validate({
          userId: 1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Invalid or missing "trainingId" param')
    })

    it('should throw error for zero trainingId', async () => {
      await expect(
        service.validate({
          trainingId: 0,
          userId: 1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Invalid or missing "trainingId" param')
    })

    it('should throw error for negative trainingId', async () => {
      await expect(
        service.validate({
          trainingId: -5,
          userId: 1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Invalid or missing "trainingId" param')
    })

    it('should throw error for invalid userId', async () => {
      await expect(
        service.validate({
          trainingId: 1,
          userId: -1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Invalid Authorization header')
    })

    it('should throw error if user does not exist', async () => {
      mockUsersRepo.findById.mockResolvedValue(null)

      await expect(
        service.validate({
          trainingId: 1,
          userId: 999,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('User with id: 999 not found')
    })

    it('should throw error if training does not exist', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(null)

      await expect(
        service.validate({
          trainingId: 999,
          userId: 1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Training with id: 999 not found')
    })

    it('should throw error if training does not belong to user', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue({
        ...mockTraining,
        userId: 2,
      })

      await expect(
        service.validate({
          trainingId: 1,
          userId: 1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Training does not belong to this user')
    })

    it('should throw error if training already completed', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue({
        ...mockTraining,
        endTime: new Date(),
      })

      await expect(
        service.validate({
          trainingId: 1,
          userId: 1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Training already completed')
    })

    it('should throw error for missing words array', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)

      await expect(
        service.validate({
          trainingId: 1,
          userId: 1,
        }),
      ).rejects.toThrow('Invalid or missing "words" array')
    })

    it('should throw error for empty words array', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)

      await expect(
        service.validate({
          trainingId: 1,
          userId: 1,
          words: [],
        }),
      ).rejects.toThrow('Invalid or missing "words" array')
    })

    it('should throw error for invalid wordId', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)

      await expect(
        service.validate({
          trainingId: 1,
          userId: 1,
          words: [{ wordId: 'invalid' as any, correct: true }],
        }),
      ).rejects.toThrow('Invalid wordId')
    })

    it('should throw error for invalid correct value', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)

      await expect(
        service.validate({
          trainingId: 1,
          userId: 1,
          words: [{ wordId: 1, correct: 'yes' as any }],
        }),
      ).rejects.toThrow('Invalid correct value for wordId 1')
    })

    it('should successfully validate correct input', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)

      const result = await service.validate({
        trainingId: 1,
        userId: 1,
        words: [
          { wordId: 1, correct: true },
          { wordId: 2, correct: false },
        ],
      })

      expect(result).toEqual({
        trainingId: 1,
        userId: 1,
        words: [
          { wordId: 1, correct: true },
          { wordId: 2, correct: false },
        ],
      })
    })

    it('should accept string trainingId and convert to number', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)

      const result = await service.validate({
        trainingId: '1',
        userId: 1,
        words: [{ wordId: 1, correct: true }],
      })

      expect(result.trainingId).toBe(1)
    })
  })

  describe('execute', () => {
    it('should complete training and update progress', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)
      mockTrainingsRepo.updateEndTime.mockResolvedValue()
      mockTrainingsRepo.updateWordResult.mockResolvedValue()
      mockProgressService.save.mockResolvedValue([
        { wordId: 1, status: ProgressStatus.IN_PROGRESS, type: IrrWordType.PS },
      ])

      const result = await service.execute({
        trainingId: 1,
        userId: 1,
        words: [{ wordId: 1, correct: true }],
      })

      expect(mockTrainingsRepo.updateEndTime).toHaveBeenCalledWith(1, expect.any(Date))
      expect(mockTrainingsRepo.updateWordResult).toHaveBeenCalledWith(1, true)
      expect(mockProgressService.save).toHaveBeenCalledWith({
        userId: 1,
        words: expect.arrayContaining([
          expect.objectContaining({
            wordId: 1,
            type: IrrWordType.PS,
            correct: true,
          }),
        ]),
      })
      expect(result).toEqual({
        success: true,
        progressUpdated: 1,
      })
    })

    it('should handle multiple words', async () => {
      const trainingWithMultipleWords: TrainingEntity = {
        ...mockTraining,
        trainingWords: [
          { ...mockTrainingWord, id: 1, irrWordId: 1, irrWord: { ...mockIrrWord, id: 1 } },
          { ...mockTrainingWord, id: 2, irrWordId: 2, irrWord: { ...mockIrrWord, id: 2 } },
          { ...mockTrainingWord, id: 3, irrWordId: 3, irrWord: { ...mockIrrWord, id: 3 } },
        ],
      }

      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(trainingWithMultipleWords)
      mockTrainingsRepo.updateEndTime.mockResolvedValue()
      mockTrainingsRepo.updateWordResult.mockResolvedValue()
      mockProgressService.save.mockResolvedValue([
        { wordId: 1, status: ProgressStatus.IN_PROGRESS, type: IrrWordType.PS },
        { wordId: 2, status: ProgressStatus.MISTAKE, type: IrrWordType.PS },
        { wordId: 3, status: ProgressStatus.STUDIED, type: IrrWordType.PS },
      ])

      const result = await service.execute({
        trainingId: 1,
        userId: 1,
        words: [
          { wordId: 1, correct: true },
          { wordId: 2, correct: false },
          { wordId: 3, correct: true },
        ],
      })

      expect(mockTrainingsRepo.updateWordResult).toHaveBeenCalledTimes(3)
      expect(mockTrainingsRepo.updateWordResult).toHaveBeenCalledWith(1, true)
      expect(mockTrainingsRepo.updateWordResult).toHaveBeenCalledWith(2, false)
      expect(mockTrainingsRepo.updateWordResult).toHaveBeenCalledWith(3, true)
      expect(result.progressUpdated).toBe(3)
    })

    it('should handle PP mode training', async () => {
      const ppTraining: TrainingEntity = {
        ...mockTraining,
        mode: TrainingMode.PP,
      }

      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(ppTraining)
      mockTrainingsRepo.updateEndTime.mockResolvedValue()
      mockTrainingsRepo.updateWordResult.mockResolvedValue()
      mockProgressService.save.mockResolvedValue([
        { wordId: 1, status: ProgressStatus.IN_PROGRESS, type: IrrWordType.PP },
      ])

      await service.execute({
        trainingId: 1,
        userId: 1,
        words: [{ wordId: 1, correct: true }],
      })

      expect(mockProgressService.save).toHaveBeenCalledWith({
        userId: 1,
        words: expect.arrayContaining([
          expect.objectContaining({
            type: IrrWordType.PP,
          }),
        ]),
      })
    })

    it('should handle MIXED mode training', async () => {
      const mixedTraining: TrainingEntity = {
        ...mockTraining,
        mode: TrainingMode.MIXED,
      }

      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mixedTraining)
      mockTrainingsRepo.updateEndTime.mockResolvedValue()
      mockTrainingsRepo.updateWordResult.mockResolvedValue()
      mockProgressService.save.mockResolvedValue([
        { wordId: 1, status: ProgressStatus.IN_PROGRESS, type: IrrWordType.PS },
      ])

      await service.execute({
        trainingId: 1,
        userId: 1,
        words: [{ wordId: 1, correct: true }],
      })

      expect(mockProgressService.save).toHaveBeenCalled()
    })

    it('should throw error if training already completed in execute', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue({
        ...mockTraining,
        endTime: new Date(),
      })

      await expect(
        service.execute({
          trainingId: 1,
          userId: 1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Training already completed')
    })

    it('should check training exists before and after update', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)
      mockTrainingsRepo.updateEndTime.mockResolvedValue()
      mockTrainingsRepo.updateWordResult.mockResolvedValue()
      mockProgressService.save.mockResolvedValue([
        { wordId: 1, status: ProgressStatus.IN_PROGRESS, type: IrrWordType.PS },
      ])

      const result = await service.execute({
        trainingId: 1,
        userId: 1,
        words: [{ wordId: 1, correct: true }],
      })

      // Training is checked in validation and before processing words
      expect(mockTrainingsRepo.findById).toHaveBeenCalledTimes(2)
      expect(mockTrainingsRepo.findById).toHaveBeenCalledWith(1)
      expect(mockTrainingsRepo.updateEndTime).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })

    it('should only update words that exist in training', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)
      mockTrainingsRepo.updateEndTime.mockResolvedValue()
      mockTrainingsRepo.updateWordResult.mockResolvedValue()
      mockProgressService.save.mockResolvedValue([
        { wordId: 1, status: ProgressStatus.IN_PROGRESS, type: IrrWordType.PS },
      ])

      await service.execute({
        trainingId: 1,
        userId: 1,
        words: [
          { wordId: 1, correct: true },
          { wordId: 999, correct: false },
        ],
      })

      expect(mockTrainingsRepo.updateWordResult).toHaveBeenCalledTimes(1)
      expect(mockTrainingsRepo.updateWordResult).toHaveBeenCalledWith(1, true)
    })

    it('should handle training with no words to update progress', async () => {
      const trainingWithNoWords: TrainingEntity = {
        ...mockTraining,
        trainingWords: [],
      }

      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(trainingWithNoWords)
      mockTrainingsRepo.updateEndTime.mockResolvedValue()
      mockProgressService.save.mockResolvedValue([])

      const result = await service.execute({
        trainingId: 1,
        userId: 1,
        words: [{ wordId: 1, correct: true }],
      })

      expect(mockProgressService.save).not.toHaveBeenCalled()
      expect(result).toEqual({
        success: true,
        progressUpdated: 0,
      })
    })

    it('should set endTime correctly', async () => {
      const beforeTime = new Date()

      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)
      mockTrainingsRepo.updateEndTime.mockResolvedValue()
      mockTrainingsRepo.updateWordResult.mockResolvedValue()
      mockProgressService.save.mockResolvedValue([])

      await service.execute({
        trainingId: 1,
        userId: 1,
        words: [{ wordId: 1, correct: true }],
      })

      const afterTime = new Date()

      expect(mockTrainingsRepo.updateEndTime).toHaveBeenCalledWith(1, expect.any(Date))

      const calledTime = (mockTrainingsRepo.updateEndTime as jest.Mock).mock.calls[0][1]
      expect(calledTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(calledTime.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })

    it('should return success true on completion', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.findById.mockResolvedValue(mockTraining)
      mockTrainingsRepo.updateEndTime.mockResolvedValue()
      mockTrainingsRepo.updateWordResult.mockResolvedValue()
      mockProgressService.save.mockResolvedValue([
        { wordId: 1, status: ProgressStatus.IN_PROGRESS, type: IrrWordType.PS },
      ])

      const result = await service.execute({
        trainingId: 1,
        userId: 1,
        words: [{ wordId: 1, correct: true }],
      })

      expect(result.success).toBe(true)
    })

    it('should propagate validation errors', async () => {
      await expect(
        service.execute({
          trainingId: 'invalid',
          userId: 1,
          words: [{ wordId: 1, correct: true }],
        }),
      ).rejects.toThrow('Invalid or missing "trainingId" param')
    })
  })
})
