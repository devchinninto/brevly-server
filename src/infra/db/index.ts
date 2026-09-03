import postgres from 'postgres'
import { env } from '@/env.ts'
import { drizzle } from 'drizzle-orm/postgres-js'

export const pg = postgres(env.DATABASE_URL)
export const db = drizzle({ client: pg })
