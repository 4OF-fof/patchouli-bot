export const modelConfig = {
	baseURL: "https://api.x.ai/v1",
	model: "grok-4-1-fast",
	maxRetries: 3,
	retryBaseDelayMs: 1000,
	maxResponseLength: 200,
	maxRegenerateAttempts: 2,
} as const;
