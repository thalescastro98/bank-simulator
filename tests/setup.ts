import * as dotenv from 'dotenv';
import { createKnexInstace } from '../src/database';
dotenv.config();
require('ts-node/register');

const setup = async () => {
  const toCreateDBTest = createKnexInstace(process.env.POSTGRES_DB);
  await toCreateDBTest.raw('DROP DATABASE IF EXISTS test;');
  await toCreateDBTest.raw('create database test;');
  await toCreateDBTest.destroy();
  const pg = createKnexInstace('test');
  await pg.migrate.latest();
  pg.destroy();
};

export default setup;
