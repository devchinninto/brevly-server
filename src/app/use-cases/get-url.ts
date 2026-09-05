import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { eq } from 'drizzle-orm'
import { Either, makeLeft, makeRight } from '@/shared/either.ts'
import { UrlNotFoundError } from '../errors/url-not-found-error.ts'

type GetUrlOutput = Either<
  UrlNotFoundError,
  {
    originalUrl: string
    accessCount: number
  }
>

export async function getUrl(shortUrl: string): Promise<GetUrlOutput> {
  const _result = await db
    .select({
      originalUrl: schema.urls.originalUrl,
      accessCount: schema.urls.accessCount
    })
    .from(schema.urls)
    .where(eq(schema.urls.shortUrl, shortUrl))

  if (_result.length === 0) {
    return makeLeft(new UrlNotFoundError())
  }

  const result = await db
    .update(schema.urls)
    .set({ accessCount: _result[0].accessCount + 1 })
    .where(eq(schema.urls.shortUrl, shortUrl))
    .returning({
      originalUrl: schema.urls.originalUrl,
      accessCount: schema.urls.accessCount
    })

  return makeRight({
    originalUrl: result[0].originalUrl,
    accessCount: result[0].accessCount
  })
}
