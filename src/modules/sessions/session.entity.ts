import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../users/users.entity'

@Entity({ name: 'sessions' })
export class SessionEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  refreshToken: string

  @Column({ type: 'timestamptz' })
  expiresAt: Date

  @ManyToOne(() => UserEntity, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: Pick<UserEntity, 'id'>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
