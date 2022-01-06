import * as dotenv from 'dotenv';
import { createKnexInstace } from './create-knex-instance';
dotenv.config();

export let pg = createKnexInstace(process.env.NODE_ENV === 'test' ? 'test' : process.env.POSTGRES_DB);

export const setupDatabase = async () => {
  const databaseName = process.env.POSTGRES_DB + (process.env.ENVIROMENT === 'dev' ? '_dev' : '');
  const verifyDatabase = await pg.raw('select datname from pg_catalog.pg_database where datname=?', [databaseName]);
  if (!verifyDatabase.rows[0]) await pg.raw(`CREATE DATABASE ${databaseName};`);
  pg = createKnexInstace(databaseName);
  await pg.migrate.latest();
};
