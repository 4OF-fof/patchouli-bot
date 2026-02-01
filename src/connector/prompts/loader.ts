import { readFile } from "node:fs/promises";
import { join } from "node:path";

const promptsDir = import.meta.dirname;

export async function loadPrompt(name = "default"): Promise<string> {
	const filePath = join(promptsDir, `${name}.md`);
	try {
		return await readFile(filePath, "utf-8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			throw new Error(`プロンプトファイルが見つかりません: ${filePath}`);
		}
		throw error;
	}
}
