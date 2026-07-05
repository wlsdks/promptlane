# PromptLane Release Stability Evidence 2026-07-06

This document records current release-stability evidence for the PromptLane
9.5 quality bar. It is evidence only for the local-first release smoke and
package lifecycle paths; scheduled `ui-patrol` and native dialog dogfood remain
separate blockers.

## Commands

| Command | Result | Evidence |
| --- | --- | --- |
| `corepack pnpm smoke:release` | PASS | Built the package, initialized an isolated data directory and HOME, previewed Claude Code and Codex hook installers without touching real user config, started the local server, ingested Claude Code and Codex prompt fixtures, verified CLI list/search/show/rebuild-index, executed transcript import, verified imported-only filtering, previewed and executed anonymized export, then verified SQLite, Markdown, FTS, and delete cleanup. |
| `corepack pnpm pack:dry-run` | PASS | Built server and web assets, ran the package dry-run wrapper, and produced `prompt-coach-0.1.0-beta.0.tgz` with 344 files including this release evidence document. |

## CI

- PR #464 added this evidence document, package manifest coverage, and the
  release-stability packaging guard.
- main CI run `28750611089` passed `test (22)` and `test (24)` after PR #464
  merged.
- Both jobs ran `pnpm test`, `pnpm lint`, `pnpm build`, and
  `pnpm pack:dry-run`.

## Privacy Observations

- `smoke:release` uses an isolated temporary data directory and HOME.
- The smoke fixture includes secret-looking prompt text and local path-shaped
  input, then asserts redacted outputs and cleanup behavior.
- Raw prompt bodies, raw local paths, and token-like secrets were not emitted by
  the verified CLI, server, import, export, SQLite, Markdown, FTS, or delete
  paths.

## Remaining Release-Adjacent Blockers

- Scheduled `ui-patrol` artifact evidence is still pending because the current
  workflow history has no `schedule` event.
- `dogfood:mcp-native-dialog-approved` still requires explicit operator
  approval before opening a native dialog.
