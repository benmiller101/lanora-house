import * as cheerio from "cheerio";
import fetch from "node-fetch";

export interface ScrapedLot {
  title: string;
  imageUrl: string;
  soldPrice: string;
}

const KNOWN_CATALOGUES: string[] = [];

let lastSyncAt: Date | null = null;
let lastSyncResult: ScrapedLot[] = [];

export function getLastSyncAt() {
  return lastSyncAt;
}

interface NodeFetchOptions extends RequestInit {
  timeout?: number;
}

async function scrapePage(url: string): Promise<{ lots: ScrapedLot[]; hasNext: boolean }> {
  const fetchOptions: NodeFetchOptions = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    timeout: 20000,
  };
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const lots: ScrapedLot[] = [];

  $(".grid-lot").each((_, lotEl) => {
    const imageEl = $(lotEl).find("img.grid-lot-image");
    let imageUrl = imageEl.attr("src") || "";

    // EasyLive serves preview images; swap for full resolution
    imageUrl = imageUrl.replace(/_PREVIEW\.JPG$/i, ".JPG");

    if (!imageUrl.startsWith("http")) return;

    const noHover = $(lotEl).find(".catalogue-description .no-hover");
    const paragraphs = noHover.find("p");

    // First paragraph with content is the lot description/title
    let title = "";
    paragraphs.each((_, p) => {
      const text = $(p).text().replace(/\s+/g, " ").trim();
      if (text && text !== "\u00a0" && !text.startsWith("Hammer") && !title) {
        title = text;
      }
    });

    if (!title) return;

    // Truncate lot number prefix like "Lot 9 - " if present at the start
    title = title.replace(/^Lot\s+\d+\s*[-–]\s*/i, "").trim();
    if (!title) return;

    // Find hammer price
    let soldPrice = "";
    paragraphs.each((_, p) => {
      const text = $(p).text().replace(/\s+/g, " ").trim();
      if (text.startsWith("Hammer")) {
        const match = text.match(/£[\d,]+/);
        if (match) soldPrice = match[0];
      }
    });

    if (!soldPrice) return; // Only include sold lots

    lots.push({ title, imageUrl, soldPrice });
  });

  const hasNext = $('link[rel="next"]').length > 0;

  return { lots, hasNext };
}

export async function scrapeEasyLiveCatalogues(
  catalogueUrls: string[] = KNOWN_CATALOGUES,
  maxPagesPerCatalogue = 5
): Promise<ScrapedLot[]> {
  const allLots: ScrapedLot[] = [];

  for (const baseUrl of catalogueUrls) {
    for (let page = 1; page <= maxPagesPerCatalogue; page++) {
      const url =
        page === 1 ? baseUrl : `${baseUrl}?currentPage=${page}`;

      try {
        const { lots, hasNext } = await scrapePage(url);
        allLots.push(...lots);
        if (!hasNext) break;
      } catch (err) {
        console.error(`[EasyLive Scraper] Error on page ${page} of ${baseUrl}:`, err);
        break;
      }

      // Polite delay between pages
      if (page < maxPagesPerCatalogue) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }

  lastSyncAt = new Date();
  lastSyncResult = allLots;

  return allLots;
}

export function getCachedLots(): ScrapedLot[] {
  return lastSyncResult;
}

export function needsSync(maxAgeMs = 6 * 60 * 60 * 1000): boolean {
  if (!lastSyncAt) return true;
  return Date.now() - lastSyncAt.getTime() > maxAgeMs;
}
