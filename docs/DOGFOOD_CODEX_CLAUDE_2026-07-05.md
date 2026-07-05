# Codex And Claude Code Dogfood Evidence - 2026-07-05

This document records the repeatable local dogfood evidence for the PromptLane
9.5 Codex and Claude Code integration bar. All commands below were run from a
clean feature branch with isolated smoke archives or temporary HOME directories.
No real provider credentials, real user prompt archive, or external LLM provider
calls were required.

## Command Evidence

| Command | Status | Evidence summary |
| --- | --- | --- |
| `corepack pnpm smoke:agent-setup` | PASS | Ran `prompt-coach setup --profile coach --register-mcp` in dry-run and real isolated setup modes, initialized storage for doctor checks, then ran `prompt-coach doctor claude-code` and `prompt-coach doctor codex` against fake provider binaries. |
| `corepack pnpm dogfood:first-coach-loop` | PASS | Built the package, initialized an isolated PromptLane archive, started a local server, captured a Codex prompt through the hook, then ran `coach --json`, `loop collect --json`, and `loop brief --json`. |
| `corepack pnpm smoke:hooks` | PASS | Verified `prompt-coach` and `loopdeck` compatibility hook status plus Claude Code and Codex fail-open hook behavior. |
| `corepack pnpm smoke:mcp-coach-loop` | PASS | Started the MCP server against an isolated archive and exercised score, improve, clarification apply, and clarification record flows through structured MCP responses. |
| `corepack pnpm dogfood:loop-memory-approval` | PASS | Captured a Codex prompt, collected a loop snapshot, called MCP `record_loop_outcome`, `propose_loop_memory_candidate`, `record_loop_memory`, and `propose_instruction_patch`, then verified the instruction file was not written. |

## Integration Coverage

- Codex setup readiness is covered by `prompt-coach doctor codex` inside
  `smoke:agent-setup`.
- Claude Code setup readiness is covered by `prompt-coach doctor claude-code`
  inside `smoke:agent-setup`.
- Hook behavior is covered for both tools by `smoke:hooks`, including fail-open
  behavior when no local PromptLane server is available.
- Prompt improvement and clarification storage are covered by
  `smoke:mcp-coach-loop`.
- First-loop prompt capture, coaching, loop snapshot, and continuation brief are
  covered by `dogfood:first-coach-loop`.
- Evidence-backed loop memory approval and instruction patch proposal are
  covered by `dogfood:loop-memory-approval`.

## Privacy Observations

- The dogfood scripts use isolated HOME directories, isolated data directories,
  local-only servers, and fake provider binaries where provider detection is
  needed.
- The hook and loop dogfoods assert that prompt bodies, raw project paths, and
  secret-looking tokens are not returned in command output.
- MCP dogfood responses are checked through structured content and assert
  local-only, no prompt body return, no raw path return, and no automatic
  instruction file writes.
- The instruction patch dogfood produces a review-only proposal. Applying that
  proposal remains explicitly user-gated.

## Human-only Remaining Steps

- `PROMPT_COACH_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved`
  still requires explicit operator approval because it can open a native OS
  dialog.
- A real installed Codex and Claude Code session should periodically repeat the
  same harness commands after release packaging changes. The current automated
  evidence intentionally avoids mutating real user configuration.
