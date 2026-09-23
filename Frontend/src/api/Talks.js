// src/api/talks.js
// Sab backend calls yahan centralize kiye hain — components ko fetch() ki
// details jaanne ki zaroorat nahi, bas ye functions use karenge.

const BASE_URL = "http://localhost:8080/api/talks";

export async function getLatestTalks(page = 1, limit = 15) {
  const res = await fetch(`${BASE_URL}/latest?limit=${limit}&page=${page}`);
  if (!res.ok) throw new Error(`Failed to load talks (status ${res.status})`);
  return res.json(); // { talks, page, hasMore }
}

export async function getTalkById(videoId) {
  const res = await fetch(`${BASE_URL}/${videoId}`);
  if (!res.ok) throw new Error(`Talk not found (status ${res.status})`);
  const data = await res.json();
  return data.talk;
}

export async function getRelatedTalks(videoId) {
  const res = await fetch(`${BASE_URL}/${videoId}/related`);
  if (!res.ok) throw new Error(`Failed to load related talks (status ${res.status})`);
  return res.json(); // already a raw array, no unwrapping needed
}

// NEW — full-text search + filters, all optional. Only params that actually
// have a value get sent, so searchTalks({ q: "climate" }) and
// searchTalks({ tags: ["Science"] }) both work without extra empty params
// cluttering the query string or the backend's $and filter.
export async function searchTalks({
  q = "",
  tags = [],
  minDuration = "",
  maxDuration = "",
  dateFrom = "",
  dateTo = "",
  page = 1,
  limit = 15,
} = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tags.length) params.set("tags", tags.join(","));
  if (minDuration) params.set("minDuration", minDuration);
  if (maxDuration) params.set("maxDuration", maxDuration);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  params.set("page", page);
  params.set("limit", limit);

  const res = await fetch(`${BASE_URL}/search?${params.toString()}`);
  if (!res.ok) throw new Error(`Search failed (status ${res.status})`);
  return res.json(); // { talks, page, hasMore }
}

// NEW — distinct tag list for the filter panel's checkboxes.
export async function getTags() {
  const res = await fetch(`${BASE_URL}/tags`);
  if (!res.ok) throw new Error(`Failed to load tags (status ${res.status})`);
  return res.json(); // string[]
}