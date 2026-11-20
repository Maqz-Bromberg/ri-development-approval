# Plan: the checks on every pull request

Status: planned 2026-11-20, not built. Would clear ARD debt 7. Needs Maqz's answers in section 5 first, because the ARD's current priority says "no new moving parts for upkeep yet" (section 2).

## What it is for

The checks now run from one command (`npm run check`), and a fresh clone can run all but one of them. Nothing runs them unless someone remembers to. The deploy workflow (`nextjs.yml`) builds only after a push to `main`, so a broken build or a changed answer is found after it is live. A check on each pull request would report before the merge, in the pull request itself.

It reports and does not edit (principle 8). It opens nothing and commits nothing: a red mark on the pull request, and the output of the check that failed.

## What it would run

Everything `npm run check` runs that does not need `.sources/`, which is not committed (D9: transcripts and minutes name residents).

| Check | Runs on GitHub? | Notes |
| --- | --- | --- |
| Types | Yes | `tsc --noEmit` |
| Engine flowcharts | Yes | Python standard library only |
| Known answers | Yes | `npm test`, 22 tests (D76) |
| Engine snapshot | Yes, against the digest | No local copy there, so it names the cases that differ from `snapshot-digest.json` (D75) but cannot show how. A pull request that changes answers on purpose commits the new digest, and the check passes. |
| Timelines | Yes, offline | `verify.py --offline` checks the data's shape and sources, not the quotes |
| Quotes | **No** | Needs the documents in `.sources/`. Stays a local check, run before pushing. |
| Build | Yes | `next build`, about a minute. The same build the deploy runs, so a pull request cannot pass and then fail to deploy. |

`npm run check` already skips the quotes check by name when `.sources/` is absent, so the workflow can call it directly, plus `npm run build`.

## The workflow, as it would be written

```yaml
# .github/workflows/checks.yml
name: Checks
on:
  pull_request:
  workflow_dispatch:
permissions:
  contents: read
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "24"      # the scripts run TypeScript directly (D73)
          cache: npm
      - run: npm ci
      - run: npm run check       # quotes are skipped by name: .sources is not in the repository
      - run: npm run build
```

No secrets, read-only permissions, nothing scheduled.

## What it costs

- **Upkeep:** none until a check fails. When one does, it is a check that would have failed locally too.
- **Time:** about two minutes a pull request, mostly `npm ci` and the build.
- **A rule to keep:** a change that changes the engine's answers on purpose commits the snapshot's digest with it (`snapshot.ts --save`). Without the digest, the pull request is red. That is the point, but it is one more step.
- **What it does not catch:** a quote that no longer matches its document, since that needs `.sources/`; anything on the pages themselves; a live service that changed (debt 14).

## Questions for Maqz

1. **Is a pull-request check within "no new moving parts" for now?** It is not scheduled and needs no service, but it is a workflow to keep. Recommended: yes, as it only reports.
2. **Which pull requests?** All of them (recommended), or only those into `main`. The statewide work lands on `statewide-coverage` first.
3. **Required or advisory?** Required means GitHub will not merge a red pull request without an override. Recommended: advisory at first, required once it has run clean for a few weeks.
4. **The deploy's Node version.** `nextjs.yml` builds with Node 20 and the checks need 24. Move the deploy to 24 too, so both build the same way? Recommended: yes, in the same change.
5. **Later, separately: a monthly check that the saved Atlas still matches the live layer** (D74). That would be a scheduled action, so it is a decision of its own. It would report a changed district, not re-save the copy.
