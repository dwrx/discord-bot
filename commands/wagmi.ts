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

export const Wagmi: Command = {
  name: "wagmi",
  description: "Whitelist Solana address for the closed alpha test in Devnet",
  type: "CHAT_INPUT",
  options: [
    {
      type: "STRING",
      name: "address",
      description: "Your Solana address",
      required: true,
    },
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const username = `${interaction.user.username}#${interaction.user.discriminator}`;
    const userId = interaction.user.id;
    const isBot = interaction.user.bot;
    const address = interaction.options.data.find(
      (element) => element.name === "address"
    )?.value;
    if (!address) {
      await interaction.followUp({
        ephemeral: true,
        content: "Solana address is required.",
      });
      return;
    }
    let publicKey,
      isOnCurve = false;
    try {
      publicKey = new PublicKey(address);
    } catch (e) {}

    if (publicKey) {
      isOnCurve = await PublicKey.isOnCurve(publicKey);
    }
    if (!isOnCurve || !publicKey) {
      await interaction.followUp({
        ephemeral: true,
        content: "Not a valid Solana address.",
      });
      return;
    }
    console.log(
      new Date(),
      `/wagmi ${address} from ${username} (${userId}): isBot=${isBot}`
    );
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      await knex("whitelist")
        .insert({
          address: address,
          username: username,
          user_id: userId,
          is_bot: isBot,
          event: "waitlist",
          date: timestamp,
        })
        .onConflict("user_id")
        .merge({
          address: address,
          date: timestamp,
        })
        .where("whitelist.user_id", userId);

      await interaction.followUp({
        ephemeral: true,
        content: `You are late to the first test in Devnet. But we have recorded your address for the future test sessions. WAGMI`,
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
