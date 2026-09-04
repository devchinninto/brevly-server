import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { eq } from 'drizzle-orm'
import { Either, makeLeft, makeRight } from '@/shared/either.ts'
import { UrlNotFoundError } from '../errors/url-not-found-error.ts'

type GetUrlOutput = Either<UrlNotFoundError, string>

export async function getUrl(shortUrl: string): Promise<GetUrlOutput> {
  const result = await db
    .select({
      originalUrl: schema.urls.originalUrl
    })
    .from(schema.urls)
    .where(eq(schema.urls.shortUrl, shortUrl))

  if (result.length === 0) {
    return makeLeft(new UrlNotFoundError())
  }

  return makeRight(result[0].originalUrl)
}
