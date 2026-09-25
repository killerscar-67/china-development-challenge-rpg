# Structure

- `client/src/App.tsx` — app shell, theme provider, and page mount.
- `client/src/pages/Home.tsx` — text-RPG state machine, narrative scenes, scoring, and UI components.
- `client/src/index.css` — design system, responsive layout, colors, typography, and game UI styling.
- `client/index.html` — metadata and font loading.
- `PLAN.md`, `STRUCTURE.md`, `MEMORY.md`, `ASSETS.md` — resumability and production notes.

The game is intentionally client-only. Gameplay is plain React state because the simulation is a deterministic interaction model rather than a real-time 3D world.
