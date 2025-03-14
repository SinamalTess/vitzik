import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    OneToOne,
} from 'typeorm'
import { User } from './User'

@Entity('login_tokens')
export class LoginToken {
    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User

    @Column()
    token: string

    @Column({
        type: 'timestamp',
        default: () => 'DATE_ADD(NOW(), INTERVAL 15 MINUTE)',
    })
    expires_at: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date
}
