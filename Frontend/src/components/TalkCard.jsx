// src/components/TalkCard.jsx
import "./TalkCard.css";

export default function TalkCard({ talk }) {
  const date = talk.publishedAt
    ? new Date(talk.publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <a
      className="talk-card"
      href={talk.link}
      target="_blank"
      rel="noopener noreferrer"
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
    </a>
  );
}