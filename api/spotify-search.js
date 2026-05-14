// Vercel serverless function
// Save this file as: api/spotify-search.js
//
// Add these environment variables in Vercel:
// SPOTIFY_CLIENT_ID=your_cardify_spotify_client_id
// SPOTIFY_CLIENT_SECRET=your_cardify_spotify_client_secret

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getSpotifyToken() {
  const now = Date.now();

  if (cachedToken && now < cachedTokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variable.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error_description || data.error || `Spotify token failed (${res.status})`);
  }

  cachedToken = data.access_token;
  cachedTokenExpiresAt = now + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

function normalizeTrack(t) {
  const images = t.album?.images || [];

  return {
    id: t.id,
    name: t.name,
    explicit: Boolean(t.explicit),
    duration_ms: t.duration_ms,
    artists: (t.artists || []).map((a) => ({
      id: a.id,
      name: a.name,
      external_urls: a.external_urls || {},
    })),
    album: {
      id: t.album?.id,
      name: t.album?.name,
      images,
      external_urls: t.album?.external_urls || {},
    },
    external_urls: t.external_urls || {},
    preview_url: t.preview_url || null,
  };
}

export default async function handler(req, res) {
  try {
    const q = String(req.query.q || "").trim();

    if (!q) {
      return res.status(200).json({ tracks: [] });
    }

    const spotifyToken = await getSpotifyToken();

    const params = new URLSearchParams({
      q,
      type: "track",
      limit: "10",
      market: "US",
    });

    const spotifyRes = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    const data = await spotifyRes.json().catch(() => ({}));

    if (!spotifyRes.ok) {
      return res.status(spotifyRes.status).json({
        error: data.error?.message || `Spotify search failed (${spotifyRes.status})`,
      });
    }

    return res.status(200).json({
      tracks: (data.tracks?.items || []).map(normalizeTrack),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
