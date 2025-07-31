import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFeedback1748612400000 implements MigrationInterface {
  name = 'AddFeedback1748612400000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "feedback" (
        "id" SERIAL NOT NULL,
        "comment" character varying(500) NOT NULL,
        "rating" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" integer,
        CONSTRAINT "PK_feedback_id" PRIMARY KEY ("id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feedback"`)
  }
}
