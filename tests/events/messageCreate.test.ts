import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockCommandsMap = new Map<string, any>();
const mockCommandOrderMap = new Map<string, number>();

// getter を使い、テストごとに mockCommandsMap / mockCommandOrderMap の中身を差し替え可能にする
vi.mock("../../src/commands/index.js", () => {
  return {
    get commands() {
      return {
        values: () => mockCommandsMap.values(),
      };
    },
    get commandOrder() {
      return mockCommandOrderMap;
    },
  };
});

import { messageCreate } from "../../src/events/messageCreate.js";

function createMockMessage(overrides: Record<string, unknown> = {}) {
  return {
    author: { bot: false },
    content: "",
    mentions: {
      has: vi.fn().mockReturnValue(false),
    },
    reply: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as any;
}

function createMockClient() {
  return { user: { id: "bot-id" } } as any;
}

function registerCommand(name: string, options: Record<string, unknown> = {}) {
  const cmd = {
    name,
    description: `${name} command`,
    ...options,
  };
  mockCommandsMap.set(name, cmd);
  mockCommandOrderMap.set(name, mockCommandsMap.size - 1);
  return cmd;
}

describe("messageCreate event", () => {
  beforeEach(() => {
    mockCommandsMap.clear();
    mockCommandOrderMap.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should ignore bot messages", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    registerCommand("ping", { message: { keywords: ["ping"], execute } });
    const message = createMockMessage({
      author: { bot: true },
      content: "ping",
    });

    await messageCreate.execute(createMockClient(), message);

    expect(execute).not.toHaveBeenCalled();
  });

  it("should execute command matching message keyword", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    registerCommand("ping", { message: { keywords: ["ping"], execute } });
    const message = createMockMessage({ content: "ping" });

    await messageCreate.execute(createMockClient(), message);

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ type: "message", message }),
    );
  });

  it("should match keywords case-insensitively", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    registerCommand("ping", { message: { keywords: ["ping"], execute } });
    const message = createMockMessage({ content: "PING" });

    await messageCreate.execute(createMockClient(), message);

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ type: "message", message }),
    );
  });

  it("should not execute when no keywords match", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    registerCommand("ping", { message: { keywords: ["ping"], execute } });
    const message = createMockMessage({ content: "hello" });

    await messageCreate.execute(createMockClient(), message);

    expect(execute).not.toHaveBeenCalled();
  });

  it("should reply with error when command execution fails", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("fail"));
    registerCommand("ping", { message: { keywords: ["ping"], execute } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const message = createMockMessage({ content: "ping" });

    await messageCreate.execute(createMockClient(), message);

    expect(message.reply).toHaveBeenCalledWith("コマンドの実行中にエラーが発生しました。");
  });

  it("should pick command by registration order when multiple match", async () => {
    const firstExecute = vi.fn().mockResolvedValue(undefined);
    const secondExecute = vi.fn().mockResolvedValue(undefined);
    registerCommand("first", {
      message: { keywords: ["hello"], execute: firstExecute },
    });
    registerCommand("second", {
      message: { keywords: ["hello"], execute: secondExecute },
    });
    const message = createMockMessage({ content: "hello" });

    await messageCreate.execute(createMockClient(), message);

    expect(firstExecute).toHaveBeenCalledWith(
      expect.objectContaining({ type: "message", message }),
    );
    expect(secondExecute).not.toHaveBeenCalled();
  });
});
