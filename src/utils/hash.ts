import crypto from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(crypto.scrypt)

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, key] = storedHash.split(':')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return derivedKey.toString('hex') === key
}
