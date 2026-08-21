// src/constants.js
// Shared between Home and Explore so both pages agree on exactly where the
// homepage's preview ends and the full "Explore" library begins. Change
// HOME_TALK_LIMIT here and both pages stay in sync automatically.

export const TALKS_PER_PAGE = 15;
export const HOME_TALK_LIMIT = 60; // shown on the homepage before "Explore more"
export const HOME_PAGE_COUNT = HOME_TALK_LIMIT / TALKS_PER_PAGE; // 4 pages