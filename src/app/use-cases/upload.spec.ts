import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createShortUrl } from './create-short-url.ts'
import { isRight } from '@/shared/either.ts'
import { uploadUrls } from './upload.ts'
import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import { eq } from 'drizzle-orm'

beforeAll(() => {
  vi.mock('@/infra/storage/upload-to-storage.ts', () => ({
    uploadToStorage: vi.fn().mockImplementation(() => {
      return {
        key: 'urls/test.json',
        url: 'https://storage.test/urls/test.json'
      }
    })
  }))
})

describe('upload to storage', () => {
  it('should be able to upload the new url to storage', async () => {
    const input = {
      name: 'google',
      originalUrl: 'https://google.com',
      shortUrlHandle: 'google'
    }

    const shortUrlInfoToUpload = await createShortUrl(input)

    if (!shortUrlInfoToUpload) {
      throw new Error('Invalid information')
    }

    const sut = await uploadUrls(shortUrlInfoToUpload)

    expect(isRight(sut)).toBe(true)

    const result = await db
      .select()
      .from(schema.urls)
      .where(eq(schema.urls.name, input.name))

    console.log(result)

    expect(result).toHaveLength(1)
  })
})
