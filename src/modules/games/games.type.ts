import { IrrWordType } from '../irr-words/irr-words.types'

export interface GetWordsDto {
  level: string
  count: number
  lang: string
  userId: number
}

export enum GameWordType {
  PS = 'ps',
  PP = 'pp',
  MIXED = 'mixed',
}

export interface GameWord {
  id: number
  basic: string
  type: IrrWordType
  pastSimple?: string
  pastParticiple?: string
  psSound?: string
  ppSound?: string
  basicSound?: string
  image?: string
}
