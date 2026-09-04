import { deleteUrl } from '@/app/use-cases/delete-url.ts'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { isRight, unwrapEither } from '@/shared/either.ts'

export const deleteUrlRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    '/urls',
    {
      schema: {
        summary: 'Delete a short urls',
        tags: ['Delete'],
        body: z.object({
          url: z.string()
        }),
        response: {
          200: z
            .object({
              message: z.string(),
              deleted_url: z.object({
                id: z.string(),
                originalUrl: z.string(),
                shortUrl: z.string(),
                createdAt: z.date(),
                accessCount: z.int()
              })
            })
            .meta({ example: { message: 'Url deleted.' } })
            .describe('Url deleted.'),

          400: z
            .object({
              message: z.string()
            })
            .meta({ example: { message: 'Invalid URL format.' } })
            .describe('Invalid url format.'),

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
      const { url } = request.body

      const result = await deleteUrl(url)

      if (isRight(result)) {
        const deleted = unwrapEither(result)

        return reply
          .status(200)
          .send({ message: 'Url deleted.', deleted_url: deleted })
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'UrlNotFoundError': {
          return reply.status(404).send({ message: error.message })
        }
        case 'InvalidUrlFormatError': {
          return reply.status(400).send({ message: error.message })
        }
      }
    }
  )
}
