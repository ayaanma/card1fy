import { useEffect, useRef, useState } from "react";
import { FIELD_BG, FIELD_BORDER, UNIT_FACTORS, UNIT_OPTIONS } from "../../config/customization";
import { formatUnitValue, pxToUnit, unitToPx } from "../../utils/format";
import { EyedropperIcon } from "../icons/Icons";
import { ghostBtn, inputStyle } from "../../styles/sharedStyles";

export function UnitDropdown({ value, onChange }) {
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

  const current = UNIT_OPTIONS.find((opt) => opt.value === value)?.label || value;

  return (
    <div ref={boxRef} style={{ position: "relative", width: 66, flexShrink: 0 }}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} style={{ width: "100%", background: FIELD_BG, border: FIELD_BORDER, borderRadius: 8, color: "#fff", padding: "4px 7px", fontSize: 12, fontWeight: 700, outline: "none", fontFamily: '"Outfit", sans-serif', cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 5 }}>
        <span>{current}</span>
        <span style={{ color: "#777", fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▾</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, boxShadow: "0 16px 40px rgba(0,0,0,0.45)", padding: 4, zIndex: 9999 }}>
          {UNIT_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              style={{ width: "100%", background: opt.value === value ? "rgba(255,255,255,0.12)" : "transparent", color: opt.value === value ? "#fff" : "#aaa", border: "none", borderRadius: 7, padding: "7px 8px", fontSize: 12, fontWeight: 800, fontFamily: '"Outfit", sans-serif', cursor: "pointer", textAlign: "left" }}
              onMouseEnter={(e) => {
                if (opt.value !== value) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={(e) => {
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

export function SizeSlider({ label, value, min, max, step = 1, onChange }) {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const commit = (raw) => {
    const n = Number(raw);
    if (!Number.isNaN(n)) onChange(clamp(n));
  };

  return (
    <label style={{ display: "grid", gap: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, color: "#ccc", fontSize: 12, fontWeight: 700 }}>
        <span style={{ whiteSpace: "nowrap" }}>{label}</span>
        <input type="number" min={min} max={max} step={step} value={value} onChange={(e) => commit(e.target.value)} style={{ width: 70, background: FIELD_BG, border: FIELD_BORDER, borderRadius: 8, color: "#fff", padding: "4px 7px", fontSize: 12, fontWeight: 700, outline: "none", fontFamily: '"Outfit", sans-serif', textAlign: "right" }} />
      </div>
      <input className="songcard-range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%" }} />
    </label>
  );
}

export function UnitSizeSlider({ label, valuePx, minPx, maxPx, stepPx = 1, unit, onUnitChange, onChangePx }) {
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
    <label style={{ display: "grid", gap: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, color: "#ccc", fontSize: 12, fontWeight: 700 }}>
        <span style={{ whiteSpace: "nowrap" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="text"
            inputMode="decimal"
            value={typedValue}
            onFocus={() => setIsTyping(true)}
            onChange={(e) => {
              const raw = e.target.value;
              if (/^-?\d*\.?\d*$/.test(raw)) setTypedValue(raw);
            }}
            onBlur={finishTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setIsTyping(false);
                setTypedValue(formatUnitValue(displayValue, unit));
                e.currentTarget.blur();
              }
            }}
            style={{ width: 88, background: FIELD_BG, border: FIELD_BORDER, borderRadius: 8, color: "#fff", padding: "4px 7px", fontSize: 12, fontWeight: 700, outline: "none", fontFamily: '"Outfit", sans-serif', textAlign: "right" }}
          />
          <UnitDropdown value={unit} onChange={(nextUnit) => { setIsTyping(false); onUnitChange(nextUnit); }} />
        </div>
      </div>
      <input className="songcard-range" type="range" min={min} max={max} step={step} value={Math.min(max, Math.max(min, displayValue))} onChange={(e) => { setIsTyping(false); onChangePx(clampPx(unitToPx(Number(e.target.value), unit))); }} style={{ width: "100%" }} />
    </label>
  );
}

export function ColorRow({ label, value, onColor, onPick }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <span style={{ color: "#ccc", fontSize: 12, fontWeight: 800 }}>{label}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ width: 44, height: 38, borderRadius: 10, overflow: "hidden", border: FIELD_BORDER, background: FIELD_BG, flexShrink: 0 }}>
          <input type="color" value={value} onChange={(e) => onColor(e.target.value)} style={{ width: 54, height: 48, margin: -5, padding: 0, border: "none", background: "transparent", cursor: "pointer" }} />
        </div>
        <input type="text" value={value} onChange={(e) => onColor(e.target.value)} style={{ ...inputStyle, padding: "9px 10px", fontSize: 12, color: "#fff", borderRadius: 10 }} />
        <button type="button" onClick={onPick} aria-label="Eyedropper" title="Eyedropper" style={{ width: 38, minWidth: 38, height: 38, padding: 0, border: "none", background: "transparent", color: "#aaa", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <EyedropperIcon c="currentColor" sz={22} />
        </button>
      </div>
    </div>
  );
}
