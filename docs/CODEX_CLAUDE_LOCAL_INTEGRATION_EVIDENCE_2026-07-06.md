# PromptLane Codex And Claude Local Integration Evidence 2026-07-06

This document records current non-operator Codex and Claude Code integration
evidence for the PromptLane 9.5 quality bar.

## Repeatable Local Evidence

| Evidence | Result | Details |
| --- | --- | --- |
| `corepack pnpm smoke:agent-setup` | PASS | Exercises setup dry-run, setup with MCP registration, Claude Code doctor, and Codex doctor with isolated HOME/data directories and fake provider binaries. |
| `corepack pnpm smoke:hooks` | PASS | Verifies `promptlane` hook status, Claude Code fail-open behavior, Codex fail-open behavior, and `promptlane` compatibility hook status. |
| `corepack pnpm smoke:mcp-coach-loop` | PASS | Exercises score, coach, improve, clarification apply/record, `score_prompt` effectiveness evidence, and `coach_prompt` effectiveness guidance through the real stdio MCP server. |
| `corepack pnpm smoke:mcp-elicitation` | PASS | Verifies MCP `elicitation/create` answer collection, final prompt composition, and local-only privacy boundaries. |
| `corepack pnpm smoke:mcp-native-dialog` | PASS | Verifies the no-dialog fallback path with `allow_native_dialog: false`, `interaction_status: "unsupported"`, and no OS dialog. |
| `corepack pnpm dogfood:first-coach-loop` | PASS | Captures a Codex prompt through the hook, then runs coach, loop collect, and loop brief against an isolated local archive. |
| `corepack pnpm dogfood:loop-memory-approval` | PASS | Captures a Codex prompt, records a loop outcome through MCP, proposes and records approved memory, and proposes an instruction patch without writing instruction files. |
| `PROMPTLANE_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved` | PASS | After explicit operator approval, opens the native macOS dialog fallback through MCP and completes with `interaction_status: "answered"` plus `approved native dialog dogfood passed`. |

## Boundary

The native OS dialog dogfood evidence is approved-run-only. The command still
requires an operator who is present and expects a native dialog. It refuses to
run without the approval environment variable and must not be added to automated
CI or scheduled checks.

## Interpretation

The Codex and Claude Code integration axis has current local setup, hook, MCP,
elicitation, no-dialog fallback, first-loop, loop-memory, and approved native
dialog dogfood evidence. `quality-evidence` records this as
`codex_claude_local_integration_evidence` plus completed
`native_dialog_approved_dogfood`.
