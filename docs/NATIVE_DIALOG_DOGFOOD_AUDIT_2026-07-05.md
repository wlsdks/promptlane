# Native Dialog Dogfood Audit - 2026-07-05

## Purpose

Verify the current native ask handoff path without opening an unexpected OS
dialog. This audit covers the first safe pass for the Codex native dialog
fallback item in `docs/NEXT_BACKLOG.md`.

## Boundary

This pass did not open a real macOS `osascript` dialog. The backlog explicitly
requires operator approval before doing that. The evidence below proves the MCP
elicitation path and the metadata-only fallback path, and it confirms the
native dialog fallback remains opt-in.

`quality-evidence` records this audit as pending native_dialog_preflight evidence.
It does not complete `native_dialog_approved_dogfood`; only an explicitly
approved local run of
`PROMPT_COACH_NATIVE_DIALOG_APPROVED=1 corepack pnpm
dogfood:mcp-native-dialog-approved` can do that.

## Commands Run

```bash
corepack pnpm smoke:mcp-native-dialog
corepack pnpm smoke:mcp-elicitation
```

Both commands rebuild the package before running the smoke harness.

## Evidence

`smoke:mcp-native-dialog`:

- Starts the real `prompt-coach mcp` server over stdio.
- Forces `PROMPT_COACH_NATIVE_DIALOG=0`.
- Calls `ask_clarifying_questions` with `allow_native_dialog: false`.
- Confirms `tools/list` exposes `allow_native_dialog` as a strict boolean
  schema property.
- Confirms the result is `interaction_status: "unsupported"` with
  `answers_count: 0`.
- Confirms clarifying questions are returned for the agent native ask UI.
- Confirms the privacy contract stays local-only with no external calls.
- Completed with `mcp native dialog preflight passed`.

`smoke:mcp-elicitation`:

- Starts the real `prompt-coach mcp` server over stdio.
- Advertises MCP `capabilities.elicitation`.
- Confirms the tool sends a server-initiated `elicitation/create` request.
- The smoke client answers the request with deterministic Korean answers.
- Confirms the final tool response is `interaction_status: "answered"`.
- Confirms `answers_count: 2` and `analyzer: "clarifications-v1"`.
- Confirms the final improved prompt includes the user-provided answers.
- Confirms the privacy contract stays local-only, stores no direct prompt
  input, performs no external calls, and does not return stored prompt bodies.
- Completed with `mcp elicitation smoke passed`.

## Findings

### P1 - Safe agent-native elicitation path is verified

When the MCP client advertises `capabilities.elicitation`, the tool can ask
questions through `elicitation/create`, receive answers, and compose the final
approval-ready draft from verbatim user answers.

### P2 - No-dialog fallback is verified

When native dialog is not allowed and the client lacks elicitation support, the
tool returns metadata with clarifying questions instead of opening an OS dialog
or fabricating answers. This keeps Codex/Claude agents on the manual
`ask user -> apply_clarifications` path.

### P3 - Real OS dialog dogfood still needs explicit operator approval

The macOS `osascript` fallback code path exists, but this audit intentionally
did not execute it. The remaining dogfood item is a manually approved run in a
real Codex or Claude Code session where the operator expects a dialog and can
answer or cancel it.

## Decision

Keep native OS dialog fallback as opt-in integration evidence, not a default
path. The canonical path remains:

1. Use MCP `elicitation/create` when the client supports it.
2. Otherwise return `clarifying_questions` and let the agent ask through its
   native ask UI.
3. Use `allow_native_dialog: true` or `PROMPT_COACH_NATIVE_DIALOG=1` only for an
   explicitly approved local dogfood run.

## Remaining Manual Dogfood

Run a real interactive session only after operator approval:

1. Confirm the operator is present and expects a native OS dialog.
2. Run:

   ```bash
   PROMPT_COACH_NATIVE_DIALOG_APPROVED=1 corepack pnpm dogfood:mcp-native-dialog-approved
   ```

3. Answer one or two dialog questions.
4. Confirm the final response reports `interaction_status: "answered"`, no raw
   secret leakage, no external calls, and no auto-submission.

The approved dogfood command refuses to run unless
`PROMPT_COACH_NATIVE_DIALOG_APPROVED=1` is set. Do not add it to automated CI or
scheduled checks.
