// src/components/FilterPanel.jsx
// Renders tag checkboxes (populated from GET /api/talks/tags), duration
// presets, and a date range. Doesn't call the search API itself — it just
// reports the current filter shape up to its parent via onChange, so the
// parent (SearchResults.jsx) can merge it with the free-text query and
// fire a single combined searchTalks() call.
import { useEffect, useState } from "react";
import { getTags } from "../api/talks.js";
import "./FilterPanel.css";

const DURATION_PRESETS = [
  { label: "Any length", min: "", max: "" },
  { label: "Under 6 min", min: "", max: "360" },
  { label: "6–20 min", min: "360", max: "1200" },
  { label: "Over 20 min", min: "1200", max: "" },
];

export default function FilterPanel({ filters, onChange }) {
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsStatus, setTagsStatus] = useState("loading");

  useEffect(() => {
    getTags()
      .then((tags) => {
        setAvailableTags(tags);
        setTagsStatus("ready");
      })
      .catch(() => setTagsStatus("error"));
  }, []);

  const toggleTag = (tag) => {
    const nextTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: nextTags });
  };

  const setDurationPreset = (preset) => {
    onChange({ ...filters, minDuration: preset.min, maxDuration: preset.max });
  };

  const handleDateChange = (field) => (e) => {
    onChange({ ...filters, [field]: e.target.value });
  };

  const clearAll = () => {
    onChange({ tags: [], minDuration: "", maxDuration: "", dateFrom: "", dateTo: "" });
  };

  const hasActiveFilters =
    filters.tags.length > 0 ||
    filters.minDuration ||
    filters.maxDuration ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <aside className="filter-panel">
      <div className="filter-panel__header">
        <h2 className="filter-panel__title">Filters</h2>
        {hasActiveFilters && (
          <button type="button" className="filter-panel__clear" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      <section className="filter-panel__section">
        <h3 className="filter-panel__label">Tags</h3>
        {tagsStatus === "loading" && (
          <p className="filter-panel__hint">Loading tags…</p>
        )}
        {tagsStatus === "error" && (
          <p className="filter-panel__hint">Couldn't load tags.</p>
        )}
        {tagsStatus === "ready" && availableTags.length === 0 && (
          <p className="filter-panel__hint">No tags yet.</p>
        )}
        {tagsStatus === "ready" && availableTags.length > 0 && (
          <div className="filter-panel__tags">
            {availableTags.map((tag) => (
              <label key={tag} className="filter-panel__checkbox">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="filter-panel__section">
        <h3 className="filter-panel__label">Duration</h3>
        <div className="filter-panel__radios">
          {DURATION_PRESETS.map((preset) => {
            const isActive =
              filters.minDuration === preset.min && filters.maxDuration === preset.max;
            return (
              <label key={preset.label} className="filter-panel__radio">
                <input
                  type="radio"
                  name="duration"
                  checked={isActive}
                  onChange={() => setDurationPreset(preset)}
                />
                {preset.label}
              </label>
            );
          })}
        </div>
      </section>

      <section className="filter-panel__section">
        <h3 className="filter-panel__label">Upload date</h3>
        <div className="filter-panel__dates">
          <label className="filter-panel__date-field">
            From
            <input
              type="date"
              value={filters.dateFrom}
              onChange={handleDateChange("dateFrom")}
            />
          </label>
          <label className="filter-panel__date-field">
            To
            <input
              type="date"
              value={filters.dateTo}
              onChange={handleDateChange("dateTo")}
            />
          </label>
        </div>
      </section>
    </aside>
  );
}