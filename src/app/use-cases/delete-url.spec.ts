import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createShortUrl } from './create-short-url.ts'
import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { listUrls } from './list-urls.ts'
import { uuidv7 } from 'uuidv7'
import { deleteUrl } from './delete-url.ts'
import { InvalidUrlFormatError } from '../errors/invalid-url-format.ts'

beforeEach(async () => {
  await db.delete(schema.urls)
})

afterEach(async () => {
  await db.delete(schema.urls)
})

describe('Delete a short url', () => {
  it('should delete a url', async () => {
    const handle = uuidv7().replace(/-/g, '').slice(0, 5)

    const input = {
      originalUrl: `https://${handle}.com`,
      shortUrlHandle: handle
    }

    const createdUrl = await createShortUrl(input)

    const url = createdUrl.right?.shortUrl

    if (!url) {
      throw new InvalidUrlFormatError()
    }

    await deleteUrl(url)

    const result = await listUrls()

    expect(result.urls.length).toBe(0)
  })
})
