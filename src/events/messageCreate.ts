import type { Client, Message, MessagePayload, MessageReplyOptions } from "discord.js";
import type { Event, Command, CommandContext } from "../types";
import { commandOrder, keywordMap, regexCommands } from "../commands";

const segmenter = new Intl.Segmenter("ja", { granularity: "word" });

function segmentWords(text: string): Set<string> {
	const words = new Set<string>();
	for (const { segment, isWordLike } of segmenter.segment(text)) {
		if (isWordLike) words.add(segment.toLowerCase());
	}
	return words;
}

const sortByOrder = (a: Command, b: Command) =>
	(commandOrder.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
	(commandOrder.get(b.name) ?? Number.MAX_SAFE_INTEGER);

export const messageCreate: Event<"messageCreate"> = {
	name: "messageCreate",
	async execute(client: Client, message: Message) {
		if (message.author.bot) return;
		if (!client.user) return;

		const reply: CommandContext["reply"] = (opts) =>
			message.reply(opts as string | MessagePayload | MessageReplyOptions);

		const baseContext = { message, executor: message.author, reply } as const;

		const words = segmentWords(message.content);

		// 文字列キーワード: Map で O(1) ルックアップ
		const matchSet = new Set<Command>();
		for (const word of words) {
			const cmds = keywordMap.get(word);
			if (cmds) for (const cmd of cmds) matchSet.add(cmd);
		}

		// 正規表現キーワード: リニアスキャン
		for (const cmd of regexCommands) {
			if (cmd.message!.keywords.some((kw) => kw instanceof RegExp && kw.test(message.content))) {
				matchSet.add(cmd);
			}
		}

		if (matchSet.size > 0) {
			const messageMatches = [...matchSet].sort(sortByOrder);
			const command = messageMatches[0];
			try {
				await command.message!.execute({ type: "message", ...baseContext });
			} catch (error) {
				console.error("Error executing command:", error);
				try {
					await message.reply("コマンドの実行中にエラーが発生しました。");
				} catch (replyError) {
					console.error("Failed to send error response:", replyError);
				}
			}
			return;
		}
	},
};
