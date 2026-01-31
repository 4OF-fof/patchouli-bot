import type { Client, Message, MessagePayload, MessageReplyOptions } from "discord.js";
import type { Event, Command, CommandContext } from "../types";
import { commands, commandOrder } from "../commands";

const sortByOrder = (a: Command, b: Command) =>
	(commandOrder.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
	(commandOrder.get(b.name) ?? Number.MAX_SAFE_INTEGER);

export const messageCreate: Event<"messageCreate"> = {
	name: "messageCreate",
	async execute(client: Client, message: Message) {
		if (message.author.bot) return;
		if (!client.user) return;

		const contentLower = message.content.toLowerCase();

		const reply: CommandContext["reply"] = (opts) =>
			message.reply(opts as string | MessagePayload | MessageReplyOptions);

		const baseContext = { message, executor: message.author, reply } as const;

		const messageMatches = Array.from(commands.values()).filter((cmd: Command) =>
			Boolean(cmd.message?.keywords.some((kw: string) => contentLower.includes(kw.toLowerCase()))),
		);

		if (messageMatches.length > 0) {
			messageMatches.sort(sortByOrder);
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
