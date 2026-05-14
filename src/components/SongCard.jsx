import { useEffect, useRef, useState } from "react";
import { ExplicitIcon, NextIcon, PauseBtn, PrevIcon, RepeatIcon, ShuffleIcon } from "./icons/Icons";
import { getDominantColor, hexToRgb, luminance, rgbToHex } from "../utils/color";
import { cleanSongTitle, fmtMs } from "../utils/format";

export function SongCard({ track, cardRef, custom, setCustom, selected, setSelected }) {
  const [autoBg, setAutoBg] = useState({ r: 22, g: 22, b: 22 });
  const [colorSet, setColorSet] = useState(false);
  const imgRef = useRef(null);

  const albumUrl = track.album?.images?.[0]?.url;
  const artists = track.artists?.map((a) => a.name).join(", ") || "";
  const displayTitle = cleanSongTitle(track.name) || track.name;
  const duration = fmtMs(track.duration_ms || 0);
  const manualBg = hexToRgb(custom.backgroundColor || "#161616");
  const bg = custom.useAutoBg ? autoBg : manualBg;
  const fg = custom.useAutoText ? (luminance(bg.r, bg.g, bg.b) < 0.35 ? "#fff" : "#000") : custom.textColor;
  const bgStr = `rgb(${bg.r},${bg.g},${bg.b})`;
  const side = custom.sidePadding;

  const selectable = (key, opts = {}) => ({
    cursor: "pointer",
    outline: selected === key ? `2px dashed ${fg}` : "none",
    outlineOffset: selected === key ? (opts.inset ? -6 : 4) : 0,
  });

  const pick = (key) => (e) => {
    e.stopPropagation();
    setSelected(key);
  };

  useEffect(() => {
    if (custom.useAutoBg && autoBg) setCustom((prev) => ({ ...prev, backgroundColor: rgbToHex(autoBg) }));
  }, [autoBg, custom.useAutoBg, setCustom]);

  useEffect(() => {
    if (custom.useAutoText) setCustom((prev) => ({ ...prev, textColor: fg }));
  }, [fg, custom.useAutoText, setCustom]);

  return (
    <div
      ref={cardRef}
      onClick={() => setSelected(null)}
      style={{
        width: custom.cardWidth,
        height: custom.cardHeight,
        backgroundColor: bgStr,
        fontFamily: '"Outfit", system-ui, sans-serif',
        overflow: "hidden",
        transition: colorSet ? "background-color 0.7s ease" : "none",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ padding: `${side}px ${side}px 0`, display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <div onClick={pick("image")} style={{ width: `${custom.imageSize}%`, aspectRatio: "1", overflow: "hidden", ...selectable("image") }}>
          {albumUrl && (
            <img
              ref={imgRef}
              src={albumUrl}
              crossOrigin="anonymous"
              alt={track.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onLoad={() => {
                if (imgRef.current) {
                  setAutoBg(getDominantColor(imgRef.current));
                  setTimeout(() => setColorSet(true), 30);
                }
              }}
            />
          )}
        </div>
      </div>

      <div style={{ padding: `13px ${side}px 6px`, textAlign: "left", flexShrink: 0 }}>
        <div
          onClick={pick("title")}
          style={{
            color: fg,
            fontSize: custom.titleSize,
            fontWeight: 800,
            lineHeight: 1.16,
            marginBottom: 7,
            paddingBottom: 2,
            letterSpacing: "-0.5px",
            textAlign: "left",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ...selectable("title"),
          }}
        >
          {displayTitle}
        </div>
        <div onClick={pick("artist")} style={{ display: "flex", alignItems: "center", gap: 7, ...selectable("artist") }}>
          {track.explicit && <ExplicitIcon c={fg} sz={Math.max(12, custom.artistSize * 0.95)} />}
          <span style={{ color: fg, fontSize: custom.artistSize, fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {artists}
          </span>
        </div>
      </div>

      <div style={{ padding: `6px ${side}px 0`, flexShrink: 0 }}>
        <div onClick={pick("progress")} style={{ height: custom.progressHeight, background: fg, borderRadius: 2, marginBottom: 5, ...selectable("progress") }} />
        <div onClick={pick("time")} style={{ display: "flex", justifyContent: "space-between", color: fg, fontSize: custom.timeSize, fontWeight: 500, marginBottom: 8, ...selectable("time") }}>
          <span>0:00</span>
          <span>{duration}</span>
        </div>
      </div>

      <div onClick={pick("icons")} style={{ padding: `4px ${Math.max(8, side - 6)}px ${Math.max(10, side * 0.55)}px`, boxSizing: "border-box", flexShrink: 0, ...selectable("icons", { inset: true }) }}>
        <div style={{ display: "flex", justifyContent: "center", gap: custom.iconGap, alignItems: "center", padding: `8px ${Math.max(6, side * 0.25)}px 8px`, boxSizing: "border-box" }}>
          <ShuffleIcon c={fg} sz={custom.iconSize} />
          <PrevIcon c={fg} sz={custom.iconSize} />
          <PauseBtn fg={fg} sz={custom.centerButtonSize} />
          <NextIcon c={fg} sz={custom.iconSize} />
          <RepeatIcon c={fg} sz={custom.iconSize} />
        </div>
      </div>
    </div>
  );
}
