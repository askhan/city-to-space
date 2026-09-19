# City to Space

A colorful overhead driving game built with TypeScript, Vite, and Canvas.

## Run

Install Node.js 22.18+ (or 24+) and run:

```sh
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.
Open the localhost URL printed by Vite. To play on an iPad on the same Wi-Fi, open the printed Network URL and allow the dev server through the computer's firewall if needed.

## Controls

- Left/right arrows or touch buttons: steer.
- Up/down arrows or FAST/SLOW buttons: change speed while held.
- Pause button or Escape: pause/resume. Leaving the browser pauses automatically.
- SOUND ON/OFF: mute or unmute the engine and collision effects. Audio begins after tapping Let's drive; engine pitch follows speed and audio fades out when paused or finished. Sounds are synthesized locally with Web Audio, with no downloads required.

Person collisions also play a short synthesized cartoon scream. Other hazards retain the crunch/thump effect. The scream follows the same mute and pause controls.

Earn 10 points each second. Bumps cost 50 points, with one second of protection. Sky unlocks at 500, space at 1,000, and the journey finishes at 1,500. Stage unlocks persist during the run. Reloading or replaying resets progress.

Each stage alternates crossing characters, oncoming vehicles, and stationary obstacles:

- Green City: walking people, oncoming cars, and cones/barriers.
- Sky: flapping birds, oncoming propeller planes, and cones/barriers.
- Space: walking aliens, oncoming spaceships, and asteroids.

Crossing characters can enter from either side. Vehicles approach faster than the scrolling road. Waves stay separated so faster traffic cannot trap you against a crossing character. All contacts use the same forgiving point penalty and collision sound.

## Validate and build

```sh
npm test
npm run build
npm run preview
```

Production files are generated in `dist/`. No backend, external artwork, or account is required. Difficulty constants live in `src/game.ts`.

## Publish on GitHub Pages

GitHub Pages can host this static game for free from a public repository. This also makes the game's source public. No paid domain or server is needed.

1. Create a public repository in your GitHub account and push this project to its `main` branch, including `.github/workflows/deploy.yml`.
2. In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Open **Actions → Publish game to GitHub Pages → Run workflow** (future pushes to `main` publish automatically).
4. Wait for the workflow to succeed, then open the URL shown in **Settings → Pages**.

The workflow runs the gameplay tests and builds the game before publishing. Relative asset URLs support GitHub's repository subdirectory URLs. `dist/` can alternatively be uploaded to a static host such as Cloudflare Pages.

## Multiplayer direction (not implemented yet)

Keep Solo Adventure and add Race a Friend with a room code, two device connections, a shared countdown, matching obstacles, opponent positions, and a shared finish distance. Race collisions should slow the car as well as cost points so dodging affects the race outcome. A small authoritative WebSocket service should manage race state, validate inputs, and handle disconnects; each device should render smoothly between server updates. A multiplayer race should continue for the other player when one player backgrounds their browser. GitHub Pages can keep hosting the game client, but it cannot run this game server. Multiplayer requires its own backend deployment and cross-device testing.
