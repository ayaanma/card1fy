import { useState, useEffect, useRef, useCallback } from "react";

function getDominantColor(img) {
  try {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 80;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, 80, 80);
    const { data } = cx.getImageData(0, 0, 80, 80);
    const buckets = {};
    for (let i = 0; i < data.length; i += 4) {
      const key = `${data[i] >> 4},${data[i+1] >> 4},${data[i+2] >> 4}`;
      if (!buckets[key]) buckets[key] = { n:0, r:0, g:0, b:0 };
      buckets[key].n++;
      buckets[key].r += data[i];
      buckets[key].g += data[i+1];
      buckets[key].b += data[i+2];
    }
    const best = Object.values(buckets).reduce((a,b) => b.n > a.n ? b : a);
    return { r: best.r/best.n|0, g: best.g/best.n|0, b: best.b/best.n|0 };
  } catch { return { r: 25, g: 25, b: 25 }; }
}

function luminance(r, g, b) {
  const f = c => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
  return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
}

function fmtMs(ms) {
  const s = ms/1000|0;
  return `${s/60|0}:${(s%60).toString().padStart(2,"0")}`;
}

const SVG_FILES = {
  "shuffle.svg": {
    ratio: 27.12 / 22.64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27.12 22.64" preserveAspectRatio="xMidYMid meet" fill="currentColor" style="display:block;width:100%;height:100%;overflow:visible;background:transparent;border-radius:0"><path d="M22.14,3.24l-1-1c-.67-.63-.74-1.3-.2-1.85a1.33,1.33,0,0,1,1.95,0c1.31,1.24,2.61,2.5,3.94,3.73.35.32.42.53,0,.88-1.34,1.24-2.65,2.52-4,3.77a1.31,1.31,0,0,1-2.25-.53,1.19,1.19,0,0,1,.44-1.23l1.21-1.13c-2.15-.33-4-.08-5.46,1.47s-2.82,3-4.17,4.54a66.42,66.42,0,0,1-5.76,6.33A7.66,7.66,0,0,1,3,20.36a17.3,17.3,0,0,1-2.6.07c-.11,0-.31-.23-.32-.37a12.06,12.06,0,0,1,0-1.7A.56.56,0,0,1,.4,18a3,3,0,0,1,.9,0,4.14,4.14,0,0,0,3.52-1.29c1.33-1.28,2.6-2.62,3.84-4,2-2.22,3.92-4.53,6-6.71A7.74,7.74,0,0,1,19,3.46a20.59,20.59,0,0,1,2.49-.07c.18,0,.37,0,.55,0Z"/><path d="M22.22,16.63l-1-.94c-.7-.66-.79-1.34-.26-1.9a1.37,1.37,0,0,1,2,.05c1.33,1.25,2.64,2.53,4,3.78.3.28.32.49,0,.78-1.36,1.27-2.7,2.57-4.06,3.84a1.34,1.34,0,0,1-1.91,0,1.2,1.2,0,0,1,.17-1.83l1-1-.06-.17c-.57,0-1.15,0-1.72,0a5.59,5.59,0,0,1-3.7-1.08,29.73,29.73,0,0,1-3.05-2.56c-1-.91-1.06-.64.09-1.65,1-.85,1-.82,1.89.07.69.66,1.41,1.3,2.15,1.9a3.77,3.77,0,0,0,2.67.87c.57,0,1.15,0,1.73,0Z"/><path d="M.06,4.65V2.28a7.46,7.46,0,0,1,6.77,2C7.93,5.37,9,6.51,10,7.59c.28.29.21.46-.08.67a13.11,13.11,0,0,0-1.16.93c-.32.31-.51.26-.81-.06-.91-1-1.86-2-2.8-2.91a6.53,6.53,0,0,0-.7-.58,4,4,0,0,0-3-1C1,4.69.57,4.65.06,4.65Z"/></svg>`,
  },
  "rewind.svg": {
    ratio: 22.43 / 22.64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22.43 22.64" preserveAspectRatio="xMidYMid meet" fill="currentColor" style="display:block;width:100%;height:100%;overflow:visible;background:transparent;border-radius:0"><path d="M4.79,9.5l1.35-.79L20.34.52c1.2-.69,2.09-.17,2.09,1.23V20.84c0,1.37-.91,1.9-2.11,1.21L5.26,13.34l-.47-.24v8.37c0,.79-.26,1.05-1,1.05s-1.85,0-2.77,0c-.68,0-1-.29-1-1V1C0,.35.28.08.94.08H3.86c.67,0,.92.26.92.94,0,2.61,0,5.21,0,7.82Z"/></svg>`,
  },
  "pause.svg": {
    ratio: 1,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;overflow:visible;background:transparent;border-radius:0"><defs><mask id="__ID__" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="34" y="30" width="12" height="40" rx="2.5" fill="black"/><rect x="54" y="30" width="12" height="40" rx="2.5" fill="black"/></mask></defs><circle cx="50" cy="50" r="50" fill="currentColor" mask="url(#__ID__)"/></svg>`,
  },
  "skip.svg": {
    ratio: 22.43 / 22.64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22.43 22.64" preserveAspectRatio="xMidYMid meet" fill="currentColor" style="display:block;width:100%;height:100%;overflow:visible;background:transparent;border-radius:0"><path d="M17.66,9.47V1.09c0-.83.21-1,1-1h2.82c.64,0,.89.25.92.9,0,.12,0,.25,0,.37V21.22c0,1.08-.21,1.29-1.27,1.29h-2.5c-.76,0-1-.26-1-1V13.1c-.24.12-.42.19-.59.29-5,2.87-9.92,5.74-14.89,8.6a2.39,2.39,0,0,1-1,.34A1.15,1.15,0,0,1,0,21.22c0-.15,0-.29,0-.43C0,14.43,0,8.06,0,1.7A1.32,1.32,0,0,1,2.09.47C7,3.36,11.94,6.18,16.87,9Z"/></svg>`,
  },
  "loop.svg": {
    ratio: 24.88 / 22.64,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.88 22.64" preserveAspectRatio="xMidYMid meet" fill="currentColor" style="display:block;width:100%;height:100%;overflow:visible;background:transparent;border-radius:0"><path d="M9.38,18.19,11,16.71c.9-.86,1.8-1.72,2.71-2.57a1.26,1.26,0,0,1,1.85.16,1.14,1.14,0,0,1-.18,1.54L14.12,17a.22.22,0,0,0-.07.07s.06,0,.09,0c1.74,0,3.48,0,5.22,0a3.41,3.41,0,0,0,3.23-3.38c0-2.68,0-5.37,0-8.06A3.47,3.47,0,0,0,20.3,2.35a4,4,0,0,0-1.41-.24H6A3.61,3.61,0,0,0,2.79,3.8a3.12,3.12,0,0,0-.5,1.73c0,2.73,0,5.45,0,8.18A3.4,3.4,0,0,0,5,17a10.91,10.91,0,0,0,1.61.12c.14,0,.27,0,.42,0v2.17h-.4a9.56,9.56,0,0,1-2.2-.16A5.72,5.72,0,0,1,.07,14.53,6.25,6.25,0,0,1,0,13.66C0,11,0,8.29,0,5.6A5.43,5.43,0,0,1,3,.69,5.86,5.86,0,0,1,5.88,0c4.43,0,8.86,0,13.28,0a5.73,5.73,0,0,1,5.59,4.46,4.92,4.92,0,0,1,.11,1.09c0,2.73,0,5.47,0,8.2a5.36,5.36,0,0,1-3,4.88,6,6,0,0,1-3,.7H14a.28.28,0,0,0,.05.08c.39.37.77.75,1.17,1.12a1.16,1.16,0,0,1,.22,1.64,1.26,1.26,0,0,1-1.77.18c-.31-.26-.6-.55-.9-.84L9.48,18.3Z"/></svg>`,
  },
  "explicit.svg": {
    ratio: 1,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;overflow:visible;background:transparent;border-radius:0"><defs><mask id="__ID__" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect x="0" y="0" width="100" height="100" fill="white"/><path d="M34 25h36v13H49v7h18v12H49v8h22v13H34V25Z" fill="black"/></mask></defs><rect x="4" y="4" width="92" height="92" rx="8" fill="currentColor" mask="url(#__ID__)"/></svg>`,
  },
  "eyedropper.svg": {
    ratio: 1,
    svg: `<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
<svg style="display:block;width:100%;height:100%;overflow:visible;background:transparent;border-radius:0" preserveAspectRatio="xMidYMid meet" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <path d="M12.5 7.50006L16 4.00006C17.1046 2.89549 18.8954 2.89549 20 4.00006C21.1046 5.10463 21.1046 6.89549 20 8.00006L16.5 11.5001M11 6.00006L18 13.0001M14 14.0001L10.4059 17.5942C9.88703 18.113 9.6276 18.3725 9.32485 18.558C9.05644 18.7225 8.7638 18.8437 8.4577 18.9172C8.11243 19.0001 7.74555 19.0001 7.01178 19.0001H6L3 21.0001L5 18.0001V16.9883C5 16.2545 5 15.8876 5.08289 15.5424C5.15638 15.2363 5.27759 14.9436 5.44208 14.6752C5.6276 14.3725 5.88703 14.113 6.40589 13.5942L10 10.0001" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </g>

</svg>`,
  },
};

function SvgIcon({ name, color, size=24, style, square=false }) {
  const icon = SVG_FILES[name];
  const maskId = `svg-mask-${name.replace(/[^a-z0-9]/gi, "-")}-${String(size).replace(/[^a-z0-9]/gi, "-")}`;
  const raw = icon?.svg?.replaceAll("__ID__", maskId) || "";
  const width = square ? size : size * (icon?.ratio || 1);
  return (
    <span
      aria-label={name}
      title={name}
      style={{
        width,
        height:size,
        display:"inline-flex",
        alignItems:"center",
        justifyContent:"center",
        color,
        flexShrink:0,
        lineHeight:0,
        overflow:"visible",
        borderRadius:0,
        background:"transparent",
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: raw }}
    />
  );
}

function ShuffleIcon({ c, sz=26 }) {
  return <SvgIcon name="shuffle.svg" color={c} size={sz} />;
}
function PrevIcon({ c, sz=26 }) {
  return <SvgIcon name="rewind.svg" color={c} size={sz} />;
}
function NextIcon({ c, sz=26 }) {
  return <SvgIcon name="skip.svg" color={c} size={sz} />;
}
function RepeatIcon({ c, sz=26 }) {
  return <SvgIcon name="loop.svg" color={c} size={sz} />;
}
function ExplicitIcon({ c, sz=14 }) {
  return <SvgIcon name="explicit.svg" color={c} size={sz} />;
}
function PauseBtn({ fg, sz=58 }) {
  return <SvgIcon name="pause.svg" color={fg} size={sz} square />;
}
function EyedropperIcon({ c = "#aaa", sz = 18 }) {
  return <SvgIcon name="eyedropper.svg" color={c} size={sz} square />;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const n = parseInt(clean.length === 3 ? clean.split("").map(x => x + x).join("") : clean, 16);
  return { r:(n >> 16) & 255, g:(n >> 8) & 255, b:n & 255 };
}

function rgbToHex({ r, g, b }) {
  return `#${[r,g,b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,"0")).join("")}`;
}

const DEFAULT_CUSTOM = {
  useAutoBg: true,
  backgroundColor: "#161616",
  useAutoText: true,
  textColor: "#ffffff",
  cardWidth: 384,
  cardHeight: 576,
  sidePadding: 22,
  imageSize: 100,
  titleSize: 27,
  artistSize: 15,
  timeSize: 12,
  iconSize: 26,
  centerButtonSize: 58,
  iconGap: 26,
  progressHeight: 2.5,
};

const PREVIEW_CARD_WIDTH = 320;
const PREVIEW_CARD_HEIGHT = 520;

const FIELD_BG = "rgba(255,255,255,0.06)";
const FIELD_BORDER = "1px solid rgba(255,255,255,0.12)";
const RANGE_THUMB = "#2a2a2a";
const UNIT_FACTORS = {
  px: 1,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  ft: 96 * 12,
  m: 96 / 0.0254,
};
const UNIT_OPTIONS = [
  { value: "px", label: "px" },
  { value: "in", label: "in" },
  { value: "cm", label: "cm" },
  { value: "mm", label: "mm" },
  { value: "ft", label: "ft" },
  { value: "m", label: "m" },
];

function pxToUnit(px, unit) {
  return px / (UNIT_FACTORS[unit] || 1);
}

function unitToPx(value, unit) {
  return value * (UNIT_FACTORS[unit] || 1);
}

function formatUnitValue(value, unit) {
  if (unit === "px") return String(Math.round(value * 1000) / 1000).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  if (Math.abs(value) >= 10) return value.toFixed(2).replace(/\.00$/, "");
  if (Math.abs(value) >= 1) return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

function formatCardDimensions(widthPx, heightPx) {
  return `${Math.round(widthPx)} × ${Math.round(heightPx)} px`;
}

function formatInches(px) {
  return `${formatUnitValue(pxToUnit(px, "in"), "in")} in`;
}

function scaleCardCustom(custom) {
  const scale = custom.cardWidth / 320;
  return {
    ...custom,
    sidePadding: custom.sidePadding * scale,
    titleSize: custom.titleSize * scale,
    artistSize: custom.artistSize * scale,
    timeSize: custom.timeSize * scale,
    iconSize: custom.iconSize * scale,
    centerButtonSize: custom.centerButtonSize * scale,
    iconGap: custom.iconGap * scale,
    progressHeight: custom.progressHeight * scale,
  };
}


function cleanSongTitle(title = "") {
  return title
    .replace(/\s*\((feat\.|featuring|with)\s+[^)]*\)\s*/ig, "")
    .replace(/\s*\[(feat\.|featuring|with)\s+[^\]]*\]\s*/ig, "")
    .trim();
}

function SongCard({ track, cardRef, custom, setCustom, selected, setSelected }) {
  const [autoBg, setAutoBg] = useState({ r:22, g:22, b:22 });
  const [colorSet, setColorSet] = useState(false);
  const imgRef = useRef(null);
  const albumUrl = track.album?.images?.[0]?.url;
  const artists = track.artists?.map(a => a.name).join(", ") || "";
  const displayTitle = cleanSongTitle(track.name) || track.name;
  const explicit = track.explicit;
  const dur = fmtMs(track.duration_ms || 0);
  const manualBg = hexToRgb(custom.backgroundColor || "#161616");
  const bg = custom.useAutoBg ? autoBg : manualBg;
  const lum = luminance(bg.r, bg.g, bg.b);
  const dark = lum < 0.35;
  const autoFg = dark ? "#fff" : "#000";
  const fg = custom.useAutoText ? autoFg : custom.textColor;
  const bgStr = `rgb(${bg.r},${bg.g},${bg.b})`;
  const side = custom.sidePadding;
  const selectable = (key, opts = {}) => ({
    cursor:"pointer",
    outline: selected === key ? `2px dashed ${fg}` : "none",
    outlineOffset: selected === key ? (opts.inset ? -6 : 4) : 0,
  });
  const pick = (key) => (e) => { e.stopPropagation(); setSelected(key); };

  useEffect(() => {
    if (custom.useAutoBg && autoBg) {
      setCustom(prev => ({ ...prev, backgroundColor: rgbToHex(autoBg) }));
    }
  }, [autoBg, custom.useAutoBg, setCustom]);

  useEffect(() => {
    if (custom.useAutoText) {
      setCustom(prev => ({ ...prev, textColor: autoFg }));
    }
  }, [autoFg, custom.useAutoText, setCustom]);

  return (
    <div ref={cardRef} onClick={() => setSelected(null)} style={{
      width: custom.cardWidth, height: custom.cardHeight, backgroundColor: bgStr,
      fontFamily: '"Outfit", system-ui, sans-serif',
      overflow: "hidden",
      transition: colorSet ? "background-color 0.7s ease" : "none",
      flexShrink: 0,
      display:"flex",
      flexDirection:"column",
      justifyContent:"space-between",
    }}>
      <div style={{ padding:`${side}px ${side}px 0`, display:"flex", justifyContent:"center", flexShrink:0 }}>
        <div onClick={pick("image")} style={{ width:`${custom.imageSize}%`, aspectRatio:"1", overflow:"hidden", ...selectable("image") }}>
          {albumUrl && (
            <img ref={imgRef} src={albumUrl} crossOrigin="anonymous" alt={track.name}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
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

      <div style={{ padding:`12px ${side}px 6px`, textAlign:"left", flexShrink:0 }}>
        <div onClick={pick("title")} style={{ color:fg, fontSize:custom.titleSize, fontWeight:800, lineHeight:1.16,
          marginBottom:7, paddingBottom:2, letterSpacing:"-0.5px", textAlign:"left", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", ...selectable("title") }}>
          {displayTitle}
        </div>
        <div onClick={pick("artist")} style={{ display:"flex", alignItems:"center", gap:7, ...selectable("artist") }}>
          {explicit && (
            <ExplicitIcon c={fg} sz={Math.max(12, custom.artistSize * 0.95)} />
          )}
          <span style={{
            color:fg, fontSize:custom.artistSize, fontWeight:400,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>{artists}</span>
        </div>
      </div>

      <div style={{ padding:`6px ${side}px 0`, flexShrink:0 }}>
        <div onClick={pick("progress")} style={{ height:custom.progressHeight, background:fg, borderRadius:2, marginBottom:5, ...selectable("progress") }}/>
        <div onClick={pick("time")} style={{ display:"flex", justifyContent:"space-between",
          color:fg, fontSize:custom.timeSize, fontWeight:500, marginBottom:8, ...selectable("time") }}>
          <span>0:00</span><span>{dur}</span>
        </div>
      </div>

      <div onClick={pick("icons")} style={{
        padding:`4px ${Math.max(8, side - 6)}px ${Math.max(10, side * 0.55)}px`,
        boxSizing:"border-box",
        flexShrink:0,
        ...selectable("icons", { inset:true })
      }}>
        <div style={{
          display:"flex",
          justifyContent:"center",
          gap:custom.iconGap,
          alignItems:"center",
          padding:`8px ${Math.max(6, side * 0.25)}px 8px`,
          boxSizing:"border-box",
        }}>
          <ShuffleIcon c={fg} sz={custom.iconSize}/>
          <PrevIcon c={fg} sz={custom.iconSize}/>
          <PauseBtn fg={fg} sz={custom.centerButtonSize}/>
          <NextIcon c={fg} sz={custom.iconSize}/>
          <RepeatIcon c={fg} sz={custom.iconSize}/>
        </div>
      </div>
    </div>
  );
}


function UnitDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const current = UNIT_OPTIONS.find(opt => opt.value === value)?.label || value;

  return (
    <div ref={boxRef} style={{ position:"relative", width:66, flexShrink:0 }}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        style={{
          width:"100%",
          background:FIELD_BG,
          border:FIELD_BORDER,
          borderRadius:8,
          color:"#fff",
          padding:"4px 7px",
          fontSize:12,
          fontWeight:700,
          outline:"none",
          fontFamily:'"Outfit", sans-serif',
          cursor:"pointer",
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          gap:5,
        }}
      >
        <span>{current}</span>
        <span style={{ color:"#777", fontSize:10, transform:open ? "rotate(180deg)" : "none", transition:"transform 0.15s" }}>▾</span>
      </button>

      {open && (
        <div style={{
          position:"absolute",
          top:"calc(100% + 6px)",
          right:0,
          width:"100%",
          background:"#111",
          border:"1px solid #2a2a2a",
          borderRadius:10,
          boxShadow:"0 16px 40px rgba(0,0,0,0.45)",
          padding:4,
          zIndex:9999,
        }}>
          {UNIT_OPTIONS.map(opt => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={{
                width:"100%",
                background:opt.value === value ? "rgba(255,255,255,0.12)" : "transparent",
                color:opt.value === value ? "#fff" : "#aaa",
                border:"none",
                borderRadius:7,
                padding:"7px 8px",
                fontSize:12,
                fontWeight:800,
                fontFamily:'"Outfit", sans-serif',
                cursor:"pointer",
                textAlign:"left",
              }}
              onMouseEnter={e => {
                if (opt.value !== value) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={e => {
                if (opt.value !== value) e.currentTarget.style.background = "transparent";
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


function SizeSlider({ label, value, min, max, step=1, onChange }) {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const commit = (raw) => {
    const n = Number(raw);
    if (!Number.isNaN(n)) onChange(clamp(n));
  };

  return (
    <label style={{ display:"grid", gap:7 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, color:"#ccc", fontSize:12, fontWeight:700 }}>
        <span style={{ whiteSpace:"nowrap" }}>{label}</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => commit(e.target.value)}
          style={{
            width:70,
            background:FIELD_BG,
            border:FIELD_BORDER,
            borderRadius:8,
            color:"#fff",
            padding:"4px 7px",
            fontSize:12,
            fontWeight:700,
            outline:"none",
            fontFamily:'"Outfit", sans-serif',
            textAlign:"right",
          }}
        />
      </div>
      <input className="songcard-range" type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} style={{ width:"100%" }}/>
    </label>
  );
}

function UnitSizeSlider({ label, valuePx, minPx, maxPx, stepPx=1, unit, onUnitChange, onChangePx }) {
  const factor = UNIT_FACTORS[unit] || 1;
  const displayValue = pxToUnit(valuePx, unit);
  const min = pxToUnit(minPx, unit);
  const max = pxToUnit(maxPx, unit);
  const step = stepPx / factor;
  const [typedValue, setTypedValue] = useState(formatUnitValue(displayValue, unit));
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isTyping) setTypedValue(formatUnitValue(displayValue, unit));
  }, [displayValue, unit, isTyping]);

  const clampPx = (px) => Math.min(maxPx, Math.max(minPx, px));

  const finishTyping = () => {
    setIsTyping(false);
    const n = Number(typedValue);

    if (typedValue === "" || typedValue === "-" || typedValue === "." || typedValue === "-." || Number.isNaN(n)) {
      setTypedValue(formatUnitValue(displayValue, unit));
      return;
    }

    const clamped = clampPx(unitToPx(n, unit));
    onChangePx(clamped);
    setTypedValue(formatUnitValue(pxToUnit(clamped, unit), unit));
  };

  return (
    <label style={{ display:"grid", gap:7 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, color:"#ccc", fontSize:12, fontWeight:700 }}>
        <span style={{ whiteSpace:"nowrap" }}>{label}</span>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <input
            type="text"
            inputMode="decimal"
            value={typedValue}
            onFocus={() => setIsTyping(true)}
            onChange={e => {
              const raw = e.target.value;
              if (/^-?\d*\.?\d*$/.test(raw)) setTypedValue(raw);
            }}
            onBlur={finishTyping}
            onKeyDown={e => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setIsTyping(false);
                setTypedValue(formatUnitValue(displayValue, unit));
                e.currentTarget.blur();
              }
            }}
            style={{
              width:88,
              background:FIELD_BG,
              border:FIELD_BORDER,
              borderRadius:8,
              color:"#fff",
              padding:"4px 7px",
              fontSize:12,
              fontWeight:700,
              outline:"none",
              fontFamily:'"Outfit", sans-serif',
              textAlign:"right",
            }}
          />
          <UnitDropdown
            value={unit}
            onChange={nextUnit => {
              setIsTyping(false);
              onUnitChange(nextUnit);
            }}
          />
        </div>
      </div>
      <input
        className="songcard-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, displayValue))}
        onChange={e => {
          setIsTyping(false);
          onChangePx(clampPx(unitToPx(Number(e.target.value), unit)));
        }}
        style={{ width:"100%" }}
      />
    </label>
  );
}

function ColorRow({ label, value, onColor, onPick }) {
  return (
    <div style={{ display:"grid", gap:8 }}>
      <span style={{ color:"#ccc", fontSize:12, fontWeight:800 }}>{label}</span>
      <div style={{ display:"flex", gap:8 }}>
        <div style={{ width:44, height:38, borderRadius:10, overflow:"hidden", border:FIELD_BORDER, background:FIELD_BG, flexShrink:0 }}>
          <input type="color" value={value} onChange={e => onColor(e.target.value)}
            style={{ width:54, height:48, margin:-5, padding:0, border:"none", background:"transparent", cursor:"pointer" }}/>
        </div>
        <input type="text" value={value} onChange={e => onColor(e.target.value)}
          style={{ ...inputStyle, padding:"9px 10px", fontSize:12, color:"#fff", borderRadius:10 }}/>
        <button
          type="button"
          onClick={onPick}
          aria-label="Eyedropper"
          title="Eyedropper"
          style={{
            width:38,
            minWidth:38,
            height:38,
            padding:0,
            border:"none",
            background:"transparent",
            color:"#aaa",
            display:"inline-flex",
            alignItems:"center",
            justifyContent:"center",
            cursor:"pointer",
          }}
        >
          <EyedropperIcon c="currentColor" sz={22} />
        </button>
      </div>
    </div>
  );
}

function CustomizerPanel({ custom, setCustom, selected, setSelected, setErr }) {
  const [units, setUnits] = useState({
    cardWidth: "px",
    cardHeight: "px",
    sidePadding: "px",
    iconGap: "px",
  });
  const update = (key, value) => setCustom(prev => ({ ...prev, [key]: value }));
  const setUnit = (key, value) => setUnits(prev => ({ ...prev, [key]: value }));
  const pickColor = async (key, autoKey) => {
    try {
      if (!window.EyeDropper) {
        setErr("Your browser does not support the eyedropper API. Use the color picker instead.");
        return;
      }
      const result = await new window.EyeDropper().open();
      setCustom(prev => ({ ...prev, [autoKey]: false, [key]: result.sRGBHex }));
    } catch {}
  };

  const selectedSliders = {
    image: <SizeSlider label="Image size" value={custom.imageSize} min={60} max={100} onChange={v => update("imageSize", v)} />,
    title: <SizeSlider label="Title size" value={custom.titleSize} min={14} max={56} onChange={v => update("titleSize", v)} />,
    artist: <SizeSlider label="Artist / E label size" value={custom.artistSize} min={10} max={34} onChange={v => update("artistSize", v)} />,
    progress: <SizeSlider label="Progress bar thickness" value={custom.progressHeight} min={1} max={10} step={0.5} onChange={v => update("progressHeight", v)} />,
    time: <SizeSlider label="Timestamp size" value={custom.timeSize} min={8} max={24} onChange={v => update("timeSize", v)} />,
    icons: <>
      <SizeSlider label="Side icon size" value={custom.iconSize} min={16} max={58} onChange={v => update("iconSize", v)} />
      <SizeSlider label="Pause button size" value={custom.centerButtonSize} min={36} max={100} onChange={v => update("centerButtonSize", v)} />
      <UnitSizeSlider
        label="Space between icons"
        valuePx={custom.iconGap}
        minPx={4}
        maxPx={56}
        stepPx={1}
        unit={units.iconGap}
        onUnitChange={v => setUnit("iconGap", v)}
        onChangePx={v => update("iconGap", v)}
      />
    </>,
  };

  return (
    <div onClick={e => e.stopPropagation()} style={{ width:380, maxWidth:"100%", background:"#111", border:"1px solid #252525", borderRadius:16, padding:18 }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:16 }}>
        <h2 style={{ margin:0, fontSize:18, letterSpacing:"-0.4px" }}>Customize</h2>
        <button onClick={() => { setCustom(DEFAULT_CUSTOM); setSelected(null); }} style={{ ...ghostBtn, padding:"6px 10px", fontSize:11 }}>Reset</button>
      </div>

      <div style={{ display:"grid", gap:16 }}>
        <ColorRow label="Background color" value={custom.backgroundColor}
          onColor={v => setCustom(prev => ({ ...prev, useAutoBg:false, backgroundColor:v }))}
          onPick={() => pickColor("backgroundColor", "useAutoBg")} />
        <ColorRow label="Text + icon color" value={custom.textColor}
          onColor={v => setCustom(prev => ({ ...prev, useAutoText:false, textColor:v }))}
          onPick={() => pickColor("textColor", "useAutoText")} />

        <div style={{ height:1, background:"#252525" }} />
        <div style={{ color:"#777", fontSize:12, lineHeight:1.5 }}>
          Click the album, title, artist line, progress bar, timestamps, or icons on the card to edit that element's size.
        </div>

        {selected ? (
          <div style={{ display:"grid", gap:12, background:"#0b0b0b", border:"1px solid #222", borderRadius:12, padding:12 }}>
            <div style={{ color:"#1DB954", fontSize:11, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.1em" }}>
              Editing {selected}
            </div>
            {selectedSliders[selected]}
          </div>
        ) : (
          <div style={{ color:"#555", fontSize:12, background:"#0b0b0b", border:"1px solid #222", borderRadius:12, padding:12 }}>
            No element selected yet.
          </div>
        )}

        <div style={{ height:1, background:"#252525" }} />
        <UnitSizeSlider
          label="Whole card width"
          valuePx={custom.cardWidth}
          minPx={192}
          maxPx={576}
          stepPx={1}
          unit={units.cardWidth}
          onUnitChange={v => setUnit("cardWidth", v)}
          onChangePx={v => update("cardWidth", v)}
        />
        <UnitSizeSlider
          label="Whole card height"
          valuePx={custom.cardHeight}
          minPx={288}
          maxPx={864}
          stepPx={1}
          unit={units.cardHeight}
          onUnitChange={v => setUnit("cardHeight", v)}
          onChangePx={v => update("cardHeight", v)}
        />
        <UnitSizeSlider
          label="Side spacing"
          valuePx={custom.sidePadding}
          minPx={10}
          maxPx={54}
          stepPx={1}
          unit={units.sidePadding}
          onUnitChange={v => setUnit("sidePadding", v)}
          onChangePx={v => update("sidePadding", v)}
        />
      </div>
    </div>
  );
}

const inputStyle = {
  flex:1, background:FIELD_BG, border:FIELD_BORDER,
  borderRadius:10, color:"#fff", padding:"14px 18px", fontSize:15, outline:"none",
  fontFamily:'"Outfit", sans-serif', letterSpacing:"-0.1px",
  transition:"border-color 0.2s",
};
const greenBtn = {
  background:"#1DB954", color:"#000", border:"none", borderRadius:10,
  padding:"14px 26px", fontWeight:700, fontSize:15, cursor:"pointer",
  fontFamily:'"Outfit", sans-serif', whiteSpace:"nowrap", flexShrink:0,
};
const ghostBtn = {
  background:FIELD_BG, color:"#aaa", border:FIELD_BORDER,
  borderRadius:10, padding:"12px 18px", fontWeight:600, fontSize:14, cursor:"pointer",
  fontFamily:'"Outfit", sans-serif',
};

export default function App() {
  const [phase, setPhase] = useState("search");
  const [query, setQuery] = useState("");
  const [searchVersion, setSearchVersion] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [track, setTrack] = useState(null);
  const [custom, setCustom] = useState(DEFAULT_CUSTOM);
  const [selectedElement, setSelectedElement] = useState(null);
  const cardRef = useRef(null);
  const previewCustom = {
    ...custom,
    cardWidth: PREVIEW_CARD_WIDTH,
    cardHeight: PREVIEW_CARD_HEIGHT,
  };

  const goHome = () => {
    setPhase("search");
    setTrack(null);
    setSelectedElement(null);
    setCustom(DEFAULT_CUSTOM);
    setQuery("");
    setResults([]);
    setLoading(false);
    setErr("");
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);

    const rangeStyle = document.createElement("style");
    rangeStyle.setAttribute("data-songcard-range", "true");
    rangeStyle.textContent = `
      html, body, #root {
        margin: 0;
        width: 100%;
        min-width: 100%;
        min-height: 100%;
        background: #161616;
      }
      body {
        display: block;
        place-items: unset;
        overflow-x: hidden;
      }
      #root {
        max-width: none;
        padding: 0;
        text-align: initial;
      }
      .songcard-range {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        border-radius: 999px;
        background: rgba(255,255,255,0.12);
        outline: none;
      }
      .songcard-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: ${RANGE_THUMB};
        border: 1px solid rgba(255,255,255,0.12);
        cursor: pointer;
      }
      .songcard-range::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: ${RANGE_THUMB};
        border: 1px solid rgba(255,255,255,0.12);
        cursor: pointer;
      }
      .songcard-range::-moz-range-track {
        height: 4px;
        border-radius: 999px;
        background: rgba(255,255,255,0.12);
      }
    `;
    document.head.appendChild(rangeStyle);

    const h2c = document.createElement("script");
    h2c.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    document.head.appendChild(h2c);

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
      if (rangeStyle.parentNode) rangeStyle.parentNode.removeChild(rangeStyle);
      if (h2c.parentNode) h2c.parentNode.removeChild(h2c);
    };
  }, []);

  const searchTracks = useCallback(async (searchQuery, signal) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/spotify-search?q=${encodeURIComponent(trimmed)}`, { signal });
      const d = await res.json().catch(() => ({}));
      if (signal?.aborted) return;

      if (!res.ok || d.error) {
        setErr(d.error || d.message || `Search failed (${res.status})`);
        setResults([]);
      } else {
        setResults(d.tracks || []);
      }
    } catch(e) {
      if (e.name !== "AbortError") setErr(e.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (phase !== "search" || searchVersion === 0) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchTracks(trimmed, controller.signal);
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, searchVersion, searchTracks]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    if (!window.html2canvas) { setErr("Downloader still loading — try again in a second"); return; }
    try {
      const sourceCanvas = await window.html2canvas(cardRef.current, {
        useCORS:true,
        scale:4,
        backgroundColor:null,
        logging:false,
      });

      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = Math.round(custom.cardWidth);
      outputCanvas.height = Math.round(custom.cardHeight);

      const ctx = outputCanvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sourceCanvas, 0, 0, outputCanvas.width, outputCanvas.height);

      const a = document.createElement("a");
      a.download = `${cleanSongTitle(track?.name) || track?.name || "song"}-card.png`;
      a.href = outputCanvas.toDataURL("image/png");
      a.click();
    } catch(e) { setErr("Download failed — try right-clicking the card to save"); }
  };

  const shell = {
    minHeight:"100vh", width:"100vw", minWidth:"100vw", background:"#161616", color:"#fff",
    fontFamily:'"Outfit", system-ui, sans-serif',
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
  };

  if (phase === "card" && track) return (
    <div onClick={() => setSelectedElement(null)} style={{ ...shell, gap:24, padding:"36px 20px", justifyContent:"flex-start" }}>
      <div style={{ display:"flex", gap:24, alignItems:"flex-start", justifyContent:"center", flexWrap:"wrap", width:"100%" }}>
        <div style={{ display:"grid", gap:10, justifyItems:"center" }}>
          <SongCard
            track={track}
            cardRef={cardRef}
            custom={previewCustom}
            setCustom={setCustom}
            selected={selectedElement}
            setSelected={setSelectedElement}
          />
          <div style={{ color:"#666", fontSize:12, fontWeight:700 }}>
            Preview fixed at {PREVIEW_CARD_WIDTH} × {PREVIEW_CARD_HEIGHT}px · PNG exports at {formatCardDimensions(custom.cardWidth, custom.cardHeight)} ({formatInches(custom.cardWidth)} × {formatInches(custom.cardHeight)})
          </div>
        </div>
        <CustomizerPanel
          custom={custom}
          setCustom={setCustom}
          selected={selectedElement}
          setSelected={setSelectedElement}
          setErr={setErr}
        />
      </div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => { setPhase("search"); setTrack(null); setSelectedElement(null); setCustom(DEFAULT_CUSTOM); setLoading(false); if (!query.trim()) setResults([]); }} style={ghostBtn}>← Back</button>
        <button onClick={handleDownload} style={greenBtn}>⬇ Download PNG</button>
      </div>
      {err && <div style={{ color:"#ff6b6b", fontSize:13, maxWidth:620, textAlign:"center" }}>{err}</div>}
      <p style={{ color:"#333", fontSize:12, margin:0 }}>Tip: the preview keeps the same design proportions; width and height control the final PNG size.</p>
    </div>
  );

  return (
    <div style={{ ...shell, justifyContent:"flex-start" }}>
      <div style={{ width:"100%", maxWidth:580, padding:"36px 28px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:30 }}>
          <button type="button" onClick={goHome} style={{
            display:"inline-flex",
            alignItems:"center",
            gap:12,
            background:"transparent",
            border:"none",
            color:"#fff",
            padding:0,
            cursor:"pointer",
            fontFamily:'"Outfit", sans-serif',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1DB954"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <span style={{ fontWeight:900, fontSize:18, letterSpacing:"-0.5px" }}>card1fy</span>
          </button>
        </div>

        {err && <div style={{ color:"#ff6b6b", fontSize:13, marginBottom:14 }}>{err}</div>}

        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <input type="text" placeholder="Search songs, artists, albums…"
            value={query} onChange={e => { setQuery(e.target.value); setSearchVersion(v => v + 1); }}
            autoFocus
            style={{ ...inputStyle, fontSize:16 }}
            onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.35)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
          />
        </div>

        {loading && query.trim() && <div style={{ textAlign:"center", color:"#444", padding:"48px 0", fontSize:15 }}>
          Searching Spotify…
        </div>}

        {!loading && results.length === 0 && !query && (
          <div style={{ textAlign:"center", color:"#2a2a2a", padding:"64px 0", fontSize:15 }}>
            Search for a song to generate a card
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div style={{ textAlign:"center", color:"#444", padding:"48px 0" }}>No results found</div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:2, maxHeight:"calc(100vh - 190px)", overflowY:"auto", paddingRight:4 }}>
          {results.map(t => (
            <div key={t.id}
              onClick={() => { setCustom(DEFAULT_CUSTOM); setSelectedElement(null); setTrack(t); setPhase("card"); }}
              onMouseEnter={e => e.currentTarget.style.background = "#232323"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 12px",
                borderRadius:10, cursor:"pointer", transition:"background 0.12s", textAlign:"left" }}>
              <img src={t.album?.images?.[2]?.url || t.album?.images?.[0]?.url} alt=""
                style={{ width:52, height:52, borderRadius:6, objectFit:"cover", flexShrink:0,
                  background:"#1a1a1a" }}/>
              <div style={{ minWidth:0, flex:1, textAlign:"left" }}>
                <div style={{ fontWeight:700, fontSize:15, whiteSpace:"nowrap",
                  overflow:"hidden", textOverflow:"ellipsis", marginBottom:3, textAlign:"left" }}>
                  {t.name}
                </div>
                <div style={{ color:"#555", fontSize:13, whiteSpace:"nowrap",
                  overflow:"hidden", textOverflow:"ellipsis", display:"flex", alignItems:"center", gap:5 }}>
                  {t.explicit && (
                    <ExplicitIcon c="#666" sz={13} />
                  )}
                  <span style={{ minWidth:0, overflow:"hidden", textOverflow:"ellipsis" }}>{t.artists?.map(a=>a.name).join(", ")} · {t.album?.name}</span>
                </div>
              </div>
              <span style={{ color:"#333", fontSize:12, flexShrink:0, marginLeft:8 }}>
                {fmtMs(t.duration_ms)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
