# Contributing

Contributions that add or correct public Voice AI benchmarks are welcome.

## Add a Benchmark

1. Create a new JSON file in `data/benchmarks/`.
2. Use a stable lowercase ID with hyphens.
3. Write a neutral, one-sentence description of what the benchmark compares.
4. Assign every relevant category. Categories are not exclusive.
5. Link to the benchmark owner’s website and add public code or paper links when available.
6. Run `npm run lint` and `npm run build`.
7. Open a pull request explaining why the benchmark belongs in the directory.

Do not copy model scores, datasets, or copyrighted benchmark content into this repository. Link to the owner’s published materials instead.

## Inclusion Scope

The directory includes benchmarks that help engineers evaluate a component or complete system used in a voice agent. Generic LLM benchmarks without a clear voice-agent workload are outside the current scope.
