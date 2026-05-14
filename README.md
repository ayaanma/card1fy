# Cardify split file structure

Use `src/App.jsx` as your main React entry component.

Backend proxy file:

```txt
api/spotify-search.js
```

Add these environment variables in Vercel:

```txt
SPOTIFY_CLIENT_ID=your_cardify_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_cardify_spotify_client_secret
```

Recommended structure:

```txt
api/
  spotify-search.js
src/
  App.jsx
  components/
  config/
  data/
  hooks/
  services/
  styles/
  utils/
```

If your existing `main.jsx` imports `./App.jsx`, replace your current `src/App.jsx` with the one in this folder.
