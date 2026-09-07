# Voice AI Benchmarks

A public directory of benchmarks for the components and complete systems used to build voice agents.

The collection includes benchmarks, leaderboards, arenas, frameworks, and toolkits across the voice AI stack.

The website groups benchmarks into 6 non-exclusive categories:

- **Speech-to-Text (STT):** transcription models and services, also known as automatic speech recognition (ASR)
- **Text-to-Speech (TTS):** speech generation models and services
- **Turn-Taking:** voice activity detection, end-of-turn detection, interruptions, barge-in, backchannels, and overlap
- **LLM:** language-model evaluation for voice-agent workloads
- **Speech-to-Speech (S2S):** direct comparison of audio-native conversational models
- **Voice Agents:** complete cascaded, speech-to-speech, or hybrid systems

## Run Locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Browse the Collection

The handheld starts with two options: **Benchmarks** opens the component selector, and **GitHub repo** opens the repository in a new tab while displaying contribution links on the console. Selecting a component opens the expanded LCD library. Benchmark cards show descriptions and links in a responsive grid with ordinary page scrolling. Switch components from the library toolbar, use “Back to console,” or press Left Arrow to return to your selected component. Use the directional controls and A/START to browse and open items. B or Escape returns one level, SELECT returns to the main menu, and START also wakes the screen when it is off.

Component selections have shareable URLs, and browser Back/Forward restores navigation and scroll position. Existing benchmark-specific URLs highlight the corresponding card. Benchmark, code, and paper links open in a new tab.

The screen font is bundled locally. Everything runs in the browser and works on GitHub Pages without a backend.

## Sorting and Popularity Signals

The library defaults to **Most starred**, ranking benchmarks by their linked GitHub repository's star count. Entries without a count remain visible in separate alphabetical groups.

Use **Most starred**, **Most cited**, or **A–Z** to change the order. Category and sort selections are shareable in the URL, and browser Back/Forward restores them.

- Stars come from the linked GitHub repository, using `codeUrl` or a GitHub `websiteUrl`. Shared repositories are labeled; their stars measure the whole repository's popularity.
- Citations come from **Semantic Scholar**, not Google Scholar, using the exact linked paper identifier. The refresh script supports arXiv, DOI, and Semantic Scholar paper URLs.
- Known counts sort highest first, with alphabetical ties. A measured zero is a valid count. Entries whose count is unavailable and entries without a linked source appear in separate alphabetical groups below the ranked results. Missing data never becomes zero.
- Badges link to their source and show the retrieval date. Counts measure attention, not benchmark quality.

### Refresh and Test Locally

```bash
npm run stats:refresh
npm test
npm run lint
npm run build
npm run dev
```

The refresh script reads public GitHub and Semantic Scholar APIs and writes `data/benchmark-stats.json`. Optional `GITHUB_TOKEN` and `SEMANTIC_SCHOLAR_API_KEY` environment variables can raise API allowances. Supply them to the script's environment; do not put credentials in benchmark JSON or client-side Vite variables. The script does not load `.env` files automatically.

Refreshes deduplicate shared repositories, batch paper lookups, and retry rate limits and server errors with bounded waits. If a lookup fails or a paper is not indexed, an existing count for the same source keeps its original retrieval date; otherwise the count remains unavailable. Changing a source invalidates its old count.

The frontend imports the saved snapshot at build time and makes no external API requests. `npm run build` works offline with the saved counts. Local refreshes are manual; production refreshes run through the Pages workflow described below.

## Add a Benchmark

Create a JSON file in `data/benchmarks/` using this template:

```json
{
  "id": "example-benchmark",
  "name": "Example Benchmark",
  "organization": "Example Organization",
  "description": "One sentence describing what the benchmark compares.",
  "categories": ["voice-agents"],
  "benchmarkType": "benchmark",
  "evaluationMethod": "mixed",
  "openness": "open",
  "websiteUrl": "https://example.com/benchmark",
  "codeUrl": "https://github.com/example/benchmark",
  "paperUrl": "https://arxiv.org/abs/0000.00000",
  "architectures": ["cascaded", "speech-to-speech"]
}
```

Only `codeUrl`, `paperUrl`, and `architectures` are optional. Valid categories are `stt`, `tts`, `turn-taking`, `llm`, `s2s`, and `voice-agents`. Valid benchmark types are `benchmark`, `leaderboard`, `arena`, `framework`, and `toolkit`. Valid evaluation methods are `automatic`, `deterministic`, `human`, `llm-judge`, `mixed`, and `unknown`. Valid openness values are `open`, `partially-open`, `closed`, and `unknown`. Valid architectures are `cascaded`, `speech-to-speech`, and `hybrid`.

Then verify the change:

```bash
npm run lint
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution guidelines.

## Deployment

The production site is built and deployed to GitHub Pages by `.github/workflows/deploy-pages.yml` after changes reach `main`, daily at **08:23 UTC**, or through a manual workflow run. Scheduled runs use the default branch; this repository uses `main`. Manual deployments are also limited to `main`.

Each run checks the code, restores the previous stats snapshot from the Actions cache, refreshes stars and citations, builds the site, saves the snapshot for the next run, and deploys to Pages. Every run uses a new cache key so updated counts can be saved. If the cache is missing or evicted, the checked-in snapshot is the fallback. API failures retain the restored counts and their original retrieval dates. Counts are not committed back to the repository automatically.

### Enable Daily Updates

1. Commit and push the implementation to `main`, including the refresh script and `data/benchmark-stats.json`. The push triggers the first deployment, and the daily schedule becomes active once the workflow is on the default branch.
2. In repository **Settings → Pages**, choose **GitHub Actions** as the build source. This repository is already configured this way.
3. No GitHub API key setup is needed: the workflow supplies its built-in `GITHUB_TOKEN` with read-only repository access.
4. No Semantic Scholar secret is needed: the workflow uses its public, unauthenticated batch API. If a request is rate-limited, previous citation counts are retained. The refresh script still supports an optional API key for local use or a future workflow update.
5. To refresh immediately, open **Actions → Deploy to GitHub Pages → Run workflow**, select `main`, and run it. The **Refresh benchmark stats** step and job summary report refreshed and available counts; the `deploy` job publishes the result.

GitHub schedules are approximate and can be delayed during busy periods. If the repository becomes public, GitHub can disable scheduled workflows after 60 days without repository activity; re-enable the workflow in Actions if that happens. See [GitHub's schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

## License

MIT
