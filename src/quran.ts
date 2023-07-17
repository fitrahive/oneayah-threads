import crypto from 'crypto'
import * as path from 'path'
import * as fs from 'fs/promises'

export type RandomType = {
  surah: {
    id: number
    arabic: string
    latin: string
    transliteration: string
    translation: string
    ayah: number
    mushaf: number
    location: string
  }
  ayah: {
    id: number
    surah_id: number
    ayah: number
    page: number
    juz: number
    manzil: number
    arabic: string
    kitabah: string
    latin: string
    arabic_words: string[]
    translation: string
    footnotes: string | null
  }
  tafsir: { title: string; description: string }[]
}

function getRandomNumber(min: number, max: number) {
  const range = max - min + 1
  const buffer = crypto.randomBytes(4)
  const value = buffer.readUint32LE()

  return (value % range) + min
}

export async function random(): Promise<RandomType> {
  const publishedPath = path.resolve(import.meta.dir, '..', 'data/published.json')
  const isExist = await fs.exists(publishedPath)

  const quranPath = path.resolve(import.meta.dir, '..', 'data/static/surah.json')
  const quranData = await Bun.file(quranPath).json()

  let surahRand: number = 1
  let ayahRand: number = 1
  let newRand: string = '1-1'
  let published: string[] = []

  if (isExist) {
    published = await Bun.file(publishedPath).json()
  }

  if (
    quranData.reduce((total: number, item: { ayah: number }) => total + item.ayah, 0) ===
    published.length
  ) {
    // reset published if it's full
    published = ['1-1']
  }

  if (!Boolean(Bun.env.BISMILLAH) || published.length > 0) {
    do {
      surahRand = getRandomNumber(1, quranData.length)
      ayahRand = getRandomNumber(1, quranData[surahRand - 1].ayah)

      newRand = `${surahRand}-${ayahRand}`
    } while (published.includes(newRand))
  }

  published.push(newRand)
  await Bun.write(publishedPath, JSON.stringify(published, undefined, 2))

  const surahPath = path.resolve(import.meta.dir, '..', 'data/surah', `${surahRand}.json`)
  const surahData = await Bun.file(surahPath).json()

  const tafsirPath = path.resolve(
    import.meta.dir,
    '..',
    'data/tafsir',
    surahRand.toString(),
    `${ayahRand}.json`
  )
  const tafsirData = await Bun.file(tafsirPath).json()

  return { surah: quranData[surahRand - 1], ayah: surahData[ayahRand - 1], tafsir: tafsirData }
}
