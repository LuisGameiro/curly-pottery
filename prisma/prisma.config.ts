import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(__dirname, '../.env') })

export default defineConfig({
  datasource: {
    url: process.env.DB_DATABASE_URL,
  },
})
