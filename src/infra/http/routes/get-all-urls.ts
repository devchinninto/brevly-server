import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { listUrls } from '@/app/use-cases/list-urls.ts'

export const getUrlsRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    '/urls',
    {
      schema: {
        summary: 'List all short urls',
        tags: ['List'],
        response: {
          200: z
            .object({
              urls: z.array(
                z.object({
                  id: z
                    .string()
                    .meta({ example: '0197c0a2-3b4c-7def-8a1b-2c3d4e5f6a7b' }),
                  originalUrl: z
                    .string()
                    .meta({ example: 'https://example.com' }),
                  shortUrl: z.string().meta({ example: 'brev.ly/shortUrl' }),
                  accessCount: z.int().meta({ example: 0 }),
                  createdAt: z.date()
                })
              )
            })
            .describe('List of all short urls.'),

          400: z
            .object({
              message: z.string()
            })
            .meta({ example: { message: 'Unable to list urls' } })
            .describe('Unable to list short urls.')
        }
      }
    },
    async (request, reply) => {
      const { urls } = await listUrls()

      if (!urls) {
        return reply.status(400).send({ message: 'Unable to list urls' })
      }

      return reply.status(200).send({ urls })
    }
  )
}
