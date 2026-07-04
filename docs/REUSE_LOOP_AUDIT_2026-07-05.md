# Reuse Loop Audit - 2026-07-05

## Purpose

Verify whether a user can find a strong stored prompt in the web UI, reuse its
improved draft, and continue work without leaving the local-first boundary.
This audit covers the second user-flow pass from `docs/NEXT_BACKLOG.md`.

## Environment

- Repository: `/Users/jinan/side-project/prompt-memory`
- Branch: `codex/reuse-loop-audit`
- Browser path: Codex in-app Browser
- Local server: temporary archive at `http://127.0.0.1:60324`
- Fixture data:
  - One high-score Claude Code prompt about the `apply_clarifications` flow.
  - One weak Codex prompt containing a fake API token and temp path to verify
    redaction.

The in-app Browser `domSnapshot()` API failed on this page with an unavailable
snapshot method, so the audit used the Browser runtime's read-only page
evaluation plus screenshot evidence.

## Path Tested

1. Build and run the local Loopdeck web server with a temporary data dir.
2. Ingest a high-score stored prompt and a weak redaction fixture.
3. Open the prompt archive in the Codex in-app Browser.
4. Search for `apply_clarifications`.
5. Open the remaining high-score prompt detail page.
6. Inspect available reuse actions.
7. Try `Copy draft`.
8. Try `Save draft`.

## Evidence

Archive/search:

- The archive loaded with two prompts.
- The weak prompt rendered `[REDACTED:api_key]` and `[REDACTED:path]` instead
  of the fake secret/path.
- Searching for `apply_clarifications` narrowed the list to the high-score
  Claude Code prompt.

Detail/reuse:

- The detail page showed score `90`, band `excellent`, and the improved draft.
- The page exposed:
  - `Copy draft`
  - `Save draft`
  - `Copy saved draft`
  - `Copy prompt`
  - MCP follow-up commands for `score_prompt`, `improve_prompt`, and
    `prepare_agent_rewrite`
- `Save draft` succeeded and rendered a saved draft row.

Copy behavior:

```json
{
  "copiedDraftLength": 0,
  "buttonStateChanged": false,
  "error": "Could not copy the improvement draft."
}
```

After increasing the clipboard bridge wait from 250 ms to 1000 ms, the same
in-app Browser copy path still failed. This suggests the issue is not just a
slow clipboard promise; the in-app Browser surface may reject page clipboard
writes or not expose them to the Browser automation clipboard.

## Findings

### P1 - Reuse copy can fail in the Codex in-app Browser

What the user sees: clicking `Copy draft` leaves the clipboard empty and shows
`Could not copy the improvement draft.`

Why it matters: the core reuse loop depends on copying an approval-ready draft
back into Claude Code or Codex. Saving still works, but copy failure makes the
workflow feel broken at the handoff point.

Evidence:

- Browser clipboard text stayed empty after clicking `Copy draft`.
- Page body contained `Could not copy the improvement draft.`
- Console warnings/errors were empty, so the failure is silent from the
  browser console.

Recommended fix:

- Add an in-page manual-copy fallback when clipboard writes fail. For example,
  keep the draft visibly selected/focused or show a small fallback panel with
  the draft text and a clear "select and copy manually" action.
- Preserve privacy/local-first behavior: do not auto-submit, do not externalize
  draft text, and do not store extra data just to recover from copy failure.

Resolution:

- The prompt detail page now opens a local manual-copy fallback when clipboard
  writes fail for either the current improved draft or a saved draft.
- `PromptDetailView` renders a read-only `Manual copy draft text` textarea so
  the operator can select and copy the draft manually without auto-submitting
  it to Codex, Claude Code, or any external service.
- `corepack pnpm e2e:browser` now forces both `document.execCommand("copy")`
  and `navigator.clipboard.writeText()` to fail, clicks `Copy draft` and
  `Copy saved draft`, and verifies that the manual-copy fallback appears for
  both paths.

Current status: resolved for repeatable automated coverage. A fresh manual pass
in the Codex in-app Browser is still useful as user-experience evidence, but
the original missing fallback is no longer an open implementation gap.

Follow-up manual pass:

- A fresh Codex in-app Browser pass on 2026-07-05 confirmed the real browser
  clipboard bridge still leaves clipboard text empty for `Copy draft`, and the
  page now opens the local manual-copy fallback with a read-only
  `Manual copy draft text` textarea.
- The same pass confirmed `Save draft` creates a saved draft row and
  `Copy saved draft` opens the same local manual-copy fallback when clipboard
  writes are unavailable.
- The saved-draft failure path now uses the saved-draft-specific message
  `Could not copy the saved draft.` instead of reusing the current-draft error.
- The page did not expose the fake API token or temporary local path in the
  archive, detail, or fallback state checked during the pass.

### P2 - Saved drafts can be reopened as the current draft

What worked: search found the reusable prompt, detail showed the improved
draft, and `Save draft` persisted it locally.

Follow-up implementation: saved draft rows now expose `Use as current draft`.
This reopens the saved redacted draft text in the current coach draft panel,
so the operator can reuse the existing copy, save, feedback, and manual-copy
fallback controls without auto-submitting the prompt or adding a new storage
write path. Reopened drafts use the user-facing `Saved draft` badge rather
than leaking the internal `saved-draft` mode enum into the UI, and the save
action changes to disabled `Already saved` copy so reopening a draft does not
create a duplicate saved draft row.

## Decisions

- Keep the web UI copy workflow local and manual. Do not auto-submit copied
  prompts into any agent.
- Treat `Save draft` as a persistence fallback, not a replacement for copy.
- Keep the 1000 ms clipboard bridge timeout. It is a safe improvement for slow
  browser bridges even though it does not fully solve the in-app Browser case.

## Recommended Next Slices

1. Re-run the reuse flow in a real browser after this slice is merged to
   confirm the reopened current draft behaves correctly with clipboard fallback.
