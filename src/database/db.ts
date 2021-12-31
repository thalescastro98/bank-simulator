import knex from 'knex';
import * as dotenv from 'dotenv';
dotenv.config();

export const pg = knex({
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.NODE_ENV === 'test' ? 'test' : process.env.POSTGRES_DATABASE,
  },
  migrations: {
    directory: './src/database/migrations',
  },
});
