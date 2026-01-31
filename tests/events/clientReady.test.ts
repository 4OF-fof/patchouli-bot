import { describe, it, expect, vi, afterEach } from "vitest";
import { clientReady } from "../../src/events/clientReady.js";

describe("clientReady event", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log the bot tag on ready", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const mockClient = {
      user: { tag: "TestBot#1234" },
    } as any;

    clientReady.execute(mockClient);

    expect(console.log).toHaveBeenCalledWith("Logged in as TestBot#1234");
  });

  it("should have once set to true", () => {
    expect(clientReady.once).toBe(true);
  });

  it("should handle missing user gracefully", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    const mockClient = { user: undefined } as any;

    clientReady.execute(mockClient);

    expect(console.error).toHaveBeenCalledWith("Client user is not available");
    expect(console.log).not.toHaveBeenCalled();
  });
});
