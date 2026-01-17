// src/components/SearchBar.jsx
import React from "react";

const SearchBar = ({placeholder = "Search…", value, onChange, onClear, onAdvanced }) => {
  return (
    <div className="relative flex items-center bg-slate-700 rounded px-3 py-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none pr-16"
      />

      {value && (
        <button
          onClick={onClear}
          className="absolute right-10 text-gray-300 hover:text-white"
        >
          ✕
        </button>
      )}

      <button
        onClick={onAdvanced}
        className="absolute right-3 text-gray-300 hover:text-white"
      >
        ⌄
      </button>
    </div>
  );
}

export default SearchBar;