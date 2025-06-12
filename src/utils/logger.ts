import ENVS from '../config/envs'

export class Logger {
  static log(message: string) {
    const currentDate = new Date()
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`
    console.log(`[${formattedDate}] ${message}`)
  }

  static error(message: string, error: unknown) {
    if (ENVS.APP_ENV === 'test') {
      return
    }
    console.error(message, error)
  }
}
