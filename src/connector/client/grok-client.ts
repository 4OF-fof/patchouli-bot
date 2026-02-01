import OpenAI from "openai";
import { env } from "../../env";
import { modelConfig } from "../config";
import { BaseClient } from "./base-client";

function isRetryableError(error: unknown): boolean {
	if (error instanceof OpenAI.APIError) {
		return error.status === 429 || (error.status !== undefined && error.status >= 500);
	}
	return false;
}

function getRetryDelay(error: unknown, attempt: number): number {
	if (error instanceof OpenAI.APIError) {
		const retryAfter = error.headers?.["retry-after"];
		if (retryAfter) {
			const seconds = Number(retryAfter);
			if (!Number.isNaN(seconds)) return seconds * 1000;
		}
	}
	return modelConfig.retryBaseDelayMs * 2 ** (attempt - 1);
}

export class GrokClient extends BaseClient {
	private client: OpenAI;

	constructor() {
		super();
		this.client = new OpenAI({
			apiKey: env.grokApiKey,
			baseURL: modelConfig.baseURL,
		});
	}

	async generateResponse(message: string, systemPrompt: string): Promise<string> {
		console.log(`[GrokClient] リクエスト送信: model=${modelConfig.model}, messageLength=${message.length}`);

		let lastError: unknown;
		for (let attempt = 1; attempt <= modelConfig.maxRetries; attempt++) {
			try {
				const response = await this.client.chat.completions.create({
					model: modelConfig.model,
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: message },
					],
				});

				const content = response.choices[0]?.message?.content;
				if (content == null) {
					throw new Error("APIからの応答にコンテンツが含まれていません");
				}

				console.log(`[GrokClient] レスポンス受信: responseLength=${content.length}`);
				return content;
			} catch (error) {
				lastError = error;
				if (attempt < modelConfig.maxRetries && isRetryableError(error)) {
					const delay = getRetryDelay(error, attempt);
					console.log(`[GrokClient] リトライ ${attempt}/${modelConfig.maxRetries}: ${delay}ms後に再試行`);
					await new Promise((resolve) => setTimeout(resolve, delay));
					continue;
				}
				break;
			}
		}

		console.error("[GrokClient] リクエスト失敗:", lastError);
		throw lastError;
	}
}
