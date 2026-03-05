import createHttpError from 'http-errors'
import { GetWordService } from '../../games/services/get-words.service'
import { UsersRepository } from '../../users/users.repository'
import { TrainingsRepository } from '../trainings.repository'
import {
  StartTrainingDto,
  ValidatedStartTrainingDto,
  TrainingMode,
  TrainingType,
  TrainingLevel,
} from '../trainings.types'
import { GameWord, GameWordType } from '../../games/games.type'

export class StartTrainingService {
  private readonly getWordService = new GetWordService()
  private readonly usersRepository = new UsersRepository()
  private readonly trainingsRepository = new TrainingsRepository()

  async validate(dto: StartTrainingDto): Promise<ValidatedStartTrainingDto> {
    const { count, lang, mode, type } = dto

    if (!dto?.level || !['easy', 'medium', 'hard'].includes(dto?.level)) {
      throw createHttpError(400, 'Invalid or missing "level" param')
    }

    const wordCount = Number(count)
    if (!wordCount || isNaN(wordCount) || wordCount <= 0) {
      throw createHttpError(400, 'Invalid or missing "count" param')
    }

    if (!lang || !['en', 'uk'].includes(lang)) {
      throw createHttpError(400, 'Invalid or missing "lang" param')
    }

    if (!mode || !Object.values(TrainingMode).includes(mode as TrainingMode)) {
      throw createHttpError(400, 'Invalid or missing "mode" param')
    }

    if (!type || !Object.values(TrainingType).includes(type as TrainingType)) {
      throw createHttpError(400, 'Invalid or missing "type" param')
    }

    const userId = Number(dto.userId)
    if (!userId || isNaN(userId) || userId <= 0) {
      throw createHttpError(401, 'Invalid Authorization header')
    }
    const user = await this.usersRepository.findById(userId)
    if (!user) throw createHttpError(404, `User with id: ${dto.userId} not found`)

    return {
      level: dto.level as TrainingLevel,
      count: wordCount,
      lang: lang as string,
      userId,
      mode: mode as TrainingMode,
      type: type as TrainingType,
    }
  }

  async execute(dto: StartTrainingDto): Promise<{ trainingId: number; words: GameWord[] }> {
    const validatedDto = await this.validate(dto)
    const { mode, type, level, userId, count, lang } = validatedDto

    // Convert TrainingMode to GameWordType
    const irrWordType = mode as unknown as GameWordType

    // Reuse GetWordService to get words
    const words = await this.getWordService.execute({
      level,
      count,
      lang,
      userId,
      irrWordType,
    })

    // Create training record
    const training = await this.trainingsRepository.create({
      userId,
      mode,
      type,
      level,
      questionCount: words.length,
    })

    // Link words to training
    const wordIds = words.map((w) => w.id)
    await this.trainingsRepository.addTrainingWords(training.id, wordIds)

    return {
      trainingId: training.id,
      words,
    }
  }
}
