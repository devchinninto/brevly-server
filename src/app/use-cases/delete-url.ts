import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { InvalidUrlFormatError } from '../errors/invalid-url-format.ts'
import { UrlNotFoundError } from '../errors/url-not-found-error.ts'
import { Either, makeLeft, makeRight } from '@/shared/either.ts'

const deleteUrlInput = z.string()

type DeleteUrlInput = z.input<typeof deleteUrlInput>

type DeleteUrlOutput = typeof schema.urls.$inferSelect

type deleteUrlOutput = Either<
  InvalidUrlFormatError | UrlNotFoundError,
  DeleteUrlOutput
>

export async function deleteUrl(url: DeleteUrlInput): Promise<deleteUrlOutput> {
  const parsed = deleteUrlInput.safeParse(url)

  if (!parsed.success) {
    throw new InvalidUrlFormatError()
  }

  const deleted = await db
    .delete(schema.urls)
    .where(eq(schema.urls.shortUrl, parsed.data))
    .returning()

  if (deleted.length === 0) {
    return makeLeft(new UrlNotFoundError())
  }

  return makeRight(deleted[0])
}
