import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../users/users.entity'

@Entity({ name: 'feedback' })
export class FeedbackEntity {
  static getRepository() {
    throw new Error('Method not implemented.')
  }
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 500 })
  comment: string

  @Column({ length: 100 })
  rating: number

  @ManyToOne(() => UserEntity, (user) => user.feedback)
  user: Pick<UserEntity, 'id'>

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
