// routes/talks.js
const express = require("express");
const router = express.Router();
const Talk = require("../models/Talk");

// GET /api/talks/latest?limit=12
router.get("/latest", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const talks = await Talk.find().sort({ publishedAt: -1 }).limit(limit);
    res.json({ talks });
  } catch (err) {
    res.status(500).json({ error: "Could not read talks from database." });
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