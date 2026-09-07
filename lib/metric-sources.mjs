export function githubRepository(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const [owner, rawRepo] = url.pathname.split('/').filter(Boolean);
    const repo = rawRepo?.replace(/\.git$/, '');
    return url.hostname === 'github.com' && owner && repo
      ? `${owner}/${repo}`.toLowerCase()
      : null;
  } catch {
    return null;
  }
}

export function semanticScholarId(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname === 'arxiv.org' || url.hostname === 'www.arxiv.org') {
      const id = url.pathname
        .replace(/^\/(abs|pdf)\//, '')
        .replace(/\.pdf$/, '')
        .replace(/v\d+$/, '');
      if (/^(\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})$/.test(id))
        return `ARXIV:${id}`;
    }
    if (url.hostname === 'doi.org')
      return `DOI:${decodeURIComponent(url.pathname.slice(1))}`;
    if (
      url.hostname === 'www.semanticscholar.org' ||
      url.hostname === 'semanticscholar.org'
    ) {
      const id = url.pathname.split('/').filter(Boolean).at(-1);
      if (/^[a-f0-9]{40}$/.test(id ?? '')) return id ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function benchmarkRepository(benchmark) {
  return (
    githubRepository(benchmark.codeUrl) ??
    githubRepository(benchmark.websiteUrl)
  );
}
