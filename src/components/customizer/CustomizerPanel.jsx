import { useState } from "react";
import { DEFAULT_CUSTOM } from "../../config/customization";
import { ghostBtn } from "../../styles/sharedStyles";
import { ColorRow, SizeSlider, UnitSizeSlider } from "./Controls";

export function CustomizerPanel({ custom, setCustom, selected, setSelected, setErr }) {
  const [units, setUnits] = useState({
    cardWidth: "px",
    cardHeight: "px",
    sidePadding: "px",
    iconGap: "px",
  });

  const update = (key, value) => setCustom((prev) => ({ ...prev, [key]: value }));
  const setUnit = (key, value) => setUnits((prev) => ({ ...prev, [key]: value }));

  const pickColor = async (key, autoKey) => {
    try {
      if (!window.EyeDropper) {
        setErr("Your browser does not support the eyedropper API. Use the color picker instead.");
        return;
      }
      const result = await new window.EyeDropper().open();
      setCustom((prev) => ({ ...prev, [autoKey]: false, [key]: result.sRGBHex }));
    } catch {}
  };

  const selectedSliders = {
    image: <SizeSlider label="Image size" value={custom.imageSize} min={60} max={100} onChange={(v) => update("imageSize", v)} />,
    title: <SizeSlider label="Title size" value={custom.titleSize} min={14} max={56} onChange={(v) => update("titleSize", v)} />,
    artist: <SizeSlider label="Artist / E label size" value={custom.artistSize} min={10} max={34} onChange={(v) => update("artistSize", v)} />,
    progress: <SizeSlider label="Progress bar thickness" value={custom.progressHeight} min={1} max={10} step={0.5} onChange={(v) => update("progressHeight", v)} />,
    time: <SizeSlider label="Timestamp size" value={custom.timeSize} min={8} max={24} onChange={(v) => update("timeSize", v)} />,
    icons: (
      <>
        <SizeSlider label="Side icon size" value={custom.iconSize} min={16} max={58} onChange={(v) => update("iconSize", v)} />
        <SizeSlider label="Pause button size" value={custom.centerButtonSize} min={36} max={100} onChange={(v) => update("centerButtonSize", v)} />
        <UnitSizeSlider label="Space between icons" valuePx={custom.iconGap} minPx={4} maxPx={56} stepPx={1} unit={units.iconGap} onUnitChange={(v) => setUnit("iconGap", v)} onChangePx={(v) => update("iconGap", v)} />
      </>
    ),
  };

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: "100%", background: "#111", border: "1px solid #252525", borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, letterSpacing: "-0.4px" }}>Customize</h2>
        <button onClick={() => { setCustom(DEFAULT_CUSTOM); setSelected(null); }} style={{ ...ghostBtn, padding: "6px 10px", fontSize: 11 }}>Reset</button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <ColorRow label="Background color" value={custom.backgroundColor} onColor={(v) => setCustom((prev) => ({ ...prev, useAutoBg: false, backgroundColor: v }))} onPick={() => pickColor("backgroundColor", "useAutoBg")} />
        <ColorRow label="Text + icon color" value={custom.textColor} onColor={(v) => setCustom((prev) => ({ ...prev, useAutoText: false, textColor: v }))} onPick={() => pickColor("textColor", "useAutoText")} />

        <div style={{ height: 1, background: "#252525" }} />
        <div style={{ color: "#777", fontSize: 12, lineHeight: 1.5 }}>
          Click the album, title, artist line, progress bar, timestamps, or icons on the card to edit that element's size.
        </div>

        {selected ? (
          <div style={{ display: "grid", gap: 12, background: "#0b0b0b", border: "1px solid #222", borderRadius: 12, padding: 12 }}>
            <div style={{ color: "#1DB954", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>Editing {selected}</div>
            {selectedSliders[selected]}
          </div>
        ) : (
          <div style={{ color: "#555", fontSize: 12, background: "#0b0b0b", border: "1px solid #222", borderRadius: 12, padding: 12 }}>No element selected yet.</div>
        )}

        <div style={{ height: 1, background: "#252525" }} />
        <UnitSizeSlider label="Whole card width" valuePx={custom.cardWidth} minPx={192} maxPx={576} stepPx={1} unit={units.cardWidth} onUnitChange={(v) => setUnit("cardWidth", v)} onChangePx={(v) => update("cardWidth", v)} />
        <UnitSizeSlider label="Whole card height" valuePx={custom.cardHeight} minPx={288} maxPx={864} stepPx={1} unit={units.cardHeight} onUnitChange={(v) => setUnit("cardHeight", v)} onChangePx={(v) => update("cardHeight", v)} />
        <UnitSizeSlider label="Side spacing" valuePx={custom.sidePadding} minPx={10} maxPx={54} stepPx={1} unit={units.sidePadding} onUnitChange={(v) => setUnit("sidePadding", v)} onChangePx={(v) => update("sidePadding", v)} />
      </div>
    </div>
  );
}
