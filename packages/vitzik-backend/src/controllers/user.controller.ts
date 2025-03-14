import { Request, Response } from 'express'
import { UserService } from '../services'

export const UserController = {
    async createUser(req: Request, res: Response) {
        const { email } = req.body
        const user = await UserService.getUserByEmail(email)

        if (user) {
            res.status(400).json({ error: 'User already exists' })
        }

        try {
            const user = await UserService.createUser(email)

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

    async getUserByEmail(req: Request, res: Response) {
        const user = await UserService.getUserByEmail(req.params.email)
        user
            ? res.json(user)
            : res.status(404).json({ error: 'User not found' })
    },

    async updateUser(req: Request, res: Response) {
        const user = req.body

        const _user = await UserService.updateUser(user)
        _user
            ? res.json(_user)
            : res.status(404).json({ error: 'User not found' })
    },

    async deleteUser(req: Request, res: Response) {
        await UserService.deleteUser(Number(req.params.id))
        res.status(204).send()
    },
}
