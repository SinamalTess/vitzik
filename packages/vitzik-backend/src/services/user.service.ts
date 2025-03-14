import { userRepository } from '../repositories/user.repository'
import { User } from '../entities'

export const UserService = {
    async createUser(email: User['email']) {
        const _user = userRepository.create({ email })
        return await userRepository.save(_user)
    },

    async getUsers() {
        return await userRepository.find()
    },

    async getUserById(id: User['id']) {
        return await userRepository.findOne({ where: { id } })
    },

    async getUserByEmail(email: User['email']) {
        return await userRepository.findOne({ where: { email } })
    },

    async updateUser(user) {
        const { id, ...rest } = user
        await userRepository.update(id, rest)
        return userRepository.findOne({ where: { id } })
    },

    async deleteUser(id: User['id']) {
        return await userRepository.delete(id)
    },
}
