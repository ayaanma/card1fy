import { BrandLogo } from "./BrandLogo";
import { SearchResultItem } from "./SearchResultItem";
import { inputStyle } from "../styles/sharedStyles";

export function SearchPage({ query, setQuery, bumpSearchVersion, results, loading, err, onSelectTrack, onHome }) {
  return (
    <div style={{ width: "100%", maxWidth: 580, padding: "36px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
        <BrandLogo onClick={onHome} />
      </div>

      {err && <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 14 }}>{err}</div>}

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search songs, artists, albums…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            bumpSearchVersion();
          }}
          autoFocus
          style={{ ...inputStyle, fontSize: 16 }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
        />
      </div>

      {loading && query.trim() && <div style={{ textAlign: "center", color: "#444", padding: "48px 0", fontSize: 15 }}>Searching Spotify…</div>}

      {!loading && results.length === 0 && !query && (
        <div style={{ textAlign: "center", color: "#2a2a2a", padding: "64px 0", fontSize: 15 }}>Search for a song to generate a card</div>
      )}

      {!loading && results.length === 0 && query && <div style={{ textAlign: "center", color: "#444", padding: "48px 0" }}>No results found</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: "calc(100vh - 190px)", overflowY: "auto", paddingRight: 4 }}>
        {results.map((track) => <SearchResultItem key={track.id} track={track} onSelect={onSelectTrack} />)}
      </div>
    </div>
  );
}
