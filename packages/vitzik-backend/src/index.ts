import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { azureWebSubPubRoutes } from './routes'

config()

const app = express()
const PORT = 8080

app.use(cors())
app.use('/', azureWebSubPubRoutes())

app.listen(PORT, () =>
    console.log(`Application server listening at http://localhost:${PORT}`)
)
