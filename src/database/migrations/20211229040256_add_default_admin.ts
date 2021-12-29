import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex('admins').insert({login:'admin',password:'admin'});
}


export async function down(knex: Knex): Promise<void> {
}

