import { dataSource } from '../config'
import { LoginToken } from '../entities'

export const loginTokenRepository = dataSource.getRepository(LoginToken)
