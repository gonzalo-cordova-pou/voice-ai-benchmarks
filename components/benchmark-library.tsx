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
  onCategoryChange: (category: CatalogCategory) => void;
  onBack: () => void;
};

export function BenchmarkLibrary({
  benchmarks,
  category,
  highlightedBenchmark,
  onCategoryChange,
  onBack,
}: LibraryProps) {
  const filtered = benchmarks.filter(
    (item) =>
      category === 'all' || item.categories.some((id) => id === category),
  );
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
          <div
            className="library-grid"
            aria-label={
              category === 'all' ? 'All benchmarks' : `${name} benchmarks`
            }
          >
            {filtered.map((benchmark, index) => (
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
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h2>{benchmark.name}</h2>
                <div className="library-tags">
                  {benchmark.categories.map((id) => (
                    <span key={id}>
                      {categories.find((item) => item.id === id)?.shortLabel}
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
                      .map((architecture) => architectureLabels[architecture])
                      .join(' / ')}
                  </p>
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
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                  {benchmark.paperUrl && (
                    <a
                      href={benchmark.paperUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Paper ↗
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
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
          {filtered.length} benchmarks in {name}.
        </span>
      </div>
    </section>
  );
}
