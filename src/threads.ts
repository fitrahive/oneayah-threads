import * as path from 'path'
import { random } from './quran'
import * as fs from 'fs/promises'
import * as Threads from '../modules/threads-api/threads-api/src'

let token: string = ''

const tokenPath = path.resolve(import.meta.dir, '..', 'data/token.json')
if (await fs.exists(tokenPath)) {
  token = await Bun.file(tokenPath).json()
}

const threads = new Threads.ThreadsAPI({
  token: token || undefined,
  username: process.env.THREADS_USERNAME,
  password: process.env.THREADS_PASSWORD,
})
token = (await threads.getToken()) || ''

await Bun.write(tokenPath, JSON.stringify(token))

async function publish() {
  let parentId: string | undefined = ''

  const current = await random()
  const text =
    `${current.ayah.arabic}\n\n${current.ayah.translation} ` +
    `(QS. ${current.surah.transliteration}: ${current.ayah.ayah})`

  parentId = await threads.publish({ text })

  if (text.length > 500 || !parentId) {
    publish()
    return
  }

  if (current.ayah.footnotes) {
    const childrenId = await threads.publish({
      text: `Catatan Kaki:\n\n${current.ayah.footnotes}`,
      parentPostID: parentId.split('_')[0],
    })

    if (!childrenId) {
      console.error('Failed to post footnotes.')
    }

    parentId = childrenId || parentId
  }

  const shortTafsir = current.tafsir.filter(
    (tafsir) => `${tafsir.title}\n\n${tafsir.description}`.length <= 500
  )

  if (shortTafsir && shortTafsir.length > 0) {
    for (const tafsir of shortTafsir) {
      console.log(parentId)

      const childrenId = await threads.publish({
        text: `${tafsir.title}\n\n${tafsir.description}`,
        parentPostID: parentId.split('_')[0],
      })

      if (!childrenId) {
        console.error('Failed to post tafsir.')
      }

      parentId = childrenId || parentId
    }
  }

  console.log(`Published: QS. ${current.surah.transliteration}: ${current.ayah.ayah}`)
}

publish()
