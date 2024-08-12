import express from 'express'
import bodyParser from 'body-parser'

import PrismaClient from './prisma'
import router from './src/routes'
import errorHandler from './src/middleware/errorHandler/errorHandler'

const PORT = process.env.SERVER_PORT
const dbUrl = process.env.DATABASE_URL

export const app = express()

app.use(express.json())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true })) // support encoded bodies

PrismaClient.$connect()
  .then(() => {
    console.log(`[Server]: Connected to DB at ${dbUrl}`)
  })
  .catch((err: any) => {
    console.log(err)
  })

app.use('/api', router, errorHandler)

app.listen(PORT, () => {
  console.log(`[Server]: Up and running on http://localhost:${PORT}`)
})
