import type { Benchmark } from './benchmarks';
import { benchmarkRepository, semanticScholarId } from './metric-sources.mjs';

export const sortOptions = [
  { id: 'stars', label: 'Most starred' },
  { id: 'citations', label: 'Most cited' },
  { id: 'alphabetical', label: 'A–Z' },
] as const;
export type BenchmarkSort = (typeof sortOptions)[number]['id'];
export type Metric = {
  count: number;
  source: string;
  url: string;
  fetchedAt: string;
};
export type BenchmarkStats = { stars?: Metric; citations?: Metric };
export type StatsSnapshot = { benchmarks: Record<string, BenchmarkStats> };

export function readSort(value: string | null): BenchmarkSort {
  return sortOptions.find((option) => option.id === value)?.id ?? 'stars';
}

// Ignore old measurements if the linked repository or paper has changed.
export function getStats(
  benchmark: Benchmark,
  snapshot: StatsSnapshot,
): BenchmarkStats {
  const saved = snapshot.benchmarks[benchmark.id];
  const valid = (
    metric: Metric | undefined,
    source: string | null,
    host: string,
  ) => {
    if (
      !metric ||
      !source ||
      metric.source !== source ||
      !Number.isSafeInteger(metric.count) ||
      metric.count < 0 ||
      !Number.isFinite(Date.parse(metric.fetchedAt))
    )
      return undefined;
    try {
      const url = new URL(metric.url);
      return url.protocol === 'https:' && url.hostname === host
        ? metric
        : undefined;
    } catch {
      return undefined;
    }
  };
  return {
    stars: valid(saved?.stars, benchmarkRepository(benchmark), 'github.com'),
    citations: valid(
      saved?.citations,
      semanticScholarId(benchmark.paperUrl),
      'www.semanticscholar.org',
    ),
  };
}

export type BenchmarkGroup = {
  id: string;
  label: string;
  description?: string;
  benchmarks: Benchmark[];
};

export function groupBenchmarks(
  benchmarks: Benchmark[],
  sort: BenchmarkSort,
  snapshot: StatsSnapshot,
): BenchmarkGroup[] {
  const alphabetical = [...benchmarks].sort((a, b) =>
    a.name.localeCompare(b.name, 'en'),
  );
  if (sort === 'alphabetical')
    return alphabetical.length
      ? [{ id: 'all', label: 'All benchmarks', benchmarks: alphabetical }]
      : [];
  const ranked: Benchmark[] = [];
  const unavailable: Benchmark[] = [];
  const unlinked: Benchmark[] = [];
  for (const benchmark of alphabetical) {
    if (getStats(benchmark, snapshot)[sort] !== undefined)
      ranked.push(benchmark);
    else if (
      sort === 'stars' ? benchmarkRepository(benchmark) : benchmark.paperUrl
    )
      unavailable.push(benchmark);
    else unlinked.push(benchmark);
  }
  ranked.sort(
    (a, b) =>
      getStats(b, snapshot)[sort]!.count - getStats(a, snapshot)[sort]!.count,
  );
  return [
    {
      id: 'ranked',
      label:
        sort === 'stars'
          ? 'Most starred on GitHub'
          : 'Most cited on Semantic Scholar',
      description:
        'Highest count first. These signals measure attention, not benchmark quality.',
      benchmarks: ranked,
    },
    {
      id: 'unavailable',
      label:
        sort === 'stars'
          ? 'Star count unavailable'
          : 'Citation count unavailable',
      description:
        'A source is linked, but no count is available yet. Listed A–Z.',
      benchmarks: unavailable,
    },
    {
      id: 'unlinked',
      label:
        sort === 'stars' ? 'No linked GitHub repository' : 'No linked paper',
      description:
        'Popularity is unknown. These benchmarks may still be widely used. Listed A–Z.',
      benchmarks: unlinked,
    },
  ].filter((group) => group.benchmarks.length);
}
