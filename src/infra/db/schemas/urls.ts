import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const urls = pgTable('urls', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text('name').notNull(),
  originalUrl: text('original_url').notNull().unique(),
  shortenedUrl: text('shortened_url').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})
