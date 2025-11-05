export enum ProgressStatus {
  MISTAKE = 'mistake',
  STUDIED = 'studied',
  IN_PROGRESS = 'in_progress',
}

export type ProgressSaveParams = {
  userId: number
  words: {
    wordId: number
    status: ProgressStatus
  }[]
}
export type ProgressGetWordParams = {
  userId: number
  wordId: number
}
export type ProgressListQuery = {
  status: ProgressStatus
}
