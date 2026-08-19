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