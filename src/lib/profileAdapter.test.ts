import assert from 'node:assert/strict';
import test from 'node:test';
import { isProfileComplete, toSurferProfile } from './profileAdapter.js';

test('uses the signed-in surfer’s saved experience and wave preference', () => {
  const profile = toSurferProfile({
    user_id: 'user-a',
    display_name: 'Alex',
    skill_level: 'advanced',
    experience_years: 8,
    preferred_wave_size: 'overhead',
  });

  assert.equal(profile.name, 'Alex');
  assert.equal(profile.yearsSurfing, 8);
  assert.equal(profile.comfortableWaveSize, 'overhead');
  assert.ok(profile.experienceTypes.includes('reef'));
});

test('uses a conservative beginner fallback only when no profile has been saved', () => {
  const profile = toSurferProfile(null);

  assert.equal(profile.comfortableWaveSize, 'waist');
  assert.equal(profile.riskTolerance, 'conservative');
});

test('does not classify a trigger-created skeletal row as personalised', () => {
  assert.equal(isProfileComplete({
    user_id: 'user-b',
    display_name: 'New surfer',
    skill_level: null,
    experience_years: null,
    preferred_wave_size: null,
  }), false);
});

test('classifies a saved surf profile as personalised', () => {
  assert.equal(isProfileComplete({
    user_id: 'user-c',
    display_name: 'Taylor',
    skill_level: 'intermediate',
    experience_years: 3,
    preferred_wave_size: 'head',
  }), true);
});
