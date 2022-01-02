import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').createTable('users', table => {
    table.uuid('id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()')).unique();
    table.string('name', 30).notNullable();
    table.string('cpf', 11).unique().notNullable();
    table.string('email', 100).unique().notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
