import * as fs from 'fs/promises'
import { tasks } from '@poppinss/cliui'
import { RandomType } from '../types/quran'
import { getRandomAyah } from '../utils/quran'
import { delay, generateDeviceId, resolve } from '../utils'
import * as Threads from '../../modules/threads-api/threads-api/src'
import type { Spinner } from '@poppinss/cliui/build/src/Logger/Spinner'

let token: string = ''

const deviceID = generateDeviceId()
const tokenPath = resolve('token.json')

if (await fs.exists(tokenPath)) {
  token = await Bun.file(tokenPath).json()
}

const threads = new Threads.ThreadsAPI({
  deviceID,
  token: Bun.env.THREADS_TOKEN || token || undefined,
  username: Bun.env.THREADS_USERNAME,
  password: Bun.env.THREADS_PASSWORD,
})

token = (await threads.getToken()) || ''
await Bun.write(tokenPath, JSON.stringify(token))

export const publishToThreads = async () => {
  let spinner: Spinner
  let current: RandomType
  let parentPostID: string | undefined
  let threadsID: string | undefined
  let childrenPostID: string | undefined

  await tasks()
    .add('Initiating several tasks', async (_, task) => {
      await task.complete()
    })
    .add('Posting a random ayah', async (logger, task) => {
      spinner = logger.await('Retrieving a random ayah')
      current = await getRandomAyah()

      const qs = `QS. ${current.surah.transliteration}: ${current.ayah.ayah}`
      const text = `${current.ayah.arabic}\n\n${current.ayah.translation} (${qs})`

      spinner.stop()
      logger.success(`Retrieved a random ayah: ${qs}`)

      if (text.length > 500) {
        await task.fail('Generated text exceeds 500 characters')
        return
      }

      spinner = logger.await('Currently posting a random ayah')

      try {
        threadsID = parentPostID = await threads.publish({ text })
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

      spinner = logger.await('Currently posting a footnotes')

      try {
        await delay()
        childrenPostID = await threads.publish({ text, parentPostID })
      } catch (error: any) {
        spinner.stop()
        await task.fail(error.message)
      }

      spinner.stop()
      logger.success('Successfully posted footnotes')

      parentPostID = childrenPostID || parentPostID
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
            childrenPostID = await threads.publish({
              text: `${tafsir.title}\n\n${tafsir.description}`,
              parentPostID,
            })
          } catch (error: any) {
            spinner.stop()
            logger.error(error.message)

            continue
          }

          spinner.stop()
          parentPostID = childrenPostID || parentPostID
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
