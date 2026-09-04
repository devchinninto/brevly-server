import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { isRight, unwrapEither } from '@/shared/either.ts'
import { createShortUrl } from '@/app/use-cases/create-short-url.ts'

export const createShortUrlRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/urls',
    {
      schema: {
        summary: 'Create a short url',
        tags: ['Create'],
        body: z
          .object({
            originalUrl: z.string().meta({ example: 'https://example.com' }),
            shortUrlHandle: z
              .string()
              .min(2)
              .max(12)
              .regex(/^[a-zA-Z0-9]+$/)
              .meta({ example: 'abc123' })
          })
          .meta({
            example: {
              originalUrl: 'https://example.com',
              shortUrlHandle: 'abc123'
            }
          }),
        response: {
          201: z
            .object({
              shortUrl: z.string().meta({ example: 'abc123' })
            })
            .meta({ example: { shortUrl: 'abc123' } })
            .describe('Short url created!'),
          400: z
            .object({
              message: z.string()
            })
            .meta({ example: { message: 'Invalid URL format.' } })
            .describe('Invalid url format.'),
          409: z
            .object({
              message: z.string()
            })
            .meta({
              example: {
                message:
                  'The following URLs already exist: https://example.com'
              }
            })
            .describe('Url already exists.')
        }
      }
    },
    async (request, reply) => {
      const { originalUrl, shortUrlHandle } = request.body

      const result = await createShortUrl({ originalUrl, shortUrlHandle })

      if (isRight(result)) {
        const url = unwrapEither(result)

        return reply.status(201).send({ shortUrl: url.shortUrl })
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'UrlAlreadyExistsError': {
          return reply.status(409).send({ message: error.message })
        }
        case 'InvalidUrlFormatError': {
          return reply.status(400).send({ message: error.message })
        }
      }
    }
  )
}
