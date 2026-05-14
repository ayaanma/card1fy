import { UNIT_FACTORS } from "../config/customization";

export function fmtMs(ms) {
  const s = (ms / 1000) | 0;
  return `${(s / 60) | 0}:${(s % 60).toString().padStart(2, "0")}`;
}

export function pxToUnit(px, unit) {
  return px / (UNIT_FACTORS[unit] || 1);
}

export function unitToPx(value, unit) {
  return value * (UNIT_FACTORS[unit] || 1);
}

export function formatUnitValue(value, unit) {
  if (unit === "px") {
    return String(Math.round(value * 1000) / 1000)
      .replace(/\.0+$/, "")
      .replace(/(\.\d*?)0+$/, "$1");
  }
  if (Math.abs(value) >= 10) return value.toFixed(2).replace(/\.00$/, "");
  if (Math.abs(value) >= 1) return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatCardDimensions(widthPx, heightPx) {
  return `${Math.round(widthPx)} × ${Math.round(heightPx)} px`;
}

export function formatInches(px) {
  return `${formatUnitValue(pxToUnit(px, "in"), "in")} in`;
}

export function cleanSongTitle(title = "") {
  return title
    .replace(/\s*\((feat\.|featuring|with)\s+[^)]*\)\s*/gi, "")
    .replace(/\s*\[(feat\.|featuring|with)\s+[^\]]*\]\s*/gi, "")
    .trim();
}
