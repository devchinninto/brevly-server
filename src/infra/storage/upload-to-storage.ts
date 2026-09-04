import { Upload } from '@aws-sdk/lib-storage'
import { z } from 'zod'
import { env } from '@/env.ts'
import { r2 } from './client.ts'

const uploadToStorageInput = z.object({
  folder: z.string().default('urls'),
  urlName: z.string(),
  originalUrl: z.url(),
  shortUrl: z.string()
})

type UploadToStorageInput = z.input<typeof uploadToStorageInput>

export async function uploadToStorage(input: UploadToStorageInput) {
  const { folder, originalUrl, shortUrl, urlName } =
    uploadToStorageInput.parse(input)

  const key = `${folder}/${shortUrl}.json`
  const body = JSON.stringify({ originalUrl, shortUrl, urlName })

  const upload = new Upload({
    client: r2,
    params: {
      Key: key,
      Bucket: env.CLOUDFLARE_BUCKET,
      Body: body,
      ContentType: 'application/json'
    }
  })

  await upload.done()

  return {
    key,
    url: new URL(key, env.CLOUDFLARE_PUBLIC_URL).toString()
  }
}
