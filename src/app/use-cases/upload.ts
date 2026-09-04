import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { makeRight } from '@/shared/either.ts'
import { uploadToStorage } from '@/infra/storage/upload-to-storage.ts'

const uploadUrlsInput = z.object({
  name: z.string(),
  originalUrl: z.url(),
  shortUrl: z.string()
})

type UploadUrlsInput = z.input<typeof uploadUrlsInput>

export async function uploadUrls(input: UploadUrlsInput) {
  const { name, originalUrl, shortUrl } = uploadUrlsInput.parse(input)

  const [inserted] = await db
    .insert(schema.urls)
    .values({ name, originalUrl, shortUrl })
    .onConflictDoNothing({ target: schema.urls.originalUrl })
    .returning({ shortUrl: schema.urls.shortUrl })

  // If the original URL was already shortened, keep its existing short URL.
  let resolvedShortUrl = inserted?.shortUrl

  if (!resolvedShortUrl) {
    const [existing] = await db
      .select({ shortUrl: schema.urls.shortUrl })
      .from(schema.urls)
      .where(eq(schema.urls.originalUrl, originalUrl))

    resolvedShortUrl = existing.shortUrl
  }

  // Always (re)write the storage object so the bucket stays in sync with the DB,
  // even when the row already existed. PutObject overwrites, so this is idempotent.
  const result = await uploadToStorage({
    urlName: name,
    originalUrl,
    shortUrl: resolvedShortUrl
  })

  console.log(result)

  return makeRight({ shortUrl: resolvedShortUrl })
}
