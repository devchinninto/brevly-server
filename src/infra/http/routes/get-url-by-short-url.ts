import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getUrl } from '@/app/use-cases/get-url.ts'
import { isRight, unwrapEither } from '@/shared/either.ts'

export const getUrlByShortUrlRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    '/urls/:shortUrl',
    {
      schema: {
        summary: 'Get an original URL by short URL',
        tags: ['List'],
        params: z.object({
          shortUrl: z.string()
        }),
        response: {
          200: z
            .object({
              originalUrl: z.string(),
              accessCount: z.int()
            })
            .describe('Get an original URL by short URL.'),

          404: z
            .object({
              message: z.string()
            })
            .meta({ example: { message: 'Url not found.' } })
            .describe('Url not found.')
        }
      }
    },
    async (request, reply) => {
      const { shortUrl } = request.params

      const result = await getUrl(shortUrl)

      if (isRight(result)) {
        const { originalUrl, accessCount } = unwrapEither(result)

        return reply.status(200).send({ originalUrl, accessCount })
      }

      const error = unwrapEither(result)

      return reply.status(404).send({ message: error.message })
    }
  )
}
