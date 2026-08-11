// src/pages/TalkDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTalkById, getRelatedTalks } from "../api/talks.js";
import "./TalkDetail.css";

export default function TalkDetail() {
  const { videoId } = useParams();
  const [talk, setTalk] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setStatus("loading");
    Promise.all([getTalkById(videoId), getRelatedTalks(videoId)])
      .then(([talkData, relatedData]) => {
        setTalk(talkData);
        setRelated(relatedData);
        setStatus("ready");
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setStatus("error");
      });
  }, [videoId]);

  if (status === "loading") {
    return <p className="status status--loading">Loading talk…</p>;
  }

  if (status === "error") {
    return (
      <div className="status status--error">
        <p>Couldn't load this talk: {errorMsg}</p>
        <Link to="/">← Back to all talks</Link>
      </div>
    );
  }

  return (
    <div className="talk-detail">
      <Link to="/" className="back-link">← Back to all talks</Link>

      <div className="player-wrapper">
        <iframe
          src={`https://www.youtube.com/embed/${talk.videoId}`}
          title={talk.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="talk-info">
        <h1>{talk.title}</h1>
        <p className="talk-date">
          {talk.publishedAt &&
            new Date(talk.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </p>
        {talk.description && <p className="talk-description">{talk.description}</p>}
        <a href={talk.link} target="_blank" rel="noopener noreferrer" className="youtube-link">
          Watch on YouTube
        </a>
      </div>

      {related.length > 0 && (
        <section className="related-talks">
          <h2>Related Talks</h2>
          <div className="related-grid">
            {related.map((t) => (
              <Link key={t.videoId} to={`/talk/${t.videoId}`} className="related-card">
                <img src={t.thumbnail} alt={t.title} />
                <p>{t.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}