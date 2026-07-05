# MCP Coach Loop Audit - 2026-07-05

## Purpose

Verify the agent-facing MCP coaching path with a real local stdio MCP server,
not just direct function tests. This audit covers the first user-flow pass from
`docs/NEXT_BACKLOG.md`: can Claude Code or Codex discover prompt-coach tools,
score a weak stored prompt, generate an approval-gated improvement, and store
the user's clarification answers without leaving the local-first boundary?

## Environment

- Repository: `/Users/jinan/side-project/prompt-memory`
- Branch: `codex/mcp-coach-loop-audit`
- Codex CLI: `codex-cli 0.142.5`
- Claude Code: `2.1.199 (Claude Code)`
- MCP command under test: `node dist/cli/index.js mcp --data-dir <temp-data-dir>`
- Data source: temporary local archive initialized with `prompt-coach init`
- Stored test prompt: short Korean request to open an HTML result

This audit did not drive an interactive Claude Code or Codex UI session. It
did exercise the same stdio MCP server command those agents are configured to
launch.

## Path Tested

1. Build current repo output with `corepack pnpm build`.
2. Initialize a temporary local archive with `prompt-coach init --data-dir`.
3. Store one Claude Code `UserPromptSubmit`-shaped event into SQLite through
   the same normalization and redaction modules used by the app.
4. Start the MCP stdio server with the temporary data directory.
5. Send JSON-RPC requests over stdio:
   - `initialize`
   - `tools/list`
   - `tools/call` -> `score_prompt`
   - `tools/call` -> `improve_prompt`
   - `tools/call` -> `apply_clarifications`
   - `tools/call` -> `record_clarifications`

## Evidence

Observed MCP server identity:

```json
{
  "name": "prompt-coach",
  "version": "0.1.0-beta.0"
}
```

Observed tool catalogue:

- 20 tools returned from `tools/list`.
- `score_prompt`, `improve_prompt`, `apply_clarifications`, and
  `record_clarifications` were present.

Observed `score_prompt` result:

```json
{
  "is_error": false,
  "source": "prompt_id",
  "quality_score": {
    "value": 10,
    "max": 100,
    "band": "weak"
  },
  "privacy": {
    "local_only": true,
    "stores_input": false,
    "external_calls": false,
    "returns_prompt_body": false
  }
}
```

Observed `improve_prompt` result:

```json
{
  "is_error": false,
  "has_draft": true,
  "clarifying_questions_count": 2,
  "requires_user_approval": true,
  "next_action": "Ask the user the listed clarifying_questions through the agent's native ask UI before producing or submitting any rewrite. Wait for the user's own answers; do not guess on their behalf."
}
```

Observed `record_clarifications` result:

```json
{
  "is_error": false,
  "answers_count": 2,
  "changed_sections": [
    "scope_limits",
    "output_format",
    "verification_criteria"
  ],
  "privacy": {
    "local_only": true,
    "stores_input": true,
    "external_calls": false,
    "returns_stored_prompt_body": false
  }
}
```

## What Worked

- The local stdio MCP server starts and responds without requiring a web
  server.
- Claude Code and Codex compatible tool discovery is intact: the catalogue is
  visible before any agent-specific UI interaction.
- Stored-prompt scoring works through MCP and does not return prompt bodies.
- `improve_prompt` correctly treats the weak prompt as needing user
  clarification and keeps the rewrite approval-gated.
- `record_clarifications` stores user-origin answers and returns metadata
  without echoing the stored prompt body or draft body.

## Friction Found

1. **The original documented audit path missed `apply_clarifications`.**
   `record_clarifications` is a storage tool; it intentionally returns
   metadata only. For an agent to show the final answer-refined draft to the
   user inside Claude Code or Codex, the natural path is:
   `score_prompt` -> `improve_prompt` -> ask user -> `apply_clarifications` ->
   `record_clarifications`.

   Resolution: docs and the repeatable `smoke:mcp-coach-loop` harness now
   treat `apply_clarifications` as the in-agent draft presentation step before
   optional `record_clarifications`.

2. **The first audit needed a reusable MCP coach-loop smoke command.**
   The initial audit used a one-off Node script to seed a local archive and
   exercise JSON-RPC over stdio.

   Resolution: `smoke:mcp-coach-loop` now builds the package, starts the real
   stdio MCP server against a temporary archive, and verifies `score_prompt` ->
   `improve_prompt` -> `apply_clarifications` -> optional
   `record_clarifications` without returning stored prompt bodies.

3. **The post-record next action forces a context switch for review.**
   `record_clarifications` says to open the draft in the local archive or use
   `prompt-coach show`. That is privacy-preserving, but it means the agent
   cannot complete the review loop entirely through MCP unless it called
   `apply_clarifications` first and kept that draft in context.

4. **The audit still needs one interactive agent run.**
   The stdio server path is the same command used by Claude Code and Codex,
   but native ask UI behavior was not exercised here. A later dogfood pass
   should run the same flow from a real agent session and verify that
   clarifying questions appear in the agent's own ask UI.

## Decisions

- Keep the local-first privacy boundary: do not make
  `record_clarifications` return stored prompt or draft bodies just to reduce
  friction.
- Treat `apply_clarifications` as the in-agent draft presentation step.
- Keep the repeatable smoke harness small and stdio-only; avoid broad MCP
  registry work for this audit alone.

## Recommended Next Slices

No immediate MCP coach-loop slice remains. The remaining validation is the
approval-gated native ask UI dogfood tracked in
`docs/NATIVE_DIALOG_DOGFOOD_AUDIT_2026-07-05.md`; do not open that OS/native
dialog path without explicit operator approval.
