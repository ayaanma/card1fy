import { SVG_FILES } from "../../data/svgFiles";

export function SvgIcon({ name, color, size = 24, style, square = false }) {
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
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        flexShrink: 0,
        lineHeight: 0,
        overflow: "visible",
        borderRadius: 0,
        background: "transparent",
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: raw }}
    />
  );
}

export function ShuffleIcon({ c, sz = 26 }) {
  return <SvgIcon name="shuffle.svg" color={c} size={sz} />;
}

export function PrevIcon({ c, sz = 26 }) {
  return <SvgIcon name="rewind.svg" color={c} size={sz} />;
}

export function NextIcon({ c, sz = 26 }) {
  return <SvgIcon name="skip.svg" color={c} size={sz} />;
}

export function RepeatIcon({ c, sz = 26 }) {
  return <SvgIcon name="loop.svg" color={c} size={sz} />;
}

export function ExplicitIcon({ c, sz = 14 }) {
  return <SvgIcon name="explicit.svg" color={c} size={sz} />;
}

export function PauseBtn({ fg, sz = 58 }) {
  return <SvgIcon name="pause.svg" color={fg} size={sz} square />;
}

export function EyedropperIcon({ c = "#aaa", sz = 18 }) {
  return <SvgIcon name="eyedropper.svg" color={c} size={sz} square />;
}
