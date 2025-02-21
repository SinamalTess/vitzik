import { dataSource } from '../config'
import { User } from '../entities'

export const userRepository = dataSource.getRepository(User)
