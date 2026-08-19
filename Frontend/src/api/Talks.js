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