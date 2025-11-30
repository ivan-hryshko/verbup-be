import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { TrainingEntity } from './trainings.entity'
import { IrrWordEntity } from '../irr-words/irr-words.entity'

@Entity({ name: 'training_words' })
export class TrainingWordEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => TrainingEntity, (training) => training.trainingWords, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'training_id' })
  training: TrainingEntity

  @Column({ name: 'training_id' })
  trainingId: number

  @ManyToOne(() => IrrWordEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'irr_word_id' })
  irrWord: IrrWordEntity

  @Column({ name: 'irr_word_id' })
  irrWordId: number

  @Column({ name: 'was_correct', type: 'boolean', nullable: true })
  wasCorrect: boolean | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
