import { Request, Response } from 'express'
import { LoginTokenService } from '../services/login-token.service'
import { sendAzureLoginEmail } from '../utils'
import { UserService } from '../services'

export const LoginController = {
    async getLoginLink(req: Request, res: Response) {
        const { email } = req.body
        const user = await UserService.getUserByEmail(email)
        const userId = user.id

        if (!user) {
            res.status(404).json({ error: 'User not found' })
        }

        const existingToken =
            await LoginTokenService.getLoginTokenByUser(userId)

        if (existingToken) {
            res.status(400).json({ error: 'User already has a valid token' })
        }

        const { token } = await LoginTokenService.createLoginToken(user.id)
        //TODO: replace by final url
        const magicLink = `http://mydomain.com/login?token=${token}&email=${email}`

        try {
            // await sendAzureLoginEmail({ to: email, magicLink })

            res.json({ message: 'Magic link sent! (fake)' })
        } catch (error) {
            console.error('Failed to send email:', error)

            await LoginTokenService.deleteLoginToken(token)

            res.status(500).json({ error: 'Failed to send email' })
        }
    },

    async checkLoginToken(req: Request, res: Response) {
        const { token, email } = req.body
        const user = await UserService.getUserByEmail(email)
        const userId = user.id
        const loginToken = await LoginTokenService.getLoginToken(token, userId)

        if (!loginToken) {
            res.status(404).json({ error: 'Login token is invalid' })
        }

        res.json({ message: 'Login token is valid' })
    },

    async deleteLoginToken(req: Request, res: Response) {
        const { token } = req.body
        const loginToken = await LoginTokenService.deleteLoginToken(token)

        if (!loginToken) {
            res.status(404).json({ error: 'Login token not found' })
        }

        res.json({ message: 'Login token deleted' })
    },
}
