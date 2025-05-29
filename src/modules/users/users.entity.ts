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

@Entity({ name: 'users' })
@Unique(['email'])
export class UserEntity {
  static getRepository() {
    throw new Error('Method not implemented.')
  }
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 30 })
  username: string

  @Column({ length: 200, select: false })
  password: string

  @Column({ length: 40 })
  email: string

  @Column({ length: 200, nullable: true })
  avatar: string

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[]

  //   @Column()
  //   isAdmin: boolean

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
