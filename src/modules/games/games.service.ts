// import { UsersRequestCreate } from "./users.request"
// import { UsersRepository } from "./users.repository"

import { IrrWordEntity } from "../irr-words-en/irr-words.entity";
import { IrrWordRepository } from "../irr-words-en/irr-words.repository";
import { IrrWordLang, IrrWordLevel } from "../irr-words-en/irr-words.types";

interface GetWordsParams {
  level?: string;
  count?: string | number;
  lang?: string;
}

export class GamesService {
  private irrWordRepo = new IrrWordRepository();

  static validateGetWords(params: GetWordsParams) {
    const { level, count, lang } = params;
    if (!level || !['easy', 'medium', 'hard'].includes(level)) {
      throw new Error('Invalid or missing "level" param');
    }

    const wordCount = Number(count);
    if (!wordCount || isNaN(wordCount) || wordCount <= 0) {
      throw new Error('Invalid or missing "count" param');
    }

    if (!lang || !['en', 'uk'].includes(lang)) {
      throw new Error('Invalid or missing "lang" param');
    }

    return {
      level: level as IrrWordLevel,
      count: wordCount,
      lang: lang as IrrWordLang,
    }
  }

  async getWords(params: GetWordsParams) {
    const { level, count, lang } = GamesService.validateGetWords(params);

    const words = await this.irrWordRepo.getRandomWordsByLevel(level, count, lang);

    return words
  }
}