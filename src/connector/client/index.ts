import type { BaseClient } from "./base-client";
import { GrokClient } from "./grok-client";

let client: BaseClient | undefined;

export function getClient(): BaseClient {
	client ??= new GrokClient();
	return client;
}
