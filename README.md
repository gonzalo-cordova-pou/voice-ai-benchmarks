# Voice AI Benchmarks

A directory of benchmarks for the components and complete systems used to build voice agents.

**[Browse the collection →](https://voicebenchmarks.com/)**

Discover benchmarks, leaderboards, arenas, frameworks, and toolkits across six categories:

- **Speech-to-Text (STT):** transcription models and services.
- **Text-to-Speech (TTS):** speech generation models and services.
- **Turn-Taking:** voice activity, end-of-turn detection, interruptions, and overlap.
- **LLM:** language-model evaluation for voice-agent workloads.
- **Speech-to-Speech (S2S):** audio-native conversational models.
- **Voice Agents:** complete cascaded, speech-to-speech, or hybrid systems.

Entries can belong to more than one category. The directory links to evaluations published by their owners; inclusion is not an endorsement.

## Contributing

Know a benchmark we're missing, spotted a broken link, or want to improve the site?

- **[Suggest a benchmark](https://github.com/gonzalo-cordova-pou/voice-ai-benchmarks/issues/new?template=benchmark.yml)** — no coding required.
- **[Report an issue](https://github.com/gonzalo-cordova-pou/voice-ai-benchmarks/issues/new)** — include the page, expected behavior, and steps to reproduce.
- **[Submit a pull request](CONTRIBUTING.md)** — add an entry, correct the metadata, or improve the website.

Each benchmark is a small JSON file in `data/benchmarks/`. See the [contribution guide](CONTRIBUTING.md) for the schema, inclusion criteria, and local checks.

## Run Locally

Requires Node.js **22.13 or newer**.

```bash
npm ci
npm run dev
```

Open the local URL printed by the development server. No API keys or backend are needed; the site uses a saved stats snapshot.

```bash
npm run lint
npm test
npm run build
```

## Browsing and Sorting

Choose a component on the handheld console to open the library. Category and sort selections have shareable URLs. The console supports arrow keys, A/Enter to select, and B/Escape to go back. Inside the library, use the component and sort controls or Left Arrow to return to the console.

- **Most starred** is the default, using the linked GitHub repository's stars.
- **Most cited** uses citation counts from [Semantic Scholar](https://www.semanticscholar.org/?utm_source=api).
- **A–Z** lists every entry alphabetically.

Counts measure attention, not benchmark quality. Missing metrics are kept in separate alphabetical groups. Shared repositories are labeled, and each badge links to its source and shows its retrieval date.

## Deployment and Stats Updates

GitHub Actions deploys the static site on pushes to `main` and refreshes stars and citations daily at **08:23 UTC**. This is already enabled. To refresh immediately, use **Actions → Deploy to GitHub Pages → Run workflow**. No API secrets are required: the workflow uses GitHub's built-in token and Semantic Scholar's public API.

The workflow caches updated counts between runs. Failed lookups retain previous counts and retrieval dates; the checked-in snapshot is the fallback. Updated production counts are not committed back to the repository. Run `npm run stats:refresh` to update the local snapshot. The script accepts optional `GITHUB_TOKEN` and `SEMANTIC_SCHOLAR_API_KEY` environment variables; keep credentials out of source files and client-side Vite variables.

For a fork, enable Actions and select **Settings → Pages → GitHub Actions**. Update repository links in `app/page.tsx` and `components/catalog.tsx`, configure your own domain, and set Vite's `base` for your repository path if using a Pages project URL. GitHub may delay scheduled runs or disable them after 60 days without activity in a public repository; see [schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

## Contributors

Maintained by [Gonzalo Cordova Pou](https://github.com/gonzalo-cordova-pou). Contributions to the catalog, code, and documentation are welcome. GitHub maintains the [contributor list](https://github.com/gonzalo-cordova-pou/voice-ai-benchmarks/graphs/contributors) automatically.

## License and Data Sources

Original code and documentation are available under the [MIT License](LICENSE). Third-party materials retain their own terms:

- Citation counts and paper identifiers come from the [Semantic Scholar API](https://www.semanticscholar.org/product/api), subject to its [API license](https://www.semanticscholar.org/product/api/license) and applicable data licenses. The provider also publishes [API-hosted terms](https://api.semanticscholar.org/license/); confirm applicable terms before commercial reuse or redistributing the collected data as a separate dataset.
- GitHub star counts are subject to [GitHub's API terms](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#h-api-terms). Metric badges link to their sources and show retrieval dates.
- The bundled VT323 font uses the [SIL Open Font License 1.1](public/licenses/VT323-OFL.txt), also included in the deployed site. Software dependencies retain their package licenses.
- Linked benchmarks, papers, and datasets remain the property of their respective owners; inclusion does not relicense them.
