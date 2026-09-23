const TAXONOMY = require("./tagTaxonomy");

function generateTags(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(TAXONOMY)) {
    let score = 0;
    for (const kw of keywords) {
      if (title.toLowerCase().includes(kw)) score += 3; // title hits weigh more
      if (description.toLowerCase().includes(kw)) score += 1;
    }
    if (score > 0) scores[category] = score;
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)          // top 3 categories max
    .map(([category]) => category);
}

module.exports = { generateTags };