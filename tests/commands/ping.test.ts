import { describe, it, expect, vi } from "vitest";
import { executePing } from "../../src/commands/ping/executePing.js";

describe("executePing handler", () => {
  it("should reply with Pong! for interaction", async () => {
    const mockReply = vi.fn().mockResolvedValue(undefined);

    const mockInteraction = {
      reply: mockReply,
      isChatInputCommand: () => true,
    } as any;

    await executePing(mockInteraction);

    expect(mockReply).toHaveBeenCalledWith({ content: "Pong!" });
  });

  it("should reply with Pong! for a message", async () => {
    const mockReply = vi.fn().mockResolvedValue(undefined);
    const mockMessage = {
      createdTimestamp: Date.now(),
      reply: mockReply,
    } as any;

    await executePing(mockMessage);

    expect(mockReply).toHaveBeenCalledWith({ content: "Pong!" });
  });
});
