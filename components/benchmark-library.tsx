import { useEffect } from 'react';
import {
  type Architecture,
  type Benchmark,
  type BenchmarkType,
  type CatalogCategory,
  type EvaluationMethod,
  type Openness,
  categories,
  categoryOptions,
} from '@/lib/benchmarks';

import snapshot from '@/data/benchmark-stats.json';
import {
  type BenchmarkSort,
  getStats,
  groupBenchmarks,
  sortOptions,
} from '@/lib/benchmark-ranking';
import { benchmarkRepository } from '@/lib/metric-sources.mjs';

const descriptions: Record<CatalogCategory, string> = {
  all: 'Discover benchmarks for every layer of your voice agent, from speech recognition to complete systems.',
  stt: 'Explore benchmarks for speech recognition models and transcription services.',
  tts: 'Explore benchmarks for speech quality, intelligibility, and natural-sounding voices.',
  'turn-taking':
    'Explore benchmarks for detecting speech, knowing when to respond, and handling interruptions.',
  llm: 'Explore benchmarks for the language models behind your voice agents: reasoning, tool use, and conversation.',
  s2s: 'Explore benchmarks that compare audio-native conversational models.',
  'voice-agents':
    'Explore benchmarks for complete voice agents, across cascaded, speech-to-speech, and hybrid systems.',
};

const architectureLabels: Record<Architecture, string> = {
  cascaded: 'Cascaded',
  'speech-to-speech': 'Speech-to-Speech',
  hybrid: 'Hybrid',
};

const benchmarkTypeLabels: Record<BenchmarkType, string> = {
  benchmark: 'Benchmark',
  leaderboard: 'Leaderboard',
  arena: 'Arena',
  framework: 'Framework',
  toolkit: 'Toolkit',
};

const evaluationMethodLabels: Record<EvaluationMethod, string> = {
  automatic: 'Automatic evaluation',
  deterministic: 'Deterministic evaluation',
  human: 'Human evaluation',
  'llm-judge': 'LLM judge',
  mixed: 'Mixed evaluation',
  unknown: 'Evaluation method unknown',
};

const opennessLabels: Record<Openness, string> = {
  open: 'Open',
  'partially-open': 'Partially open',
  closed: 'Closed',
  unknown: 'Openness unknown',
};

type LibraryProps = {
  benchmarks: Benchmark[];
  category: CatalogCategory;
  highlightedBenchmark: string | null;
  sort: BenchmarkSort;
  onSortChange: (sort: BenchmarkSort) => void;
  onCategoryChange: (category: CatalogCategory) => void;
  onBack: () => void;
};

export function BenchmarkLibrary({
  benchmarks,
  category,
  highlightedBenchmark,
  sort,
  onSortChange,
  onCategoryChange,
  onBack,
}: LibraryProps) {
  const filtered = benchmarks.filter(
    (item) =>
      category === 'all' || item.categories.some((id) => id === category),
  );
  const groups = groupBenchmarks(filtered, sort, snapshot);
  const repositoryCounts = new Map<string, number>();
  for (const benchmark of benchmarks) {
    const repository = benchmarkRepository(benchmark);
    if (repository)
      repositoryCounts.set(
        repository,
        (repositoryCounts.get(repository) ?? 0) + 1,
      );
  }
  const name = categoryOptions.find((item) => item.id === category)?.label;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key !== 'ArrowLeft' ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      onBack();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <section className="library-frame" aria-labelledby="library-heading">
      <div className="library-bezel-label" aria-hidden="true">
        <i />
        <span>VOICE AI POCKET · EXPANDED VIEW</span>
        <i />
      </div>
      <div className="library-screen">
        <div className="library-toolbar">
          <button className="library-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Back to console
          </button>
          <div className="library-controls">
            <div className="library-filter">
              <label htmlFor="library-category">Component</label>
              <select
                id="library-category"
                aria-label="Component"
                value={category}
                onChange={(event) =>
                  onCategoryChange(event.target.value as CatalogCategory)
                }
              >
                {categoryOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="library-filter">
              <label htmlFor="library-sort">Sort</label>
              <select
                id="library-sort"
                aria-label="Sort benchmarks"
                value={sort}
                onChange={(event) =>
                  onSortChange(event.target.value as BenchmarkSort)
                }
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="library-content">
          <header className="library-heading-row">
            <div>
              <p className="library-eyebrow">THE BENCHMARK LIBRARY</p>
              <h1 id="library-heading" tabIndex={-1}>
                {name}
                <span aria-hidden="true">_</span>
              </h1>
              <p className="library-description">{descriptions[category]}</p>
            </div>
            <p className="library-count">
              <strong>{String(filtered.length).padStart(2, '0')}</strong>
              <span>benchmarks</span>
            </p>
          </header>
          <div className="library-ranking-note">
            <details>
              <summary>About these signals</summary>
              <p>
                Stars measure interest in the linked GitHub repository; a
                repository can cover several benchmarks. Citations come from
                Semantic Scholar, not Google Scholar. Counts are saved
                snapshots; each badge shows its retrieval date. Entries without
                counts remain visible below the ranked results.
              </p>
            </details>
          </div>
          {groups.map((group) => (
            <section
              className="library-group"
              key={group.id}
              aria-labelledby={`group-${group.id}`}
            >
              <div className="library-group-heading">
                <h2 id={`group-${group.id}`}>
                  {group.label} <span>({group.benchmarks.length})</span>
                </h2>
                {group.description && <p>{group.description}</p>}
              </div>
              <div className="library-grid">
                {group.benchmarks.map((benchmark) => {
                  const stats = getStats(benchmark, snapshot);
                  const sharedRepository =
                    (repositoryCounts.get(
                      benchmarkRepository(benchmark) ?? '',
                    ) ?? 0) > 1;
                  return (
                    <article
                      className="library-card"
                      key={benchmark.id}
                      id={`benchmark-${benchmark.id}`}
                      data-highlighted={
                        benchmark.id === highlightedBenchmark || undefined
                      }
                      tabIndex={-1}
                    >
                      <div className="library-card-meta">
                        <p>{benchmark.organization}</p>
                      </div>
                      <h3>{benchmark.name}</h3>
                      <div className="library-tags">
                        {benchmark.categories.map((id) => (
                          <span key={id}>
                            {
                              categories.find((item) => item.id === id)
                                ?.shortLabel
                            }
                          </span>
                        ))}
                      </div>
                      <p className="library-card-description">
                        {benchmark.description}
                      </p>
                      <p className="library-benchmark-details">
                        {benchmarkTypeLabels[benchmark.benchmarkType]} ·{' '}
                        {evaluationMethodLabels[benchmark.evaluationMethod]} ·{' '}
                        {opennessLabels[benchmark.openness]}
                      </p>
                      {benchmark.architectures && (
                        <p className="library-architectures">
                          {benchmark.architectures
                            .map(
                              (architecture) =>
                                architectureLabels[architecture],
                            )
                            .join(' / ')}
                        </p>
                      )}
                      {(stats.stars || stats.citations) && (
                        <div
                          className="library-metrics"
                          aria-label="Popularity signals"
                        >
                          {stats.stars && (
                            <MetricBadge
                              metric={stats.stars}
                              label="GitHub stars"
                              symbol="★"
                              shared={sharedRepository}
                            />
                          )}
                          {stats.citations && (
                            <MetricBadge
                              metric={stats.citations}
                              label="Semantic Scholar citations"
                            />
                          )}
                        </div>
                      )}
                      <div className="library-card-links">
                        <a
                          className="library-primary-link"
                          href={benchmark.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Benchmark <span aria-hidden="true">↗</span>
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        {benchmark.codeUrl && (
                          <a
                            href={benchmark.codeUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Code ↗
                            <span className="sr-only">
                              {' '}
                              (opens in a new tab)
                            </span>
                          </a>
                        )}
                        {benchmark.paperUrl && (
                          <a
                            href={benchmark.paperUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Paper ↗
                            <span className="sr-only">
                              {' '}
                              (opens in a new tab)
                            </span>
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
          {filtered.length === 0 && (
            <p className="library-empty">
              No benchmarks in this component yet. Choose another component to
              keep exploring.
            </p>
          )}
          <div className="library-end">
            <span aria-hidden="true">▪ ▪ ▪</span>
            <p>End of this collection. More discoveries ahead.</p>
            <button onClick={onBack}>← Back to console</button>
          </div>
        </div>
        <span className="sr-only" aria-live="polite">
          {filtered.length} benchmarks in {name}. Sorted by{' '}
          {sortOptions.find((option) => option.id === sort)?.label}.
        </span>
      </div>
    </section>
  );
}

function MetricBadge({
  metric,
  label,
  symbol,
  shared = false,
}: {
  metric: NonNullable<ReturnType<typeof getStats>['stars']>;
  label: string;
  symbol?: string;
  shared?: boolean;
}) {
  const date = new Date(metric.fetchedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const count = metric.count.toLocaleString('en-US');
  return (
    <a
      className="library-metric"
      href={metric.url}
      target="_blank"
      rel="noreferrer"
      title={`${count} ${label}${shared ? ' · shared repository' : ''}. Retrieved ${date}.`}
      aria-label={`${count} ${label}${shared ? ', shared repository' : ''}. Retrieved ${date}. Opens in a new tab.`}
    >
      <span>
        {symbol && <span aria-hidden="true">{symbol} </span>}
        {count} {label}
      </span>
      {shared && (
        <span className="library-metric-detail">Shared repository</span>
      )}
      <span className="library-metric-detail">As of {date}</span>
    </a>
  );
}
