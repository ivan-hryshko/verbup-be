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

  it('should return cleaned and shuffled words (mix ps/pp)', async () => {
    mockUsersRepo.findById.mockResolvedValue(mockUser)

    mockIrrWordRepo.getNotLearnedWordsByType
      .mockImplementationOnce(async () => [
        // PS words
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
      .mockImplementationOnce(async () => [
        // PP words
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
      count: 2,
      lang: 'en',
      userId: 1,
      irrWordType: GameWordType.MIXED,
    })

    expect(words).toHaveLength(2)

    const psWord = words.find((w) => w.type === 'ps')
    const ppWord = words.find((w) => w.type === 'pp')

    expect(psWord).toMatchObject({
      id: 1,
      basic: 'go',
      type: 'ps',
      pastSimple: 'went',
      psSound: 'go.mp3',
      basicSound: 'go-basic.mp3',
      image: 'go.png',
    })
    expect(psWord).not.toHaveProperty('pastParticiple')
    expect(psWord).not.toHaveProperty('ppSound')

    expect(ppWord).toMatchObject({
      id: 2,
      basic: 'eat',
      type: 'pp',
      pastParticiple: 'eaten',
      ppSound: 'eat.mp3',
      basicSound: 'eat-basic.mp3',
      image: 'eat.png',
    })
    expect(ppWord).not.toHaveProperty('pastSimple')
    expect(ppWord).not.toHaveProperty('psSound')
  })
})
