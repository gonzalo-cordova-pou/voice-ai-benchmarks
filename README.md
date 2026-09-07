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

The production site refreshes stats daily through GitHub Actions and remains fully static. See the [maintenance guide](docs/maintaining.md) for refresh commands, deployment, and hosting a fork.

## Contributors

Maintained by [Gonzalo Cordova Pou](https://github.com/gonzalo-cordova-pou). Contributions to the catalog, code, and documentation are welcome. GitHub maintains the [contributor list](https://github.com/gonzalo-cordova-pou/voice-ai-benchmarks/graphs/contributors) automatically.

## License and Data Sources

Project source code is available under the [MIT License](LICENSE). Linked benchmarks, API-derived metrics, and third-party assets remain subject to their respective terms. See [third-party notices](THIRD_PARTY_NOTICES.md) for data attribution and the bundled font license.
