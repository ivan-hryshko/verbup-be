export function getRequiredEnvVar<T extends string | number>(key: string, defaultValue: T): T {
  const value = process.env[key]
  const isGitCi = process.env.NODE_ENV === 'git-ci'
  const isTestEnv = process.env.NODE_ENV === 'test'
  if (!value && !isGitCi && !isTestEnv) {
    console.error(`${key} is not defined in the environment variables`)
    return defaultValue
  }

  if (typeof defaultValue === 'number') {
    const parsed = Number(value)
    if (isNaN(parsed) && !isGitCi && !isTestEnv) {
      console.error(`${key} is not a valid number`)
      return defaultValue
    }
    return parsed as T
  }

  return value as T
}
