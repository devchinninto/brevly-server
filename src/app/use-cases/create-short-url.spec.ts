import { describe, expect, it, beforeAll } from 'vitest'
import { createShortUrl } from './create-short-url.ts'
import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { isRight, unwrapEither } from '@/shared/either.ts'
import { env } from '@/env.ts'
import { InvalidUrlFormatError } from '../errors/invalid-url-format.ts'
import { UrlAlreadyExistsError } from '../errors/url-already-exists-error.ts'

beforeAll(async () => {
  await db.delete(schema.urls)
})

describe('create a short url', () => {
  it('should create a new short url', async () => {
    const input = {
      originalUrl: 'https://google.com',
      shortUrlHandle: 'google'
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
    const input = {
      originalUrl: 'https://mywebsite.com/',
      shortUrlHandle: 'mywebsite_new_big_link'
    }

    const result = await createShortUrl(input)

    const error = unwrapEither(result)

    expect(error).toBeInstanceOf(InvalidUrlFormatError)
  })

  it('should throw an URL Already Exists Error', async () => {
    const input = {
      originalUrl: 'https://mywebsite.com/',
      shortUrlHandle: 'mywebsite'
    }

    const firstCreateAttempt = await createShortUrl(input)

    const secondCreateAttempt = await createShortUrl(input)
    const error = unwrapEither(secondCreateAttempt)

    expect(isRight(firstCreateAttempt)).toBe(true)
    expect(error).toBeInstanceOf(UrlAlreadyExistsError)
  })
})
