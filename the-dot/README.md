# THE DOT v11

THE DOT is a dark public-story website with posts, discussions, an optional location marker, web music embeds, an admin area and a language switcher.

## What's new
- English is the default UI language.
- Language switcher: English, Deutsch, Español, Français.
- Real zoomable world map powered by MapLibre GL JS + OpenFreeMap vector tiles.
- Country, city, road and place labels come from the map data and become more detailed as you zoom.
- Click the map to place a post location; drag and scroll to navigate.
- No OpenStreetMap raster tile server is used, so the previous 403 tile error is avoided.
- Server-side IP logging works when the site is run through `server.js` instead of opening `index.html` directly.

## Run locally
Install Node.js 18+ and run:

```bash
npm start
```

Then open:

`http://localhost:8080`

Do **not** double-click `index.html` if you want server-side logging. Use the Node server.

## Make it public for everyone
The project is a Node.js web app. Deploy the whole `the-dot` folder to a Node-capable host (for example a VPS or a Node hosting service). The host must run:

```bash
npm start
```

and expose the assigned `PORT` environment variable. The included server already uses `process.env.PORT`.

For a public deployment, also set a strong secret:

```text
DOT_ADMIN_CODE=<your-private-admin-secret>
```

If your hosting provider sits behind a trusted reverse proxy and provides the real client IP in `X-Forwarded-For`, set:

```text
TRUST_PROXY=1
```

Only set `TRUST_PROXY=1` when the proxy is actually trusted; otherwise a visitor could spoof the forwarded IP header.

## Important limitation of this demo
Posts and chats are currently stored in each browser's `localStorage`, so the content is **not yet a shared global database**. The Node server provides server-side activity/IP logging and admin authentication, but a real multi-user THE DOT should move posts, chats, users and moderation state into a server database/API.

## Map provider
The map uses OpenFreeMap's public MapLibre style. OpenFreeMap states that its public instance is free, requires no API key, and uses OpenStreetMap data. Attribution is kept visible in the map UI.

## Privacy
IP addresses are personal data in many jurisdictions. If you publish THE DOT, provide a privacy notice, define a retention period, secure admin access and collect only what you actually need.
