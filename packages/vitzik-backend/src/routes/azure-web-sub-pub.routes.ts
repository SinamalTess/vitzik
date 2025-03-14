import express from 'express'
import { AzureWebSubPubController } from '../controllers'

export const azureWebSubPubRoutes = () => {
    const router = express.Router()

    router.get('/negotiate', (req, res) =>
        AzureWebSubPubController(req, res).negotiate()
    )

    router.get('/join-group', (req, res) =>
        AzureWebSubPubController(req, res).joinGroup('test')
    )

    return router
}
