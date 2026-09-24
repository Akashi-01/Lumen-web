const mongoose = require("mongoose");

const talkSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  link: String,
  publishedAt: Date,
  thumbnail: String,
  description: String,
  tags: { type: [String], default: [], index: true },
  durationSeconds: { type: Number, default: null },
  viewCount: { type: Number, default: null },
}, { timestamps: true });

talkSchema.index({ title: "text", description: "text" }, {
  weights: { title: 5, description: 1 },
  name: "TalkTextIndex"
});

module.exports = mongoose.model("Talk", talkSchema);