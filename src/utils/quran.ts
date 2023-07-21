import * as fs from 'fs/promises'
import { RandomType } from '../types/quran'
import { getRandomNumber, resolve } from '.'

export const getRandomAyah = async (): Promise<RandomType> => {
  const pastPath = resolve('published.json')
  const isPastExist = await fs.exists(pastPath)

  const quranPath = resolve('static', 'surah.json')
  const quran = await Bun.file(quranPath).json()
  const length = quran.reduce((total: number, item: { ayah: number }) => total + item.ayah, 0)

  let randomSurah: number = 1
  let randomAyah: number = 1
  let random: string = '1-1'
  let published: string[] = []

  if (isPastExist) {
    published = await Bun.file(pastPath).json()
  }

  if (length === published.length) {
    // reset published if it's full
    published = ['1-1']
  }

  if (!Boolean(Bun.env.START_WITH_BISMILLAH) || published.length > 0) {
    do {
      randomSurah = getRandomNumber(1, quran.length)
      randomAyah = getRandomNumber(1, quran[randomSurah - 1].ayah)

      random = `${randomSurah}-${randomAyah}`
    } while (published.includes(random))
  }

  published.push(random)
  await Bun.write(pastPath, JSON.stringify(published, undefined, 2))

  const surahPath = resolve('surah', `${randomSurah}.json`)
  const surah = await Bun.file(surahPath).json()

  const tafsirPath = resolve('tafsir', randomSurah.toString(), `${randomAyah}.json`)
  const tafsir = await Bun.file(tafsirPath).json()

  return { surah: quran[randomSurah - 1], ayah: surah[randomAyah - 1], tafsir }
}
