export type SurahType = {
  id: number
  arabic: string
  latin: string
  transliteration: string
  translation: string
  ayah: number
  mushaf: number
  location: string
}

export type AyahType = {
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

export type TafsirType = {
  title: string
  description: string
}

export type RandomType = {
  surah: SurahType
  ayah: AyahType
  tafsir: TafsirType[]
}
