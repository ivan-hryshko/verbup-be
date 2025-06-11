export enum ProgressStatus {
  MISTAKE = 'mistake',
  STUDIED = 'studied',
}

export type ProgressSaveParams = {
  userId: number
  words: {
    wordId: number
    status: ProgressStatus
  }[]
}
