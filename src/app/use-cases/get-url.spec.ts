import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { createShortUrl } from './create-short-url.ts'
import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { uuidv7 } from 'uuidv7'
import { getUrl } from './get-url.ts'
import { makeRight, unwrapEither } from '@/shared/either.ts'
import { UrlNotFoundError } from '../errors/url-not-found-error.ts'

beforeEach(async () => {
  await db.delete(schema.urls)
})

afterEach(async () => {
  await db.delete(schema.urls)
})

describe('Get a single URL', () => {
  it('should get an original URL by short URL ', async () => {
    const handle = uuidv7().replace(/-/g, '').slice(0, 5)

    const url = {
      originalUrl: `https://${handle}.com`,
      shortUrlHandle: handle
    }

    const _createdUrl = await createShortUrl(url)

    const createdUrl = makeRight(_createdUrl)
    const response = unwrapEither(createdUrl)

    const shortUrlToSearch = response.right?.shortUrl

    if (!shortUrlToSearch) {
      throw new UrlNotFoundError()
    }

    const result = await getUrl(shortUrlToSearch)

    expect(unwrapEither(result)).toEqual(response.right?.originalUrl)
  })
})
