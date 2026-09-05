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

    const createUrlResponse = await createShortUrl(url)

    const successfullyCreated = makeRight(createUrlResponse)
    const createdUrl = unwrapEither(successfullyCreated)

    const shortUrlToSearch = createdUrl.right?.shortUrl

    if (!shortUrlToSearch) {
      throw new UrlNotFoundError()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const firstAccess = await getUrl(shortUrlToSearch)
    const secondAccess = await getUrl(shortUrlToSearch)

    const successfulResponse = makeRight(secondAccess)
    const result = unwrapEither(successfulResponse)

    expect(result.right?.originalUrl).toEqual(createdUrl.right?.originalUrl)
    expect(result.right?.accessCount).toBe(2)
  })
})
