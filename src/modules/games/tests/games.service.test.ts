import { GamesService } from '../games.service'
import { IrrWordRepository } from '../../irr-words/irr-words.repository'
import { UsersRepository } from '../../users/users.repository'
import { IrrWordType } from '../../irr-words/irr-words.types'
import { UserEntity } from '../../users/users.entity'
import { GameWordType } from '../games.type'

jest.mock('../../irr-words/irr-words.repository')
jest.mock('../../users/users.repository')

describe('GamesService - getWords', () => {
  let service: GamesService
  let mockIrrWordRepo: jest.Mocked<IrrWordRepository>
  let mockUsersRepo: jest.Mocked<UsersRepository>

  const mockUser: UserEntity = {
    id: 1,
    username: 'Test User',
    password: '1235',
    email: 'test@gmail.com',
    avatar: '',
    isActive: false,
    emailVerificationToken: null,
    emailVerificationTokenExpiresAt: null,
    sessions: [],
    progressPs: [],
    progressPp: [],
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeEach(() => {
    mockIrrWordRepo = new IrrWordRepository() as jest.Mocked<IrrWordRepository>
    mockUsersRepo = new UsersRepository() as jest.Mocked<UsersRepository>

    service = new GamesService()
    // Override injected repo instances
    ;(service as any).irrWordRepo = mockIrrWordRepo
    ;(service as any).usersRepository = mockUsersRepo
  })

  it('should throw error for invalid level', async () => {
    await expect(
      service.getWords({
        level: 'invalid',
        count: 5,
        lang: 'en',
        userId: 1,
      }),
    ).rejects.toThrow('Invalid or missing "level" param')
  })

  it('should throw error for invalid count', async () => {
    await expect(
      service.getWords({
        level: 'easy',
        count: -5,
        lang: 'en',
        userId: 1,
      }),
    ).rejects.toThrow('Invalid or missing "count" param')
  })
  it('should throw error for invalid count', async () => {
    await expect(
      service.getWords({
        level: 'easy',
        count: -5,
        lang: 'en',
        userId: 1,
      }),
    ).rejects.toThrow('Invalid or missing "count" param')
  })

  it('should throw error if user does not exist', async () => {
    mockUsersRepo.findById.mockResolvedValue(null)
    await expect(
      service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 999,
        irrWordType: GameWordType.MIXED,
      }),
    ).rejects.toThrow('User with id: 999 not found')
  })

  it('should throw error for invalid irrWordType', async () => {
    mockUsersRepo.findById.mockResolvedValue(mockUser)
    await expect(
      service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
      }),
    ).rejects.toThrow('Invalid or missing "irrWordType" param')
  })

  describe('GameWordType.PS', () => {
    it('should return not learned PS words', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockIrrWordRepo.getNotLearnedWordsByType.mockResolvedValue([
        {
          id: 1,
          basic: 'go',
          pastSimple: 'went',
          psSound: 'go.mp3',
          basicSound: 'go-basic.mp3',
          image: 'go.png',
          type: IrrWordType.PS,
        },
      ])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.PS,
      })

      expect(words).toHaveLength(1)
      expect(mockIrrWordRepo.getNotLearnedWordsByType).toHaveBeenCalledWith(
        IrrWordType.PS,
        'easy',
        'en',
        1,
      )
      expect(words[0]).toMatchObject({
        id: 1,
        basic: 'go',
        type: 'ps',
        pastSimple: 'went',
      })
    })

    it('should fallback to all PS words if no not learned words', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockIrrWordRepo.getNotLearnedWordsByType.mockResolvedValue([])
      mockIrrWordRepo.getAllWordsByType.mockResolvedValue([
        {
          id: 2,
          basic: 'see',
          pastSimple: 'saw',
          psSound: 'see.mp3',
          basicSound: 'see-basic.mp3',
          image: 'see.png',
          type: IrrWordType.PS,
        },
      ])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.PS,
      })

      expect(mockIrrWordRepo.getAllWordsByType).toHaveBeenCalledWith(IrrWordType.PS, 'easy', 'en')
      expect(words).toHaveLength(1)
      expect(words[0].basic).toBe('see')
    })
  })

  describe('GameWordType.PP', () => {
    it('should prioritize words with PS progress (MISTAKE or IN_PROGRESS)', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      // Words that have PS progress with MISTAKE or IN_PROGRESS
      mockIrrWordRepo.getWordsByProgressStatus.mockResolvedValue([
        {
          id: 1,
          basic: 'go',
          pastParticiple: 'gone',
          ppSound: 'go-pp.mp3',
          basicSound: 'go-basic.mp3',
          image: 'go.png',
          type: IrrWordType.PP,
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
      ])
      mockIrrWordRepo.getNotLearnedWordsByType.mockResolvedValue([])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.PP,
      })

      expect(mockIrrWordRepo.getWordsByProgressStatus).toHaveBeenCalledWith(
        IrrWordType.PS,
        IrrWordType.PP,
        'easy',
        'en',
        1,
        ['mistake', 'in_progress'],
      )
      expect(words).toHaveLength(2)
      expect(words[0]).toHaveProperty('pastParticiple')
      expect(words[0]).not.toHaveProperty('pastSimple')
    })

    it('should add regular not learned PP words if not enough priority words', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      // Only 1 word with PS progress
      mockIrrWordRepo.getWordsByProgressStatus.mockResolvedValue([
        {
          id: 1,
          basic: 'go',
          pastParticiple: 'gone',
          ppSound: 'go-pp.mp3',
          basicSound: 'go-basic.mp3',
          image: 'go.png',
          type: IrrWordType.PP,
        },
      ])

      // Additional not learned PP words
      mockIrrWordRepo.getNotLearnedWordsByType.mockResolvedValue([
        {
          id: 1,
          basic: 'go',
          pastParticiple: 'gone',
          ppSound: 'go-pp.mp3',
          basicSound: 'go-basic.mp3',
          image: 'go.png',
          type: IrrWordType.PP,
        },
        {
          id: 3,
          basic: 'see',
          pastParticiple: 'seen',
          ppSound: 'see-pp.mp3',
          basicSound: 'see-basic.mp3',
          image: 'see.png',
          type: IrrWordType.PP,
        },
      ])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.PP,
      })

      expect(mockIrrWordRepo.getNotLearnedWordsByType).toHaveBeenCalledWith(
        IrrWordType.PP,
        'easy',
        'en',
        1,
      )
      expect(words.length).toBeGreaterThan(1)
    })

    it('should fallback to all PP words if no priority or not learned words', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockIrrWordRepo.getWordsByProgressStatus.mockResolvedValue([])
      mockIrrWordRepo.getNotLearnedWordsByType.mockResolvedValue([])
      mockIrrWordRepo.getAllWordsByType.mockResolvedValue([
        {
          id: 5,
          basic: 'make',
          pastParticiple: 'made',
          ppSound: 'make-pp.mp3',
          basicSound: 'make-basic.mp3',
          image: 'make.png',
          type: IrrWordType.PP,
        },
      ])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.PP,
      })

      expect(mockIrrWordRepo.getAllWordsByType).toHaveBeenCalledWith(IrrWordType.PP, 'easy', 'en')
      expect(words).toHaveLength(1)
      expect(words[0].basic).toBe('make')
    })
  })

  describe('GameWordType.MIXED', () => {
    it('should prioritize words with MISTAKE or IN_PROGRESS from both PS and PP', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      mockIrrWordRepo.getWordsByProgressStatus
        .mockResolvedValueOnce([
          // PS words with progress
          {
            id: 1,
            basic: 'go',
            pastSimple: 'went',
            psSound: 'go.mp3',
            basicSound: 'go-basic.mp3',
            image: 'go.png',
            type: IrrWordType.PS,
          },
        ])
        .mockResolvedValueOnce([
          // PP words with progress
          {
            id: 2,
            basic: 'eat',
            pastParticiple: 'eaten',
            ppSound: 'eat.mp3',
            basicSound: 'eat-basic.mp3',
            image: 'eat.png',
            type: IrrWordType.PP,
          },
        ])

      mockIrrWordRepo.getNotLearnedWordsByType.mockResolvedValue([])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.MIXED,
      })

      expect(mockIrrWordRepo.getWordsByProgressStatus).toHaveBeenCalledTimes(2)
      expect(mockIrrWordRepo.getWordsByProgressStatus).toHaveBeenCalledWith(
        IrrWordType.PS,
        IrrWordType.PS,
        'easy',
        'en',
        1,
        ['mistake', 'in_progress'],
      )
      expect(mockIrrWordRepo.getWordsByProgressStatus).toHaveBeenCalledWith(
        IrrWordType.PP,
        IrrWordType.PP,
        'easy',
        'en',
        1,
        ['mistake', 'in_progress'],
      )
      expect(words).toHaveLength(2)

      const psWord = words.find((w) => w.type === 'ps')
      const ppWord = words.find((w) => w.type === 'pp')

      expect(psWord).toBeDefined()
      expect(ppWord).toBeDefined()
    })

    it('should add not learned words if not enough priority words', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      // Only 1 word with progress
      mockIrrWordRepo.getWordsByProgressStatus
        .mockResolvedValueOnce([
          {
            id: 1,
            basic: 'go',
            pastSimple: 'went',
            psSound: 'go.mp3',
            basicSound: 'go-basic.mp3',
            image: 'go.png',
            type: IrrWordType.PS,
          },
        ])
        .mockResolvedValueOnce([])

      mockIrrWordRepo.getNotLearnedWordsByType
        .mockResolvedValueOnce([
          // Additional PS words
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
            id: 3,
            basic: 'see',
            pastSimple: 'saw',
            psSound: 'see.mp3',
            basicSound: 'see-basic.mp3',
            image: 'see.png',
            type: IrrWordType.PS,
          },
        ])
        .mockResolvedValueOnce([
          // Additional PP words
          {
            id: 2,
            basic: 'eat',
            pastParticiple: 'eaten',
            ppSound: 'eat.mp3',
            basicSound: 'eat-basic.mp3',
            image: 'eat.png',
            type: IrrWordType.PP,
          },
        ])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.MIXED,
      })

      expect(mockIrrWordRepo.getNotLearnedWordsByType).toHaveBeenCalledWith(
        IrrWordType.PS,
        'easy',
        'en',
        1,
      )
      expect(mockIrrWordRepo.getNotLearnedWordsByType).toHaveBeenCalledWith(
        IrrWordType.PP,
        'easy',
        'en',
        1,
      )
      expect(words.length).toBeGreaterThan(1)
    })

    it('should fallback to all words if no priority or not learned words', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      mockIrrWordRepo.getWordsByProgressStatus.mockResolvedValue([])
      mockIrrWordRepo.getNotLearnedWordsByType.mockResolvedValue([])
      mockIrrWordRepo.getAllWordsByType
        .mockResolvedValueOnce([
          {
            id: 1,
            basic: 'go',
            pastSimple: 'went',
            psSound: 'go.mp3',
            basicSound: 'go-basic.mp3',
            image: 'go.png',
            type: IrrWordType.PS,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 2,
            basic: 'eat',
            pastParticiple: 'eaten',
            ppSound: 'eat.mp3',
            basicSound: 'eat-basic.mp3',
            image: 'eat.png',
            type: IrrWordType.PP,
          },
        ])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.MIXED,
      })

      expect(mockIrrWordRepo.getAllWordsByType).toHaveBeenCalledWith(IrrWordType.PS, 'easy', 'en')
      expect(mockIrrWordRepo.getAllWordsByType).toHaveBeenCalledWith(IrrWordType.PP, 'easy', 'en')
      expect(words).toHaveLength(2)
    })

    it('should respect count limit and shuffle words', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)

      mockIrrWordRepo.getWordsByProgressStatus
        .mockResolvedValueOnce([
          {
            id: 1,
            basic: 'go',
            pastSimple: 'went',
            psSound: 'go.mp3',
            basicSound: 'go-basic.mp3',
            image: 'go.png',
            type: IrrWordType.PS,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 2,
            basic: 'eat',
            pastParticiple: 'eaten',
            ppSound: 'eat.mp3',
            basicSound: 'eat-basic.mp3',
            image: 'eat.png',
            type: IrrWordType.PP,
          },
        ])

      const words = await service.getWords({
        level: 'easy',
        count: 1,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.MIXED,
      })

      expect(words).toHaveLength(1)
    })
  })

  describe('Word field cleanup', () => {
    it('should not include PP fields in PS words', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockIrrWordRepo.getNotLearnedWordsByType.mockResolvedValue([
        {
          id: 1,
          basic: 'go',
          pastSimple: 'went',
          psSound: 'go.mp3',
          basicSound: 'go-basic.mp3',
          image: 'go.png',
          type: IrrWordType.PS,
        },
      ])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.PS,
      })

      expect(words[0]).not.toHaveProperty('pastParticiple')
      expect(words[0]).not.toHaveProperty('ppSound')
    })

    it('should not include PS fields in PP words', async () => {
      mockUsersRepo.findById.mockResolvedValue(mockUser)
      mockIrrWordRepo.getWordsByProgressStatus.mockResolvedValue([
        {
          id: 1,
          basic: 'go',
          pastParticiple: 'gone',
          ppSound: 'go-pp.mp3',
          basicSound: 'go-basic.mp3',
          image: 'go.png',
          type: IrrWordType.PP,
        },
      ])
      mockIrrWordRepo.getNotLearnedWordsByType.mockResolvedValue([])

      const words = await service.getWords({
        level: 'easy',
        count: 5,
        lang: 'en',
        userId: 1,
        irrWordType: GameWordType.PP,
      })

      expect(words[0]).not.toHaveProperty('pastSimple')
      expect(words[0]).not.toHaveProperty('psSound')
    })
  })
})
