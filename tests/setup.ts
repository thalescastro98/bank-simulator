import knex from 'knex';
import * as dotenv from 'dotenv';
import { pg } from '../src/database';
dotenv.config();
require('ts-node/register');

const toCreateDBTest = knex({
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
});

const setup = async () => {
  await toCreateDBTest.raw('DROP DATABASE IF EXISTS test;');
  await toCreateDBTest.raw('create database test;');
  await toCreateDBTest.destroy();
  await pg.migrate.latest();
  pg.destroy();
};

export default setup;
