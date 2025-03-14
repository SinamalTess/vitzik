import express from 'express'
import { LoginController } from '../controllers'

export const loginRoutes = () => {
    const router = express.Router()

    router.get('/', LoginController.getLoginLink)
    router.post('/', LoginController.checkLoginToken)
    router.delete('/', LoginController.deleteLoginToken)

    return router
}
