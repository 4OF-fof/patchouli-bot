import { describe, it, expect, vi, afterEach } from "vitest";
import { clientReady } from "../../src/events/clientReady.js";

describe("clientReady event", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log the bot tag on ready", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const mockClient = {} as any;
    const mockReadyClient = {
      user: { tag: "TestBot#1234" },
    } as any;

    clientReady.execute(mockClient, mockReadyClient);

    expect(console.log).toHaveBeenCalledWith("Logged in as TestBot#1234");
  });

  it("should have once set to true", () => {
    expect(clientReady.once).toBe(true);
  });
});
