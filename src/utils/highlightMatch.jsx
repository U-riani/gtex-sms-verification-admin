// src/utils/highlightMatch.js
export function highlightMatch(text, query) {
  if (!query || text == null) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return String(text)
    .split(regex)
    .map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-400/40 text-yellow-200 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
}
