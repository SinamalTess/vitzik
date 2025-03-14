import { userRoutes } from './user.routes'
import { azureWebSubPubRoutes } from './azure-web-sub-pub.routes'
import express from 'express'
import { loginRoutes } from './login.routes'

export const routes = () => {
    const router = express.Router()

    router.use('/users', userRoutes())
    router.use('/azure-websub', azureWebSubPubRoutes())
    router.use('/login', loginRoutes())

    return router
}
