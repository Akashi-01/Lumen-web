require("dotenv").config();
const connectDB = require("./db");
const Talk = require("../models/Talk");
const { generateTags } = require("./autoTag");

async function run() {
  await connectDB();
  const talks = await Talk.find({});
  const ops = talks.map(t => ({
    updateOne: {
      filter: { _id: t._id },
      update: { $set: { tags: generateTags(t.title, t.description) } }
    }
  }));
  const result = await Talk.bulkWrite(ops);
  console.log(`Tagged ${result.modifiedCount} talks.`);
  process.exit(0);
}
run();