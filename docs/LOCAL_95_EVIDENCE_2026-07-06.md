# PromptLane Local 9.5 Evidence 2026-07-06

This document records the current local evidence sweep for PromptLane's 9.5
quality bar. It covers repeatable local proof that can run without opening real
provider CLIs, without external LLM calls, and without reading private app
state.

The current quality evidence command reports complete. It includes the native
dialog approved dogfood operator-approved answer recorded in
`docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`.

## Command Evidence

| Command                                      | Result | Evidence                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `corepack pnpm smoke:hooks`                  | PASS   | Built server/web assets, verified `promptlane` hook status, Claude Code fail-open, Codex fail-open, `promptlane` compatibility hook status, and compatibility fail-open paths. Ended with `hook binary smoke passed`.                                                                                                                                                                  |
| `corepack pnpm smoke:mcp-coach-loop`         | PASS   | Built server/web assets, started the stdio MCP smoke path, and exercised score, coach, improve, clarification, record, and effectiveness evidence flows. Ended with `mcp coach loop smoke passed`.                                                                                                                                                                                     |
| `corepack pnpm dogfood:first-coach-loop`     | PASS   | Built server/web assets, initialized an isolated PromptLane archive, started a local server, captured a Codex prompt through the hook, ran `coach --json`, `loop collect --json`, and `loop brief --json`. Ended with `first coach loop dogfood passed`.                                                                                                                               |
| `corepack pnpm dogfood:loop-memory-approval` | PASS   | Built server/web assets, captured a Codex prompt through the local server, collected a loop snapshot, started MCP, recorded a loop outcome, proposed a memory candidate, recorded approved memory, and proposed an instruction patch. Ended with `loop memory approval dogfood passed`.                                                                                                |
| `corepack pnpm smoke:release`                | PASS   | Built server/web assets, initialized isolated data/HOME, previewed hook installers, started the local server, captured Claude Code and Codex prompt payloads, verified CLI list/search/show/rebuild-index, import, imported-only filter, anonymized export, SQLite, Markdown, FTS, delete cleanup, and the built product quality evidence CLI gate. Ended with `release smoke passed`. |
| `corepack pnpm --silent benchmark -- --json` | PASS   | Built server/web assets and returned `pass: true`, `privacy_leak_count: 0`, `archive_effectiveness_score: 1`, `coach_prompt_actionability: 1`, `retrieval_top3: 1`, and `analytics_score: 1`.                                                                                                                                                                                          |

## Quality Interpretation

- Local-first privacy evidence is current for the highest-risk local agent
  surfaces covered by hooks, MCP, release smoke, and benchmark privacy checks.
- Codex and Claude Code local integration evidence is current for setup,
  hooks, MCP, first-loop capture, approved native-dialog dogfood, and
  loop-memory approval flows.
- Loop memory and continuation evidence is current for capture, collect, brief,
  outcome, approved memory, and instruction patch proposal. Instruction file
  writes remain explicit and user-gated.
- Release-stability local evidence is current for release smoke, the built
  product quality evidence CLI gate, benchmark, and package lifecycle gates, but
  release completion still depends on the normal full gate and external
  blockers.

## Current Completion Boundary

`corepack pnpm evidence:quality` is now `complete` for the local 9.5 evidence
summary because every scorecard axis has current local evidence and the native
dialog approved dogfood has an operator-approved answer recorded. This ledger
strengthens current local proof; it does not authorize release completion by
itself. Run the full release gate before claiming the long-running goal
complete.
