import { Collection } from "discord.js";
import type { Command } from "@/types";
import { promptMessage } from "./promptMessage";

export const commandList: Command[] = [promptMessage];

export const commandOrder = new Map(commandList.map((cmd, i) => [cmd.name, i]));

export const commands = new Collection<string, Command>(commandList.map((cmd) => [cmd.name, cmd]));

/** 文字列キーワード → コマンドリストの逆引きマップ (O(1) ルックアップ) */
export const keywordMap = new Map<string, Command[]>();

/** 正規表現キーワードを持つコマンドのリスト (リニアスキャン) */
export const regexCommands: Command[] = [];

for (const cmd of commandList) {
	if (!cmd.message) continue;
	let hasRegex = false;
	for (const kw of cmd.message.keywords) {
		if (kw instanceof RegExp) {
			hasRegex = true;
		} else {
			const key = kw.toLowerCase();
			const list = keywordMap.get(key);
			if (list) {
				list.push(cmd);
			} else {
				keywordMap.set(key, [cmd]);
			}
		}
	}
	if (hasRegex) regexCommands.push(cmd);
}
