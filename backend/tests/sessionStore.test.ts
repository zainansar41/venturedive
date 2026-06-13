import { describe, expect, it } from "vitest";
import { SessionStore } from "../src/services/sessionStore.js";

describe("SessionStore", () => {
  it("stores and retrieves sessions", () => {
    const store = new SessionStore();
    store.set({
      sessionId: "abc",
      title: "Node.js",
      summary: "summary",
      url: "https://en.wikipedia.org/wiki/Node.js",
      createdAt: new Date()
    });

    expect(store.has("abc")).toBe(true);
    expect(store.get("abc")?.title).toBe("Node.js");
  });
});
