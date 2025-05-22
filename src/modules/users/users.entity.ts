import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

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

  @Column({ length: 50 })
  password: string

  @Column({ length: 40 })
  email: string

  @Column({ length: 200, nullable: true })
  avatar: string

  //   @Column()
  //   isAdmin: boolean

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
