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
      "default system prompt",
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
      "custom prompt",
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
});
