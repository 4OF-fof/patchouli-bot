import { env } from "../../env";
import { generateResponse } from "../../connector";
import type { MessageContext } from "../../types";

const mentionRegex = new RegExp(`^<@[!&]?${env.discordClientId}>\\s*`);

export const executePromptMessage = async (ctx: MessageContext) => {
	const content = ctx.message.content.replace(mentionRegex, "").trim();
	if (!content) {
		await ctx.reply({ content: "なにか用ですか？" });
		return;
	}
	const reply = await generateResponse(content);
	await ctx.reply({ content: reply || "応答を生成できませんでした。" });
};
