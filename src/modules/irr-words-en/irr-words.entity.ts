import { Entity, PrimaryGeneratedColumn, OneToOne, Unique, Column } from 'typeorm'

@Entity({ name: 'irr_words' })
@Unique(['wordGroupId', 'basic']) // this enforces uniqueness; creates index automatically
export class IrrWordEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'word_group_id', nullable: false,  })
  wordGroupId: number;

  @Column()
  lang: string;

  @Column({ length: 40 })
  basic: string;

  @Column({ name: 'past_simple', length: 40, nullable: true })
  pastSimple: string;

  @Column({ name: 'past_participle', length: 40, nullable: true })
  pastParticiple: string;

  @Column({ length: 40, nullable: true })
  level: string;

  @Column({ length: 200, nullable: true })
  image: string;

  @Column({ name: 'basic_sound', length: 200, nullable: true })
  basicSound: string;

  @Column({ name: 'ps_sound', length: 200, nullable: true })
  psSound: string;

  @Column({ name: 'pp_sound', length: 200, nullable: true })
  ppSound: string;
}
