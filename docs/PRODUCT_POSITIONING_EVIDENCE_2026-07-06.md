# PromptLane Product Positioning Evidence 2026-07-06

This document records current evidence for the PromptLane product planning and
positioning 9.5 quality bar.

## Metadata Evidence

| Surface | Evidence |
| --- | --- |
| GitHub repository | `wlsdks/promptlane` description is `PromptLane local-first prompt improvement workspace for Codex, Claude Code, and long-running coding-agent work.` |
| GitHub topics | Includes `promptlane`, `prompt-improvement`, `meta-prompting`, `local-first`, `codex`, `claude-code`, `loop-engineering`, `mcp`, and `worktrees`. |
| npm package metadata | `package.json#description` uses PromptLane positioning while package name remains `promptlane` for compatibility. |
| Codex plugin metadata | `plugins/promptlane/.codex-plugin/plugin.json` uses `displayName: PromptLane` and PromptLane-first descriptions. |
| Claude plugin metadata | `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` use PromptLane-first descriptions. |

## Product Contract Evidence

- `docs/PROMPTLANE.md` states the active product name, positioning, runtime
  compatibility IDs, feature portfolio keep/improve/build/defer/reject
  decisions, privacy boundaries, risk model, MVP slices, and autonomy model.
- `docs/superpowers/specs/2026-07-05-promptlane-repositioning-design.md`
  records why `PromptLane` and `PromptLane` were rejected as primary product
  names and why PromptLane is the active service name.
- `docs/PROMPTLANE.md` and `docs/PROMPTLANE-LEGACY-SURFACES.md` keep PromptLane as
  historical terminology and compatibility-only surface.
- `docs/PROMPTLANE_GOAL_AUDIT_2026-07-05.md` records product name,
  positioning, feature portfolio, data model, privacy boundary, harness docs,
  technical risk handling, and TDD implementation slices as satisfied for the
  current compatibility window.
- `docs/NEXT_BACKLOG.md` keeps the operational queue aligned with PromptLane as
  prompt improvement first and loop-aware continuation second.

## Interpretation

The product planning and positioning axis is ready for 9.5/10 because the
current first-screen README, package metadata, Codex plugin metadata, Claude
plugin metadata, GitHub repository metadata, product contract, backlog, and
goal audit all point to the same product shape:

- PromptLane is the product name.
- `promptlane` remains the compatibility runtime ID.
- Prompt improvement is the first value.
- Loop/worktree/session features are loop-aware continuation for better next
  prompts, not a separate loop-engineering product.
- PromptLane is historical or compatibility-only terminology.
- Hidden provider calls, transcript scraping, automatic resubmission, and
  automatic merge behavior remain rejected.
