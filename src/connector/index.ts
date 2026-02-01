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

		for (let attempt = 1; attempt <= modelConfig.maxRegenerateAttempts; attempt++) {
			const response = await client.generateResponse(message, systemPrompt);
			if (response.length <= modelConfig.maxResponseLength) {
				return response;
			}
			console.log(
				`[generateResponse] 応答が文字数制限を超過 (${response.length}/${modelConfig.maxResponseLength}), 再生成 ${attempt}/${modelConfig.maxRegenerateAttempts}`,
			);
		}

		throw new Error("応答が文字数制限を超過しました。再度お試しください。");
	});
}
