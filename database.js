require("dotenv").config();

module.exports = {
  dev: {
    driver: "pg",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  test: {
    driver: "pg",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.TEST_DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};
