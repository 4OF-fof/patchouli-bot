export abstract class BaseClient {
	abstract generateResponse(message: string, systemPrompt: string): Promise<string>;
}
