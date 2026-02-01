import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateResponse = vi.fn();

vi.mock("../../src/connector/client/index.js", () => ({
  getClient: () => ({
    generateResponse: mockGenerateResponse,
  }),
}));

vi.mock("../../src/connector/prompts/loader.js", () => ({
  loadPrompt: vi.fn().mockResolvedValue("default system prompt"),
}));

import { generateResponse } from "../../src/connector/index.js";
import { loadPrompt } from "../../src/connector/prompts/loader.js";

const lengthPrefix = "あなたの応答は必ず2000文字以内に収めてください。\n\n";

describe("generateResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateResponse.mockResolvedValue("AI response");
  });

  it("should return AI response for a message", async () => {
    const result = await generateResponse("hello");

    expect(result).toBe("AI response");
    expect(mockGenerateResponse).toHaveBeenCalledWith(
      "hello",
      `${lengthPrefix}default system prompt`,
    );
  });

  it("should use default prompt when no options given", async () => {
    await generateResponse("hello");

    expect(loadPrompt).toHaveBeenCalledWith(undefined);
  });

  it("should use custom systemPrompt when provided", async () => {
    await generateResponse("hello", { systemPrompt: "custom prompt" });

    expect(loadPrompt).not.toHaveBeenCalled();
    expect(mockGenerateResponse).toHaveBeenCalledWith(
      "hello",
      `${lengthPrefix}custom prompt`,
    );
  });

  it("should use promptFile when provided", async () => {
    await generateResponse("hello", { promptFile: "coding" });

    expect(loadPrompt).toHaveBeenCalledWith("coding");
  });

  it("should return empty string when client returns empty", async () => {
    mockGenerateResponse.mockResolvedValue("");

    const result = await generateResponse("hello");

    expect(result).toBe("");
  });

  it("should regenerate when response exceeds maxResponseLength", async () => {
    const longResponse = "a".repeat(2001);
    const shortResponse = "short reply";
    mockGenerateResponse
      .mockResolvedValueOnce(longResponse)
      .mockResolvedValueOnce(shortResponse);

    const result = await generateResponse("hello");

    expect(result).toBe(shortResponse);
    expect(mockGenerateResponse).toHaveBeenCalledTimes(2);
  });

  it("should throw error after max regenerate attempts exceeded", async () => {
    const longResponse = "a".repeat(2001);
    mockGenerateResponse.mockResolvedValue(longResponse);

    await expect(generateResponse("hello")).rejects.toThrow(
      "応答が文字数制限を超過しました。再度お試しください。",
    );
  });
});
