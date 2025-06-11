import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddIrrWords1748537260813 implements MigrationInterface {
  name = 'AddIrrWords1748537260813'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "irr_words" ("id" SERIAL NOT NULL, "word_group_id" integer NOT NULL, "lang" character varying NOT NULL, "basic" character varying(40) NOT NULL, "past_simple" character varying(40), "past_participle" character varying(40), "level" character varying(40), "image" character varying(200), "basic_sound" character varying(200), "ps_sound" character varying(200), "pp_sound" character varying(200), CONSTRAINT "UQ_f5ad4144d1664ba0b2f8d9db555" UNIQUE ("word_group_id", "basic"), CONSTRAINT "PK_912a7fa14ad49e199b6b2bbca85" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "irr_words"`)
  }
}
