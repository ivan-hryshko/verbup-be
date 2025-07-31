import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { SessionEntity } from '../sessions/session.entity'
import { ProgressPsEntity } from '../progress/progress-ps/progress-ps.entity'
import { ProgressPpEntity } from '../progress/progress-pp/progress-pp.entity'

@Entity({ name: 'users' })
@Unique(['email'])
export class UserEntity {
  static getRepository() {
    throw new Error('Method not implemented.')
  }
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 30, nullable: true })
  username: string

  @Column({ length: 200, select: false })
  password: string

  @Column({ length: 40 })
  email: string

  @Column({ length: 200, nullable: true })
  avatar: string

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[]

  @OneToMany(() => ProgressPsEntity, (ps) => ps.user)
  progressPs: ProgressPsEntity[]

  @OneToMany(() => ProgressPpEntity, (pp) => pp.user)
  progressPp: ProgressPpEntity[]

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
