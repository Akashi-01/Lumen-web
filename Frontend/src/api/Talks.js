// src/api/talks.js
// Sab backend calls yahan centralize kiye hain — components ko fetch() ki
// details jaanne ki zaroorat nahi, bas ye functions use karenge.

const BASE_URL = "http://localhost:8080/api/talks";

export async function getLatestTalks(limit = 12) {
  const res = await fetch(`${BASE_URL}/latest?limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to load talks (status ${res.status})`);
  const data = await res.json();
  return data.talks;
}

export async function getTalkById(videoId) {
  const res = await fetch(`${BASE_URL}/${videoId}`);
  if (!res.ok) throw new Error(`Talk not found (status ${res.status})`);
  const data = await res.json();
  return data.talk;
}