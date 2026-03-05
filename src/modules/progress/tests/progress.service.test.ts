import { ProgressSaveDto, ProgressService } from '../progress.service'
import { UsersRepository } from '../../../modules/users/users.repository'
import { ProgressPsRepository } from '../../../modules/progress/progress-ps/progress-ps.repository'
import { ProgressPpRepository } from '../../../modules/progress/progress-pp/progress-pp.repository'
import { ProgressRepository } from '../../../modules/progress/progress.repository'
import { ProgressStatus } from '../../../modules/progress/progress.types'
import { UserEntity } from '../../users/users.entity'
import { ProgressPsEntity } from '../progress-ps/progress-ps.entity'
import { IrrWordEntity } from '../../irr-words/irr-words.entity'
import { IrrWordType } from '../../irr-words/irr-words.types'

// Mocks
jest.mock('../../../modules/users/users.repository')
jest.mock('../../../modules/progress/progress-ps/progress-ps.repository')
jest.mock('../../../modules/progress/progress-pp/progress-pp.repository')
jest.mock('../../../modules/progress/progress.repository')

describe('ProgressService', () => {
  let service: ProgressService
  let usersRepoMock: jest.Mocked<UsersRepository>
  let psRepoMock: jest.Mocked<ProgressPsRepository>
  let ppRepoMock: jest.Mocked<ProgressPpRepository>
  let progressRepoMock: jest.Mocked<ProgressRepository>

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
    trainings: [],
    created_at: new Date(),
    updated_at: new Date(),
  }

  const mockProgressPs: ProgressPsEntity = {
    id: 1,
    status: ProgressStatus.MISTAKE,
    createdAt: new Date('2025-06-03T13:31:36.705Z'),
    updatedAt: new Date('2025-06-03T13:31:36.705Z'),
    word: {
      basic: 'go',
    } as IrrWordEntity,
    user: mockUser,
  }
  const mockProgressPp: ProgressPsEntity = {
    id: 1,
    status: ProgressStatus.STUDIED,
    createdAt: new Date('2025-06-03T13:31:36.705Z'),
    updatedAt: new Date('2025-06-03T13:31:36.705Z'),
    word: {
      basic: 'go',
    } as IrrWordEntity,
    user: mockUser,
  }

  beforeEach(() => {
    usersRepoMock = new UsersRepository() as jest.Mocked<UsersRepository>
    psRepoMock = new ProgressPsRepository() as jest.Mocked<ProgressPsRepository>
    ppRepoMock = new ProgressPpRepository() as jest.Mocked<ProgressPpRepository>
    progressRepoMock = new ProgressRepository() as jest.Mocked<ProgressRepository>

    usersRepoMock.findById.mockResolvedValue(mockUser)
    psRepoMock.saveProgress.mockResolvedValue()
    ppRepoMock.saveProgress.mockResolvedValue()
    progressRepoMock.getWordProgress = jest.fn().mockResolvedValue(null)
    progressRepoMock.saveProgress = jest.fn().mockResolvedValue(undefined)

    service = new ProgressService()
    // @ts-ignore: Inject mocks
    service['usersRepository'] = usersRepoMock
    // @ts-ignore
    service['progressPsRepository'] = psRepoMock
    // @ts-ignore
    service['progressPpRepository'] = ppRepoMock
    // @ts-ignore
    service['progressRepository'] = progressRepoMock
  })

  describe('save', () => {
    it('should save progress for ps and pp words', async () => {
      const input: ProgressSaveDto = {
        userId: 1,
        words: [
          { wordId: 10, type: IrrWordType.PS, status: ProgressStatus.MISTAKE, correct: true },
          { wordId: 20, type: IrrWordType.PP, status: ProgressStatus.STUDIED, correct: true },
        ],
      }

      const result = await service.save(input)

      expect(usersRepoMock.findById).toHaveBeenCalledWith(1)
      expect(progressRepoMock.saveProgress).toHaveBeenCalledWith(IrrWordType.PS, {
        userId: 1,
        words: [{ wordId: 10, status: ProgressStatus.IN_PROGRESS }],
      })
      expect(progressRepoMock.saveProgress).toHaveBeenCalledWith(IrrWordType.PP, {
        userId: 1,
        words: [{ wordId: 20, status: ProgressStatus.IN_PROGRESS }],
      })
      expect(result[0].status).toBe(ProgressStatus.IN_PROGRESS)
      expect(result[1].status).toBe(ProgressStatus.IN_PROGRESS)
    })

    describe('status transitions when correct=true', () => {
      it('should set status to IN_PROGRESS when no existing progress exists', async () => {
        progressRepoMock.getWordProgress = jest.fn().mockResolvedValue(null)

        const input: ProgressSaveDto = {
          userId: 1,
          words: [{ wordId: 10, type: IrrWordType.PS, status: ProgressStatus.MISTAKE, correct: true }],
        }

        const result = await service.save(input)

        expect(result[0].status).toBe(ProgressStatus.IN_PROGRESS)
        expect(progressRepoMock.saveProgress).toHaveBeenCalledWith(IrrWordType.PS, {
          userId: 1,
          words: [{ wordId: 10, status: ProgressStatus.IN_PROGRESS }],
        })
      })

      it('should update status from MISTAKE to IN_PROGRESS', async () => {
        const existingProgress = {
          id: 1,
          status: ProgressStatus.MISTAKE,
          word: { id: 10 } as IrrWordEntity,
          user: mockUser,
        } as ProgressPsEntity

        progressRepoMock.getWordProgress = jest.fn().mockResolvedValue(existingProgress)

        const input: ProgressSaveDto = {
          userId: 1,
          words: [{ wordId: 10, type: IrrWordType.PS, status: ProgressStatus.MISTAKE, correct: true }],
        }

        const result = await service.save(input)

        expect(result[0].status).toBe(ProgressStatus.IN_PROGRESS)
        expect(progressRepoMock.saveProgress).toHaveBeenCalledWith(IrrWordType.PS, {
          userId: 1,
          words: [{ wordId: 10, status: ProgressStatus.IN_PROGRESS }],
        })
      })

      it('should update status from IN_PROGRESS to STUDIED', async () => {
        const existingProgress = {
          id: 1,
          status: ProgressStatus.IN_PROGRESS,
          word: { id: 10 } as IrrWordEntity,
          user: mockUser,
        } as ProgressPsEntity

        progressRepoMock.getWordProgress = jest.fn().mockResolvedValue(existingProgress)

        const input: ProgressSaveDto = {
          userId: 1,
          words: [{ wordId: 10, type: IrrWordType.PS, status: ProgressStatus.IN_PROGRESS, correct: true }],
        }

        const result = await service.save(input)

        expect(result[0].status).toBe(ProgressStatus.STUDIED)
        expect(progressRepoMock.saveProgress).toHaveBeenCalledWith(IrrWordType.PS, {
          userId: 1,
          words: [{ wordId: 10, status: ProgressStatus.STUDIED }],
        })
      })

      it('should keep status as STUDIED when already STUDIED', async () => {
        const existingProgress = {
          id: 1,
          status: ProgressStatus.STUDIED,
          word: { id: 10 } as IrrWordEntity,
          user: mockUser,
        } as ProgressPsEntity

        progressRepoMock.getWordProgress = jest.fn().mockResolvedValue(existingProgress)

        const input: ProgressSaveDto = {
          userId: 1,
          words: [{ wordId: 10, type: IrrWordType.PS, status: ProgressStatus.STUDIED, correct: true }],
        }

        const result = await service.save(input)

        expect(result[0].status).toBe(ProgressStatus.STUDIED)
        expect(progressRepoMock.saveProgress).toHaveBeenCalledWith(IrrWordType.PS, {
          userId: 1,
          words: [{ wordId: 10, status: ProgressStatus.STUDIED }],
        })
      })
    })

    describe('status transitions when correct=false', () => {
      it('should set status to MISTAKE from no existing progress', async () => {
        progressRepoMock.getWordProgress = jest.fn().mockResolvedValue(null)

        const input: ProgressSaveDto = {
          userId: 1,
          words: [{ wordId: 10, type: IrrWordType.PS, status: ProgressStatus.IN_PROGRESS, correct: false }],
        }

        const result = await service.save(input)

        expect(result[0].status).toBe(ProgressStatus.MISTAKE)
        expect(progressRepoMock.saveProgress).toHaveBeenCalledWith(IrrWordType.PS, {
          userId: 1,
          words: [{ wordId: 10, status: ProgressStatus.MISTAKE }],
        })
      })

      it('should set status to MISTAKE from IN_PROGRESS', async () => {
        const existingProgress = {
          id: 1,
          status: ProgressStatus.IN_PROGRESS,
          word: { id: 10 } as IrrWordEntity,
          user: mockUser,
        } as ProgressPsEntity

        progressRepoMock.getWordProgress = jest.fn().mockResolvedValue(existingProgress)

        const input: ProgressSaveDto = {
          userId: 1,
          words: [{ wordId: 10, type: IrrWordType.PS, status: ProgressStatus.IN_PROGRESS, correct: false }],
        }

        const result = await service.save(input)

        expect(result[0].status).toBe(ProgressStatus.MISTAKE)
        expect(progressRepoMock.saveProgress).toHaveBeenCalledWith(IrrWordType.PS, {
          userId: 1,
          words: [{ wordId: 10, status: ProgressStatus.MISTAKE }],
        })
      })

      it('should set status to MISTAKE from STUDIED', async () => {
        const existingProgress = {
          id: 1,
          status: ProgressStatus.STUDIED,
          word: { id: 10 } as IrrWordEntity,
          user: mockUser,
        } as ProgressPsEntity

        progressRepoMock.getWordProgress = jest.fn().mockResolvedValue(existingProgress)

        const input: ProgressSaveDto = {
          userId: 1,
          words: [{ wordId: 10, type: IrrWordType.PS, status: ProgressStatus.STUDIED, correct: false }],
        }

        const result = await service.save(input)

        expect(result[0].status).toBe(ProgressStatus.MISTAKE)
        expect(progressRepoMock.saveProgress).toHaveBeenCalledWith(IrrWordType.PS, {
          userId: 1,
          words: [{ wordId: 10, status: ProgressStatus.MISTAKE }],
        })
      })
    })
  })

  describe('list', () => {
    it('should return progress for user', async () => {
      const input = { userId: 1 }

      usersRepoMock.findById.mockResolvedValue(mockUser)
      psRepoMock.getProgressByUserId.mockResolvedValue([mockProgressPs])
      ppRepoMock.getProgressByUserId.mockResolvedValue([mockProgressPp])

      const result = await service.list(input)

      expect(result).toEqual({
        progressPs: [mockProgressPs],
        progressPp: [mockProgressPp],
      })

      expect(psRepoMock.getProgressByUserId).toHaveBeenCalledWith(1)
      expect(ppRepoMock.getProgressByUserId).toHaveBeenCalledWith(1)
    })
  })
})
