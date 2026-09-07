import {
  appendFile,
  readFile,
  readdir,
  rename,
  writeFile,
} from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import {
  benchmarkRepository,
  semanticScholarId,
} from '../lib/metric-sources.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const snapshotPath = resolve(root, 'data/benchmark-stats.json');

async function requestJson(url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) return response.json();
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      const retryAfter = Number(response.headers.get('retry-after'));
      await delay(
        Math.min(10000, Math.max(2000 * (attempt + 1), retryAfter * 1000)),
      );
      continue;
    }
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      rateLimited:
        response.status === 429 ||
        (response.status === 403 &&
          (response.headers.get('x-ratelimit-remaining') === '0' ||
            response.headers.has('retry-after'))),
    });
  }
}

export function measurement(count, source, url, fetchedAt) {
  if (!Number.isSafeInteger(count) || count < 0)
    throw new Error('Invalid count');
  return { count, source, url, fetchedAt };
}

export function retainMatching(previous, source) {
  return source && previous?.source === source ? previous : undefined;
}

export async function refreshStats() {
  const files = (await readdir(resolve(root, 'data/benchmarks')))
    .filter((name) => name.endsWith('.json'))
    .sort();
  const benchmarks = await Promise.all(
    files.map(async (name) =>
      JSON.parse(
        await readFile(resolve(root, 'data/benchmarks', name), 'utf8'),
      ),
    ),
  );
  const previous = JSON.parse(await readFile(snapshotPath, 'utf8'));
  const fetchedAt = new Date().toISOString();
  const next = { benchmarks: {} };
  const repositories = new Map();
  const papers = new Map();
  for (const benchmark of benchmarks) {
    const repository = benchmarkRepository(benchmark);
    const paper = semanticScholarId(benchmark.paperUrl);
    next.benchmarks[benchmark.id] = {
      stars: retainMatching(
        previous.benchmarks[benchmark.id]?.stars,
        repository,
      ),
      citations: retainMatching(
        previous.benchmarks[benchmark.id]?.citations,
        paper,
      ),
    };
    if (repository) repositories.set(repository, undefined);
    if (paper) papers.set(paper, undefined);
  }

  // Fetch each repository once, including repositories shared by several entries.
  const githubHeaders = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN)
    githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  for (const repository of repositories.keys()) {
    try {
      const data = await requestJson(
        `https://api.github.com/repos/${repository}`,
        { headers: githubHeaders },
      );
      repositories.set(
        repository,
        measurement(
          data.stargazers_count,
          repository,
          `https://github.com/${repository}`,
          fetchedAt,
        ),
      );
    } catch (error) {
      console.warn(
        `GitHub ${repository}: ${error.message}; retaining any previous count.`,
      );
      if (error.rateLimited) {
        console.warn(
          'GitHub rate limit reached; keeping saved counts for the remaining repositories.',
        );
        break;
      }
    }
  }

  // Batch exact paper identifiers. Never guess a paper from a title search.
  const paperIds = [...papers.keys()];
  const scholarHeaders = { 'Content-Type': 'application/json' };
  if (process.env.SEMANTIC_SCHOLAR_API_KEY)
    scholarHeaders['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
  for (let offset = 0; offset < paperIds.length; offset += 100) {
    const ids = paperIds.slice(offset, offset + 100);
    try {
      const data = await requestJson(
        'https://api.semanticscholar.org/graph/v1/paper/batch?fields=paperId,citationCount',
        {
          method: 'POST',
          headers: scholarHeaders,
          body: JSON.stringify({ ids }),
        },
      );
      if (!Array.isArray(data) || data.length !== ids.length)
        throw new Error('Invalid batch response');
      for (const [index, paper] of data.entries()) {
        if (
          !paper ||
          !/^[a-f0-9]{40}$/.test(paper.paperId ?? '') ||
          !Number.isSafeInteger(paper.citationCount) ||
          paper.citationCount < 0
        ) {
          console.warn(
            `Semantic Scholar ${ids[index]}: no indexed citation count; retaining any previous count.`,
          );
          continue;
        }
        papers.set(
          ids[index],
          measurement(
            paper.citationCount,
            ids[index],
            `https://www.semanticscholar.org/paper/${paper.paperId}`,
            fetchedAt,
          ),
        );
      }
    } catch (error) {
      console.warn(
        `Semantic Scholar: ${error.message}; retaining any previous counts.`,
      );
    }
  }

  for (const benchmark of benchmarks) {
    const entry = next.benchmarks[benchmark.id];
    const stars = repositories.get(benchmarkRepository(benchmark));
    const citations = papers.get(semanticScholarId(benchmark.paperUrl));
    if (stars) entry.stars = stars;
    if (citations) entry.citations = citations;
  }
  // Atomic replacement; an interrupted refresh leaves the last snapshot intact.
  await writeFile(`${snapshotPath}.tmp`, `${JSON.stringify(next, null, 2)}\n`);
  await rename(`${snapshotPath}.tmp`, snapshotPath);
  console.log(
    `Refreshed ${[...repositories.values()].filter(Boolean).length}/${repositories.size} repositories and ${[...papers.values()].filter(Boolean).length}/${papers.size} papers. Saved data/benchmark-stats.json.`,
  );
  if (process.env.GITHUB_STEP_SUMMARY) {
    const entries = Object.values(next.benchmarks);
    await appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      [
        '### Benchmark stats refresh',
        '',
        `Attempted at ${fetchedAt}.`,
        '',
        '| Source | Refreshed this run | Entries with a saved count |',
        '| --- | --- | --- |',
        `| GitHub | ${[...repositories.values()].filter(Boolean).length}/${repositories.size} repositories | ${entries.filter((entry) => entry.stars).length}/${entries.length} |`,
        `| Semantic Scholar | ${[...papers.values()].filter(Boolean).length}/${papers.size} papers | ${entries.filter((entry) => entry.citations).length}/${entries.length} |`,
        '',
        'Shared repositories are fetched once. If a lookup failed, its previous count and retrieval date were retained. See the refresh log for details.',
        '',
      ].join('\n'),
    );
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  refreshStats().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
