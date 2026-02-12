export enum TrainingMode {
  PS = 'ps',
  PP = 'pp',
  MIXED = 'mixed',
}

export enum TrainingType {
  VERB_TEST = 'verb_test',
  VERB_SPELL = 'verb_spell',
  BASIC_WORDS = 'basic_words',
  VERB_SENTENCE = 'verb_sentence',
}

export enum TrainingLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface StartTrainingDto {
  level?: string
  count?: string | number
  lang?: string
  userId?: number | null
  mode?: string
  type?: string
}

export interface ValidatedStartTrainingDto {
  level: TrainingLevel
  count: number
  lang: string
  userId: number
  mode: TrainingMode
  type: TrainingType
}

export interface EndTrainingWordDto {
  wordId: number
  correct: boolean
}

export interface EndTrainingDto {
  trainingId?: string | number
  userId?: number | null
  words?: EndTrainingWordDto[]
}

export interface ValidatedEndTrainingDto {
  trainingId: number
  userId: number
  words: EndTrainingWordDto[]
}
