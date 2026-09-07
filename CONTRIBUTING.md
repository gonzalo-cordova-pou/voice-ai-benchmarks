# Contributing

Help grow and improve the Voice AI Benchmarks directory. Benchmark suggestions, metadata corrections, bug reports, and website improvements are welcome.

## Suggest a Benchmark Without Writing Code

Open the [benchmark suggestion form](https://github.com/gonzalo-cordova-pou/voice-ai-benchmarks/issues/new?template=benchmark.yml). Include its official URL, the organization behind it, and a short description of what it evaluates. A repository or paper is useful but not required.

## Inclusion Criteria

Entries should evaluate a component or complete system used in voice agents. Generic LLM benchmarks without a clear voice-agent workload are outside the scope. Link to public materials published by the benchmark's owners, keep descriptions neutral, and avoid duplicate entries. Open, partially open, and closed evaluations may be included when their scope is documented publicly.

Do not copy model scores, datasets, papers, or private information into the repository. Link to the original materials instead.

## Add or Correct an Entry

1. Fork the repository and create a branch for your change.
2. Add or edit a JSON file in `data/benchmarks/` using the schema below.
3. Use a unique lowercase, hyphenated ID and assign every relevant category.
4. Classify benchmark type, evaluation method, and openness. Use `unknown` rather than guessing where that value is supported.
5. Check the official website, code, and paper links.
6. Run `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
7. Open a pull request describing the entry or correction, with a link to any related issue.

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

## Website Changes

Use Node.js 22.13 or newer. Run `npm ci` and `npm run dev` to start the site. Keep changes focused, describe the resulting behavior, and check desktop and mobile layouts for UI changes. Include a screenshot in the pull request when it helps explain a visual change.

Run `npm run lint`, `npm test`, and `npm run build` before submitting. Discuss large changes in an issue first so the approach can be agreed on before implementation.

## Popularity Metrics

GitHub stars and Semantic Scholar citations live in the generated `data/benchmark-stats.json` snapshot. Do not invent or manually estimate counts. You do not need to refresh metrics or provide an API key when contributing an entry: the production workflow refreshes them after changes are merged. A missing count is unknown, not zero.

If your change affects refresh behavior, see [deployment and stats updates](README.md#deployment-and-stats-updates). Keep the providers' attribution and source links intact; see [license and data sources](README.md#license-and-data-sources).

## Working Together

Be respectful, explain the reasoning behind suggestions, and focus feedback on the work. Contributions of original code and documentation are accepted under the project's MIT license. Identify third-party material and its license when including it.
