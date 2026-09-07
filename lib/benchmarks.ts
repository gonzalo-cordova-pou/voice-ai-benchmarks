export const categories = [
  { id: 'stt', label: 'Speech-to-Text', shortLabel: 'STT' },
  { id: 'tts', label: 'Text-to-Speech', shortLabel: 'TTS' },
  { id: 'turn-taking', label: 'Turn-Taking', shortLabel: 'Turn-Taking' },
  { id: 'llm', label: 'LLM', shortLabel: 'LLM' },
  { id: 's2s', label: 'Speech-to-Speech', shortLabel: 'S2S' },
  { id: 'voice-agents', label: 'Voice Agents', shortLabel: 'Voice Agents' },
] as const;

export type CategoryId = (typeof categories)[number]['id'];
export type CatalogCategory = CategoryId | 'all';
export type ConsoleScreen = 'home' | 'components' | 'contribute';
export const categoryOptions = [
  { id: 'all', label: 'All benchmarks' },
  ...categories,
] as const;
export type Architecture = 'cascaded' | 'speech-to-speech' | 'hybrid';

export type Benchmark = {
  id: string;
  name: string;
  organization: string;
  description: string;
  categories: CategoryId[];
  websiteUrl: string;
  codeUrl?: string;
  paperUrl?: string;
  architectures?: Architecture[];
};

const benchmarkModules = import.meta.glob<{ default: Benchmark }>(
  '../data/benchmarks/*.json',
  { eager: true },
);

function isWebUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateBenchmark(value: Benchmark, source: string): Benchmark {
  const validCategories = new Set(categories.map((category) => category.id));
  const validArchitectures = new Set<Architecture>([
    'cascaded',
    'speech-to-speech',
    'hybrid',
  ]);
  const requiredStrings = [
    value.id,
    value.name,
    value.organization,
    value.description,
  ];

  if (
    requiredStrings.some((field) => typeof field !== 'string' || !field.trim())
  ) {
    throw new Error(`Invalid required field in ${source}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.id)) {
    throw new Error(`Benchmark ID must use lowercase kebab-case in ${source}`);
  }
  if (!Array.isArray(value.categories) || value.categories.length === 0) {
    throw new Error(`At least one category is required in ${source}`);
  }
  if (value.categories.some((category) => !validCategories.has(category))) {
    throw new Error(`Unknown category in ${source}`);
  }
  if (
    value.architectures !== undefined &&
    (!Array.isArray(value.architectures) ||
      value.architectures.some(
        (architecture) => !validArchitectures.has(architecture),
      ))
  ) {
    throw new Error(`Unknown architecture in ${source}`);
  }
  if (!isWebUrl(value.websiteUrl)) {
    throw new Error(`Invalid website URL in ${source}`);
  }
  for (const optionalUrl of [value.codeUrl, value.paperUrl]) {
    if (optionalUrl !== undefined && !isWebUrl(optionalUrl)) {
      throw new Error(`Invalid optional URL in ${source}`);
    }
  }

  return value;
}

export function getBenchmarks(): Benchmark[] {
  const benchmarks = Object.entries(benchmarkModules).map(([source, module]) =>
    validateBenchmark(module.default, source),
  );
  const ids = benchmarks.map((benchmark) => benchmark.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('Benchmark IDs must be unique.');
  }
  return benchmarks.sort((a, b) => a.name.localeCompare(b.name));
}
