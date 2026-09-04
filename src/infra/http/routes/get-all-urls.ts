import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { listUrls } from '@/app/use-cases/list-urls.ts'

export const getUrlsRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    '/urls',
    {
      schema: {
        summary: 'List all short urls',
        tags: ['list'],
        response: {
          200: z.object({
            urls: z.array(
              z.object({
                short_url: z.string()
              })
            )
          }),

          400: z.object({
            message: z.string()
          })
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
