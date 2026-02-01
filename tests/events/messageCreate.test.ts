import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Command } from "@/types";

const mockCommandOrderMap = new Map<string, number>();
const mockKeywordMap = new Map<string, any[]>();
const mockRegexCommands: any[] = [];

vi.mock("@/commands", () => {
  return {
    get commandOrder() {
      return mockCommandOrderMap;
    },
    get keywordMap() {
      return mockKeywordMap;
    },
    get regexCommands() {
      return mockRegexCommands;
    },
  };
});

import { messageCreate } from "@/events/messageCreate";

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

function registerCommand(name: string, options: Partial<Command> = {}) {
  const cmd: Command = {
    name,
    description: `${name} command`,
    ...options,
  };
  const order = mockCommandOrderMap.size;
  mockCommandOrderMap.set(name, order);

  const msg = cmd.message;
  if (msg) {
    let hasRegex = false;
    for (const kw of msg.keywords) {
      if (kw instanceof RegExp) {
        hasRegex = true;
      } else {
        const key = kw.toLowerCase();
        const list = mockKeywordMap.get(key);
        if (list) {
          list.push(cmd);
        } else {
          mockKeywordMap.set(key, [cmd]);
        }
      }
    }
    if (hasRegex) mockRegexCommands.push(cmd);
  }

  return cmd;
}

describe("messageCreate event", () => {
  beforeEach(() => {
    mockCommandOrderMap.clear();
    mockKeywordMap.clear();
    mockRegexCommands.length = 0;
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

  it("should not match keyword as substring of another word", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    registerCommand("test", { message: { keywords: ["ワード"], execute } });
    const message = createMockMessage({ content: "キーワードマッチング" });

    await messageCreate.execute(createMockClient(), message);

    expect(execute).not.toHaveBeenCalled();
  });

  it("should match keyword as independent token", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    registerCommand("test", { message: { keywords: ["メッセージ"], execute } });
    const message = createMockMessage({ content: "特定のメッセージに反応したい" });

    await messageCreate.execute(createMockClient(), message);

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ type: "message", message }),
    );
  });

  it("should match regex keywords", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    registerCommand("mention", {
      message: { keywords: [/^<@!?\d+>/], execute },
    });
    const message = createMockMessage({ content: "<@123456> hello" });

    await messageCreate.execute(createMockClient(), message);

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ type: "message", message }),
    );
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
