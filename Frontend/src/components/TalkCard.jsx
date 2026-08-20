// src/components/TalkCard.jsx
import { Link } from "react-router-dom";
import "./TalkCard.css";

export default function TalkCard({ talk, variant = "default" }) {
  const date = talk.publishedAt
    ? new Date(talk.publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
      <Link
        className={`talk-card talk-card--${variant}`}
        to={`/talk/${talk.videoId}`}
      >
      <div className="talk-card__thumb-wrap">
        <img
          className="talk-card__thumb"
          src={talk.thumbnail}
          alt=""
          loading="lazy"
        />
        <div className="talk-card__spotlight" />
      </div>
      <div className="talk-card__body">
        <p className="talk-card__title">{talk.title}</p>
        <p className="talk-card__date">{date}</p>
      </div>
    </Link>
  );
}