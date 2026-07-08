# promptlane Implementation Plan

Date: 2026-05-01

Status: 1.0.0 stable release candidate

Related docs:

- [PRD.md](./PRD.md)
- [TECH_SPEC.md](./TECH_SPEC.md)
- [PRD_PHASE2.md](./PRD_PHASE2.md)
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)

## 1. Purpose

This plan breaks `promptlane` into implementation phases and release gates.

The product identity is:

> AI coding prompt memory and improvement workspace, local-first.

The implementation goal is to help Claude Code and Codex users safely record prompts locally, find them again, understand weak prompting habits, and write better next requests through a copy-based PromptLane improvement workflow.

## 2. Engineering Principles

- Keep Markdown as the source of truth.
- Treat SQLite as a rebuildable index.
- Redact before persistent storage.
- Keep hooks fail-open.
- Do not log prompt bodies or tokens.
- Prefer explicit setup and dry-run before writing tool configuration.
- Add tests before feature implementation where behavior is risky.
- Verify user-facing web changes in a real browser.
- Do not add hidden external LLM/network analysis to the core beta.

## 3. Phase Overview

| Phase | Goal                                         | Status   |
| ----- | -------------------------------------------- | -------- |
| P0    | Project skeleton and package smoke           | Complete |
| P1    | Normalized event contract and adapters       | Complete |
| P2    | Local server, auth, validation, redaction    | Complete |
| P3    | Markdown, SQLite, FTS, delete, rebuild       | Complete |
| P4    | Claude Code hook install/doctor              | Complete |
| P5    | CLI list/search/show/delete/open             | Complete |
| P6    | Web archive/detail/dashboard                 | Complete |
| P7    | Codex beta adapter                           | Complete |
| P8    | Release smoke and package readiness          | Complete |
| P9    | Project Control Plane                        | Complete |
| P10   | Transcript import                            | Complete |
| P11   | Prompt Improvement Workspace                 | Complete |
| P12   | Anonymized export                            | Complete |
| P13   | Benchmark and browser E2E                    | Complete |
| P14   | English/Korean docs and npm stable readiness | Complete |

## 4. Public Beta Completion Criteria

The beta is implementation-complete when:

- setup initializes local config and storage
- Claude Code hook capture works
- Codex beta hook capture works
- hooks fail open
- prompts are redacted before storage
- Markdown and SQLite/FTS rows are created
- CLI can list/search/show/delete/open prompts
- web UI can list/search/detail/delete prompts
- PromptLane can create, copy, and save improvement drafts
- Prompt Rewrite Guard can optionally block low-score prompts and copy a local
  rewrite for manual resubmission
- project capture/export policies are enforced
- CLI import dry-run/execute/resume works
- anonymized export preview/job flow works in CLI and web
- `rebuild-index` can recover prompt index state from Markdown
- benchmark and release smoke pass
- npm package includes built files and English/Korean public README docs

## 5. Verification Gates

Default local release gate:

```sh
corepack pnpm test
corepack pnpm lint
corepack pnpm build
corepack pnpm --silent benchmark -- --json
corepack pnpm e2e:browser
corepack pnpm smoke:release
corepack pnpm smoke:package-install
corepack pnpm pack:dry-run
corepack pnpm evidence:quality -- --require-complete
corepack pnpm promptlane quality-evidence --require-complete
git diff --check
```

Package smoke:

```sh
corepack pnpm smoke:package-install
```

## 6. Current Implemented Surface

CLI commands:

- `setup`
- `init`
- `doctor`
- `hook`
- `install-hook`
- `uninstall-hook`
- `statusline`
- `install-statusline`
- `uninstall-statusline`
- `service`
- `server`
- `list`
- `search`
- `show`
- `open`
- `delete`
- `rebuild-index`
- `import`
- `import-job`
- `export`
- `improve`

API groups:

- health
- session
- ingest
- prompts
- projects
- exports
- settings
- static web UI

Web screens:

- archive
- prompt detail
- improvement drafts
- dashboard/quality
- projects
- export

## 7. Release-Readiness Work

Before the first stable npm publish:

- keep package version aligned at `1.0.0`
- run the full release gate on Node 22
- ensure `corepack pnpm pack:dry-run` includes built CLI/server/web files
- check that `dist/cli/index.js` is executable
- verify `npm whoami`
- verify package name availability or ownership
- create or refresh the annotated git tag before npm publish preflight:
  `git tag -fa v1.0.0 -m "promptlane 1.0.0"`
- run `corepack pnpm npm-publish:preflight`
- publish with `npm publish --tag latest`

## 8. Deferred Work

Deferred from the 1.0.0 stable release:

- hidden external LLM analysis
- Claude Code/Codex tool-assisted analysis that is not explicit, redacted, and
  user-session mediated
- automatic input replacement/resubmission inside Claude Code or Codex
- GitHub integration
- web import upload UI
- semantic embedding search
- raw export
- team/cloud sync
- full cross-platform release matrix

## 9. Next Steps After 1.0.0

1. Expand smoke coverage across macOS, Linux, and Windows when product support
   requires it.
2. Collect real-user feedback on PromptLane improvement usefulness.
3. Decide whether to add web import upload.
4. Decide whether semantic search can remain local-first.
5. Revisit external/tool-assisted analysis only with explicit opt-in, preview,
   redaction, user-session mediation, and audit.
