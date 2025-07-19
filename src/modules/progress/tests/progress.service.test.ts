import { ProgressSaveDto, ProgressService } from '../progress.service'
import { UsersRepository } from '../../../modules/users/users.repository'
import { ProgressPsRepository } from '../../../modules/progress/progress-ps/progress-ps.repository'
import { ProgressPpRepository } from '../../../modules/progress/progress-pp/progress-pp.repository'
import { ProgressStatus } from '../../../modules/progress/progress.types'
import { UserEntity } from '../../users/users.entity'
import { ProgressPsEntity } from '../progress-ps/progress-ps.entity'
import { IrrWordEntity } from '../../irr-words/irr-words.entity'
import { IrrWordType } from '../../irr-words/irr-words.types'

// Mocks
jest.mock('../../../modules/users/users.repository')
jest.mock('../../../modules/progress/progress-ps/progress-ps.repository')
jest.mock('../../../modules/progress/progress-pp/progress-pp.repository')

describe('ProgressService', () => {
  let service: ProgressService
  let usersRepoMock: jest.Mocked<UsersRepository>
  let psRepoMock: jest.Mocked<ProgressPsRepository>
  let ppRepoMock: jest.Mocked<ProgressPpRepository>

  const mockUser: UserEntity = {
    id: 1,
    username: 'Test User',
    password: '1235',
    email: 'test@gmail.com',
    avatar: '',
    sessions: [],
    feedback: [],
    progressPs: [],
    progressPp: [],
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

    usersRepoMock.findById.mockResolvedValue(mockUser) // fake user
    psRepoMock.saveProgress.mockResolvedValue([mockProgressPs]) // fake save result
    ppRepoMock.saveProgress.mockResolvedValue([mockProgressPp])

    service = new ProgressService()
    // @ts-ignore: Inject mocks
    service['usersRepository'] = usersRepoMock
    // @ts-ignore
    service['progressPsRepository'] = psRepoMock
    // @ts-ignore
    service['progressPpRepository'] = ppRepoMock
  })

  describe('save', () => {
    it('should save progress for ps and pp words', async () => {
      const input: ProgressSaveDto = {
        userId: 1,
        words: [
          { wordId: 10, type: IrrWordType.PS, status: ProgressStatus.MISTAKE },
          { wordId: 20, type: IrrWordType.PP, status: ProgressStatus.STUDIED },
        ],
      }

      const result = await service.save(input)

      expect(usersRepoMock.findById).toHaveBeenCalledWith(1)
      expect(psRepoMock.saveProgress).toHaveBeenCalledWith({
        userId: 1,
        words: [{ wordId: 10, status: ProgressStatus.MISTAKE }],
      })
      expect(ppRepoMock.saveProgress).toHaveBeenCalledWith({
        userId: 1,
        words: [{ wordId: 20, status: ProgressStatus.STUDIED }],
      })
      expect(result[0].status).toBe(ProgressStatus.MISTAKE)
      expect(result[1].status).toBe(ProgressStatus.STUDIED)
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
