import * as cheerio from "cheerio";
import type { Article, Section } from "../types/domain.js";
import { NotFoundError, UnprocessableError } from "../utils/errors.js";
import { getArticleTitleFromUrl } from "../utils/validators.js";
import { logger } from "../utils/logger.js";

export class WikipediaScraperService {
  async fetchArticle(url: string): Promise<Article> {
    const title = getArticleTitleFromUrl(url);
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;

    logger.info("scraper", "Fetching Wikipedia article", { url, title, endpoint });

    let html: string;
    try {
      const endFetch = logger.time("scraper", "Wikipedia REST fetch");
      const response = await fetch(endpoint);
      if (!response.ok) {
        logger.warn("scraper", "Wikipedia returned non-OK status", {
          status: response.status,
          title
        });
        throw new NotFoundError("Article not found or has no readable content");
      }
      html = await response.text();
      endFetch();
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error("scraper", "Failed to fetch article", {
        title,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new UnprocessableError("Could not retrieve article content");
    }

    if (!html.trim()) {
      throw new NotFoundError("Article not found or has no readable content");
    }

    const endParse = logger.time("scraper", "parse HTML with Cheerio");
    const $ = cheerio.load(html);
    const articleTitle = $("h1").first().text().trim() || title.replaceAll("_", " ");

    const sections: Section[] = [];
    $("section").each((_, sectionEl) => {
      const heading =
        $(sectionEl).find("h2, h3").first().text().trim() || "Article";

      const content = $(sectionEl)
        .find("p, li")
        .toArray()
        .map((el) => $(el).text().trim())
        .filter(Boolean)
        .join(" ");

      if (content.length > 40) {
        sections.push({ title: heading, content });
      }
    });

    if (sections.length === 0) {
      const content = $("p")
        .toArray()
        .map((el) => $(el).text().trim())
        .filter(Boolean)
        .join(" ");

      if (!content) {
        throw new NotFoundError("Article not found or has no readable content");
      }

      sections.push({ title: "Article", content });
    }

    const text = sections.map((section) => section.content).join("\n\n");
    endParse();

    logger.info("scraper", "Article parsed", {
      title: articleTitle,
      sectionCount: sections.length,
      textLength: text.length,
      htmlLength: html.length
    });

    return {
      title: articleTitle,
      url,
      sections,
      text
    };
  }
}
