import * as path from 'path'
import * as fs from 'fs/promises'
import { tasks } from '@poppinss/cliui'
import { type RandomType, random } from './quran'
import * as Threads from '../modules/threads-api/threads-api/src'
import type { Spinner } from '@poppinss/cliui/build/src/Logger/Spinner'

let token: string = ''

const deviceId = `android-${(Math.random() * 1e24).toString(36)}`
const tokenPath = path.resolve(import.meta.dir, '..', 'data/token.json')
const delay = () => new Promise((resolve) => setTimeout(resolve, Math.random() * 10_000 + 10_000))

if (await fs.exists(tokenPath)) {
  token = await Bun.file(tokenPath).json()
}

const threads = new Threads.ThreadsAPI({
  deviceID: deviceId,
  token: token || undefined,
  username: Bun.env.THREADS_USERNAME,
  password: Bun.env.THREADS_PASSWORD,
})
token = (await threads.getToken()) || ''

await Bun.write(tokenPath, JSON.stringify(token))

async function publish(first: boolean = true) {
  let spinner: Spinner
  let current: RandomType
  let parentId: string | undefined
  let threadsId: string | undefined
  let childrenId: string | undefined

  await tasks()
    .add(first ? 'Initiating several tasks' : 'Getting random ayah again', async (_, task) => {
      await task.complete()
    })
    .add('Posting a random ayah', async (logger, task) => {
      spinner = logger.await('Retrieving a random ayah')
      current = await random()

      const qs = `QS. ${current.surah.transliteration}: ${current.ayah.ayah}`
      const text = `${current.ayah.arabic}\n\n${current.ayah.translation} (${qs})`

      spinner.stop()
      logger.success(`Retrieved a random ayah: ${qs}`)

      if (text.length > 500) {
        await task.fail(`Generated text exceeds 500 characters`)
        return
      }

      spinner = logger.await(`Currently posting a random ayah`)

      try {
        threadsId = parentId = await threads.publish({ text })
      } catch (error: any) {
        spinner.stop()
        await task.fail(error.message)
      }

      spinner.stop()
      logger.success(`Successfully posted ${qs}`)

      await task.complete()
    })
    .add('Posting footnotes if available', async (logger, task) => {
      const text = `Catatan Kaki:\n\n${current.ayah.footnotes}`

      if (text.length > 500 || !current.ayah.footnotes) {
        await task.complete('No footnotes available')
        return
      }

      spinner = logger.await(`Currently posting a footnotes`)

      try {
        await delay()
        childrenId = await threads.publish({ text, parentPostID: parentId!.split('_')[0] })
      } catch (error: any) {
        spinner.stop()
        await task.fail(error.message)
      }

      spinner.stop()
      logger.success('Successfully posted footnotes')
      parentId = childrenId || parentId

      await task.complete()
    })
    .add('Posting a brief tafsir', async (logger, task) => {
      spinner = logger.await('Retrieving a brief tafsir')

      const items = current.tafsir.filter(
        (tafsir) => `${tafsir.title}\n\n${tafsir.description}`.length <= 500
      )

      spinner.stop()
      logger.success('Retrieved a brief tafsir')

      if (items.length > 0) {
        for (const index in items) {
          spinner = logger.await(`Currently posting a tafsir #${index + 1}`)
          const tafsir = items[index]

          try {
            await delay()
            childrenId = await threads.publish({
              text: `${tafsir.title}\n\n${tafsir.description}`,
              parentPostID: parentId!.split('_')[0],
            })
          } catch (error: any) {
            spinner.stop()
            logger.error(error.message)
            continue
          }

          spinner.stop()
          parentId = childrenId || parentId
        }
      }

      logger.success('All tafsir have been posted')
      await task.complete()
    })
    .add('All tasks has been completed', async (_, task) => {
      await task.complete()
    })
    .run()
}

publish()
