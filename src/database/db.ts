import * as dotenv from 'dotenv';
import { Knex } from 'knex';
import { createKnexInstace } from './create-knex-instance';
dotenv.config();

export const createDatabase = async () => {
  const initialDatabase = createKnexInstace(process.env.POSTGRES_DB);
  const databaseName = process.env.POSTGRES_DB + (process.env.ENVIROMENT === 'dev' ? '_dev' : '');
  const verifyDatabase = await initialDatabase.raw('select datname from pg_catalog.pg_database where datname=?', [databaseName]);
  if (!verifyDatabase.rows[0]) await initialDatabase.raw(`CREATE DATABASE ${databaseName};`);
  await initialDatabase.destroy();
};

let pg: Knex<any, unknown[]> | undefined;

export const getConnection = () => {
  if (!pg) {
    if (process.env.NODE_ENV === 'test') pg = createKnexInstace('test');
    else {
      const databaseName = process.env.POSTGRES_DB + (process.env.ENVIROMENT === 'dev' ? '_dev' : '');
      pg = createKnexInstace(databaseName);
    }
  }
  return pg;
};

export const setupDatabase = async () => {
  await getConnection().migrate.latest();
};

export const destroyConnection = async () => {
  if (pg) await pg.destroy();
  pg = undefined;
};
