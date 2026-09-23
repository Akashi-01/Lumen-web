// src/components/SearchBar.jsx
import { useState } from "react";

export default function SearchBar({
  onSearch,
  onSubmit,
  placeholder = "Search talks by title...",
  initialValue = "", 
}) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    if (onSearch) onSearch(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit(value);
    }
  };

  const handleClear = () => {
    setValue("");
    if (onSearch) onSearch("");
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}