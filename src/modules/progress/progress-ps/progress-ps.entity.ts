import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  Unique,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserEntity } from '../../users/users.entity'
import { IrrWordEntity } from '../../irr-words-en/irr-words.entity'
import { ProgressStatus } from '../progress.types'

@Entity({ name: 'progress_ps' })
@Unique(['user', 'word']) // this enforces uniqueness; creates index automatically
export class ProgressPsEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => UserEntity, (user) => user.progressPs, {
    onDelete: 'CASCADE',
  })
  user: UserEntity

  @ManyToOne(() => IrrWordEntity, (word) => word.progressPs, {
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
