# UI Patrol Local Evidence Policy - 2026-07-06

This ledger used to track readiness for a scheduled GitHub Actions
`ui-patrol` run. Maintainer policy has changed: PromptLane no longer uses
GitHub Actions workflows for CI or scheduled operational evidence.

## Current Policy

| Surface | Status | Evidence |
| --- | --- | --- |
| GitHub Actions workflows | REMOVED | No `.github/workflows/*.yml` file is required for PromptLane quality evidence. |
| Local browser patrol | PASS | Local `ui-patrol` evidence is collected with `corepack pnpm ui-patrol`. |
| Web user-flow dogfood | PASS | `corepack pnpm dogfood:web-user-flow` exercises the archive/detail/dashboard/coach/projects/mcp/exports/settings/mobile flow. |
| Quality evidence | PASS | `quality-evidence` uses local browser evidence and does not require `scheduled_ui_patrol`. |

## Boundary

Local `ui-patrol` evidence is sufficient for the web operations scorecard when
paired with web user-flow dogfood and browser assertions. Do not reintroduce a
scheduled GitHub Actions workflow unless a dedicated product decision explains
which local-first risk it closes beyond the local gate.
