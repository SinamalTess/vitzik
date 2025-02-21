import { userRepository } from '../repositories/user.repository'

export const UserService = {
    async createUser(name: string) {
        const user = userRepository.create({ name })
        return await userRepository.save(user)
    },

    async getUsers() {
        return await userRepository.find()
    },

    async getUserById(id: number) {
        return await userRepository.findOne({ where: { id } })
    },

    async updateUser(id: number, name: string) {
        await userRepository.update(id, { name })
        return userRepository.findOne({ where: { id } })
    },

    async deleteUser(id: number) {
        return await userRepository.delete(id)
    },
}
