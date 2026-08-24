# Trains Away

A browser transport-engineering puzzle with four complete opening levels. Place limited road and rail components on marked worksites, press **Run network**, and let the live simulation judge connectivity, signal timing, deadlocks, and collisions.

## Run

```powershell
npm start
```

Open `http://localhost:4173`. Run the deterministic level/engine checks with `npm test`.

## First four cases

1. **Three missing streets** — complete a broken bus route.
2. **Market hour** — choose signal control for two conflicting buses.
3. **The two platforms** — build a rail switch and two branches.
4. **Harbor knot** — separate road and rail with a correctly oriented bridge.

Controls: click to fit, `R` to rotate, right-click to remove, and `Space` to run or stop.
