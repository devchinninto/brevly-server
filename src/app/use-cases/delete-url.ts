import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { InvalidUrlFormatError } from '../errors/invalid-url-format.ts'
import { makeRight } from '@/shared/either.ts'

const deleteUrlInput = z.string()

type DeleteUrlInput = z.input<typeof deleteUrlInput>

export async function deleteUrl(url: DeleteUrlInput) {
  const parsed = deleteUrlInput.safeParse(url)

  if (!parsed.success) {
    throw new InvalidUrlFormatError()
  }

  const deleted = await db
    .delete(schema.urls)
    .where(eq(schema.urls.shortUrl, parsed.data))

  return makeRight({ deleted })
}
