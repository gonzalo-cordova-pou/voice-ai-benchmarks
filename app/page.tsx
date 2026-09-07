import { useEffect, useRef, useState } from 'react';
import { Catalog } from '@/components/catalog';
import { BenchmarkLibrary } from '@/components/benchmark-library';
import {
  type CatalogCategory,
  type ConsoleScreen,
  categoryOptions,
  getBenchmarks,
} from '@/lib/benchmarks';

const benchmarks = getBenchmarks();
const repository = 'https://github.com/gonzalo-cordova-pou/voice-ai-benchmarks';

type Route = {
  category: CatalogCategory | null;
  benchmark: string | null;
  screen: ConsoleScreen;
};
type NavigationState = { cursor?: number; scrollY?: number };

function readRoute(): Route {
  const params = new URLSearchParams(window.location.search);
  const benchmark = benchmarks.find(
    (item) => item.id === params.get('benchmark'),
  );
  const category = categoryOptions.find(
    (item) => item.id === params.get('category'),
  )?.id;
  return {
    category: category ?? (benchmark ? 'all' : null),
    benchmark: benchmark?.id ?? null,
    screen:
      category || benchmark || params.get('screen') === 'components'
        ? 'components'
        : params.get('screen') === 'contribute'
          ? 'contribute'
          : 'home',
  };
}

export default function Home() {
  const [route, setRoute] = useState(readRoute);
  const [cursor, setCursor] = useState(() =>
    Math.max(
      0,
      categoryOptions.findIndex((item) => item.id === readRoute().category),
    ),
  );
  const consoleScroll = useRef(0);

  function navigate(category: CatalogCategory | null, focus = true) {
    if (!route.category) consoleScroll.current = window.scrollY;
    window.history.replaceState({ cursor, scrollY: window.scrollY }, '');
    const nextCursor = category
      ? categoryOptions.findIndex((item) => item.id === category)
      : cursor;
    const nextScroll = category ? 0 : consoleScroll.current;
    setCursor(nextCursor);
    setRoute({ category, benchmark: null, screen: 'components' });
    const url = new URL(window.location.href);
    if (category) url.searchParams.set('category', category);
    else url.searchParams.delete('category');
    url.searchParams.delete('benchmark');
    if (category) url.searchParams.delete('screen');
    else url.searchParams.set('screen', 'components');
    window.history.pushState(
      { cursor: nextCursor, scrollY: nextScroll },
      '',
      url,
    );
    requestAnimationFrame(() => {
      window.scrollTo({ top: nextScroll, behavior: 'instant' });
      if (category && focus)
        document
          .getElementById('library-heading')
          ?.focus({ preventScroll: true });
      if (!category) {
        const selected =
          document.querySelectorAll<HTMLButtonElement>('[data-menu-item]')[
            nextCursor
          ];
        selected?.focus({ preventScroll: true });
        selected?.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function navigateConsole(screen: ConsoleScreen) {
    window.history.replaceState({ cursor, scrollY: window.scrollY }, '');
    setRoute({ category: null, benchmark: null, screen });
    const url = new URL(window.location.href);
    url.searchParams.delete('category');
    url.searchParams.delete('benchmark');
    if (screen === 'home') url.searchParams.delete('screen');
    else url.searchParams.set('screen', screen);
    window.history.pushState({ cursor, scrollY: window.scrollY }, '', url);
  }

  useEffect(() => {
    function restore(event: PopStateEvent) {
      const state = event.state as NavigationState | null;
      const next = readRoute();
      setRoute(next);
      setCursor(
        state?.cursor ??
          Math.max(
            0,
            categoryOptions.findIndex((item) => item.id === next.category),
          ),
      );
      requestAnimationFrame(() =>
        window.scrollTo({ top: state?.scrollY ?? 0, behavior: 'instant' }),
      );
    }
    window.addEventListener('popstate', restore);
    const initial = readRoute();
    if (initial.benchmark)
      requestAnimationFrame(() =>
        document
          .getElementById(`benchmark-${initial.benchmark}`)
          ?.scrollIntoView({ block: 'center' }),
      );
    return () => window.removeEventListener('popstate', restore);
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href={import.meta.env.BASE_URL}>
          <span className="wordmark-icon" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          voice ai benchmarks<span className="wordmark-period">.</span>
        </a>
        <nav aria-label="Project links">
          <a href={repository}>
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a
            className="contribute-link"
            href={`${repository}/issues/new?template=benchmark.yml`}
          >
            Add a benchmark <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main id="main-content">
        {route.category ? (
          <BenchmarkLibrary
            benchmarks={benchmarks}
            category={route.category}
            highlightedBenchmark={route.benchmark}
            onCategoryChange={(category) => navigate(category, false)}
            onBack={() => navigate(null)}
          />
        ) : (
          <div className="workspace">
            <section className="intro" aria-labelledby="intro-heading">
              <p className="edition">
                <span /> AN OPEN-SOURCE COLLECTION
              </p>
              <h1 id="intro-heading">
                Voice AI
                <br />
                benchmarks.
                <br />
                <em>All in one place.</em>
              </h1>
              <p className="intro-copy">
                Discover benchmarks for every layer of your voice agent, from
                speech recognition to complete systems.
              </p>
              <div className="collection-stats">
                <span>
                  <strong>{benchmarks.length}</strong> benchmarks
                </span>
                <i />
                <span>
                  <strong>6</strong> categories
                </span>
                <i />
                <span>Always open</span>
              </div>
              <div className="play-note">
                <span className="note-arrow" aria-hidden="true">
                  ⤴
                </span>
                <p>
                  Go on, press a button.
                  <br />
                  <span>A whole library awaits.</span>
                </p>
              </div>
              <div className="instructions" id="console-help">
                <span className="instruction-title">HOW TO EXPLORE</span>
                <p>
                  <kbd>↑</kbd>
                  <kbd>↓</kbd> Browse{' '}
                  <span className="instruction-divider">/</span> <kbd>A</kbd>{' '}
                  Explore
                </p>
                <p className="touch-hint">
                  Use your keyboard, the controls, or tap the screen.
                </p>
              </div>
            </section>
            <div className="console-stage">
              <Catalog
                benchmarks={benchmarks}
                screen={route.screen}
                onScreenChange={navigateConsole}
                cursor={cursor}
                onCursorChange={setCursor}
                onSelectCategory={(category) => navigate(category)}
              />
              <p className="console-caption">
                <span /> ONE COLLECTION. EVERY LAYER OF VOICE AI.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <span>Made for curious engineers.</span>
        <span>
          A community project. <a href={repository}>Make it better ↗</a>
        </span>
      </footer>
    </div>
  );
}
