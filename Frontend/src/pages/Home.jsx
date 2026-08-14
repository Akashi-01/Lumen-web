// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { getLatestTalks } from "../api/talks.js";
import TalkCard from "../components/TalkCard.jsx";
import TalkCardSkeleton from "../components/TalkCardSkeleton.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const SKELETON_COUNT = 15; // match the 15 you request from getLatestTalks

export default function Home() {
  const [talks, setTalks] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getLatestTalks(15)
      .then((data) => {
        setTalks(data);
        setStatus("ready");
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setStatus("error");
      });
  }, []);

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="hero__eyebrow">Now on the TED Stage</p>
          <h1 className="hero__title">Latest Ideas Worth Spreading</h1>
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

      {status === "ready" && (
        <div className="grid">
          {talks.map((talk) => (
            <TalkCard key={talk.videoId} talk={talk} />
          ))}
        </div>
      )}
    </div>
  );
}