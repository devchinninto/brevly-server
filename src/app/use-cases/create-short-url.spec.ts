import { describe, expect, it, beforeEach } from 'vitest'
import { createShortUrl } from './create-short-url.ts'
import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { isRight, unwrapEither } from '@/shared/either.ts'
import { env } from '@/env.ts'
import { InvalidUrlFormatError } from '../errors/invalid-url-format.ts'
import { UrlAlreadyExistsError } from '../errors/url-already-exists-error.ts'
import { afterEach } from 'node:test'
import { uuidv7 } from 'uuidv7'

beforeEach(async () => {
  await db.delete(schema.urls)
})

afterEach(async () => {
  await db.delete(schema.urls)
})

describe('create a short url', () => {
  const handle = uuidv7().replace(/-/g, '').slice(0, 12)

  it('should create a new short url', async () => {
    const input = {
      originalUrl: `https://${handle}.com`,
      shortUrlHandle: handle
    }

    const createdUrl = await createShortUrl(input)
    const formattedShortUrl = `${env.PREFIX}/${input.shortUrlHandle}`

    let result

    if (isRight(createdUrl)) {
      result = unwrapEither(createdUrl)
    }

    expect(result?.originalUrl).toEqual(input.originalUrl)
    expect(result?.shortUrl).toEqual(formattedShortUrl)
  })

  it('should throw an Invalid URL Format Error', async () => {
    const invalidHandle = uuidv7().replace(/-/g, '').slice(0, 15)

    const input = {
      originalUrl: `https://${invalidHandle}.com/`,
      shortUrlHandle: invalidHandle
    }

    const result = await createShortUrl(input)

    const error = unwrapEither(result)

    expect(error).toBeInstanceOf(InvalidUrlFormatError)
  })

  it('should throw an URL Already Exists Error', async () => {
    const input = {
      originalUrl: 'https://duplicate-website.com/',
      shortUrlHandle: 'duplicate'
    }

    const firstCreateAttempt = await createShortUrl(input)

    const secondCreateAttempt = await createShortUrl(input)
    const error = unwrapEither(secondCreateAttempt)

    expect(isRight(firstCreateAttempt)).toBe(true)
    expect(error).toBeInstanceOf(UrlAlreadyExistsError)
  })
})
