# Eclipse Frontier — The Shattered Verge

A small, original browser action RPG prototype created in an otherwise empty workspace. The 3D scene uses procedural Three.js geometry and original UI artwork built from CSS. No downloaded game assets are included.

## What is implemented

- A title screen and a walkable, third-person 3D clearing with a forest path, distant ridges, an old waystone, and sunshards.
- Keyboard movement, mouse-drag camera orbit, a short dodge with stamina, and a close-range blade attack.
- A simple enemy that notices and follows the player, attacks nearby, loses health when hit, and drops a shard when defeated.
- Vitality and stamina meters, an enemy health bar, a three-shard quest counter, and pickup notifications.

This is a single-player prototype. It does not include multiplayer, accounts, saved progression, or a backend. There was no pre-existing game, source, or title artwork in this workspace, so existing behavior could not be inspected or preserved.

## Initial project audit

- **Existing features before this pass:** none found; the workspace contained only an empty `.git` directory.
- **Existing game bugs:** none could be confirmed because there was no game to run.
- **Prototype limitations:** combat is a single-hit attack rather than a combo system; there is one enemy type and one small area; there is no inventory, equipment, persistence, audio, settings menu, dungeon, or multiplayer.
- **Verification:** JavaScript syntax was checked with `node --check`. The local HTTP server was started, but opening its URL in the browser was denied by the browser-origin approval gate. I therefore could not visually inspect the rendered game or test its controls in-browser and do not claim that gameplay has been browser-verified.

## Run locally

The page uses JavaScript modules, so serve the folder over HTTP rather than opening `index.html` directly.

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`. Three.js and the display font are loaded from public CDNs, so first load needs an internet connection.

## Deploy to Vercel

Import the repository into Vercel and use the **Other** framework preset with no build command and `.` as the output directory. The static `index.html`, `styles.css`, and `game.js` files are served as-is. A `vercel.json` file supplies the static rewrite.

## Multiplayer architecture (separate roadmap)

Keep the browser as a rendering and input client. Use a dedicated authoritative game service (for example, Nakama or a custom Colyseus/Node service) for movement validation, combat results, parties, and dungeon instances over WebSockets. Store accounts and durable character inventory/progression in PostgreSQL; use Redis for ephemeral presence, matchmaking, and short-lived shared world state. Validate item and reward grants server-side, and use a transactional event log/outbox for durable progression. Vercel can continue serving the static client, while the realtime game service runs on infrastructure designed for persistent WebSocket connections. This is a proposal only; none of those services are connected.

