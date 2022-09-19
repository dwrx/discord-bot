import {
  Client,
  Interaction,
  BaseCommandInteraction,
} from "discord.js";
import { Wagmi } from "./commands/wagmi";
import { Help } from "./commands/help";
import { Address } from "./commands/address";
import { Airdrop } from "./commands/airdrop";
import { botToken } from "./config/config.json";

const Commands = [Wagmi, Help, Address, Airdrop];

const client = new Client({
  intents: [],
});

client.login(botToken);

client.on("ready", async () => {
  if (!client.user || !client.application) {
    return;
  }
  await client.application.commands.set(Commands);
  console.log(`${client.user.username} bot is online`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isCommand() || interaction.isContextMenu()) {
    await handleSlashCommand(interaction);
  }
});

const handleSlashCommand = async (interaction: BaseCommandInteraction) => {
  const slashCommand = Commands.find(
    (command) => command.name === interaction.commandName
  );
  if (!slashCommand) {
    interaction.followUp({ content: "An error has occurred" });
    return;
  }

  await interaction.deferReply();

  slashCommand.run(client, interaction);
};
