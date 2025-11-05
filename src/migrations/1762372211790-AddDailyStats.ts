import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDailyStats1762372211790 implements MigrationInterface {
    name = 'AddDailyStats1762372211790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "daily_stats" ("id" SERIAL NOT NULL, "stat_date" date NOT NULL, "registrations" integer NOT NULL DEFAULT '0', "games_finished" integer NOT NULL DEFAULT '0', "games_finished_easy" integer NOT NULL DEFAULT '0', "games_finished_medium" integer NOT NULL DEFAULT '0', "games_finished_hard" integer NOT NULL DEFAULT '0', "users_completed_platform" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d7ee51bf4f499cf0af07df6f5f1" UNIQUE ("stat_date"), CONSTRAINT "PK_d1830b57aa5fafc5cb26a09aa73" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "daily_stats"`);
    }

}
