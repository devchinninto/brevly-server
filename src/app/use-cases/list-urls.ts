import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'

export async function listUrls() {
  const urls = await db
    .select({
      short_url: schema.urls.shortUrl
    })
    .from(schema.urls)

  return { urls }
}
