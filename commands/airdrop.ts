import { PublicKey } from "@solana/web3.js";
import {
  BaseCommandInteraction,
  ChatInputApplicationCommandData,
  Client,
} from "discord.js";
import sendAirdrop from '../utils/minter'; 
const config = require("../knexfile");

const knex = require("knex")(config[process.env.NODE_ENV || "development"]);

interface Command extends ChatInputApplicationCommandData {
  run: (client: Client, interaction: BaseCommandInteraction) => void;
}

export const Airdrop: Command = {
  name: "airdrop",
  description: "Send NFT and tokens to a SOL address",
  type: "CHAT_INPUT",
  options: [
    {
      type: "STRING",
      name: "address",
      description: "SOL address",
      required: true,
    },
  ],
  run: async (client: Client, interaction: BaseCommandInteraction) => {
    const userId = interaction.user.id;
    const admins = ['938778626994872390', '939097038749057025', '944233680203808831'];
    if (!admins.includes(userId)) {
      await interaction.followUp({
        ephemeral: true,
        content: `You don't have permission to execute this command.`,
      });
      return;
    }

    const username = `${interaction.user.username}#${interaction.user.discriminator}`;
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

    try {
      const user = await knex("airdrop").where("address", address).first();
      if (user) {
        await interaction.followUp({
          ephemeral: true,
          content: `This address has already received airdrop.`,
        });
        return;
      }
      const timestamp = Math.floor(Date.now() / 1000);
      await knex("airdrop").insert({
        address: address,
        referral: interaction.user.username,
        datetime: timestamp,
      });
      await interaction.followUp({
        ephemeral: true,
        content: `Minting NFT...`,
      });
      const transactions = await sendAirdrop(address.toString());
      // await knex("airdrop").update({transactions: transactions}).where('address', address);
      await interaction.followUp({
        ephemeral: true,
        content: `Result: ${transactions.join(', ')}`,
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
