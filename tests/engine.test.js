import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../src/levels.js';
import { findPath, makeBoard, runToEnd } from '../src/engine.js';

for (const level of LEVELS) {
  test(`level ${level.id} known solution finishes`, () => {
    const result = runToEnd(level, level.solution);
    assert.equal(result.status, 'success', result.reason);
    assert.equal(result.delivered, level.requiredPassengers);
  });
}

test('level 1 cannot route across an empty worksite', () => {
  const level = LEVELS[0];
  assert.equal(findPath(makeBoard(level, []), level.vehicles[0].start, level.vehicles[0].target, 'road'), null);
});

test('plain junction collides while signal control resolves the conflict', () => {
  const level = LEVELS[1];
  const unsafe = runToEnd(level, [{ col: 5, row: 3, type: 'intersection', rotation: 0 }]);
  const safe = runToEnd(level, level.solution);
  assert.equal(unsafe.status, 'failed');
  assert.match(unsafe.reason, /Collision/);
  assert.equal(safe.status, 'success');
});

test('level crossing collides while a bridge separates transport modes', () => {
  const level = LEVELS[3];
  const unsafe = level.solution.map(part => part.type === 'bridge' ? { ...part, type: 'levelCrossing' } : part);
  assert.equal(runToEnd(level, unsafe).status, 'failed');
  assert.equal(runToEnd(level, level.solution).status, 'success');
});
