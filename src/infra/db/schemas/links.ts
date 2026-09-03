import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const links = pgTable('links', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text('name').notNull(),
  originalUrl: text('original_url').notNull().unique(),
  shortenedUrl: text('remote_url').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})
