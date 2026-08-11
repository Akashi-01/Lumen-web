// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { getLatestTalks } from "../api/talks.js";
import TalkCard from "../components/TalkCard.jsx";

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
        <span className="hero__eyebrow">Now on the TED stage</span>
        <h1 className="hero__title">Latest Ideas Worth Spreading</h1>
      </header>

      {status === "loading" && (
        <p className="status status--loading">Bringing up the house lights…</p>
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