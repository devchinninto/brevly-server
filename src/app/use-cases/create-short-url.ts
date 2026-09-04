import { z, ZodError } from 'zod'
import { env } from '@/env.ts'

const shortUrlInput = z.object({
  name: z.string(),
  originalUrl: z.url(),
  shortUrlHandle: z
    .string()
    .min(2)
    .max(12)
    .regex(/^[a-zA-Z0-9]+$/)
})

export type ShortUrlInput = z.input<typeof shortUrlInput>

export async function createShortUrl(input: ShortUrlInput) {
  try {
    const { name, originalUrl, shortUrlHandle } = shortUrlInput.parse(input)

    const formattedShortUrl = `${env.PREFIX}/${shortUrlHandle}`

    return { name, originalUrl, shortUrl: formattedShortUrl }
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.issues)
    }
  }
}
