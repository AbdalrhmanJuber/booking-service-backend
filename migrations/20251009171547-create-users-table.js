"use strict";

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // ensure required Postgres extensions
  await db.runSql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
  await db.runSql(`CREATE EXTENSION IF NOT EXISTS "citext";`);

  // ensure enum type exists
  await db.runSql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('pending','active','disabled');
      END IF;
    END$$;
  `);

  // create users table
  await db.runSql(`
    CREATE TABLE IF NOT EXISTS users (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name         VARCHAR(120) NOT NULL,
      email             CITEXT NOT NULL UNIQUE,
      phone             VARCHAR(32),
      birthday          DATE,
      password          VARCHAR(255),
      password_reset_token VARCHAR(255),
      password_reset_expires timestamptz,
      is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      status            user_status NOT NULL DEFAULT 'pending',
      created_at        timestamptz NOT NULL DEFAULT now(),
      updated_at        timestamptz NOT NULL DEFAULT now()
    );
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE IF EXISTS users CASCADE;`);
  await db.runSql(`DROP TYPE IF EXISTS user_status;`);
};

exports._meta = {
  version: 1,
};

