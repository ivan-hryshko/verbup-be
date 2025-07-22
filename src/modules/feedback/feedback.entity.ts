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

  @Column('int')
  rating: number

  @ManyToOne(() => UserEntity, (user) => user.feedback, { nullable: true })
  user: UserEntity | null

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
