import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { routes } from './routes'
import { dataSource } from './config'

config()

const app = express()
const PORT = 8080

app.use([cors(), express.json(), routes()])

app.listen(PORT, async () => {
    console.log(`Application server listening at http://localhost:${PORT}`)

    await dataSource.initialize()

    console.log(`Connection to the database successful`)
})
