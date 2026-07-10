# PromptLane Release Stability Evidence 2026-07-06

This document records current release-stability evidence for the PromptLane
9.5 quality bar. It is evidence only for the local-first release smoke and
package lifecycle paths. Browser operations use local browser evidence, and
native-dialog evidence is recorded through the approved dogfood audit without
making automated tests open OS dialogs.

## Commands

| Command                               | Result | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `corepack pnpm smoke:release`         | PASS   | Built the package, initialized an isolated data directory and HOME, previewed Claude Code and Codex hook installers without touching real user config, started the local server, ingested Claude Code and Codex prompt fixtures, verified CLI list/search/show/rebuild-index, executed transcript import, verified imported-only filtering, previewed and executed anonymized export, then verified SQLite, Markdown, FTS, delete cleanup, and the built product quality evidence CLI gate. |
| `corepack pnpm pack:dry-run`          | PASS   | Built server and web assets, ran the package dry-run wrapper, and produced `promptlane-1.0.0.tgz` with the expected shipped files, including this release evidence document.                                                                                                                                                                                                                                                                                                                |
| `corepack pnpm smoke:package-install` | PASS   | Built server and web assets, packed `promptlane-1.0.0.tgz`, installed it into an isolated npm prefix, verified the shipped `promptlane`, `pl-claude`, and `pl-codex` bin help paths from an isolated cwd, checked `promptlane start --open-web --json` returns the first-success setup, coach, and doctor commands, and verified the installed `promptlane quality-evidence --require-complete` release gate.                                                                               |

## Local Release Gate

- PR #464 added this evidence document, package manifest coverage, and the
  release-stability packaging guard.
- The current local release gate is local-first and matches
  `quality-evidence` `release_gate`: `corepack pnpm format`,
  `corepack pnpm test`, `corepack pnpm lint`, `corepack pnpm build`,
  `corepack pnpm pack:dry-run`, `corepack pnpm --silent benchmark -- --json`,
  `corepack pnpm e2e:browser`, `corepack pnpm smoke:release`,
  `corepack pnpm smoke:package-install`,
  `corepack pnpm evidence:quality -- --require-complete`,
  `corepack pnpm promptlane quality-evidence --require-complete`, and
  `git diff --check`.
- General PR/main test CI and scheduled UI patrol workflows are not release
  requirements. Web operations are verified with local browser evidence:
  `corepack pnpm ui-patrol` and `corepack pnpm dogfood:web-user-flow`.
- Native-dialog integration evidence is tracked as approved native-dialog
  evidence in `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`; automated
  release gates still must not open native OS dialogs without explicit approval.
- The current local scorecard treats that audit as approved native-dialog evidence.

## Privacy Observations

- `smoke:release` uses an isolated temporary data directory and HOME.
- The smoke fixture includes secret-looking prompt text and local path-shaped
  input, then asserts redacted outputs, cleanup behavior, and quality evidence
  CLI gate output without raw home paths.
- Raw prompt bodies, raw local paths, and token-like secrets were not emitted by
  the verified CLI, server, import, export, SQLite, Markdown, FTS, or delete
  paths.

## Release-Adjacent Evidence

- `docs/UI_PATROL_EVIDENCE_2026-07-06.md` records local browser evidence.
- `docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md` records approved
  native-dialog evidence.
- `corepack pnpm --silent evidence:quality` reports `promptlane_95_quality`
  as `complete` for repeatable isolated evidence. Run
  `promptlane quality-evidence --runtime-tool codex --require-runtime-ready`
  before claiming the installed Codex integration is live, and run the full
  local release gate before claiming release or long-running-goal completion.
