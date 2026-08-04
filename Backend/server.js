// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./utils/db");
const { syncTalksFromFeed } = require("./utils/feedParser");
const talksRouter = require("./routes/talks");

const app = express();
app.use(cors());
app.use("/api/talks", talksRouter);

const PORT = 8080;
const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // re-check the feed every 15 min

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    syncTalksFromFeed(); // initial sync
    setInterval(syncTalksFromFeed, REFRESH_INTERVAL_MS);
  });
}

start();