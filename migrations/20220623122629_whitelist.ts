import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
    .createTable('whitelist', function (table) {
        table.string('address', 255).notNullable();
        table.string('username', 255).notNullable();
        table.string('user_id', 255).notNullable().primary();
        table.string('is_bot', 255).notNullable();
        table.string('event', 255).notNullable();
        table.decimal('date').notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("whitelist");
}

