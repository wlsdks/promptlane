# UI Patrol Schedule Readiness Evidence 2026-07-06

This ledger records the operational readiness evidence for the scheduled
`ui-patrol` workflow. It is not scheduled-run completion evidence.

| Evidence | Status | Notes |
| --- | --- | --- |
| `.github/workflows/ui-patrol.yml` | PASS | The workflow has `workflow_dispatch` and `schedule` triggers. |
| Weekly cron | PASS | Configured as cron: `17 6 * * 1`. |
| Recent manual artifact | PASS | workflow_dispatch run `28717406758` uploaded `ui-patrol-screenshots` with 9 png files. |
| Repeatable checker | PASS | `corepack pnpm evidence:ui-patrol` distinguishes manual evidence from a real `schedule` event. |

## Boundary

This evidence proves the scheduled workflow is configured, manually runnable,
and guarded by a repeatable checker. It does not complete `scheduled_ui_patrol`
because the current workflow history has no successful `schedule` event with a
downloaded `ui-patrol-screenshots` artifact containing 9 png files.

`quality-evidence` records this readiness ledger as
`scheduled_ui_patrol_preflight` and must keep `scheduled_ui_patrol` in remaining
evidence until the first real cron artifact is verified.
