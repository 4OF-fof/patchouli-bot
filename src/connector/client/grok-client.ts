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
		});
	}

	async generateResponse(message: string, systemPrompt: string): Promise<string> {
		const response = await this.client.chat.completions.create({
			model: modelConfig.model,
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: message },
			],
		});
		return response.choices[0]?.message?.content ?? "";
	}
}
