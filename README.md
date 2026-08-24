# Trains Away

A browser transport-engineering puzzle with a 20-level campaign. Place limited road and rail components on marked worksites, press **Run route**, and let the live simulation judge connectivity, direction, vehicle access, signal timing, deadlocks, and collisions.

## Run

```powershell
npm start
```

Open `http://localhost:4173`. Run the deterministic level/engine checks with `npm test`.

## Campaign

1. **Three missing streets** — complete a broken bus route.
2. **Market hour** — choose signal control for two conflicting buses.
3. **The two platforms** — build a rail switch and two branches.
4. **Harbor knot** — separate road and rail with a correctly oriented bridge.

Levels 5–20 use authored layouts rather than repeated templates: diversions, one-way climbs, bus-priority bypasses, multi-junction signal corridors, tram streets, station throats, gated crossings, rail interlockings, combined geometry, and multimodal capstones.

Controls: click to fit, `R` to rotate, right-click to remove, and `Space` to run or stop.
