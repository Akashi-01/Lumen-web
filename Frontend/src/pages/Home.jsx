// src/pages/Home.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { getLatestTalks } from "../api/talks.js";
import TalkCard from "../components/TalkCard.jsx";
import TalkCardSkeleton from "../components/TalkCardSkeleton.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import SearchBar from "../components/SearchBar.jsx";
import FeaturedTalk from "../components/FeaturedTalk.jsx";

const SKELETON_COUNT = 15; // match the 15 you request from getLatestTalks

export default function Home() {
  const [talks, setTalks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loaderRef = useRef(null);

  // initial load (page 1)
  useEffect(() => {
    getLatestTalks(1)
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

  // fetch next page and append
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

  // watch the sentinel div and trigger loadMore when it scrolls into view
  useEffect(() => {
    if (!loaderRef.current || searchTerm) return; // pause auto-load while filtering
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore, searchTerm]);

  const featured = talks[0];

  const filteredTalks = useMemo(() => {
    if (!searchTerm) return talks;
    return talks.filter((talk) =>
      talk.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [talks, searchTerm]);

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="hero__eyebrow">Now on the TED Stage</p>
          <h1 className="hero__title">Latest Ideas Worth Spreading</h1>
          {status === "ready" && (
            <div className="hero__search">
              <SearchBar onSearch={setSearchTerm} />
            </div>
          )}
        </div>
        <ThemeToggle />
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

      {status === "ready" && !searchTerm && (
        <FeaturedTalk talk={featured} />
      )}

      {status === "ready" && (
        <div className="grid">
          {filteredTalks.map((talk) => (
            <TalkCard key={talk.videoId} talk={talk} />
          ))}
        </div>
      )}

      {status === "ready" && searchTerm && filteredTalks.length === 0 && (
        <p className="status">No talks match "{searchTerm}".</p>
      )}

      {status === "ready" && !searchTerm && (
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