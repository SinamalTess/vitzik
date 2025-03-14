import { DataSource } from 'typeorm'
import { LoginToken, User } from '../entities'
import * as dotenv from 'dotenv'

dotenv.config()

export const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.MYSQL_DATABASE_HOST,
    port: Number(process.env.MYSQL_DATABASE_PORT),
    username: process.env.MYSQL_DATABASE_USERNAME,
    password: process.env.MYSQL_DATABASE_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME,
    synchronize: true, // Auto-migrate
    entities: [User, LoginToken],
})
