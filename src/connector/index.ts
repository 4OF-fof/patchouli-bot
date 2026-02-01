import type { GenerateOptions } from "./types";
import { getClient } from "./client";
import { loadPrompt } from "./prompts/loader";

export type { GenerateOptions, TaskType } from "./types";

export async function generateResponse(
	message: string,
	options: GenerateOptions = {},
): Promise<string> {
	const systemPrompt =
		options.systemPrompt ?? (await loadPrompt(options.promptFile));

	const client = getClient();
	return client.generateResponse(message, systemPrompt);
}
