import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrainings1764534788448 implements MigrationInterface {
    name = 'AddTrainings1764534788448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "training_words" ("id" SERIAL NOT NULL, "training_id" integer NOT NULL, "irr_word_id" integer NOT NULL, "was_correct" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_823a7a16671c38323dc6144f608" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trainings" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "mode" character varying(10) NOT NULL, "type" character varying(10) NOT NULL, "level" character varying(10) NOT NULL, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "end_time" TIMESTAMP WITH TIME ZONE, "question_count" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b67237502b175163e47dc85018d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "training_words" ADD CONSTRAINT "FK_16d4f68da6dbbedb8ad64a48d22" FOREIGN KEY ("training_id") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "training_words" ADD CONSTRAINT "FK_237b6e0d1d3683c629ddc492c44" FOREIGN KEY ("irr_word_id") REFERENCES "irr_words"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trainings" ADD CONSTRAINT "FK_0a6488e45e7e8ed7d5f69e0dead" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trainings" DROP CONSTRAINT "FK_0a6488e45e7e8ed7d5f69e0dead"`);
        await queryRunner.query(`ALTER TABLE "training_words" DROP CONSTRAINT "FK_237b6e0d1d3683c629ddc492c44"`);
        await queryRunner.query(`ALTER TABLE "training_words" DROP CONSTRAINT "FK_16d4f68da6dbbedb8ad64a48d22"`);
        await queryRunner.query(`DROP TABLE "trainings"`);
        await queryRunner.query(`DROP TABLE "training_words"`);
    }

}
