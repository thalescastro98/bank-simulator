import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').createTable('transactions', table => {
    table.uuid('id').primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()')).unique();
    table.string('type', 15).notNullable();
    table.uuid('fromId').notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.timestamp('date').defaultTo(knex.fn.now());
    table.string('description', 100).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
