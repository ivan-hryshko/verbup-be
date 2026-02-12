import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { UserEntity } from '../users/users.entity'
import { TrainingWordEntity } from './training-words.entity'

@Entity({ name: 'trainings' })
export class TrainingEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ name: 'user_id' })
  userId: number

  @Column({ length: 10 })
  mode: string

  @Column({ length: 10 })
  type: string

  @Column({ length: 10 })
  level: string

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime: Date | null

  @Column({ name: 'question_count' })
  questionCount: number

  @OneToMany(() => TrainingWordEntity, (trainingWord) => trainingWord.training)
  trainingWords: TrainingWordEntity[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
