import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm'

@Entity('daily_stats')
@Unique(['stat_date'])
export class DailyStatsEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'date' })
  stat_date: string

  @Column({ type: 'int', default: 0 })
  registrations: number

  @Column({ type: 'int', default: 0 })
  games_finished: number

  @Column({ type: 'int', default: 0 })
  games_finished_easy: number

  @Column({ type: 'int', default: 0 })
  games_finished_medium: number

  @Column({ type: 'int', default: 0 })
  games_finished_hard: number

  @Column({ type: 'int', default: 0 })
  users_completed_platform: number

  @CreateDateColumn()
  created_at: Date
}
