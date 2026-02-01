import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/env.js", () => ({
  env: {
    discordToken: "test",
    discordClientId: "test-bot-id",
    grokApiKey: "test-api-key",
  },
}));

vi.mock("../../src/connector/index.js", () => ({
  generateResponse: vi.fn(),
}));

import { executePromptMessage } from "../../src/commands/promptMessage/executePromptMessage.js";
import { generateResponse } from "../../src/connector/index.js";

const mockGenerateResponse = vi.mocked(generateResponse);

function createMockContext(content: string) {
  return {
    message: { content },
    executor: { username: "testuser" },
    reply: vi.fn().mockResolvedValue(undefined),
  } as any;
}

describe("executePromptMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reply with AI response for user message", async () => {
    mockGenerateResponse.mockResolvedValue("AI reply");
    const ctx = createMockContext("hello");

    await executePromptMessage(ctx);

    expect(mockGenerateResponse).toHaveBeenCalledWith("hello");
    expect(ctx.reply).toHaveBeenCalledWith({ content: "AI reply" });
  });

  it("should reply with default message when content is empty after mention removal", async () => {
    const ctx = createMockContext("");

    await executePromptMessage(ctx);

    expect(mockGenerateResponse).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith({ content: "なにか用ですか？" });
  });

  it("should reply with fallback when AI returns empty string", async () => {
    mockGenerateResponse.mockResolvedValue("");
    const ctx = createMockContext("hello");

    await executePromptMessage(ctx);

    expect(ctx.reply).toHaveBeenCalledWith({ content: "応答を生成できませんでした。" });
  });

  it("should reply with error when response exceeds Discord limit", async () => {
    mockGenerateResponse.mockResolvedValue("a".repeat(2001));
    const ctx = createMockContext("hello");

    await executePromptMessage(ctx);

    expect(ctx.reply).toHaveBeenCalledWith({ content: "応答が長すぎて送信できませんでした。" });
  });

  it("should send response at exactly 2000 characters", async () => {
    const exactResponse = "a".repeat(2000);
    mockGenerateResponse.mockResolvedValue(exactResponse);
    const ctx = createMockContext("hello");

    await executePromptMessage(ctx);

    expect(ctx.reply).toHaveBeenCalledWith({ content: exactResponse });
  });
});
