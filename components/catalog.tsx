import { useEffect, useRef, useState } from 'react';
import {
  type Benchmark,
  type CatalogCategory,
  type ConsoleScreen,
  categoryOptions,
} from '@/lib/benchmarks';
import { cn } from '@/lib/utils';

const repository = 'https://github.com/gonzalo-cordova-pou/voice-ai-benchmarks';

type CatalogProps = {
  benchmarks: Benchmark[];
  screen: ConsoleScreen;
  cursor: number;
  onScreenChange: (screen: ConsoleScreen) => void;
  onCursorChange: (cursor: number) => void;
  onSelectCategory: (category: CatalogCategory) => void;
};

export function Catalog({
  benchmarks,
  screen,
  cursor,
  onScreenChange,
  onCursorChange,
  onSelectCategory,
}: CatalogProps) {
  const [powered, setPowered] = useState(true);
  const [homeCursor, setHomeCursor] = useState(screen === 'contribute' ? 1 : 0);
  const [contributionCursor, setContributionCursor] = useState(0);
  const screenRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLElement>(null);
  const githubLinkRef = useRef<HTMLAnchorElement>(null);
  const activeCursor =
    screen === 'home'
      ? homeCursor
      : screen === 'components'
        ? cursor
        : contributionCursor;
  const itemCount =
    screen === 'home'
      ? 2
      : screen === 'components'
        ? categoryOptions.length
        : 3;

  function selectCursor(index: number) {
    if (screen === 'home') setHomeCursor(index);
    else if (screen === 'components') onCursorChange(index);
    else setContributionCursor(index);
  }

  function changeScreen(next: ConsoleScreen, nextHomeCursor = homeCursor) {
    if (next === 'home') setHomeCursor(nextHomeCursor);
    if (next === 'contribute') setContributionCursor(0);
    onScreenChange(next);
    requestAnimationFrame(() => {
      screenRef.current?.scrollTo({ top: 0 });
      if (next === 'home')
        screenRef.current
          ?.querySelectorAll<HTMLElement>('[data-menu-item]')
          [nextHomeCursor]?.focus({ preventScroll: true });
      else
        screenRef.current?.querySelector('h2')?.focus({ preventScroll: true });
    });
  }

  function confirm() {
    if (!powered) {
      setPowered(true);
      return;
    }
    if (screen === 'home') {
      if (homeCursor === 0) changeScreen('components');
      else githubLinkRef.current?.click();
    } else if (screen === 'components') {
      onSelectCategory(categoryOptions[cursor].id);
    } else {
      screenRef.current
        ?.querySelectorAll<HTMLElement>('[data-menu-item]')
        [contributionCursor]?.click();
    }
  }

  function move(delta: number) {
    if (!powered) return;
    const next = (activeCursor + delta + itemCount) % itemCount;
    selectCursor(next);
    const scroller = screenRef.current;
    const row =
      scroller?.querySelectorAll<HTMLElement>('[data-menu-item]')[next];
    if (!scroller || !row) return;
    const bounds = scroller.getBoundingClientRect();
    const item = row.getBoundingClientRect();
    if (item.top < bounds.top)
      scroller.scrollBy({ top: item.top - bounds.top });
    else if (item.bottom > bounds.bottom)
      scroller.scrollBy({ top: item.bottom - bounds.bottom });
    if (scroller.contains(document.activeElement))
      row.focus({ preventScroll: true });
  }

  function resetMenu() {
    if (!powered) return;
    if (screen !== 'home')
      changeScreen('home', screen === 'contribute' ? 1 : 0);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat)
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target !== document.body &&
        !deviceRef.current?.contains(target)
      )
        return;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select')
      )
        return;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        move(-1);
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        move(1);
      }
      if (
        event.key === 'ArrowLeft' ||
        event.key === 'Escape' ||
        event.key.toLowerCase() === 'b'
      ) {
        event.preventDefault();
        resetMenu();
      }
      if (
        event.key === 'ArrowRight' ||
        event.key.toLowerCase() === 'a' ||
        (event.key === 'Enter' &&
          (target === document.body ||
            (target instanceof HTMLElement && target.tagName === 'H2')))
      ) {
        event.preventDefault();
        confirm();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <section
      className="handheld"
      aria-label="Interactive benchmark console"
      aria-describedby="console-help"
      ref={deviceRef}
    >
      <div className="shell-top" aria-hidden="true">
        <span>◀ OFF · ON ▶</span>
      </div>
      <button
        className={cn('power-switch', powered && 'is-on')}
        aria-label={powered ? 'Turn screen off' : 'Turn screen on'}
        aria-pressed={powered}
        onClick={() => setPowered(!powered)}
      >
        <span />
      </button>
      <div className="screen-bezel">
        <div className="bezel-heading" aria-hidden="true">
          <i />
          <span>DOT MATRIX WITH STEREO SOUND</span>
          <i />
        </div>
        <div className="battery" aria-hidden="true">
          <i className={powered ? 'lit' : ''} />
          <span>BATTERY</span>
        </div>
        <div className={cn('lcd', !powered && 'lcd-off')}>
          {powered ? (
            <>
              <div className="lcd-status">
                <span>
                  <span className="pixel-mark" aria-hidden="true">
                    ▥
                  </span>{' '}
                  VOICE AI / BENCHMARKS
                </span>
                <span aria-label="Battery full">▰▰▰</span>
              </div>
              <div
                className={cn(
                  'screen-content',
                  screen === 'home' && 'console-home',
                  screen === 'contribute' && 'console-contribute',
                )}
                ref={screenRef}
              >
                {screen === 'home' ? (
                  <>
                    <div className="lcd-title">
                      <p>THE VOICE AI COLLECTION</p>
                      <h2 tabIndex={-1}>
                        Main menu<span aria-hidden="true">_</span>
                      </h2>
                    </div>
                    <p className="console-home-intro">
                      Explore benchmarks.
                      <br />
                      Help grow the collection.
                    </p>
                    <div className="lcd-menu" aria-label="Console main menu">
                      <button
                        className={cn(
                          'lcd-row',
                          homeCursor === 0 && 'is-selected',
                        )}
                        data-menu-item
                        onFocus={() => setHomeCursor(0)}
                        onClick={() => changeScreen('components')}
                      >
                        <span className="row-cursor" aria-hidden="true">
                          ▶
                        </span>
                        <span className="row-text">Benchmarks</span>
                        <span aria-hidden="true">›</span>
                      </button>
                      <a
                        className={cn(
                          'lcd-row',
                          homeCursor === 1 && 'is-selected',
                        )}
                        ref={githubLinkRef}
                        data-menu-item
                        href={repository}
                        target="_blank"
                        rel="noreferrer"
                        onFocus={() => setHomeCursor(1)}
                        onClick={(event) => {
                          if (
                            !event.metaKey &&
                            !event.ctrlKey &&
                            !event.shiftKey &&
                            !event.altKey
                          )
                            changeScreen('contribute');
                        }}
                      >
                        <span className="row-cursor" aria-hidden="true">
                          ▶
                        </span>
                        <span className="row-text">GitHub repo</span>
                        <span aria-hidden="true">↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </div>
                    <p className="console-home-count">
                      {benchmarks.length} BENCHMARKS /{' '}
                      {categoryOptions.length - 1} COMPONENTS
                    </p>
                  </>
                ) : screen === 'contribute' ? (
                  <>
                    <div className="lcd-title">
                      <p>OPEN SOURCE / COMMUNITY</p>
                      <h2 tabIndex={-1}>
                        Contribute to
                        <br />
                        the collection<span aria-hidden="true">_</span>
                      </h2>
                    </div>
                    <p className="console-contribute-copy">
                      Know a benchmark we missed?
                      <br />
                      Found something outdated?
                    </p>
                    <div className="lcd-menu" aria-label="Contribution options">
                      <a
                        className={cn(
                          'lcd-row',
                          contributionCursor === 0 && 'is-selected',
                        )}
                        data-menu-item
                        onFocus={() => setContributionCursor(0)}
                        href={repository + '/issues/new?template=benchmark.yml'}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="row-cursor" aria-hidden="true">
                          ▶
                        </span>
                        <span className="row-text">Suggest a benchmark</span>
                        <span aria-hidden="true">↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                      <a
                        className={cn(
                          'lcd-row',
                          contributionCursor === 1 && 'is-selected',
                        )}
                        data-menu-item
                        onFocus={() => setContributionCursor(1)}
                        href={repository}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="row-cursor" aria-hidden="true">
                          ▶
                        </span>
                        <span className="row-text">Open repository</span>
                        <span aria-hidden="true">↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                      <button
                        className={cn(
                          'lcd-row',
                          contributionCursor === 2 && 'is-selected',
                        )}
                        data-menu-item
                        onFocus={() => setContributionCursor(2)}
                        onClick={() => changeScreen('home', 1)}
                      >
                        <span className="row-cursor" aria-hidden="true">
                          ▶
                        </span>
                        <span className="row-text">Back to main menu</span>
                        <span aria-hidden="true">‹</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="lcd-title">
                      <p>BENCHMARKS / COMPONENTS</p>
                      <h2 tabIndex={-1}>
                        Choose a component<span aria-hidden="true">_</span>
                      </h2>
                    </div>
                    <div className="lcd-menu" aria-label="Benchmark components">
                      {categoryOptions.map((category, index) => (
                        <button
                          key={category.id}
                          data-menu-item
                          className={cn(
                            'lcd-row',
                            cursor === index && 'is-selected',
                          )}
                          onFocus={() => onCursorChange(index)}
                          onClick={() => onSelectCategory(category.id)}
                        >
                          <span className="row-cursor" aria-hidden="true">
                            ▶
                          </span>
                          <span className="row-text">{category.label}</span>
                          <span>
                            {String(
                              category.id === 'all'
                                ? benchmarks.length
                                : benchmarks.filter((item) =>
                                    item.categories.some(
                                      (id) => id === category.id,
                                    ),
                                  ).length,
                            ).padStart(2, '0')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="lcd-footer">
                <span>
                  {screen === 'home'
                    ? '↑↓ SELECT A: OPEN'
                    : '↑↓ A: OPEN B: BACK'}
                </span>
                <span>
                  {String(activeCursor + 1).padStart(2, '0')} /{' '}
                  {String(itemCount).padStart(2, '0')}
                </span>
              </div>
            </>
          ) : (
            <div className="off-message">Press START to explore.</div>
          )}
        </div>
      </div>
      <div className="console-brand" aria-hidden="true">
        <strong>VOICE AI</strong>
        <span>pocket</span>
        <sup>01</sup>
      </div>
      <div className="hardware-controls">
        <div className="dpad-well">
          <div className="dpad">
            <button
              className="dpad-up"
              aria-label="Previous item"
              onClick={() => move(-1)}
            >
              <span>▲</span>
            </button>
            <button
              className="dpad-left"
              aria-label="Back to main menu"
              onClick={resetMenu}
            >
              <span>◀</span>
            </button>
            <span className="dpad-center" aria-hidden="true">
              <i />
            </span>
            <button
              className="dpad-right"
              aria-label="Open selected item"
              onClick={confirm}
            >
              <span>▶</span>
            </button>
            <button
              className="dpad-down"
              aria-label="Next item"
              onClick={() => move(1)}
            >
              <span>▼</span>
            </button>
          </div>
        </div>
        <div className="action-buttons">
          <div>
            <button
              className="round-button"
              aria-label="B: Back"
              onClick={resetMenu}
            />
            <span>B</span>
          </div>
          <div>
            <button
              className="round-button"
              aria-label="A: Open selected item"
              onClick={confirm}
            />
            <span>A</span>
          </div>
        </div>
      </div>
      <div className="lower-controls">
        <button
          onClick={() => {
            setPowered(true);
            changeScreen('home', 0);
          }}
          className="pill-button"
        >
          <i />
          <span>SELECT</span>
        </button>
        <button onClick={confirm} className="pill-button">
          <i />
          <span>START</span>
        </button>
      </div>
      <div className="speaker" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <div className="shell-bottom" aria-hidden="true">
        PHONES <span>⌒</span>
      </div>
      <span className="sr-only" aria-live="polite">
        {powered
          ? screen === 'home'
            ? 'Main menu. Benchmarks or GitHub repo.'
            : screen === 'components'
              ? 'Choose a component to open the full benchmark library.'
              : 'Contribute to the collection. Suggest a benchmark or open the repository.'
          : 'Screen off.'}
      </span>
    </section>
  );
}
