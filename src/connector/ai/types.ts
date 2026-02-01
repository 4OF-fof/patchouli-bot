export type TaskType = "auto" | "chat";

export interface GenerateOptions {
	taskType?: TaskType;
	systemPrompt?: string;
	promptFile?: string;
}
