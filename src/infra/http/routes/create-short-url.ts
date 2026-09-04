import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { isRight, unwrapEither } from '@/shared/either.ts'
import { createShortUrl } from '@/app/use-cases/create-short-url.ts'
import { uploadUrl } from '@/app/use-cases/upload.ts'

export const createShortUrlRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/urls',
    {
      schema: {
        summary: 'Create a short url',
        tags: ['create'],
        body: z.object({
          name: z.string(),
          originalUrl: z.string(),
          shortUrlHandle: z
            .string()
            .min(2)
            .max(12)
            .regex(/^[a-zA-Z0-9]+$/)
        }),
        response: {
          201: z
            .object({
              shortUrl: z.string()
            })
            .describe('Short url created!'),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { name, originalUrl, shortUrlHandle } = request.body

      const result = await createShortUrl({ name, originalUrl, shortUrlHandle })

      console.log(result)
      if (!result) {
        return reply.status(400).send({ message: 'Error creating short url' })
      }

      const shortUrl = await uploadUrl(result)

      console.log(shortUrl)

      if (isRight(shortUrl)) {
        console.log(unwrapEither(shortUrl))

        return reply.status(201).send({ shortUrl: shortUrl.right.shortUrl })
      }
    }
  )
}
