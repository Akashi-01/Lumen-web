// src/pages/SearchResults.jsx
// Dedicated search + filter page, reached from the homepage search bar.
// Modeled on Explore.jsx's infinite-scroll pattern, but backed by
// searchTalks() instead of getLatestTalks() so free-text search and the
// tag/duration/date filters compose into one request.
import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchTalks } from "../api/talks.js";
import TalkCard from "../components/TalkCard.jsx";
import TalkCardSkeleton from "../components/TalkCardSkeleton.jsx";
import FilterPanel from "../components/Filterpanel.jsx";
import SearchBar from "../components/SearchBar.jsx";
import "./SearchResults.css";

const SKELETON_COUNT = 12;

const EMPTY_FILTERS = {
  tags: [],
  minDuration: "",
  maxDuration: "",
  dateFrom: "",
  dateTo: "",
};

export default function SearchResults() {
  // `q` lives in the URL so a search is shareable/bookmarkable — tags,
  // duration and dates stay in local state only, since round-tripping
  // those through the URL too isn't needed for this feature.
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [talks, setTalks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loaderRef = useRef(null);

  // Re-run the search whenever the query text or any filter changes.
  // Debounced so typing doesn't fire a request on every keystroke.
  useEffect(() => {
    setStatus("loading");
    const timeout = setTimeout(() => {
      searchTalks({ q: query, ...filters, page: 1 })
        .then(({ talks, hasMore }) => {
          setTalks(talks);
          setHasMore(hasMore);
          setPage(1);
          setStatus("ready");
        })
        .catch((err) => {
          setErrorMsg(err.message);
          setStatus("error");
        });
    }, 300);

    setSearchParams(query ? { q: query } : {}, { replace: true });

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    searchTalks({ q: query, ...filters, page: nextPage })
      .then(({ talks: newTalks, hasMore: more }) => {
        setTalks((prev) => [...prev, ...newTalks]);
        setPage(nextPage);
        setHasMore(more);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoadingMore(false));
  }, [page, hasMore, loadingMore, query, filters]);

  useEffect(() => {
    if (!loaderRef.current || status !== "ready") return;
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
        <h1 className="explore-header__title">Search Talks</h1>
        <div className="search-results__bar">
          <SearchBar
            onSearch={setQuery}
            initialValue={initialQuery}
            placeholder="Search talks by title or topic..."
          />
        </div>
      </header>

      <div className="search-results__layout">
        <FilterPanel filters={filters} onChange={setFilters} />

        <div className="search-results__main">
          {status === "loading" && (
            <div className="grid">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <TalkCardSkeleton key={i} />
              ))}
            </div>
          )}

          {status === "error" && (
            <p className="status status--error">
              Couldn't load results: {errorMsg}.
            </p>
          )}

          {status === "ready" && talks.length === 0 && (
            <p className="status">
              No talks match{query ? ` "${query}"` : ""} with these filters.
            </p>
          )}

          {status === "ready" && talks.length > 0 && (
            <div className="grid">
              {talks.map((talk) => (
                <TalkCard key={talk.videoId} talk={talk} />
              ))}
            </div>
          )}

          {status === "ready" && talks.length > 0 && (
            <>
              <div ref={loaderRef} style={{ height: 1 }} />
              {loadingMore && (
                <div className="grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TalkCardSkeleton key={`more-${i}`} />
                  ))}
                </div>
              )}
              {!hasMore && <p className="status">You've reached the end.</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}