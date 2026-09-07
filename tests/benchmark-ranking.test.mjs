import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getStats,
  groupBenchmarks,
  readSort,
} from '../lib/benchmark-ranking.ts';
import {
  benchmarkRepository,
  githubRepository,
  semanticScholarId,
} from '../lib/metric-sources.mjs';
import {
  measurement,
  retainMatching,
} from '../scripts/refresh-benchmark-stats.mjs';

const item = (id, extra = {}) => ({ id, name: id, ...extra });
const stars = (count, repo = 'owner/repo') =>
  measurement(
    count,
    repo,
    `https://github.com/${repo}`,
    '2026-09-07T00:00:00Z',
  );
const citations = (count) =>
  measurement(
    count,
    'ARXIV:2506.07982',
    'https://www.semanticscholar.org/paper/example',
    '2026-09-07T00:00:00Z',
  );
const ids = (group) => group.benchmarks.map((benchmark) => benchmark.id);

test('stars distinguish real zero, unavailable counts, and missing repositories', () => {
  const codeUrl = 'https://github.com/owner/repo';
  const input = ['Z', 'B', 'A', 'zero', 'pending'].map((id) =>
    item(id, { codeUrl }),
  );
  input.push(
    item('no-repo'),
    item('dataset', { codeUrl: 'https://huggingface.co/datasets/owner/data' }),
  );
  const snapshot = {
    benchmarks: {
      Z: { stars: stars(10) },
      B: { stars: stars(100) },
      A: { stars: stars(100) },
      zero: { stars: stars(0) },
    },
  };
  const groups = groupBenchmarks(input, 'stars', snapshot);
  assert.deepEqual(
    groups.map((g) => g.id),
    ['ranked', 'unavailable', 'unlinked'],
  );
  assert.deepEqual(groups.map(ids), [
    ['A', 'B', 'Z', 'zero'],
    ['pending'],
    ['dataset', 'no-repo'],
  ]);
  assert.equal(groups.flatMap((g) => g.benchmarks).length, input.length);
});

test('citations sort numerically and leave unindexed or unsupported papers visible', () => {
  const paperUrl = 'https://arxiv.org/abs/2506.07982';
  const input = [
    item('zero', { paperUrl }),
    item('cited', { paperUrl }),
    item('unindexed', { paperUrl }),
    item('unsupported', { paperUrl: 'https://example.com/paper' }),
    item('missing'),
  ];
  const groups = groupBenchmarks(input, 'citations', {
    benchmarks: {
      zero: { citations: citations(0) },
      cited: { citations: citations(12) },
    },
  });
  assert.deepEqual(groups.map(ids), [
    ['cited', 'zero'],
    ['unindexed', 'unsupported'],
    ['missing'],
  ]);
});

test('a changed source, invalid count, or invalid source URL cannot produce a badge', () => {
  const benchmark = item('a', { codeUrl: 'https://github.com/owner/new' });
  assert.equal(
    getStats(benchmark, { benchmarks: { a: { stars: stars(100) } } }).stars,
    undefined,
  );
  for (const invalid of [
    { ...stars(1), count: -1 },
    { ...stars(1), count: 1.5 },
    { ...stars(1), fetchedAt: 'invalid' },
    { ...stars(1), url: 'javascript:alert(1)' },
  ]) {
    assert.equal(
      getStats(item('a', { codeUrl: 'https://github.com/owner/repo' }), {
        benchmarks: { a: { stars: invalid } },
      }).stars,
      undefined,
    );
  }
});

test('failed refreshes retain original counts and dates only for the same source', () => {
  const previous = stars(42);
  assert.equal(retainMatching(previous, 'owner/repo'), previous);
  assert.equal(retainMatching(previous, 'owner/new'), undefined);
  assert.equal(retainMatching(previous, null), undefined);
  assert.throws(() => measurement(null, 'a', 'b', 'c'), /Invalid count/);
  assert.throws(() => measurement(-1, 'a', 'b', 'c'), /Invalid count/);
});

test('source parsing normalizes shared repos and versioned arXiv links', () => {
  assert.equal(
    githubRepository('https://github.com/Owner/Repo.git/tree/main'),
    'owner/repo',
  );
  assert.equal(githubRepository('https://github.com/owner'), null);
  assert.equal(githubRepository('https://example.com/owner/repo'), null);
  assert.equal(
    semanticScholarId('https://arxiv.org/pdf/2506.07982v2.pdf'),
    'ARXIV:2506.07982',
  );
  assert.equal(
    semanticScholarId('https://doi.org/10.1234/example'),
    'DOI:10.1234/example',
  );
  assert.equal(semanticScholarId('https://example.com/paper'), null);
});

test('empty categories and invalid sort URLs have stable defaults', () => {
  for (const sort of ['stars', 'citations', 'alphabetical']) {
    assert.deepEqual(groupBenchmarks([], sort, { benchmarks: {} }), []);
  }
  assert.equal(readSort('unknown'), 'stars');
  assert.equal(readSort(null), 'stars');
  assert.equal(readSort('featured'), 'stars');
  assert.equal(readSort('stars'), 'stars');
  assert.deepEqual(
    ids(
      groupBenchmarks([item('Z'), item('A')], 'alphabetical', {
        benchmarks: {},
      })[0],
    ),
    ['A', 'Z'],
  );
});

test('GitHub website links provide stars when the optional code link is absent', () => {
  const benchmark = item('website-only', {
    websiteUrl: 'https://github.com/Owner/Repo',
  });
  assert.equal(benchmarkRepository(benchmark), 'owner/repo');
  assert.equal(
    benchmarkRepository({
      ...benchmark,
      codeUrl: 'https://github.com/Owner/Preferred',
    }),
    'owner/preferred',
  );
  const snapshot = { benchmarks: { 'website-only': { stars: stars(9) } } };
  assert.deepEqual(groupBenchmarks([benchmark], 'stars', snapshot).map(ids), [
    ['website-only'],
  ]);
  assert.equal(
    groupBenchmarks([benchmark], 'stars', { benchmarks: {} })[0].id,
    'unavailable',
  );
});
