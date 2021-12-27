import knex from "knex";

export const pg=knex({
    client: 'pg',
    connection: {
      host : 'localhost',
      port : 5432,
      user : 'postgres',
      password : 'password',
      database : 'test'
    }
  });