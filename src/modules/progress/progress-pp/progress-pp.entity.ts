import {
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../../users/users.entity'
import { IrrWordEntity } from '../../irr-words/irr-words.entity'
import { ProgressStatus } from '../progress.types'

@Entity({ name: 'progress_pp' })
@Unique(['user', 'word']) // this enforces uniqueness; creates index automatically
export class ProgressPpEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => UserEntity, (user) => user.progressPp, {
    onDelete: 'CASCADE',
  })
  user: UserEntity

  @ManyToOne(() => IrrWordEntity, (word) => word.progressPp, {
    onDelete: 'CASCADE',
  })
  word: IrrWordEntity

  @Column({ type: 'varchar' })
  status: ProgressStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
