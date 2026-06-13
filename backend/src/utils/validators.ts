import { ValidationError } from "./errors.js";

export function validateWikipediaUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ValidationError("URL must be a valid Wikipedia article link");
  }

  const isValidHost =
    parsed.hostname === "en.wikipedia.org" || parsed.hostname === "wikipedia.org";

  if (!isValidHost) {
    throw new ValidationError("Only Wikipedia article URLs are supported");
  }

  if (!parsed.pathname.startsWith("/wiki/")) {
    throw new ValidationError("URL must be a valid Wikipedia article link");
  }

  const title = parsed.pathname.replace("/wiki/", "");
  if (!title || title.startsWith("Special:") || title.startsWith("File:")) {
    throw new ValidationError("URL must be a valid Wikipedia article link");
  }

  return parsed;
}

export function getArticleTitleFromUrl(url: string): string {
  const parsed = validateWikipediaUrl(url);
  return decodeURIComponent(parsed.pathname.replace("/wiki/", ""));
}
