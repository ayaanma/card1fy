export async function searchSpotifyTracks(searchQuery, signal) {
  const trimmed = searchQuery.trim();
  if (!trimmed) return [];

  const res = await fetch(`/api/spotify-search?q=${encodeURIComponent(trimmed)}`, { signal });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.error) {
    throw new Error(data.error || data.message || `Search failed (${res.status})`);
  }

  return data.tracks || [];
}
