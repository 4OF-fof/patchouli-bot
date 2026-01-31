import { env } from "../../env.js";
import type { MessageContext } from "../../types";

const mentionRegex = new RegExp(`^<@[!&]?${env.discordClientId}>\\s*`);

export const executePromptMessage = async (ctx: MessageContext) => {
	const content = ctx.message.content.replace(mentionRegex, "");
	await ctx.reply({ content: content || "なにか用ですか？" });
};
