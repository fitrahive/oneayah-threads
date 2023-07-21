import { Elysia } from 'elysia'
import { publishToThreads } from '../bot/threads'

const app = new Elysia()

app.get('/', (ctx) => {
  ctx.set.redirect = 'https://github.com/fitrahive/oneayah-threads'
})

app.get('publish', (ctx) => {
  const { secret } = ctx.query

  if (secret !== Bun.env.SECRET_KEY) {
    ctx.set.status = 403

    return {
      statusCode: ctx.set.status,
      code: 'FORBIDDEN',
      message: 'Secret key is incorrect.',
    }
  }

  // run function in background.
  publishToThreads()

  ctx.set.status = 202

  return {
    statusCode: ctx.set.status,
    code: 'OK',
    message: 'Process still running but request exited.',
  }
})

app.listen(Bun.env.PORT || 3000)

console.log(`🦊 Elysia is running at http://${app.server!.hostname}:${app.server!.port}`)
