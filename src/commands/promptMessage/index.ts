import { env } from "../../env.js";
import type { Command } from "../../types";
import { executePromptMessage } from "./executePromptMessage.js";

export const promptMessage: Command = {
	name: "promptMessage",
	description: "Botへのメンションをオウム返しします",
	message: {
		keywords: [new RegExp(`^<@[!&]?${env.discordClientId}>\\s*`)],
		execute: executePromptMessage,
	},
};
