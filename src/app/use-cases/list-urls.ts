import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'

export async function listUrls() {
  const urls = await db
    .select({
      id: schema.urls.id,
      originalUrl: schema.urls.originalUrl,
      shortUrl: schema.urls.shortUrl,
      accessCount: schema.urls.accessCount,
      createdAt: schema.urls.createdAt
    })
    .from(schema.urls)

  return { urls }
}
