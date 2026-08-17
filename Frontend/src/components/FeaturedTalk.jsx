// src/components/FeaturedTalk.jsx
import { Link } from "react-router-dom";
import "./FeaturedTalk.css";

export default function FeaturedTalk({ talk }) {
  if (!talk) return null;

  return (
    <section className="featured-talk">
      <div className="featured-talk__image-wrap">
        <img
          src={talk.thumbnail}
          alt={talk.title}
          className="featured-talk__image"
        />
        <span className="featured-talk__badge">▶ Featured Talk</span>
      </div>

      <div className="featured-talk__info">
        <h2 className="featured-talk__title">{talk.title}</h2>
        <p className="featured-talk__description">
          {talk.description?.slice(0, 150)}
          {talk.description?.length > 150 ? "…" : ""}
        </p>
        <Link to={`/talk/${talk.videoId}`} className="featured-talk__cta">
          Watch now
          <span className="featured-talk__cta-arrow">→</span>
        </Link>
      </div>
    </section>
  );
}