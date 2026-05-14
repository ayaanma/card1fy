import { CustomizerPanel } from "./customizer/CustomizerPanel";
import { SongCard } from "./SongCard";
import { formatCardDimensions, formatInches } from "../utils/format";
import { greenBtn, ghostBtn } from "../styles/sharedStyles";
import { PREVIEW_CARD_HEIGHT, PREVIEW_CARD_WIDTH } from "../config/customization";

export function CardEditorPage({ track, cardRef, custom, setCustom, selectedElement, setSelectedElement, setErr, onBack, onDownload, err }) {
  const previewCustom = {
    ...custom,
    cardWidth: PREVIEW_CARD_WIDTH,
    cardHeight: PREVIEW_CARD_HEIGHT,
  };

  return (
    <div onClick={() => setSelectedElement(null)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "36px 20px", justifyContent: "flex-start", width: "100%" }}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
        <div style={{ display: "grid", gap: 10, justifyItems: "center" }}>
          <SongCard track={track} cardRef={cardRef} custom={previewCustom} setCustom={setCustom} selected={selectedElement} setSelected={setSelectedElement} />
          <div style={{ color: "#666", fontSize: 12, fontWeight: 700 }}>
            Preview fixed at {PREVIEW_CARD_WIDTH} × {PREVIEW_CARD_HEIGHT}px · PNG exports at {formatCardDimensions(custom.cardWidth, custom.cardHeight)} ({formatInches(custom.cardWidth)} × {formatInches(custom.cardHeight)})
          </div>
        </div>
        <CustomizerPanel custom={custom} setCustom={setCustom} selected={selectedElement} setSelected={setSelectedElement} setErr={setErr} />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={onBack} style={ghostBtn}>← Back</button>
        <button onClick={onDownload} style={greenBtn}>⬇ Download PNG</button>
      </div>

      {err && <div style={{ color: "#ff6b6b", fontSize: 13, maxWidth: 620, textAlign: "center" }}>{err}</div>}
      <p style={{ color: "#333", fontSize: 12, margin: 0 }}>Tip: the preview keeps the same design proportions; width and height control the final PNG size.</p>
    </div>
  );
}
