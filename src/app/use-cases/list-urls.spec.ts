import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createShortUrl } from './create-short-url.ts'
import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { listUrls } from './list-urls.ts'
import { uuidv7 } from 'uuidv7'

beforeEach(async () => {
  await db.delete(schema.urls)
})

afterEach(async () => {
  await db.delete(schema.urls)
})

describe('List all urls', () => {
  it('should list all urls', async () => {
    const firstHandle = uuidv7().replace(/-/g, '').slice(0, 5)

    const firstUrl = {
      originalUrl: `https://${firstHandle}.com`,
      shortUrlHandle: firstHandle
    }

    const firstResponse = await createShortUrl(firstUrl)

    const secondHandle = uuidv7().replace(/-/g, '').slice(0, 6)

    const secondUrl = {
      originalUrl: `https://${secondHandle}.com`,
      shortUrlHandle: secondHandle
    }

    const secondResponse = await createShortUrl(secondUrl)

    const result = await listUrls()

    expect(result.urls.length).toBe(2)
    expect(result.urls).toEqual([
      expect.objectContaining({ short_url: firstResponse.right?.shortUrl }),
      expect.objectContaining({ short_url: secondResponse.right?.shortUrl })
    ])
  })
})
