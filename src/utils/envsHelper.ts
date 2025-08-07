export function getRequiredEnvVar<T extends string | number>(key: string, defaultValue: T): T {
  const value = process.env[key]

  if (!value && process.env.APP_ENV !== 'git-ci') {
    console.error(`${key} is not defined in the environment variables`)
    return defaultValue
  }

  if (typeof defaultValue === 'number') {
    const parsed = Number(value)
    if (isNaN(parsed)) {
      console.error(`${key} is not a valid number`)
      return defaultValue
    }
    return parsed as T
  }

  return value as T
}
