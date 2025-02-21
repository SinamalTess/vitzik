import express from 'express'
import { UserController } from '../controllers'

export const userRoutes = () => {
    const router = express.Router()

    router.get('/', UserController.getUsers)
    router.get('/:id', UserController.getUserById)
    router.delete('/:id', UserController.deleteUser)
    router.put('/:id', UserController.updateUser)
    router.post('/', UserController.createUser)

    return router
}
