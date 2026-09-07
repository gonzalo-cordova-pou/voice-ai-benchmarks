# Maintaining the Directory

This guide covers deployment, scheduled stats refreshes, and repository maintenance. Contributors adding benchmarks only need the [contribution guide](../CONTRIBUTING.md).

## Deployment

The production site is built and deployed to GitHub Pages by `.github/workflows/deploy-pages.yml` after changes reach `main`, daily at **08:23 UTC**, or through a manual workflow run. Scheduled runs use the default branch; this repository uses `main`. Manual deployments are also limited to `main`.

Each run checks the code, restores the previous stats snapshot from the Actions cache, refreshes stars and citations, builds the site, saves the snapshot for the next run, and deploys to Pages. Every run uses a new cache key so updated counts can be saved. If the cache is missing or evicted, the checked-in snapshot is the fallback. API failures retain the restored counts and their original retrieval dates. Counts are not committed back to the repository automatically.

### Deployment Setup

1. The upstream workflow is already enabled. For a new deployment, keep the workflow and snapshot on your default `main` branch and enable Actions.
2. In repository **Settings → Pages**, choose **GitHub Actions** as the build source. The upstream repository is already configured this way.
3. No GitHub API key setup is needed: the workflow supplies its built-in `GITHUB_TOKEN` with read-only repository access.
4. No Semantic Scholar secret is needed: the workflow uses its public, unauthenticated batch API. If a request is rate-limited, previous citation counts are retained. The refresh script still supports an optional API key for local use or a future workflow update.
5. To refresh immediately, open **Actions → Deploy to GitHub Pages → Run workflow**, select `main`, and run it. The **Refresh benchmark stats** step and job summary report refreshed and available counts; the `deploy` job publishes the result.

GitHub schedules are approximate and can be delayed during busy periods. For public repositories, GitHub can disable scheduled workflows after 60 days without repository activity; re-enable the workflow in Actions if that happens. See [GitHub's schedule documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

## Refresh Stats Locally

```bash
npm run stats:refresh
npm test
npm run lint
npm run build
npm run dev
```

The refresh script reads public GitHub and Semantic Scholar APIs and writes `data/benchmark-stats.json`. Optional `GITHUB_TOKEN` and `SEMANTIC_SCHOLAR_API_KEY` environment variables can raise API allowances. Supply them to the script's environment; do not put credentials in benchmark JSON or client-side Vite variables. The script does not load `.env` files automatically.

Refreshes deduplicate shared repositories, batch paper lookups, and retry rate limits and server errors with bounded waits. If a lookup fails or a paper is not indexed, an existing count for the same source keeps its original retrieval date; otherwise the count remains unavailable. Changing a source invalidates its old count.

The frontend imports the saved snapshot at build time and makes no external API requests. `npm run build` works offline with the saved counts. Local refreshes are manual; production refreshes run through the Pages workflow described above.

## Hosting a Fork

Update the repository links in `app/page.tsx` and `components/catalog.tsx` to point to your fork. The upstream site uses a custom domain and Vite's `/` base path. If your fork uses a Pages project URL, configure `base` in `vite.config.ts` for its repository path. Configure your own Pages domain rather than reusing `voicebenchmarks.com`.

## Reviewing Contributions

The Validate workflow runs with read-only repository permissions and no deployment credentials. The Pages workflow deploys only from `main`; only its deployment job receives Pages and OIDC write permissions. Review changes to workflows, dependencies, and the refresh script before merging. Dependabot checks npm and GitHub Actions dependencies weekly.

For a public repository, enable secret scanning/push protection and private vulnerability reporting in GitHub's security settings. Protect `main` with the Validate check before adding collaborators with write access. These are GitHub repository settings; adding the workflow files does not enable them automatically.

## Data and Attribution

The source code is MIT-licensed. API-derived counts, linked benchmark resources, and bundled fonts retain their providers' terms. See [third-party notices](../THIRD_PARTY_NOTICES.md). Unauthenticated access to an API does not grant unrestricted redistribution rights. Confirm the applicable provider terms before commercial reuse or redistributing collected API data as a separate dataset.
