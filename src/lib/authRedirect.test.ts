import assert from 'node:assert/strict';
import test from 'node:test';
import { getAuthRedirectUrl } from './authRedirect.js';

test('builds the GitHub Pages reset-password redirect URL', () => {
  assert.equal(
    getAuthRedirectUrl('https://wdrobins.github.io', '/swell-sensei/', 'reset-password'),
    'https://wdrobins.github.io/swell-sensei/reset-password',
  );
});

test('keeps local development reset links under the local app base', () => {
  assert.equal(
    getAuthRedirectUrl('http://localhost:8080', '/', 'reset-password'),
    'http://localhost:8080/reset-password',
  );
});
