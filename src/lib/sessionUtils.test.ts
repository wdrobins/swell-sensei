import assert from 'node:assert/strict';
import test from 'node:test';
import { getFitScoreVariant, getSpotId } from './sessionUtils.js';

test('maps a 1–10 planner score to the corresponding UI variant', () => {
  assert.equal(getFitScoreVariant(9), 'success');
  assert.equal(getFitScoreVariant(7), 'accent');
  assert.equal(getFitScoreVariant(5), 'warning');
  assert.equal(getFitScoreVariant(3), 'destructive');
});

test('reads both current and legacy stored spot identifiers', () => {
  assert.equal(getSpotId({ spotId: 'bells-beach' }), 'bells-beach');
  assert.equal(getSpotId({ spot_id: 'jan-juc' }), 'jan-juc');
  assert.equal(getSpotId({ spotId: 42 }), null);
});
