import { describe, expect, it, vi } from "vitest";
import { WikipediaScraperService } from "../src/services/scraper.js";

describe("WikipediaScraperService", () => {
  it("extracts sections and text from wikipedia html", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          "<h1>Node.js</h1><section><h2>History</h2><p>Node.js was created by Ryan Dahl and this paragraph is intentionally long enough to cross section content threshold.</p></section>",
          { status: 200 }
        )
      )
    );

    const scraper = new WikipediaScraperService();
    const article = await scraper.fetchArticle("https://en.wikipedia.org/wiki/Node.js");
    expect(article.title).toContain("Node.js");
    expect(article.sections[0].title).toContain("History");
  });
});
