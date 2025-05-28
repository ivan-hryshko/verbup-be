import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersAddIrrWords1748448726748 implements MigrationInterface {
    name = 'AddUsersAddIrrWords1748448726748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "irr_words" ("id" SERIAL NOT NULL, "word_group_id" integer NOT NULL, "lang" character varying NOT NULL, "basic" character varying(40) NOT NULL, "past_simple" character varying(40), "past_participle" character varying(40), "level" character varying(40), "image" character varying(200), "basic_sound" character varying(200), "ps_sound" character varying(200), "pp_sound" character varying(200), CONSTRAINT "UQ_f5ad4144d1664ba0b2f8d9db555" UNIQUE ("word_group_id", "basic"), CONSTRAINT "PK_912a7fa14ad49e199b6b2bbca85" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying(30) NOT NULL, "password" character varying(200) NOT NULL, "email" character varying(40) NOT NULL, "avatar" character varying(200), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "irr_words"`);
    }

}
