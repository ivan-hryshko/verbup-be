import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProgressStatsToDailyStats1762374304583 implements MigrationInterface {
    name = 'AddProgressStatsToDailyStats1762374304583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_stats" ADD "words_progress_saved" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "daily_stats" ADD "unique_users_progress" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "daily_stats" ADD "words_progress_easy" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "daily_stats" ADD "words_progress_medium" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "daily_stats" ADD "words_progress_hard" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_stats" DROP COLUMN "words_progress_hard"`);
        await queryRunner.query(`ALTER TABLE "daily_stats" DROP COLUMN "words_progress_medium"`);
        await queryRunner.query(`ALTER TABLE "daily_stats" DROP COLUMN "words_progress_easy"`);
        await queryRunner.query(`ALTER TABLE "daily_stats" DROP COLUMN "unique_users_progress"`);
        await queryRunner.query(`ALTER TABLE "daily_stats" DROP COLUMN "words_progress_saved"`);
    }

}
