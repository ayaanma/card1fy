import { useEffect } from "react";

export function useExternalAssets() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);

    const h2c = document.createElement("script");
    h2c.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    document.head.appendChild(h2c);

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
      if (h2c.parentNode) h2c.parentNode.removeChild(h2c);
    };
  }, []);
}
