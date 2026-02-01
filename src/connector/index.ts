import type { GenerateOptions } from "./types";
import { getClient } from "./client";
import { modelConfig } from "./config";
import { loadPrompt } from "./prompts/loader";
import { enqueue } from "./queue";

export type { GenerateOptions, TaskType } from "./types";

function withLengthConstraint(systemPrompt: string, maxLength: number): string {
	return `あなたの応答は必ず${maxLength}文字以内に収めてください。\n\n${systemPrompt}`;
}

export async function generateResponse(
	message: string,
	options: GenerateOptions = {},
): Promise<string> {
	return enqueue(async () => {
		const basePrompt =
			options.systemPrompt ?? (await loadPrompt(options.promptFile));
		const systemPrompt = withLengthConstraint(basePrompt, modelConfig.maxResponseLength);

		const client = getClient();
		return client.generateResponse(message, systemPrompt);
	});
}
