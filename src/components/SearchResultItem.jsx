import { ExplicitIcon } from "./icons/Icons";
import { fmtMs } from "../utils/format";

export function SearchResultItem({ track, onSelect }) {
  const albumImage = track.album?.images?.[2]?.url || track.album?.images?.[0]?.url;
  const artists = track.artists?.map((a) => a.name).join(", ");

  return (
    <div
      onClick={() => onSelect(track)}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#232323")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", borderRadius: 10, cursor: "pointer", transition: "background 0.12s", textAlign: "left" }}
    >
      <img src={albumImage} alt="" style={{ width: 52, height: 52, borderRadius: 6, objectFit: "cover", flexShrink: 0, background: "#1a1a1a" }} />
      <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
        <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3, textAlign: "left" }}>{track.name}</div>
        <div style={{ color: "#555", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 5 }}>
          {track.explicit && <ExplicitIcon c="#666" sz={13} />}
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{artists} · {track.album?.name}</span>
        </div>
      </div>
      <span style={{ color: "#333", fontSize: 12, flexShrink: 0, marginLeft: 8 }}>{fmtMs(track.duration_ms)}</span>
    </div>
  );
}
