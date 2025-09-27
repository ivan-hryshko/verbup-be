import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUsersAddSessions1748536778008 implements MigrationInterface {
  name = 'AddUsersAddSessions1748536778008'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" SERIAL NOT NULL, "refreshToken" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying(30) NOT NULL, "password" character varying(200) NOT NULL, "email" character varying(40) NOT NULL, "avatar" character varying(200), "isActive" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying, "emailVerificationTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`,
    )
    await queryRunner.query(`DROP TABLE "users"`)
    await queryRunner.query(`DROP TABLE "sessions"`)
  }
}
