import express from 'express'
import { UserController } from '../controllers'

export const userRoutes = () => {
    const router = express.Router()

    router.get('/', UserController.getUsers)
    router.get('/:id', UserController.getUserById)
    router.get('/:email', UserController.getUserByEmail)
    router.post('/', UserController.createUser)
    router.put('/:id', UserController.updateUser)
    router.delete('/:id', UserController.deleteUser)

    return router
}
