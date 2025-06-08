export enum ProgressType {
  PS = 'ps',
  PP = 'pp',
}

export enum ProgressStatus {
  FAILED = 'failed',
  STUDIED = 'studied',
}
export type IrrWordLevel = 'easy' | 'medium' | 'hard'
export type IrrWordLang = 'en' | 'uk'
export type IrrWordType = ProgressType.PS | ProgressType.PP