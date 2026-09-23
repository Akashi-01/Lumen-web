// utils/backfillTalks.js
//
// ONE-TIME SCRIPT — run manually with: node utils/backfillTalks.js
// (run it from inside the Backend/ folder, same as you'd run server.js)
//
// Why this exists: YouTube's public RSS feed (used by feedParser.js for
// the regular auto-sync) only ever returns the latest ~15 videos — that's
// a hard platform limitation, not something we can work around with RSS.
// This script uses the YouTube Data API v3 instead, which *can* page
// through a channel's entire upload history, and upserts everything it
// finds into the same `Talk` collection feedParser.js already writes to.
//
// Safe to re-run: uses the same upsert-by-videoId pattern as feedParser.js,
// so running this again later just re-syncs, it won't create duplicates.

require("dotenv").config();
const connectDB = require("./db");
const Talk = require("../models/Talk");
const { generateTags } = require("./autoTag");

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UCAuUUnT6oDeKwE6v1NGQxug"; // TED's official channel
const PAGE_SIZE = 50; // max allowed by the API per request

if (!API_KEY) {
  console.error(
    "Missing YOUTUBE_API_KEY in your .env file. Add it and try again."
  );
  process.exit(1);
}

// Step 1: every channel has a hidden "uploads" playlist containing every
// public video it's ever posted, in upload order. We need that playlist's
// ID before we can page through it.
async function getUploadsPlaylistId(channelId) {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(
      `YouTube API error: ${data.error.message} (code ${data.error.code})`
    );
  }

  const channel = data.items?.[0];
  if (!channel) {
    throw new Error(
      `No channel found for ID "${channelId}". Double check YOUTUBE_CHANNEL_ID.`
    );
  }

  return channel.contentDetails.relatedPlaylists.uploads;
}

// Step 2: page through that uploads playlist, 50 videos at a time, until
// there are no more pages (nextPageToken stops appearing).
async function fetchAllPlaylistItems(playlistId) {
  const allItems = [];
  let pageToken = "";
  let pageNumber = 1;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", PAGE_SIZE);
    url.searchParams.set("key", API_KEY);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      throw new Error(
        `YouTube API error: ${data.error.message} (code ${data.error.code})`
      );
    }

    allItems.push(...data.items);
    console.log(`Fetched page ${pageNumber} (${data.items.length} videos, ${allItems.length} total so far)`);

    pageToken = data.nextPageToken || "";
    pageNumber++;
  } while (pageToken);

  return allItems;
}

// Step 3: map the API's response shape onto our existing Talk schema and
// upsert everything in one batched write — same pattern feedParser.js uses.
async function upsertTalks(items) {
  const ops = items
    // Deleted/private videos still show up as playlist entries but with
    // placeholder titles and no real videoId — skip those.
    .filter((item) => {
      const title = item.snippet?.title;
      return (
        item.snippet?.resourceId?.videoId &&
        title !== "Private video" &&
        title !== "Deleted video"
      );
    })
      .map((item) => {
      const videoId = item.snippet.resourceId.videoId;
      const thumb = item.snippet.thumbnails;
      const description = item.snippet.description || "";

      const doc = {
        videoId,
        title: item.snippet.title,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        publishedAt: item.snippet.publishedAt
          ? new Date(item.snippet.publishedAt)
          : undefined,
        thumbnail:
          thumb?.high?.url ||
          thumb?.medium?.url ||
          thumb?.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        description,
        tags: generateTags(item.snippet.title, description),   // NEW
      };

      return {
        updateOne: {
          filter: { videoId },
          update: { $set: doc },
          upsert: true,
        },
      };
    });

  if (ops.length === 0) {
    console.log("Nothing to upsert (no valid videos found).");
    return;
  }

  const result = await Talk.bulkWrite(ops);
  console.log(
    `Backfill complete: ${result.upsertedCount} new talks added, ${result.modifiedCount} existing talks updated.`
  );
}

async function run() {
  try {
    await connectDB();

    console.log(`Looking up uploads playlist for channel ${CHANNEL_ID}...`);
    const uploadsPlaylistId = await getUploadsPlaylistId(CHANNEL_ID);

    console.log(`Fetching full upload history (playlist ${uploadsPlaylistId})...`);
    const items = await fetchAllPlaylistItems(uploadsPlaylistId);
    console.log(`Found ${items.length} videos total. Saving to MongoDB...`);

    await upsertTalks(items);
  } catch (err) {
    console.error("Backfill failed:", err.message);
  } finally {
    process.exit(0);
  }
}

run();