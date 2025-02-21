import { userRoutes } from './user.routes'
import { azureWebSubPubRoutes } from './azureWebSubPubRoutes'
import express from 'express'

export const routes = () => {
    const router = express.Router()

    router.use('/users', userRoutes())
    router.use('/azure-websub', azureWebSubPubRoutes())

    return router
}
