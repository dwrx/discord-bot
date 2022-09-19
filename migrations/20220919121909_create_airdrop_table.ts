import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("airdrop", function (table) {
    table.string("address", 255).notNullable().primary();
    table.string("referral", 255);
    table.integer("datetime").notNullable();
    table.jsonb("transactions");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("airdrop");
}
