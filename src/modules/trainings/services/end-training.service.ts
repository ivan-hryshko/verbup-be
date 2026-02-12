import createHttpError from 'http-errors'
import { UsersRepository } from '../../users/users.repository'
import { TrainingsRepository } from '../trainings.repository'
import { EndTrainingDto, ValidatedEndTrainingDto } from '../trainings.types'
import { ProgressService } from '../../progress/progress.service'
import { IrrWordType } from '../../irr-words/irr-words.types'

export class EndTrainingService {
  private readonly usersRepository = new UsersRepository()
  private readonly trainingsRepository = new TrainingsRepository()
  private readonly progressService = new ProgressService()

  async validate(dto: EndTrainingDto): Promise<ValidatedEndTrainingDto> {
    const { trainingId, userId, words } = dto

    const trainingIdNum = Number(trainingId)
    if (!trainingIdNum || isNaN(trainingIdNum) || trainingIdNum <= 0) {
      throw createHttpError(400, 'Invalid or missing "trainingId" param')
    }

    const userIdNum = Number(userId)
    if (!userIdNum || isNaN(userIdNum) || userIdNum <= 0) {
      throw createHttpError(401, 'Invalid Authorization header')
    }

    const user = await this.usersRepository.findById(userIdNum)
    if (!user) throw createHttpError(404, `User with id: ${userId} not found`)

    const training = await this.trainingsRepository.findById(trainingIdNum)
    if (!training) throw createHttpError(404, `Training with id: ${trainingId} not found`)

    if (training.userId !== userIdNum) {
      throw createHttpError(403, 'Training does not belong to this user')
    }

    if (training.endTime) {
      throw createHttpError(400, 'Training already completed')
    }

    if (!Array.isArray(words) || words.length === 0) {
      throw createHttpError(400, 'Invalid or missing "words" array')
    }

    for (const word of words) {
      if (!word.wordId || typeof word.wordId !== 'number') {
        throw createHttpError(400, `Invalid wordId: ${word.wordId}`)
      }
      if (typeof word.correct !== 'boolean') {
        throw createHttpError(400, `Invalid correct value for wordId ${word.wordId}`)
      }
    }

    return {
      trainingId: trainingIdNum,
      userId: userIdNum,
      words: words.map((w) => ({
        wordId: w.wordId,
        correct: w.correct,
      })),
    }
  }

  async execute(dto: EndTrainingDto): Promise<{ success: boolean; progressUpdated: number }> {
    const validatedDto = await this.validate(dto)
    const { trainingId, userId, words } = validatedDto

    const training = await this.trainingsRepository.findById(trainingId)
    if (!training) {
      throw createHttpError(404, `Training with id: ${trainingId} not found`)
    }

    if (training.endTime) {
      throw createHttpError(400, 'Training already completed')
    }

    const endTime = new Date()
    await this.trainingsRepository.updateEndTime(trainingId, endTime)

    const trainingWordMap = new Map(training.trainingWords.map((tw) => [tw.irrWordId, tw.id]))

    const updatePromises = words.map(async (word) => {
      const trainingWordId = trainingWordMap.get(word.wordId)
      if (trainingWordId) {
        await this.trainingsRepository.updateWordResult(trainingWordId, word.correct)
      }
    })

    await Promise.all(updatePromises)

    const trainingWordsWithIrrWords = training.trainingWords.filter(
      (tw) => tw.irrWord && words.find((w) => w.wordId === tw.irrWordId),
    )

    const progressWords = trainingWordsWithIrrWords.map((tw) => {
      const wordResult = words.find((w) => w.wordId === tw.irrWordId)
      const wordType =
        training.mode === 'ps'
          ? IrrWordType.PS
          : training.mode === 'pp'
            ? IrrWordType.PP
            : IrrWordType.PS

      return {
        wordId: tw.irrWordId,
        type: wordType,
        correct: wordResult?.correct ?? false,
        status: undefined as any,
      }
    })

    let progressResult: any[] = []
    if (progressWords.length > 0) {
      progressResult = await this.progressService.save({
        userId,
        words: progressWords,
      })
    }

    return {
      success: true,
      progressUpdated: progressResult.length,
    }
  }
}
