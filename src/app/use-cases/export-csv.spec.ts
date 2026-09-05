import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { createShortUrl } from './create-short-url.ts'
import { exportCsv } from './export-csv.ts'
import { db } from '@/infra/db/index.ts'
import { schema } from '@/infra/db/schemas/index.ts'
import * as upload from '@/infra/storage/upload-to-storage.ts'
import { isRight, unwrapEither } from '@/shared/either.ts'
import { uuidv7 } from 'uuidv7'

beforeEach(async () => {
  await db.delete(schema.urls)
})

afterEach(async () => {
  await db.delete(schema.urls)
})

describe('Export CSV', () => {
  it('should be able to export csv', async () => {
    const uploadStub = vi
      .spyOn(upload, 'uploadToUrlsStorage')
      .mockImplementationOnce(async () => {
        return {
          key: `${uuidv7()}.csv`,
          url: 'http://example.com/file.csv'
        }
      })

    const handle1 = uuidv7().replace(/-/g, '').slice(0, 5)
    const handle2 = uuidv7().replace(/-/g, '').slice(0, 6)
    const handle3 = uuidv7().replace(/-/g, '').slice(0, 7)
    const handle4 = uuidv7().replace(/-/g, '').slice(0, 8)
    const handle5 = uuidv7().replace(/-/g, '').slice(0, 9)

    const url1 = await createShortUrl({
      originalUrl: `https://${handle1}.com`,
      shortUrlHandle: handle1
    })
    const url2 = await createShortUrl({
      originalUrl: `https://${handle2}.com`,
      shortUrlHandle: handle2
    })
    const url3 = await createShortUrl({
      originalUrl: `https://${handle3}.com`,
      shortUrlHandle: handle3
    })
    const url4 = await createShortUrl({
      originalUrl: `https://${handle4}.com`,
      shortUrlHandle: handle4
    })
    const url5 = await createShortUrl({
      originalUrl: `https://${handle5}.com`,
      shortUrlHandle: handle5
    })

    const sut = await exportCsv()

    const generatedCSVStream = uploadStub.mock.calls[0][0].contentStream

    const csvAsString = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []

      generatedCSVStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      generatedCSVStream.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'))
      })

      generatedCSVStream.on('error', (error) => {
        reject(error)
      })
    })

    const csvAsArray = csvAsString
      .trim()
      .split('\n')
      .map((row) => row.split(','))

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      reportUrls: 'http://example.com/file.csv'
    })
    expect(csvAsArray).toEqual([
      ['ID', 'Original URL', 'Short URL', 'Access Count', 'Created at'],
      [
        url1.right?.id,
        url1.right?.originalUrl,
        url1.right?.shortUrl,
        '0',
        expect.any(String)
      ],
      [
        url2.right?.id,
        url2.right?.originalUrl,
        url2.right?.shortUrl,
        '0',
        expect.any(String)
      ],
      [
        url3.right?.id,
        url3.right?.originalUrl,
        url3.right?.shortUrl,
        '0',
        expect.any(String)
      ],
      [
        url4.right?.id,
        url4.right?.originalUrl,
        url4.right?.shortUrl,
        '0',
        expect.any(String)
      ],
      [
        url5.right?.id,
        url5.right?.originalUrl,
        url5.right?.shortUrl,
        '0',
        expect.any(String)
      ]
    ])
  })
})
