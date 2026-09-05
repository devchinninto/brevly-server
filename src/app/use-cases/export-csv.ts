import { PassThrough, Transform } from 'node:stream'
import { stringify } from 'csv-stringify'
import { pipeline } from 'node:stream/promises'
import { db, pg } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { uploadToUrlsStorage } from '@/infra/storage/upload-to-storage.ts'
import { Either, makeRight } from '@/shared/either.ts'

type ExportCsvOutput = {
  reportUrls: string
}

export async function exportCsv(): Promise<Either<never, ExportCsvOutput>> {
  const { sql, params } = db
    .select({
      id: schema.urls.id,
      shortUrl: schema.urls.shortUrl,
      originalUrl: schema.urls.originalUrl,
      accessCount: schema.urls.accessCount,
      createdAt: schema.urls.createdAt
    })
    .from(schema.urls)
    .toSQL()

  const cursor = pg.unsafe(sql, params as string[]).cursor(2)

  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'original_url', header: 'Original URL' },
      { key: 'short_url', header: 'Short URL' },
      { key: 'access_count', header: 'Access Count' },
      { key: 'created_at', header: 'Created at' }
    ]
  })

  const uploadToStorageStream = new PassThrough()

  const createCsvExportPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk)
        }

        callback()
      }
    }),
    csv,
    uploadToStorageStream
  )

  const uploadToStorage = uploadToUrlsStorage({
    contentType: 'text/csv',
    folder: 'urls',
    fileName: `${new Date().toISOString()}-urls-report.csv`,
    contentStream: uploadToStorageStream
  })

  const [{ url }] = await Promise.all([
    uploadToStorage,
    createCsvExportPipeline
  ])

  return makeRight({ reportUrls: url })
}
