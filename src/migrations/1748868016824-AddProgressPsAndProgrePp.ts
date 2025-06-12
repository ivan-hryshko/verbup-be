import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddProgressPsAndProgrePp1748868016824 implements MigrationInterface {
  name = 'AddProgressPsAndProgrePp1748868016824'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "progress_pp" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "wordId" integer, CONSTRAINT "UQ_d18b70c340408f6abeb25e12354" UNIQUE ("userId", "wordId"), CONSTRAINT "PK_37d971d516de844654580803dfb" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "progress_ps" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "wordId" integer, CONSTRAINT "UQ_e9b7fc74aaa1c07320e8b499da0" UNIQUE ("userId", "wordId"), CONSTRAINT "PK_d9350f7cadabf66f22e576f4d1e" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "progress_pp" ADD CONSTRAINT "FK_f1b9a881897d95edfa990a1c6a8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "progress_pp" ADD CONSTRAINT "FK_2586e36832186db6eddb5199f5a" FOREIGN KEY ("wordId") REFERENCES "irr_words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "progress_ps" ADD CONSTRAINT "FK_e2ea97030f282f94614228cd378" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "progress_ps" ADD CONSTRAINT "FK_ceb4699eaf97ebb1f75630900ce" FOREIGN KEY ("wordId") REFERENCES "irr_words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "progress_ps" DROP CONSTRAINT "FK_ceb4699eaf97ebb1f75630900ce"`,
    )
    await queryRunner.query(
      `ALTER TABLE "progress_ps" DROP CONSTRAINT "FK_e2ea97030f282f94614228cd378"`,
    )
    await queryRunner.query(
      `ALTER TABLE "progress_pp" DROP CONSTRAINT "FK_2586e36832186db6eddb5199f5a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "progress_pp" DROP CONSTRAINT "FK_f1b9a881897d95edfa990a1c6a8"`,
    )
    await queryRunner.query(`DROP TABLE "progress_ps"`)
    await queryRunner.query(`DROP TABLE "progress_pp"`)
  }
}
