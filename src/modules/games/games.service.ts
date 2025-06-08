// import { UsersRequestCreate } from "./users.request"
// import { UsersRepository } from "./users.repository"

import createHttpError from "http-errors";
import { IrrWordEntity } from "../irr-words-en/irr-words.entity";
import { GetRandomWordsByLevelParams, IrrWordRepository } from "../irr-words-en/irr-words.repository";
import { IrrWordLang, IrrWordLevel } from "../irr-words-en/irr-words.types";

interface GetWordsDto {
  level?: string;
  count?: string | number;
  lang?: string;
  userId?: number
}

export class GamesService {
  private irrWordRepo: IrrWordRepository

  constructor() {
    this.irrWordRepo = new IrrWordRepository()
  }

  static validateGetWords(dto: GetWordsDto) {
    const {count, lang } = dto;
    if (!dto?.level || !['easy', 'medium', 'hard'].includes(dto?.level)) {
      throw createHttpError(400, 'Invalid or missing "level" param')
    }

    const wordCount = Number(count);
    if (!wordCount || isNaN(wordCount) || wordCount <= 0) {
      throw new Error('Invalid or missing "count" param');
    }

    if (!lang || !['en', 'uk'].includes(lang)) {
      throw new Error('Invalid or missing "lang" param');
    }

    const userId = Number(dto.userId);
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new Error('Invalid or missing "count" param');
    }

    return {
      level: dto.level as IrrWordLevel,
      count: wordCount,
      lang: lang as IrrWordLang,
      userId,
    }
  }

  async getWords(params: GetWordsDto) {
    const { level, count, lang, userId } = GamesService.validateGetWords(params);

    const getParams: GetRandomWordsByLevelParams = {
      level,
      count,
      lang,
      userId,
    }

    const words = await this.irrWordRepo.getRandomWordsByLevel(getParams);

    return words
  }
}