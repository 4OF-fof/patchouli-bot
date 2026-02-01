import { env } from "@/env";
import type { Command } from "@/types";
import { executePromptMessage } from "./executePromptMessage";

export const promptMessage: Command = {
	name: "promptMessage",
	description: "メンション付きメッセージに応答します",
	message: {
		keywords: [new RegExp(`^<@[!&]?${env.discordClientId}>\\s*`)],
		execute: executePromptMessage,
	},
};
