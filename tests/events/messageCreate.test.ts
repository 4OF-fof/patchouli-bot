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
    execute: vi.fn().mockResolvedValue(undefined),
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
    const cmd = registerCommand("ping", { message: { keywords: ["ping"] } });
    const message = createMockMessage({
      author: { bot: true },
      content: "ping",
    });

    await messageCreate.execute(createMockClient(), message);

    expect(cmd.execute).not.toHaveBeenCalled();
  });

  it("should execute command matching message keyword", async () => {
    const cmd = registerCommand("ping", { message: { keywords: ["ping"] } });
    const message = createMockMessage({ content: "ping" });

    await messageCreate.execute(createMockClient(), message);

    expect(cmd.execute).toHaveBeenCalledWith(message);
  });

  it("should match keywords case-insensitively", async () => {
    const cmd = registerCommand("ping", { message: { keywords: ["ping"] } });
    const message = createMockMessage({ content: "PING" });

    await messageCreate.execute(createMockClient(), message);

    expect(cmd.execute).toHaveBeenCalledWith(message);
  });

  it("should not execute when no keywords match", async () => {
    const cmd = registerCommand("ping", { message: { keywords: ["ping"] } });
    const message = createMockMessage({ content: "hello" });

    await messageCreate.execute(createMockClient(), message);

    expect(cmd.execute).not.toHaveBeenCalled();
  });

  it("should execute mention command when bot is mentioned", async () => {
    const cmd = registerCommand("ping", {
      mention: { keywords: ["ping"] },
    });
    const message = createMockMessage({
      content: "<@bot-id> ping",
      mentions: { has: vi.fn().mockReturnValue(true) },
    });

    await messageCreate.execute(createMockClient(), message);

    expect(cmd.execute).toHaveBeenCalledWith(message);
  });

  it("should execute mention command with no keywords when mentioned with no extra text", async () => {
    const cmd = registerCommand("greet", {
      mention: { keywords: [] },
    });
    const message = createMockMessage({
      content: "<@bot-id>",
      mentions: { has: vi.fn().mockReturnValue(true) },
    });

    await messageCreate.execute(createMockClient(), message);

    expect(cmd.execute).toHaveBeenCalledWith(message);
  });

  it("should prefer mention match over message keyword match", async () => {
    const mentionCmd = registerCommand("mention-ping", {
      mention: { keywords: ["ping"] },
    });
    const messageCmd = registerCommand("msg-ping", {
      message: { keywords: ["ping"] },
    });
    const message = createMockMessage({
      content: "<@bot-id> ping",
      mentions: { has: vi.fn().mockReturnValue(true) },
    });

    await messageCreate.execute(createMockClient(), message);

    expect(mentionCmd.execute).toHaveBeenCalledWith(message);
    expect(messageCmd.execute).not.toHaveBeenCalled();
  });

  it("should reply with error when command execution fails", async () => {
    registerCommand("ping", {
      message: { keywords: ["ping"] },
      execute: vi.fn().mockRejectedValue(new Error("fail")),
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const message = createMockMessage({ content: "ping" });

    await messageCreate.execute(createMockClient(), message);

    expect(message.reply).toHaveBeenCalledWith("コマンドの実行中にエラーが発生しました。");
  });

  it("should pick command by registration order when multiple match", async () => {
    const first = registerCommand("first", {
      message: { keywords: ["hello"] },
    });
    const second = registerCommand("second", {
      message: { keywords: ["hello"] },
    });
    const message = createMockMessage({ content: "hello" });

    await messageCreate.execute(createMockClient(), message);

    expect(first.execute).toHaveBeenCalledWith(message);
    expect(second.execute).not.toHaveBeenCalled();
  });
});
