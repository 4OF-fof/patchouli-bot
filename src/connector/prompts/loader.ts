import { readFile } from "node:fs/promises";
import { join } from "node:path";

const promptsDir = import.meta.dirname;

export async function loadPrompt(name = "default"): Promise<string> {
	const filePath = join(promptsDir, `${name}.md`);
	return readFile(filePath, "utf-8");
}
