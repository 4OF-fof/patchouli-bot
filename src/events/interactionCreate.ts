import type {
	Client,
	Interaction,
	InteractionReplyOptions,
	MessagePayload,
	RepliableInteraction,
} from "discord.js";
import type { Command, CommandContext, Event } from "../types";

async function handleError(interaction: RepliableInteraction, commandName: string, error: unknown) {
	console.error(`Error executing command ${commandName}:`, error);
	const errorMessage = "コマンドの実行中にエラーが発生しました。";
	try {
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: errorMessage, ephemeral: true });
		} else {
			await interaction.reply({ content: errorMessage, ephemeral: true });
		}
	} catch (replyError) {
		console.error("Failed to send error response:", replyError);
	}
}

export function createInteractionHandler(commands: Map<string, Command>): Event<"interactionCreate"> {
	return {
		name: "interactionCreate",
		async execute(_client: Client, interaction: Interaction) {
			if (
				!interaction.isChatInputCommand() &&
				!interaction.isUserContextMenuCommand() &&
				!interaction.isMessageContextMenuCommand()
			) {
				return;
			}

			const command = commands.get(interaction.commandName);
			if (!command) {
				console.error(`Command not found: ${interaction.commandName}`);
				return;
			}

			const reply: CommandContext["reply"] = (opts) => {
				if (interaction.deferred || interaction.replied) {
					return interaction.editReply(opts as string | MessagePayload);
				}
				return interaction.reply(opts as string | MessagePayload | InteractionReplyOptions);
			};

			try {
				if (interaction.isChatInputCommand() && command.slash) {
					await command.slash.execute({
						type: "slash",
						interaction,
						executor: interaction.user,
						reply,
					});
				} else if (interaction.isUserContextMenuCommand() && command.userContext) {
					await command.userContext.execute({
						type: "userContext",
						interaction,
						executor: interaction.user,
						targetUser: interaction.targetUser,
						reply,
					});
				} else if (interaction.isMessageContextMenuCommand() && command.messageContext) {
					await command.messageContext.execute({
						type: "messageContext",
						interaction,
						executor: interaction.user,
						message: interaction.targetMessage,
						reply,
					});
				}
			} catch (error) {
				await handleError(interaction, interaction.commandName, error);
			}
		},
	};
}
