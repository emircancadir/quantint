import assert from 'node:assert/strict';
import test from 'node:test';
import { safeRedirectPath } from '../src/lib/redirects';
import { normalizeSiteUrl } from '../src/lib/site-url-core';
import { parsePollIntervalMs } from '../src/lib/ticker/config';

test('site URL is normalized to an HTTP(S) origin', () => {
  assert.equal(normalizeSiteUrl('https://quantint.test/path/'), 'https://quantint.test');
  assert.equal(normalizeSiteUrl('javascript:alert(1)'), 'http://localhost:3000');
  assert.equal(normalizeSiteUrl(), 'http://localhost:3000');
});

test('redirect targets remain on the same origin', () => {
  assert.equal(safeRedirectPath('/admin', '/tr'), '/admin');
  assert.equal(safeRedirectPath('//evil.test', '/tr'), '/tr');
  assert.equal(safeRedirectPath('/\\evil.test', '/tr'), '/tr');
  assert.equal(safeRedirectPath('https://evil.test', '/tr'), '/tr');
  assert.equal(safeRedirectPath(null, '/tr'), '/tr');
});

test('ticker interval rejects unsafe operator values', () => {
  assert.equal(parsePollIntervalMs(undefined), 5 * 60_000);
  assert.equal(parsePollIntervalMs(''), 5 * 60_000);
  assert.equal(parsePollIntervalMs('0'), 60_000);
  assert.equal(parsePollIntervalMs('-2'), 60_000);
  assert.equal(parsePollIntervalMs('2.5'), 2.5 * 60_000);
  assert.equal(parsePollIntervalMs('1000'), 60 * 60_000);
  assert.equal(parsePollIntervalMs('not-a-number'), 5 * 60_000);
});
