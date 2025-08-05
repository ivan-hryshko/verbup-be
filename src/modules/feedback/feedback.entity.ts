import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

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

  @Column({ type: 'int', nullable: true })
  userId: number | null

  @CreateDateColumn()
  created_at: Date
}
