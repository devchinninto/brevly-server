import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { unwrapEither } from '@/shared/either.ts'
import { exportCsv } from '@/app/use-cases/export-csv.ts'

export const exportCsvRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/urls/exports',
    {
      schema: {
        summary: 'Export urls to a CSV report',
        tags: ['Export'],
        response: {
          200: z
            .object({
              reportUrls: z.string().meta({
                example: 'https://storage.example.com/urls/2026-01-01-urls.csv'
              })
            })
            .describe('Urls exported to a CSV report.')
        }
      }
    },
    async (request, reply) => {
      const result = await exportCsv()

      const { reportUrls } = unwrapEither(result)

      return reply.status(200).send({ reportUrls })
    }
  )
}
