import { env } from "@/env";
import { generateResponse } from "@/connector";
import type { MessageContext } from "@/types";

const DISCORD_MAX_LENGTH = 2000;
const mentionRegex = new RegExp(`^<@!?${env.discordClientId}>\\s*`);

export const executePromptMessage = async (ctx: MessageContext) => {
	const content = ctx.message.content.replace(mentionRegex, "").trim();
	if (!content) {
		await ctx.reply({ content: "なにか用ですか？" });
		return;
	}
	try {
		const reply = await generateResponse(content);
		if (!reply) {
			await ctx.reply({ content: "応答を生成できませんでした。" });
			return;
		}
		if (reply.length > DISCORD_MAX_LENGTH) {
			await ctx.reply({ content: "応答が長すぎて送信できませんでした。" });
			return;
		}
		await ctx.reply({ content: reply });
	} catch (error) {
		const message = error instanceof Error ? error.message : "応答の生成中にエラーが発生しました。";
		await ctx.reply({ content: message });
	}
};
