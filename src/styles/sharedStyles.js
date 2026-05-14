import { FIELD_BG, FIELD_BORDER } from "../config/customization";

export const shellStyle = {
  minHeight: "100vh",
  width: "100vw",
  minWidth: "100vw",
  background: "#161616",
  color: "#fff",
  fontFamily: '"Outfit", system-ui, sans-serif',
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

export const inputStyle = {
  flex: 1,
  background: FIELD_BG,
  border: FIELD_BORDER,
  borderRadius: 10,
  color: "#fff",
  padding: "14px 18px",
  fontSize: 15,
  outline: "none",
  fontFamily: '"Outfit", sans-serif',
  letterSpacing: "-0.1px",
  transition: "border-color 0.2s",
};

export const greenBtn = {
  background: "#1DB954",
  color: "#000",
  border: "none",
  borderRadius: 10,
  padding: "14px 26px",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  fontFamily: '"Outfit", sans-serif',
  whiteSpace: "nowrap",
  flexShrink: 0,
};

export const ghostBtn = {
  background: FIELD_BG,
  color: "#aaa",
  border: FIELD_BORDER,
  borderRadius: 10,
  padding: "12px 18px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: '"Outfit", sans-serif',
};
