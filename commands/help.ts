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

export const Help: Command = {
  name: "help",
  description: "Get the list of available commands",
  type: "CHAT_INPUT",
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const commands = [
      '**/help** - Get the list of available commands.',
      '**/wagmi** [ADDRESS] - Whitelist Solana address for the closed alpha test in Devnet.',
      '**/address** - Verify what address you have whitelisted.',
      '**/airdrop** [ADDRESS] - Restricted to admins only.',
    ];
    try {
      await interaction.followUp({
        ephemeral: true,
        content: commands.join('\n'),
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
