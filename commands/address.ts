import { PublicKey } from "@solana/web3.js";
import {
  BaseCommandInteraction,
  ChatInputApplicationCommandData,
  Client,
} from "discord.js";
const config = require("../knexfile");

const knex = require("knex")(config[process.env.NODE_ENV || "development"]);

interface Command extends ChatInputApplicationCommandData {
  run: (client: Client, interaction: BaseCommandInteraction) => void;
}

export const Address: Command = {
  name: "address",
  description: "Verify what address you have whitelisted",
  type: "CHAT_INPUT",
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const userId = interaction.user.id;

    try {
      const user = await knex("whitelist").where("user_id", userId).first();
      const message = user ? `Your whitelisted address is **${user.address}**` : `You don't have whitelisted address. Use **/wagmi** command to save it.`;

      await interaction.followUp({
        ephemeral: true,
        content: message,
      });
    } catch (e) {
      console.error(e);
      await interaction.followUp({
        ephemeral: true,
        content: `Internal error. Please retry later.`,
      });
    }
  },
};
