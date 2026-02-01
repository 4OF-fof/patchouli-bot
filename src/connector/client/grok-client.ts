import OpenAI from "openai";
import { env } from "../../env";
import { modelConfig } from "../config";
import { BaseClient } from "./base-client";

export class GrokClient extends BaseClient {
	private client: OpenAI;

	constructor() {
		super();
		this.client = new OpenAI({
			apiKey: env.grokApiKey,
			baseURL: modelConfig.baseURL,
			maxRetries: modelConfig.maxRetries,
		});
	}

	async generateResponse(message: string, systemPrompt: string): Promise<string> {
		console.log(`[GrokClient] リクエスト送信: model=${modelConfig.model}, messageLength=${message.length}`);

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
	}
}
