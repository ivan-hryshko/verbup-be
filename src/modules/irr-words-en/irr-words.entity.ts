import { Entity, PrimaryGeneratedColumn, OneToOne, Unique, Column, OneToMany } from 'typeorm'
import { ProgressPsEntity } from '../progress/progress-ps/progress-ps.entity'
import { ProgressPpEntity } from '../progress/progress-pp/progress-pp.entity'

@Entity({ name: 'irr_words' })
@Unique(['wordGroupId', 'basic']) // this enforces uniqueness; creates index automatically
export class IrrWordEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'word_group_id', nullable: false })
  wordGroupId: number

  @Column()
  lang: string

  @Column({ length: 40 })
  basic: string

  @Column({ name: 'past_simple', length: 40, nullable: true })
  pastSimple: string

  @Column({ name: 'past_participle', length: 40, nullable: true })
  pastParticiple: string

  @Column({ length: 40, nullable: true })
  level: string

  @Column({ length: 200, nullable: true })
  image: string

  @Column({ name: 'basic_sound', length: 200, nullable: true })
  basicSound: string

  @Column({ name: 'ps_sound', length: 200, nullable: true })
  psSound: string

  @Column({ name: 'pp_sound', length: 200, nullable: true })
  ppSound: string

  @OneToMany(() => ProgressPsEntity, (ps) => ps.user)
  progressPs: ProgressPsEntity[]

  @OneToMany(() => ProgressPpEntity, (pp) => pp.user)
  progressPp: ProgressPpEntity[]
}
