import { COLS, ROWS, PIECES } from './levels.js';

export const DIRS = [
  { name: 'N', dc: 0, dr: -1, opposite: 'S' },
  { name: 'E', dc: 1, dr: 0, opposite: 'W' },
  { name: 'S', dc: 0, dr: 1, opposite: 'N' },
  { name: 'W', dc: -1, dr: 0, opposite: 'E' }
];

export const key = (col, row) => `${col},${row}`;

export function networksFor(tile) {
  if (!tile) return {};
  if (tile.type === 'terminal') {
    const dirs = tile.rotation % 2 ? ['E', 'W'] : ['N', 'S'];
    return { [tile.family]: dirs };
  }
  const def = PIECES[tile.type];
  if (!def) return {};
  const r = ((tile.rotation || 0) % 4 + 4) % 4;
  if (def.kind === 'straight') return { [def.family]: r % 2 ? ['E', 'W'] : ['N', 'S'] };
  if (def.kind === 'curve') return { [def.family]: [['N', 'E'], ['E', 'S'], ['S', 'W'], ['W', 'N']][r] };
  if (def.kind === 'intersection' || def.kind === 'signal') return { road: ['N', 'E', 'S', 'W'] };
  if (def.kind === 'switch') return { rail: [['N', 'E', 'W'], ['N', 'E', 'S'], ['E', 'S', 'W'], ['N', 'S', 'W']][r] };
  if (def.kind === 'crossing' || def.kind === 'bridge') {
    return r % 2 ? { road: ['N', 'S'], rail: ['E', 'W'] } : { road: ['E', 'W'], rail: ['N', 'S'] };
  }
  return {};
}

export function makeBoard(level, placements = []) {
  const cells = new Map();
  level.fixed.forEach(tile => cells.set(key(tile.col, tile.row), { ...tile }));
  placements.forEach(tile => cells.set(key(tile.col, tile.row), { ...tile, locked: false }));
  return cells;
}

export function remainingInventory(level, placements) {
  const remaining = { ...level.inventory };
  placements.forEach(part => { if (part.type in remaining) remaining[part.type] -= 1; });
  return remaining;
}

export function connectedNeighbors(board, col, row, mode) {
  const here = networksFor(board.get(key(col, row)))[mode] || [];
  const output = [];
  for (const dir of DIRS) {
    if (!here.includes(dir.name)) continue;
    const nc = col + dir.dc;
    const nr = row + dir.dr;
    if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
    const there = networksFor(board.get(key(nc, nr)))[mode] || [];
    if (there.includes(dir.opposite)) output.push({ col: nc, row: nr, direction: dir.name });
  }
  return output;
}

export function findPath(board, start, target, mode) {
  const queue = [{ ...start, path: [{ ...start }] }];
  const seen = new Set([key(start.col, start.row)]);
  while (queue.length) {
    const current = queue.shift();
    if (current.col === target.col && current.row === target.row) return current.path;
    for (const next of connectedNeighbors(board, current.col, current.row, mode)) {
      const id = key(next.col, next.row);
      if (seen.has(id)) continue;
      seen.add(id);
      queue.push({ ...next, path: [...current.path, { col: next.col, row: next.row }] });
    }
  }
  return null;
}

function isSignalBlocked(tile, from, to, tick) {
  if (PIECES[tile?.type]?.kind !== 'signal') return false;
  const horizontal = from.row === to.row;
  const horizontalGreen = Math.floor(tick / 3) % 2 === 0;
  return horizontal !== horizontalGreen;
}

function sharesGrade(tile, a, b) {
  return PIECES[tile?.type]?.kind === 'bridge' && a.mode !== b.mode;
}

export function createSimulation(level, placements) {
  const board = makeBoard(level, placements);
  return {
    level, board, tick: 0, delivered: 0, idleTicks: 0, status: 'running', reason: '',
    vehicles: level.vehicles.map(vehicle => ({ ...vehicle, col: vehicle.start.col, row: vehicle.start.row, active: false, done: false, waiting: false }))
  };
}

export function stepSimulation(sim) {
  if (sim.status !== 'running') return sim;
  const { level, board } = sim;
  sim.vehicles.forEach(vehicle => {
    if (!vehicle.active && !vehicle.done && vehicle.spawn <= sim.tick) vehicle.active = true;
    vehicle.waiting = false;
  });

  const active = sim.vehicles.filter(v => v.active && !v.done);
  const proposals = [];
  for (const vehicle of active) {
    if (vehicle.col === vehicle.target.col && vehicle.row === vehicle.target.row) continue;
    const path = findPath(board, vehicle, vehicle.target, vehicle.mode);
    if (!path || path.length < 2) {
      vehicle.waiting = true;
      continue;
    }
    const next = path[1];
    const tile = board.get(key(next.col, next.row));
    if (isSignalBlocked(tile, vehicle, next, sim.tick)) {
      vehicle.waiting = true;
      continue;
    }
    proposals.push({ vehicle, from: { col: vehicle.col, row: vehicle.row }, to: next });
  }

  for (let i = 0; i < proposals.length; i += 1) {
    for (let j = i + 1; j < proposals.length; j += 1) {
      const a = proposals[i];
      const b = proposals[j];
      const sameDestination = a.to.col === b.to.col && a.to.row === b.to.row;
      const edgeSwap = a.to.col === b.from.col && a.to.row === b.from.row && b.to.col === a.from.col && b.to.row === a.from.row;
      const tile = board.get(key(a.to.col, a.to.row));
      if ((sameDestination || edgeSwap) && !sharesGrade(tile, a.vehicle, b.vehicle)) {
        sim.status = 'failed';
        sim.reason = `Collision at grid ${a.to.col + 1}.${a.to.row + 1}. Both movements claimed the same space.`;
        return sim;
      }
    }
  }

  let moved = 0;
  for (const proposal of proposals) {
    const occupant = active.find(other => other !== proposal.vehicle && other.col === proposal.to.col && other.row === proposal.to.row);
    const occupantMoving = proposals.some(candidate => candidate.vehicle === occupant);
    const tile = board.get(key(proposal.to.col, proposal.to.row));
    if (occupant && !occupantMoving && !sharesGrade(tile, proposal.vehicle, occupant)) {
      proposal.vehicle.waiting = true;
      continue;
    }
    proposal.vehicle.col = proposal.to.col;
    proposal.vehicle.row = proposal.to.row;
    moved += 1;
  }

  for (const vehicle of active) {
    if (vehicle.col === vehicle.target.col && vehicle.row === vehicle.target.row) {
      vehicle.done = true;
      vehicle.active = false;
      sim.delivered += vehicle.passengers;
    }
  }

  sim.idleTicks = moved ? 0 : sim.idleTicks + 1;
  sim.tick += 1;
  if (sim.delivered >= level.requiredPassengers) {
    sim.status = 'success';
    sim.reason = level.success;
  } else if (sim.idleTicks >= 7) {
    sim.status = 'failed';
    sim.reason = 'Network deadlock. No vehicle has moved for seven dispatch cycles.';
  } else if (sim.tick >= level.maxTicks) {
    sim.status = 'failed';
    sim.reason = `Service window closed with ${sim.delivered}/${level.requiredPassengers} passengers delivered.`;
  }
  return sim;
}

export function runToEnd(level, placements, limit = 100) {
  const sim = createSimulation(level, placements);
  while (sim.status === 'running' && sim.tick < limit) stepSimulation(sim);
  return sim;
}
