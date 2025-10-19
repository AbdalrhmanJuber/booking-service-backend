require('dotenv').config();

module.exports = {
  dev: {
    driver: 'pg',
    host: process.env.DB_HOST || 'postgres',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'store_front',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'password',
  },
  test: {
    driver: 'pg',
    host: process.env.DB_HOST || 'postgres',
    port: Number(process.env.DB_PORT || 5432),

    database: process.env.DB_NAME || process.env.TEST_DB_NAME || 'store_front_test',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'password',
  }
};
