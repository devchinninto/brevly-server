import { Upload } from '@aws-sdk/lib-storage'
import { z } from 'zod'
import { env } from '@/env.ts'
import { r2 } from './client.ts'
import { Readable } from 'node:stream'
import { extname } from 'node:path'
import { uuidv7 } from 'uuidv7'

const uploadToStorageInput = z.object({
  folder: z.enum(['urls', 'reports']),
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable)
})

type UploadToStorageInput = z.input<typeof uploadToStorageInput>

export async function uploadToUrlsStorage(input: UploadToStorageInput) {
  const { folder, fileName, contentType, contentStream } =
    uploadToStorageInput.parse(input)

  const fileExtension = extname(fileName)

  const key = `${folder}/${uuidv7()}-urls-report${fileExtension}`

  console.log(key)

  const upload = new Upload({
    client: r2,
    params: {
      Key: key,
      Bucket: env.CLOUDFLARE_BUCKET,
      Body: contentStream,
      ContentType: contentType
    }
  })

  await upload.done()

  return {
    key,
    url: new URL(key, env.CLOUDFLARE_PUBLIC_URL).toString()
  }
}
