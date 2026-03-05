import { TrainingMode, TrainingType, TrainingLevel } from '../trainings.types'
import { IrrWordType } from '../../irr-words/irr-words.types'

// Mock modules before importing the service
jest.mock('../../games/services/get-words.service')
jest.mock('../../users/users.repository')
jest.mock('../trainings.repository')

import { StartTrainingService } from '../services/start-training.service'
import { GetWordService } from '../../games/services/get-words.service'
import { UsersRepository } from '../../users/users.repository'
import { TrainingsRepository } from '../trainings.repository'
import { UserEntity } from '../../users/users.entity'
import { TrainingEntity } from '../trainings.entity'

describe('StartTrainingService', () => {
  let service: StartTrainingService
  let mockGetWordService: jest.Mocked<GetWordService>
  let mockUsersRepo: jest.Mocked<UsersRepository>
  let mockTrainingsRepo: jest.Mocked<TrainingsRepository>

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

  const mockTraining: TrainingEntity = {
    id: 1,
    userId: 1,
    user: mockUser,
    mode: TrainingMode.PS,
    type: TrainingType.VERB_TEST,
    level: TrainingLevel.EASY,
    startTime: new Date(),
    endTime: null,
    questionCount: 5,
    trainingWords: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockWords = [
    {
      id: 1,
      basic: 'go',
      pastSimple: 'went',
      psSound: 'go.mp3',
      basicSound: 'go-basic.mp3',
      image: 'go.png',
      type: IrrWordType.PS,
    },
    {
      id: 2,
      basic: 'eat',
      pastSimple: 'ate',
      psSound: 'eat.mp3',
      basicSound: 'eat-basic.mp3',
      image: 'eat.png',
      type: IrrWordType.PS,
    },
  ]

  beforeEach(() => {
    mockGetWordService = new GetWordService() as jest.Mocked<GetWordService>
    mockUsersRepo = new UsersRepository() as jest.Mocked<UsersRepository>
    mockTrainingsRepo = new TrainingsRepository() as jest.Mocked<TrainingsRepository>

    service = new StartTrainingService()
    ;(service as any).getWordService = mockGetWordService
    ;(service as any).usersRepository = mockUsersRepo
    ;(service as any).trainingsRepository = mockTrainingsRepo
  })

  describe('validate', () => {
    it('should throw error for invalid level', async () => {
      await expect(
        service.validate({
          level: 'invalid',
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        }),
      ).rejects.toThrow('Invalid or missing "level" param')
    })

    it('should throw error for missing level', async () => {
      await expect(
        service.validate({
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        }),
      ).rejects.toThrow('Invalid or missing "level" param')
    })

    it('should throw error for invalid count', async () => {
      await expect(
        service.validate({
          level: 'easy',
          count: -5,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        }),
      ).rejects.toThrow('Invalid or missing "count" param')
    })

    it('should throw error for zero count', async () => {
      await expect(
        service.validate({
          level: 'easy',
          count: 0,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        }),
      ).rejects.toThrow('Invalid or missing "count" param')
    })

    it('should throw error for invalid lang', async () => {
      await expect(
        service.validate({
          level: 'easy',
          count: 5,
          lang: 'fr',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        }),
      ).rejects.toThrow('Invalid or missing "lang" param')
    })

    it('should throw error for invalid mode', async () => {
      await expect(
        service.validate({
          level: 'easy',
          count: 5,
          lang: 'en',
          mode: 'invalid' as any,
          type: TrainingType.VERB_TEST,
          userId: 1,
        }),
      ).rejects.toThrow('Invalid or missing "mode" param')
    })

    it('should throw error for invalid type', async () => {
      await expect(
        service.validate({
          level: 'easy',
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type: 'invalid' as any,
          userId: 1,
        }),
      ).rejects.toThrow('Invalid or missing "type" param')
    })

    it('should throw error for invalid userId', async () => {
      await expect(
        service.validate({
          level: 'easy',
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: -1,
        }),
      ).rejects.toThrow('Invalid Authorization header')
    })

    it('should throw error if user does not exist', async () => {
      mockUsersRepo.findById.mockResolvedValue(null)

      await expect(
        service.validate({
          level: 'easy',
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 999,
        }),
      ).rejects.toThrow('User with id: 999 not found')
    })

    it('should successfully validate correct input', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      const result = await service.validate({
        level: 'easy',
        count: '5',
        lang: 'en',
        mode: TrainingMode.PS,
        type: TrainingType.VERB_TEST,
        userId: 1,
      })

      expect(result).toEqual({
        level: TrainingLevel.EASY,
        count: 5,
        lang: 'en',
        userId: 1,
        mode: TrainingMode.PS,
        type: TrainingType.VERB_TEST,
      })
    })

    it('should validate all training types', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      const types = [
        TrainingType.VERB_TEST,
        TrainingType.VERB_SPELL,
        TrainingType.BASIC_WORDS,
        TrainingType.VERB_SENTENCE,
      ]

      for (const type of types) {
        const result = await service.validate({
          level: 'easy',
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type,
          userId: 1,
        })

        expect(result.type).toBe(type)
      }
    })

    it('should validate all training modes', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      const modes = [TrainingMode.PS, TrainingMode.PP, TrainingMode.MIXED]

      for (const mode of modes) {
        const result = await service.validate({
          level: 'easy',
          count: 5,
          lang: 'en',
          mode,
          type: TrainingType.VERB_TEST,
          userId: 1,
        })

        expect(result.mode).toBe(mode)
      }
    })

    it('should validate all difficulty levels', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      const levels = ['easy', 'medium', 'hard']

      for (const level of levels) {
        const result = await service.validate({
          level,
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        })

        expect(result.level).toBe(level)
      }
    })

    it('should validate both supported languages', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      const langs = ['en', 'uk']

      for (const lang of langs) {
        const result = await service.validate({
          level: 'easy',
          count: 5,
          lang,
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        })

        expect(result.lang).toBe(lang)
      }
    })
  })

  describe('execute', () => {
    it('should create training with PS mode', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockGetWordService.execute.mockResolvedValue(mockWords)
      mockTrainingsRepo.create.mockResolvedValue(mockTraining)
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      const result = await service.execute({
        level: 'easy',
        count: 5,
        lang: 'en',
        mode: TrainingMode.PS,
        type: TrainingType.VERB_TEST,
        userId: 1,
      })

      expect(mockGetWordService.execute).toHaveBeenCalledWith({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: TrainingMode.PS,
      })

      expect(mockTrainingsRepo.create).toHaveBeenCalledWith({
        userId: 1,
        mode: TrainingMode.PS,
        type: TrainingType.VERB_TEST,
        level: 'easy',
        questionCount: 2,
      })

      expect(mockTrainingsRepo.addTrainingWords).toHaveBeenCalledWith(1, [1, 2])

      expect(result).toEqual({
        trainingId: 1,
        words: mockWords,
      })
    })

    it('should create training with PP mode', async () => {
      const ppWords = [
        {
          id: 1,
          basic: 'go',
          pastParticiple: 'gone',
          ppSound: 'go-pp.mp3',
          basicSound: 'go-basic.mp3',
          image: 'go.png',
          type: IrrWordType.PP,
        },
      ]

      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockGetWordService.execute.mockResolvedValue(ppWords)
      mockTrainingsRepo.create.mockResolvedValue({
        ...mockTraining,
        mode: TrainingMode.PP,
      })
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      const result = await service.execute({
        level: 'easy',
        count: 5,
        lang: 'en',
        mode: TrainingMode.PP,
        type: TrainingType.VERB_TEST,
        userId: 1,
      })

      expect(mockGetWordService.execute).toHaveBeenCalledWith({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: TrainingMode.PP,
      })

      expect(result.words).toEqual(ppWords)
    })

    it('should create training with MIXED mode', async () => {
      const mixedWords = [
        {
          id: 1,
          basic: 'go',
          pastSimple: 'went',
          psSound: 'go.mp3',
          basicSound: 'go-basic.mp3',
          image: 'go.png',
          type: IrrWordType.PS,
        },
        {
          id: 2,
          basic: 'eat',
          pastParticiple: 'eaten',
          ppSound: 'eat-pp.mp3',
          basicSound: 'eat-basic.mp3',
          image: 'eat.png',
          type: IrrWordType.PP,
        },
      ]

      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockGetWordService.execute.mockResolvedValue(mixedWords)
      mockTrainingsRepo.create.mockResolvedValue({
        ...mockTraining,
        mode: TrainingMode.MIXED,
      })
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      const result = await service.execute({
        level: 'easy',
        count: 5,
        lang: 'en',
        mode: TrainingMode.MIXED,
        type: TrainingType.VERB_TEST,
        userId: 1,
      })

      expect(mockGetWordService.execute).toHaveBeenCalledWith({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: TrainingMode.MIXED,
      })

      expect(result.words).toEqual(mixedWords)
    })

    it('should create training with different types', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockGetWordService.execute.mockResolvedValue(mockWords)
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      const types = [
        TrainingType.VERB_TEST,
        TrainingType.VERB_SPELL,
        TrainingType.BASIC_WORDS,
        TrainingType.VERB_SENTENCE,
      ]

      for (const type of types) {
        mockTrainingsRepo.create.mockResolvedValue({
          ...mockTraining,
          type,
        })

        await service.execute({
          level: 'easy',
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type,
          userId: 1,
        })

        expect(mockTrainingsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            type,
          }),
        )
      }
    })

    it('should handle different word counts', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockTrainingsRepo.create.mockResolvedValue(mockTraining)
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      const counts = [1, 5, 10, 20]

      for (const count of counts) {
        const words = Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          basic: `word${i + 1}`,
          pastSimple: `past${i + 1}`,
          psSound: `sound${i + 1}.mp3`,
          basicSound: `basic${i + 1}.mp3`,
          image: `image${i + 1}.png`,
          type: IrrWordType.PS,
        }))

        mockGetWordService.execute.mockResolvedValue(words)

        const result = await service.execute({
          level: 'easy',
          count,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        })

        expect(mockTrainingsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            questionCount: count,
          }),
        )

        expect(result.words).toHaveLength(count)
      }
    })

    it('should link all word IDs to training', async () => {
      const words = [
        { id: 5, basic: 'go', pastSimple: 'went', type: IrrWordType.PS },
        { id: 10, basic: 'eat', pastSimple: 'ate', type: IrrWordType.PS },
        { id: 15, basic: 'see', pastSimple: 'saw', type: IrrWordType.PS },
      ]

      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockGetWordService.execute.mockResolvedValue(words as any)
      mockTrainingsRepo.create.mockResolvedValue(mockTraining)
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      await service.execute({
        level: 'easy',
        count: 3,
        lang: 'en',
        mode: TrainingMode.PS,
        type: TrainingType.VERB_TEST,
        userId: 1,
      })

      expect(mockTrainingsRepo.addTrainingWords).toHaveBeenCalledWith(1, [5, 10, 15])
    })

    it('should handle different difficulty levels', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockGetWordService.execute.mockResolvedValue(mockWords)
      mockTrainingsRepo.create.mockResolvedValue(mockTraining)
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      const levels = ['easy', 'medium', 'hard']

      for (const level of levels) {
        await service.execute({
          level,
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        })

        expect(mockTrainingsRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            level,
          }),
        )
      }
    })

    it('should handle both languages', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockGetWordService.execute.mockResolvedValue(mockWords)
      mockTrainingsRepo.create.mockResolvedValue(mockTraining)
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      const langs = ['en', 'uk']

      for (const lang of langs) {
        await service.execute({
          level: 'easy',
          count: 5,
          lang,
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        })

        expect(mockGetWordService.execute).toHaveBeenCalledWith(
          expect.objectContaining({
            lang,
          }),
        )
      }
    })

    it('should return correct structure', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockGetWordService.execute.mockResolvedValue(mockWords)
      mockTrainingsRepo.create.mockResolvedValue(mockTraining)
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      const result = await service.execute({
        level: 'easy',
        count: 5,
        lang: 'en',
        mode: TrainingMode.PS,
        type: TrainingType.VERB_TEST,
        userId: 1,
      })

      expect(result).toHaveProperty('trainingId')
      expect(result).toHaveProperty('words')
      expect(typeof result.trainingId).toBe('number')
      expect(Array.isArray(result.words)).toBe(true)
    })

    it('should propagate validation errors', async () => {
      await expect(
        service.execute({
          level: 'invalid',
          count: 5,
          lang: 'en',
          mode: TrainingMode.PS,
          type: TrainingType.VERB_TEST,
          userId: 1,
        }),
      ).rejects.toThrow('Invalid or missing "level" param')
    })

    it('should handle empty word results', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockGetWordService.execute.mockResolvedValue([])
      mockTrainingsRepo.create.mockResolvedValue(mockTraining)
      mockTrainingsRepo.addTrainingWords.mockResolvedValue([])

      const result = await service.execute({
        level: 'easy',
        count: 5,
        lang: 'en',
        mode: TrainingMode.PS,
        type: TrainingType.VERB_TEST,
        userId: 1,
      })

      expect(mockTrainingsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          questionCount: 0,
        }),
      )

      expect(mockTrainingsRepo.addTrainingWords).toHaveBeenCalledWith(1, [])
      expect(result.words).toHaveLength(0)
    })
  })
})
