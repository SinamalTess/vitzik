import { Request, Response } from 'express'
import { UserService } from '../services'

export const UserController = {
    async createUser(req: Request, res: Response) {
        try {
            const { name } = req.body
            const user = await UserService.createUser(name)
            res.status(201).json(user)
        } catch (error) {
            res.status(500).json({ error: 'Error creating user' })
        }
    },

    async getUsers(req: Request, res: Response) {
        const users = await UserService.getUsers()
        res.json(users)
    },

    async getUserById(req: Request, res: Response) {
        const user = await UserService.getUserById(Number(req.params.id))
        user
            ? res.json(user)
            : res.status(404).json({ error: 'User not found' })
    },

    async updateUser(req: Request, res: Response) {
        const user = await UserService.updateUser(
            Number(req.params.id),
            req.body.name
        )
        user
            ? res.json(user)
            : res.status(404).json({ error: 'User not found' })
    },

    async deleteUser(req: Request, res: Response) {
        await UserService.deleteUser(Number(req.params.id))
        res.status(204).send()
    },
}
