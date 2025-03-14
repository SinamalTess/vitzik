import { loginTokenRepository } from '../repositories/login-token.repository'
import crypto from 'crypto'
import { User } from '../entities'

export const LoginTokenService = {
    async createLoginToken(userId: User['id']) {
        const token = crypto.randomBytes(32).toString('hex')

        const _token = loginTokenRepository.create({
            token,
            user: { id: userId },
        })

        await loginTokenRepository.save(_token)

        return _token
    },

    async getLoginTokenByUser(userId: User['id']) {
        return await loginTokenRepository.findOne({
            where: { user: { id: userId } },
        })
    },

    async getLoginToken(token: string, userId: User['id']) {
        return await loginTokenRepository.findOne({
            where: { token, user: { id: userId } },
        })
    },

    async deleteLoginToken(token: string) {
        return await loginTokenRepository.delete({ token })
    },
}
