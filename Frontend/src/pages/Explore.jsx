// src/pages/Explore.jsx
// The homepage only ever shows the first HOME_TALK_LIMIT talks (see
// constants.js) and then points here via a "Explore more talks" link.
// This page picks up exactly where Home left off — starting at
// HOME_PAGE_COUNT + 1 — and scrolls infinitely with no cap.
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { getLatestTalks } from "../api/talks.js";
import TalkCard from "../components/TalkCard.jsx";
import TalkCardSkeleton from "../components/TalkCardSkeleton.jsx";
import { HOME_PAGE_COUNT } from "../constants.js";

const START_PAGE = HOME_PAGE_COUNT + 1; // page 5, i.e. talk #61 onward
const SKELETON_COUNT = 15;

export default function Explore() {
  const [talks, setTalks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(START_PAGE);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loaderRef = useRef(null);

  // initial load starts at START_PAGE, not page 1 — this is a
  // continuation of the homepage list, not a fresh one.
  useEffect(() => {
    getLatestTalks(START_PAGE)
      .then(({ talks, hasMore }) => {
        setTalks(talks);
        setHasMore(hasMore);
        setStatus("ready");
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setStatus("error");
      });
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    getLatestTalks(nextPage)
      .then(({ talks: newTalks, hasMore: more }) => {
        setTalks((prev) => [...prev, ...newTalks]);
        setPage(nextPage);
        setHasMore(more);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoadingMore(false));
  }, [page, hasMore, loadingMore]);

  // Depends on `status` too — the sentinel div below only exists once
  // status is "ready", so the observer must (re-)attach right when that
  // happens, not just once on mount.
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore, status]);

  return (
    <div className="page">
      <header className="explore-header">
        <Link to="/" className="explore-header__back">
          ← Back to Lumen
        </Link>
        <h1 className="explore-header__title">All Talks</h1>
      </header>

      {status === "loading" && (
        <div className="grid">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <TalkCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="status status--error">
          Couldn't load talks: {errorMsg}. Is your backend running on
          localhost:8080?
        </p>
      )}

      {status === "ready" && (
        <div className="grid">
          {talks.map((talk) => (
            <TalkCard key={talk.videoId} talk={talk} />
          ))}
        </div>
      )}

      {status === "ready" && (
        <>
          <div ref={loaderRef} style={{ height: 1 }} />
          {loadingMore && (
            <div className="grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <TalkCardSkeleton key={`more-${i}`} />
              ))}
            </div>
          )}
          {!hasMore && (
            <p className="status">You've reached the end.</p>
          )}
        </>
      )}
    </div>
  );
}