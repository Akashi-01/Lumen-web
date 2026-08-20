// src/components/TalkCardSkeleton.jsx
import "./TalkCard.css";
import "./TalkCardSkeleton.css";

export default function TalkCardSkeleton({ variant = "default" }) {
  return (
      <div
        className={`talk-card talk-card--${variant} talk-card--skeleton`}
        aria-hidden="true"
      >
      <div className="talk-card__thumb-wrap">
        <div className="skeleton-block skeleton-block--thumb" />
      </div>
      <div className="talk-card__body">
        <div className="skeleton-block skeleton-block--title" />
        <div className="skeleton-block skeleton-block--title skeleton-block--title-short" />
        <div className="skeleton-block skeleton-block--date" />
      </div>
    </div>
  );
}