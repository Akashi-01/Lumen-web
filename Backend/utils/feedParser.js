// utils/feedParser.js
const Parser = require("rss-parser");
const Talk = require("../models/Talk");

const parser = new Parser();

// falls back to TED's official channel if not set in .env
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UCAuUUnT6oDeKwE6v1NGQxug";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000; // 2 seconds, doubles each retry

// Helper: fetch with retries and exponential backoff
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) return response;

    // On last attempt, throw instead of retrying
    if (attempt === retries) {
      throw new Error(`Feed fetch failed with status ${response.status} after ${retries} attempts`);
    }

    const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
    console.warn(`Feed fetch attempt ${attempt}/${retries} got ${response.status}, retrying in ${delay}ms…`);
    await new Promise(r => setTimeout(r, delay));
  }
}

// Fetches the feed and upserts each talk into MongoDB.
// Safe to call repeatedly — existing talks get updated, not duplicated.
async function syncTalksFromFeed() {
  try {
    // Use a realistic browser User-Agent — YouTube returns 404 for bot-like UAs.
    const response = await fetchWithRetry(FEED_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "application/xml, text/xml, application/atom+xml, */*",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const xml = await response.text();
    const feed = await parser.parseString(xml);

    const ops = feed.items.map(item => {
      const videoId = item.id?.split(":").pop();
      const doc = {
        videoId,
        title: item.title,
        link: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        thumbnail: item["media:group"]?.["media:thumbnail"]?.[0]?.["$"]?.url
          || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        description: item["media:group"]?.["media:description"]?.[0] || ""
      };

      return {
        updateOne: {
          filter: { videoId },
          update: { $set: doc },
          upsert: true
        }
      };
    });

    if (ops.length) {
      const result = await Talk.bulkWrite(ops);
      console.log(`Synced feed: ${result.upsertedCount} new, ${result.modifiedCount} updated`);
    }
  } catch (err) {
    console.error("Feed sync failed:", err.message);
  }
}

module.exports = { syncTalksFromFeed, FEED_URL };