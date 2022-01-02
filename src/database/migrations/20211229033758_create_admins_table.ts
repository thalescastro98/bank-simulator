import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').createTable('admins', table => {
    table.uuid('id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()')).unique();
    table.string('login', 30).unique().notNullable();
    table.string('password', 30).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('admins');
}
