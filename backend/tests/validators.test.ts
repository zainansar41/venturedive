import { describe, expect, it } from "vitest";
import { validateWikipediaUrl } from "../src/utils/validators.js";

describe("validateWikipediaUrl", () => {
  it("accepts valid wikipedia article url", () => {
    const parsed = validateWikipediaUrl("https://en.wikipedia.org/wiki/Node.js");
    expect(parsed.hostname).toBe("en.wikipedia.org");
  });

  it("rejects invalid domain", () => {
    expect(() => validateWikipediaUrl("https://google.com/wiki/Node.js")).toThrowError();
  });
});
