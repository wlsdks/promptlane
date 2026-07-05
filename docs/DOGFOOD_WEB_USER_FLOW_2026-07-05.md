# Web User-Flow Dogfood Evidence - 2026-07-05

This document records repeatable local web user-flow evidence for the
PromptLane 9.5 web operations bar. The command uses an isolated data directory,
isolated HOME, temporary prompt fixtures, a local server, and Playwright. It
does not use real user prompt archives, provider credentials, or external LLM
provider calls.

## Command Evidence

| Command | Status | Evidence summary |
| --- | --- | --- |
| `corepack pnpm dogfood:web-user-flow` | PASS | Runs the built local server through `scripts/browser-e2e.mjs`, captures isolated Codex and Claude Code prompt fixtures, and verifies archive, detail, dashboard, coach, projects, mcp, exports, settings, and mobile rendering flows. |

## Current-Main Evidence

- fresh current-main pass after PR #465:
  `corepack pnpm dogfood:web-user-flow` passed on main-derived work after main
  CI run `28750766036`.
- The run built the package, initialized an isolated data directory, started a
  local server, captured prompt fixtures, seeded judge score and loop outcome
  evidence, then completed the Playwright browser flow.
- main CI run `28750766036` passed `test (22)` and `test (24)` with
  `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm pack:dry-run`.

## Flow Coverage

- `archive`: validates the Prompt archive first screen, language toggle, safe
  project labels, and redacted prompt paths.
- `detail`: validates improvement draft rendering, score breakdowns, MCP
  follow-up commands, LLM judge score display, manual clipboard fallback,
  saved draft reuse, and saved draft copy fallback.
- `dashboard`: validates archive score review and chart rendering.
- `coach`: validates PromptLane prompt improvement identity, habit command
  center, bad prompt review queue, next request brief preview, and copy
  confirmation.
- `projects`: validates agent rules analysis and capture pause state.
- `mcp`: validates MCP readiness, first MCP call guidance, core call order, and
  tool catalog visibility.
- `exports`: validates anonymized export preview, export run, and redacted path
  output.
- `settings`: validates masked local paths and browser-safe settings rendering.
- `mobile`: validates a 390px-wide settings viewport without horizontal
  overflow.

## Screenshot Evidence

`dogfood:web-user-flow` supports `SCREENSHOT_DIR=<path>` and captures
9 screenshots when provided:

- `archive-desktop.png`
- `detail-desktop.png`
- `dashboard-desktop.png`
- `coach-desktop.png`
- `projects-desktop.png`
- `mcp-desktop.png`
- `exports-desktop.png`
- `settings-desktop.png`
- `settings-mobile.png`

## Privacy Observations

- The browser dogfood uses temporary local data and removes it after the run.
- The visible UI assertions check that prompt paths are redacted as
  `[REDACTED:path]` or `[local path]`.
- The run asserts browser-visible states do not expose prompt bodies, raw local
  paths, or secret-looking tokens.
- The browser console and HTTP response checks must finish with zero errors.

## Remaining Human-only Web Evidence

- Scheduled `ui-patrol` remains pending until a real GitHub Actions `schedule`
  event appears and its screenshot artifact is verified.
- Native OS ask UI dogfood remains separate and must not run without explicit
  operator approval.
