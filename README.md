# Voice AI Benchmarks

A public directory of benchmarks for the components and complete systems used to build voice agents.

This initial version contains the repository and website template. Benchmark entries will be added separately.

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

## Add a Benchmark

Create a JSON file in `data/benchmarks/` using this template:

```json
{
  "id": "example-benchmark",
  "name": "Example Benchmark",
  "organization": "Example Organization",
  "description": "One sentence describing what the benchmark compares.",
  "categories": ["voice-agents"],
  "websiteUrl": "https://example.com/benchmark",
  "codeUrl": "https://github.com/example/benchmark",
  "paperUrl": "https://arxiv.org/abs/0000.00000",
  "architectures": ["cascaded", "speech-to-speech"]
}
```

Only `codeUrl`, `paperUrl`, and `architectures` are optional. Valid categories are `stt`, `tts`, `turn-taking`, `llm`, `s2s`, and `voice-agents`. Valid architectures are `cascaded`, `speech-to-speech`, and `hybrid`.

Then verify the change:

```bash
npm run lint
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution guidelines.

## Deployment

The production site is built and deployed to GitHub Pages by `.github/workflows/deploy-pages.yml` after changes reach `main`.

## License

MIT
