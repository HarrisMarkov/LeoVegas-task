import { PrismaClient } from '@prisma/client'

const user = process.env.MYSQL_USER
const password = process.env.MYSQL_PASSWORD
const host = process.env.MYSQL_HOST

const dbName = process.env.MYSQL_DATABASE
const port = process.env.MYSQL_PORT

export const dbUrl = `mysql://${user}:${password}@${host}:${port}/${dbName}`

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
  errorFormat: 'pretty',
  log: ['warn'],
})

export default prisma
