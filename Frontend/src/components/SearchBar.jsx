// src/components/SearchBar.jsx
import { useState } from "react";

export default function SearchBar({ onSearch, placeholder = "Search talks by title..." }) {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    onSearch(val);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
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