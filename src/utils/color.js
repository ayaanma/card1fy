export function getDominantColor(img) {
  try {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 80;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, 80, 80);
    const { data } = cx.getImageData(0, 0, 80, 80);
    const buckets = {};

    for (let i = 0; i < data.length; i += 4) {
      const key = `${data[i] >> 4},${data[i + 1] >> 4},${data[i + 2] >> 4}`;
      if (!buckets[key]) buckets[key] = { n: 0, r: 0, g: 0, b: 0 };
      buckets[key].n++;
      buckets[key].r += data[i];
      buckets[key].g += data[i + 1];
      buckets[key].b += data[i + 2];
    }

    const best = Object.values(buckets).reduce((a, b) => (b.n > a.n ? b : a));
    return { r: (best.r / best.n) | 0, g: (best.g / best.n) | 0, b: (best.b / best.n) | 0 };
  } catch {
    return { r: 25, g: 25, b: 25 };
  }
}

export function luminance(r, g, b) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const n = parseInt(clean.length === 3 ? clean.split("").map((x) => x + x).join("") : clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("")}`;
}
