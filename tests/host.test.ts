import test from 'node:test';
import assert from 'node:assert/strict';
import {parseLevelParam} from '../src/host.ts';
import {FREEFORM_LEVELS} from '../src/freeform/campaign.ts';

test('?level=N maps to an authored campaign map, otherwise null', () => {
  const n = FREEFORM_LEVELS.length;
  assert.equal(n, 24);
  assert.equal(parseLevelParam('?level=1', n), 0);
  assert.equal(parseLevelParam('?level=24', n), 23);
  assert.equal(FREEFORM_LEVELS[parseLevelParam('?level=9', n)!].id, 9);
  for (const bad of ['', '?level=0', '?level=25', '?level=-2', '?level=2.5', '?level=abc', '?stage=3']) assert.equal(parseLevelParam(bad, n), null, bad);
});
