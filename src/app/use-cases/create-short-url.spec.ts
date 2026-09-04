import { describe, expect, it } from 'vitest'
import { createShortUrl } from './create-short-url.ts'

describe('create a short url', () => {
  it('should be able to create a new short url', async () => {
    const input = {
      name: 'google',
      originalUrl: 'https://google.com',
      shortUrlHandle: 'google'
    }

    const result = await createShortUrl(input)
    console.log(result)

    expect(result?.shortUrl).toBe('brevly.com/google')
  })

  it('should NOT be able to create a new short url', async () => {
    const input = {
      name: 'google',
      originalUrl: 'https://mywebsite.com/api/something',
      shortUrlHandle: 'mywebsite/api/something'
    }

    const result = await createShortUrl(input)

    expect(result?.shortUrl).toThrow(TypeError)
  })
})
