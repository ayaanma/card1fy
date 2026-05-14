import { useCallback, useEffect, useRef, useState } from "react";
import "./styles/global.css";
import { CardEditorPage } from "./components/CardEditorPage";
import { SearchPage } from "./components/SearchPage";
import { DEFAULT_CUSTOM } from "./config/customization";
import { useExternalAssets } from "./hooks/useExternalAssets";
import { searchSpotifyTracks } from "./services/spotify";
import { shellStyle } from "./styles/sharedStyles";
import { cleanSongTitle } from "./utils/format";

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

  useExternalAssets();

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
      const tracks = await searchSpotifyTracks(trimmed, signal);
      if (!signal?.aborted) setResults(tracks);
    } catch (e) {
      if (e.name !== "AbortError") {
        setErr(e.message);
        setResults([]);
      }
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
    const timer = setTimeout(() => searchTracks(trimmed, controller.signal), 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, searchVersion, searchTracks, phase]);

  const handleSelectTrack = (nextTrack) => {
    setCustom(DEFAULT_CUSTOM);
    setSelectedElement(null);
    setTrack(nextTrack);
    setPhase("card");
  };

  const handleBack = () => {
    setPhase("search");
    setTrack(null);
    setSelectedElement(null);
    setCustom(DEFAULT_CUSTOM);
    setLoading(false);
    if (!query.trim()) setResults([]);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    if (!window.html2canvas) {
      setErr("Downloader still loading — try again in a second");
      return;
    }

    try {
      const sourceCanvas = await window.html2canvas(cardRef.current, {
        useCORS: true,
        scale: 4,
        backgroundColor: null,
        logging: false,
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
    } catch {
      setErr("Download failed — try right-clicking the card to save");
    }
  };

  if (phase === "card" && track) {
    return (
      <div style={{ ...shellStyle, justifyContent: "flex-start" }}>
        <CardEditorPage
          track={track}
          cardRef={cardRef}
          custom={custom}
          setCustom={setCustom}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          setErr={setErr}
          onBack={handleBack}
          onDownload={handleDownload}
          err={err}
        />
      </div>
    );
  }

  return (
    <div style={{ ...shellStyle, justifyContent: "flex-start" }}>
      <SearchPage
        query={query}
        setQuery={setQuery}
        bumpSearchVersion={() => setSearchVersion((v) => v + 1)}
        results={results}
        loading={loading}
        err={err}
        onSelectTrack={handleSelectTrack}
        onHome={goHome}
      />
    </div>
  );
}
