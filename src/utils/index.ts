import crypto from 'crypto'
import * as path from 'path'

export const getRandomNumber = (min: number, max: number) => {
  return (crypto.randomBytes(4).readUint32LE() % (max - min + 1)) + min
}

export const resolve = (...fileName: string[]) => {
  return path.resolve(import.meta.dir, '..', '..', 'data', ...fileName)
}

export const randomRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const delay = (ms: number | null = null) => {
  return new Promise((resolve) => setTimeout(resolve, ms || randomRange(10_000, 20_000)))
}

export const generateDeviceId = () => {
  const bytesLength = Math.ceil(13 / 2)
  const bytesBuffer = crypto.randomBytes(bytesLength)
  const random = bytesBuffer.toString('hex').slice(0, 13)

  // return `android-${(Math.random() * 1e24).toString(36)}`
  return `android-${random}`
}
