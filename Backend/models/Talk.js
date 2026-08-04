// models/Talk.js
const mongoose = require("mongoose");

const talkSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  link: String,
  publishedAt: Date,
  thumbnail: String,
  description: String
}, { timestamps: true }); // adds createdAt / updatedAt automatically

module.exports = mongoose.model("Talk", talkSchema);