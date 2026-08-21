// src/components/TalkCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import "./TalkCard.css";

// YouTube's "no real thumbnail" placeholder (shown for deleted/private
// videos) always loads as a small 120x90 grey box, regardless of the
// hqdefault.jpg URL requested. Real thumbnails come back much larger
// (480x360+). We check the loaded image's actual pixel size — not the
// URL — since the placeholder is served from the exact same URL pattern
// a real thumbnail would be, so there's no way to tell from the URL alone.
const PLACEHOLDER_WIDTH = 120;

export default function TalkCard({ talk, variant = "default" }) {
  const [unavailable, setUnavailable] = useState(false);

  const date = talk.publishedAt
    ? new Date(talk.publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  // Don't render the card at all once we know its video has no real
  // thumbnail — it's almost always been taken down/made private.
  if (unavailable) return null;

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
          onLoad={(e) => {
            if (e.target.naturalWidth <= PLACEHOLDER_WIDTH) {
              setUnavailable(true);
            }
          }}
          onError={() => setUnavailable(true)}
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