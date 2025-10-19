"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};


exports.up = function (db) {
  return db
    .createTable("users", {
      id: { type: "int", primaryKey: true, autoIncrement: true },
      fullName: { type: "string", notNull: true },
      email: { type: "string", notNull: true, unique: true },
      phone: { type: "string", notNull: true },
      password: { type: "string", notNull: true },
    })
    .then(() => {
      return db.addIndex("users", "idx_users_email", ["email"], true);
    });
};

exports.down = function (db) {
  return db
    .removeIndex("users", "idx_users_email")
    .then(() => db.dropTable("users"));
};

exports._meta = {
  version: 1,
};
