// routes/talks.js
const express = require("express");
const router = express.Router();
const Talk = require("../models/Talk");

// GET /api/talks/latest?limit=12&page=1
router.get("/latest", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [talks, total] = await Promise.all([
      Talk.find().sort({ publishedAt: -1 }).skip(skip).limit(limit),
      Talk.countDocuments()
    ]);

    res.json({
      talks,
      page,
      hasMore: skip + talks.length < total
    });
  } catch (err) {
    res.status(500).json({ error: "Could not read talks from database." });
  }
});

router.get("/:videoId/related", async (req, res) => {
  try {
    const current = await Talk.findOne({ videoId: req.params.videoId });
    if (!current) {
      return res.status(404).json({ error: "Talk not found" });
    }

    // pull meaningful words from the title (skip short/common words)
    const keywords = current.title
      .split(" ")
      .filter(word => word.length > 4)
      .map(word => word.replace(/[^a-zA-Z0-9]/g, "")); // strip punctuation

    let related = [];

    if (keywords.length > 0) {
      related = await Talk.find({
        videoId: { $ne: current.videoId },
        title: { $regex: keywords.join("|"), $options: "i" }
      })
        .sort({ publishedAt: -1 })
        .limit(6);
    }

    // fallback: if keyword match found too few, pad with recent talks
    if (related.length < 6) {
      const excludeIds = [current.videoId, ...related.map(t => t.videoId)];
      const fallback = await Talk.find({
        videoId: { $nin: excludeIds }
      })
        .sort({ publishedAt: -1 })
        .limit(6 - related.length);

      related = [...related, ...fallback];
    }

    res.json(related);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch related talks" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q, tags, minDuration, maxDuration, dateFrom, dateTo, sort } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (tags) filter.tags = { $in: tags.split(",") };
    if (minDuration || maxDuration) {
      filter.durationSeconds = {};
      if (minDuration) filter.durationSeconds.$gte = Number(minDuration);
      if (maxDuration) filter.durationSeconds.$lte = Number(maxDuration);
    }
    if (dateFrom || dateTo) {
      filter.publishedAt = {};
      if (dateFrom) filter.publishedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.publishedAt.$lte = new Date(dateTo);
    }

    let query = Talk.find(filter);
    if (q) {
      query = query.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
    } else if (sort === "views") {
      query = query.sort({ viewCount: -1 });
    } else {
      query = query.sort({ publishedAt: -1 });
    }

    const [talks, total] = await Promise.all([
      query.skip(skip).limit(limit),
      Talk.countDocuments(filter)
    ]);

    res.json({ talks, page, hasMore: skip + talks.length < total });
  } catch (err) {
    res.status(500).json({ error: "Search failed." });
  }
});

// GET /api/talks/tags
router.get("/tags", async (req, res) => {
  try {
    const tags = await Talk.distinct("tags");
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch tags." });
  }
});

// GET /api/talks/:videoId
router.get("/:videoId", async (req, res) => {
  try {
    const talk = await Talk.findOne({ videoId: req.params.videoId });
    if (!talk) return res.status(404).json({ error: "Talk not found." });
    res.json({ talk });
  } catch (err) {
    res.status(500).json({ error: "Lookup failed." });
  }
});

module.exports = router;