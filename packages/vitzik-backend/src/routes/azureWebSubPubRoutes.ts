import express from 'express'
import { azureWebSubPubController } from '../controllers'

export const azureWebSubPubRoutes = () => {
    const router = express.Router()

    router.get('/negotiate', (req, res) =>
        azureWebSubPubController(req, res).negociate()
    )

    router.get('/join-group', (req, res) =>
        azureWebSubPubController(req, res).joinGroup('test')
    )

    return router
}
