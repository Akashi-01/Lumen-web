// src/pages/Home.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { getLatestTalks, searchTalks } from "../api/talks.js";
import { HOME_TALK_LIMIT } from "../constants.js";
import TalkCard from "../components/TalkCard.jsx";
import TalkCardSkeleton from "../components/TalkCardSkeleton.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import SearchBar from "../components/SearchBar.jsx";
import FeaturedTalk from "../components/FeaturedTalk.jsx";
import logo from "../assets/Lumen.png";

const SKELETON_COUNT = 15; // match the 15 you request from getLatestTalks

export default function Home() {
  const navigate = useNavigate();
  const [talks, setTalks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const loaderRef = useRef(null);

  const scrollSentinelRef = useRef(null);

  useEffect(() => {
    const el = scrollSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
    // Stops once the homepage has shown HOME_TALK_LIMIT talks — beyond that,
  // we point people to /explore instead of scrolling forever.
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || talks.length >= HOME_TALK_LIMIT) return;
    const nextPage = page + 1;
    getLatestTalks(nextPage)
      .then(({ talks: newTalks, hasMore: more }) => {
        setTalks((prev) => [...prev, ...newTalks]);
        setPage(nextPage);
        setHasMore(more);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoadingMore(false));
  }, [page, hasMore, loadingMore, talks.length]); 
  
  // watch the sentinel div and trigger loadMore when it scrolls into view
  //
  // Bug fix: the sentinel <div ref={loaderRef}> only renders once
  // status === "ready" (it doesn't exist during the initial "loading"
  // state). This effect used to run only on [loadMore, searchTerm], so on
  // first mount it found loaderRef.current === null and bailed out — and
  // then never re-ran once the sentinel actually appeared, because
  // `status` flipping to "ready" wasn't in its dependency list. Adding
  // `status` here makes the effect re-run right when the sentinel div
  // shows up, so the observer actually gets attached to it.
    useEffect(() => {
    // pause auto-load while filtering, or once we've hit the homepage cap
    if (!loaderRef.current || searchTerm || talks.length >= HOME_TALK_LIMIT) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore, searchTerm, status, talks.length]);

  const featured = talks[0];

  const filteredTalks = useMemo(() => {
    if (!searchTerm) return talks;
    return talks.filter((talk) =>
      talk.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [talks, searchTerm]);

    // The first talk is already shown big in <FeaturedTalk>, so leave it out
  // of the grid below to avoid showing the same card twice. While
  // searching, show the full match list instead (no separate hero shown).
  const gridTalks = useMemo(() => {
    if (searchTerm) return filteredTalks;
    return filteredTalks.slice(1);
  }, [filteredTalks, searchTerm]);

  // Every 5th card in the grid renders larger (2-column span, bigger type)
  // so the layout reads as an intentional, edited feed rather than a flat
  // repeating grid of identical cards.
  const cardVariant = (index) => ((index + 1) % 5 === 0 ? "featured" : "default");

    return (
    <div className="page">
      <div ref={scrollSentinelRef} className="scroll-sentinel" />
      <header className={`hero ${isScrolled ? "hero--scrolled" : ""}`}>
        <div className="hero__topbar">
          <div className="hero__brand">
            <img src={logo} alt="" className="hero__logo" />
            <span className="hero__brand-name">Lumen</span>
          </div>
          <div className="hero__actions">
            {status === "ready" && (
              <div className="hero__search">
                <SearchBar 
                  onSearch={setSearchTerm} 
                  onSubmit={(val) => navigate(`/search${val ? `?q=${encodeURIComponent(val)}` : ''}`)}
                />
              </div>
            )}
            <button className="hero__auth-btn hero__auth-btn--ghost">
              Log in
            </button>
            <button className="hero__auth-btn hero__auth-btn--solid">
              <FontAwesomeIcon icon={faUser} />
              Sign up
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="hero__heading">
          <p className="hero__eyebrow">Now on the TED Stage</p>
          <h1 className="hero__title">Latest Ideas Worth Spreading</h1>
        </div>
      </header>


      {status === "loading" && (
        <div className="grid">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <TalkCardSkeleton key={i} variant={cardVariant(i)} />
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
          {gridTalks.map((talk, i) => (
            <TalkCard key={talk.videoId} talk={talk} variant={cardVariant(i)} />
          ))}
        </div>
      )}

      {status === "ready" && searchTerm && filteredTalks.length === 0 && (
        <p className="status">No talks match "{searchTerm}".</p>
      )}

            {status === "ready" && !searchTerm && talks.length < HOME_TALK_LIMIT && (
        <>
          <div ref={loaderRef} style={{ height: 1 }} />
          {loadingMore && (
            <div className="grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <TalkCardSkeleton
                  key={`more-${i}`}
                  variant={cardVariant(gridTalks.length + i)}
                />
              ))}
            </div>
          )}
          {!hasMore && (
            <p className="status">You've reached the end.</p>
          )}
        </>
      )}

      {status === "ready" && !searchTerm && talks.length >= HOME_TALK_LIMIT && (
        hasMore ? (
          <div className="explore-more">
            <p className="explore-more__text">
              You've seen our latest {HOME_TALK_LIMIT} talks.
            </p>
            <Link to="/explore" className="explore-more__btn">
              Explore more talks
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <p className="status">You've reached the end.</p>
        )
      )}
    </div>
  );
}