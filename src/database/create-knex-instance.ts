import knex from 'knex';
import * as dotenv from 'dotenv';
dotenv.config();

export const createKnexInstace = (databaseName: string | undefined) => {
  return knex({
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: databaseName,
    },
    migrations: {
      directory: `${__dirname}/migrations`,
    },
  });
};
