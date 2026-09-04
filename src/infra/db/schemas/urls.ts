import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const urls = pgTable('urls', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text('name').notNull(),
  originalUrl: text('original_url').notNull().unique(),
  shortUrl: text('short_url').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  accessCount: integer('access_count').notNull().default(0)
})
