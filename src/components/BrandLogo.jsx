export function BrandLogo({ onClick, size = 24 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        background: "transparent",
        border: "none",
        color: "#fff",
        padding: 0,
        cursor: "pointer",
        fontFamily: '"Outfit", sans-serif',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.5px" }}>cardify</span>
    </button>
  );
}
