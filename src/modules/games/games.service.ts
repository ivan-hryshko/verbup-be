// import { UsersRequestCreate } from "./users.request"
// import { UsersRepository } from "./users.repository"

import createHttpError from "http-errors";
import { IrrWordEntity } from "../irr-words-en/irr-words.entity";
import { GetRandomWordsByLevelParams, IrrWordRepository } from "../irr-words-en/irr-words.repository";
import { IrrWordLang, IrrWordLevel, IrrWordType } from "../irr-words-en/irr-words.types";
import { GameWord } from "./games.type";

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

  async getWords(params: GetWordsDto): Promise<GameWord[]> {
    const { level, count, lang, userId } = GamesService.validateGetWords(params);

    const psWords = await this.irrWordRepo.getAvailableWordsByType(IrrWordType.PS, level, lang, userId);
    const ppWords = await this.irrWordRepo.getAvailableWordsByType(IrrWordType.PP, level, lang, userId);

    const allWords = [...psWords, ...ppWords];

    // Random shuffle and limit
    const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, count);

    // Clean up word types
    return shuffled.map(word => {
      const base = {
        id: word.id,
        basic: word.basic,
        basicSound: word.basicSound,
        image: word.image,
        type: word.type,
      };

      if (word.type === IrrWordType.PS) {
        return {
          ...base,
          pastSimple: word.pastSimple,
          psSound: word.psSound,
        };
      } else {
        return {
          ...base,
          pastParticiple: word.pastParticiple,
          ppSound: word.ppSound,
        };
      }
    });
  }

}