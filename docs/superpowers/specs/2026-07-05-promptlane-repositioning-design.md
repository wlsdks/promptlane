# PromptLane Repositioning Design

> **For agentic workers:** This is a product and migration design spec. Do not
> rename repositories, npm packages, CLI binaries, plugin manifests, slash
> namespaces, or MCP server names from this document alone. Follow the TDD
> migration slices below.

## Status

Drafted on 2026-07-05 after user review rejected `PromptLane` and `PromptLane`
as primary service names.

Decision summary:

- Product name: PromptLane.
- PromptLane is rejected as the primary product name.
- `PromptLane` remains a useful workflow phrase, not the service name.
- Keep `promptlane` as the npm package, primary CLI, hook command, Claude
  Code slash namespace, and canonical MCP server name until a dedicated
  compatibility migration says otherwise.
- Reframe loop/worktree/session features as loop-aware continuation for better
  prompts, not as a loop-engineering product identity.

## Why This Change Exists

`PromptLane` made the product sound like a dedicated loop-engineering surface.
That is not the strongest first value. The product starts with prompt
improvement:

- capture prompts from Codex and Claude Code
- score weak requests
- generate copy-ready better prompts
- review recurring prompt habits
- reuse strong prompt patterns safely

Loop features are still important, but they should support better next prompts:

- loop snapshots help recover context for long-running work
- selected worktree/session/branch briefs help the next request be specific
- approved loop memory can improve future prompts and project instructions

`PromptLane` was also rejected as a product name because it sounds like a
feature label instead of a service. It can remain a workflow name for the
one-call coaching loop.

## Product Thesis

PromptLane is a local-first prompt improvement workspace for Codex, Claude
Code, and long-running coding-agent work.

It helps developers write better coding-agent requests by recording prompts
locally, scoring them, improving them, and carrying approved lessons forward
across longer agent workflows.

Short description:

```text
Local-first prompt improvement workspace for Codex, Claude Code, and long-running coding-agent work.
```

Korean description:

```text
PromptLane은 Codex와 Claude Code 프롬프트를 로컬에서 기록, 평가, 개선하고 장기 coding-agent 작업의 다음 요청까지 이어주는 prompt improvement workspace입니다.
```

## Naming Rationale

PromptLane is the recommended name because:

- it sounds more like a service than `PromptLane`
- it keeps `Prompt` visible, so the product is not mistaken for a generic agent
  platform
- `Lane` suggests a path from captured prompt to improved request to continued
  agent work
- it does not imply loop engineering is the only use case
- npm checks at design time returned not found for `promptlane` and
  `prompt-lane`
- repository checks at design time found no `wlsdks/promptlane` or
  `wlsdks/prompt-lane`; `wlsdks/promptlane` was selected and renamed on
  2026-07-05

Names rejected during this pass:

| Name | Decision | Reason |
| --- | --- | --- |
| PromptLane | Reject | Too loop-engineering-first for a prompt improvement product |
| PromptLane | Reject as product name | Clear but too descriptive; keep as workflow phrase |
| PromptCraft | Reject | Crowded ecosystem usage and brand ambiguity |
| PromptDesk | Reject | Existing product/package usage and weaker fit |
| PromptPilot | Reject | Existing package/project usage and agent-pilot implication |
| PromptNest | Defer | Good local-memory feel, but weaker improvement/progression signal |
| Cuebase | Defer | Strong brand feel, but higher explanation cost because it hides prompt intent |
| Briefsmith | Defer | Good brief-writing feel, but too narrow for archive/scoring/habits |

## Product Model

PromptLane has four layers. The order matters in README, docs, and onboarding.

### 1. Prompt Improvement Core

This is the first-run value.

Capabilities:

- local prompt capture
- redacted Markdown archive
- SQLite/FTS index
- Prompt Quality Score
- deterministic improvement draft
- copy/manual approval flow
- prompt habits and archive scoring
- prompt practice and feedback loops

Boundaries:

- no hidden provider calls
- no automatic prompt resubmission
- no prompt body echo in MCP status or setup paths
- no raw path or secret leakage in user-facing summaries

### 2. Codex And Claude Code Integration

PromptLane should feel native to the tools users already run.

Capabilities:

- explicit setup for hooks and MCP
- fail-open hook capture
- Codex UserPromptSubmit guidance without stdout noise
- Claude Code slash command workflow
- Codex plugin skill workflow
- MCP tools for scoring, improving, clarification, rewrite, judgment, and
  continuation

Rule:

Codex and Claude Code are first-class prompt improvement surfaces, not generic
agent runtimes owned by PromptLane.

### 3. Loop-Aware Continuation

Loop features should be described as a way to keep long-running prompt work
coherent.

Capabilities:

- loop snapshots
- compact boundary metadata
- selected worktree/session/branch continuation briefs
- command-center review summaries
- approved loop memory
- instruction patch proposal/apply gates

Rule:

Loop memory exists to help the next prompt and future project instructions. It
must not become automatic agent control, background transcript scraping, or
merge automation.

### 4. Local Review Workspace

The web UI and CLI are an operational workspace.

Capabilities:

- archive search/detail
- prompt improvement review/copy
- saved draft reuse
- projects and policy views
- loop status and selected worktree detail
- export/import review

Rule:

The product should feel like a local developer workspace for repeated prompt
improvement, not a marketing dashboard or an autonomous agent platform.

## Runtime Compatibility Policy

Keep these stable until explicit migration slices prove otherwise:

| Surface | Current value | Rule |
| --- | --- | --- |
| npm package | `promptlane` | Keep |
| Primary CLI | `promptlane` | Keep |
| Claude Code slash namespace | `/promptlane:*` | Keep |
| MCP server name | `promptlane` | Keep |
| Hook command | `promptlane hook ...` | Keep |
| Data directory | `~/.promptlane` | Keep |
| Wrapper bins | `pl-claude`, `pl-codex` | Keep |

Candidate future surfaces:

| Surface | Target | Rule |
| --- | --- | --- |
| Product-facing repo | `wlsdks/promptlane` or `wlsdks/prompt-lane` | Dedicated migration slice |
| Product CLI alias | `promptlane` or `prompt-lane` | Do not add until package/bin migration plan is accepted |
| Existing `promptlane` alias | Remove or hide from docs | Decide in a separate alias cleanup slice |

Do not use broad search-and-replace. `promptlane` is correct in commands,
package names, config paths, MCP server names, and slash namespaces.

## README Rewrite Requirements

The README first viewport should answer:

1. What is PromptLane?
2. Why should a Codex or Claude Code user care?
3. What is the first command?
4. What stays local?
5. How do loop features relate to prompt improvement?

Recommended English opening:

```md
# PromptLane

Local-first prompt improvement workspace for Claude Code, Codex, and
long-running coding-agent work.

- Capture coding-agent prompts locally in Markdown and SQLite.
- Score weak requests and show which prompt habits need work.
- Generate copy-ready improved prompts without auto-submitting anything.
- Reuse approved lessons and loop snapshots when long-running agent work needs
  a better next request.
```

Recommended Korean opening:

```md
# PromptLane

Claude Code, Codex, 장기 coding-agent 작업을 위한 local-first prompt
improvement workspace.

- 코딩 에이전트에 보낸 프롬프트를 Markdown과 SQLite에 로컬로 기록합니다.
- 약한 요청을 점수화하고 어떤 프롬프트 습관을 고쳐야 하는지 보여줍니다.
- 자동 제출 없이 복사해서 검토할 수 있는 개선 프롬프트를 만듭니다.
- 장기 agent 작업에서는 승인된 lesson과 loop snapshot을 다음 요청 작성에
  재사용합니다.
```

README ordering:

1. First prompt improvement loop
2. Install/setup for Codex and Claude Code
3. What gets captured and what stays local
4. Prompt scoring and improvement
5. Saved drafts and reuse
6. Loop-aware continuation for worktrees/sessions/branches
7. MCP and slash command surfaces
8. Privacy, deletion, export, and limitations
9. Development and release gates

## Metadata Rewrite Requirements

Change product-facing metadata to PromptLane:

- `package.json#description`
- `.claude-plugin/plugin.json#description`
- Codex plugin `interface.displayName`
- Codex plugin `interface.shortDescription`
- Codex plugin `interface.longDescription`
- README / README.ko first screen
- `AGENTS.md` product summary
- `CLAUDE.md` product summary
- `docs/NEXT_BACKLOG.md`
- goal audit and product contract docs

Keep compatibility runtime IDs:

- `package.json#name`
- `bin.promptlane`
- `pl-claude`
- `pl-codex`
- slash command files under `commands/`
- MCP server name `promptlane`
- data directory docs for `~/.promptlane`

## Documentation Architecture

Add a new primary product contract:

- `docs/PROMPTLANE.md`

Retire the current primary PromptLane contract:

- `docs/PROMPTLANE.md` should become a short rejected-decision record, move to a
  legacy folder, or be replaced after `docs/PROMPTLANE.md` lands.

Update routing:

- `AGENTS.md` should point product planning to `docs/PROMPTLANE.md`.
- `CLAUDE.md` should say PromptLane is the product and `/promptlane:*` is the
  canonical Claude Code namespace during compatibility.
- Loop snapshot/schema docs stay as loop feature docs, not product contract
  docs.

## Test And Drift Guards

Add or update tests so future changes cannot silently re-promote PromptLane:

- package/plugin metadata test expects PromptLane product-facing copy
- README first-screen test expects PromptLane positioning
- AGENTS/CLAUDE instruction routing test expects `docs/PROMPTLANE.md`
- tests preserve `promptlane` runtime IDs
- tests forbid promoting `/promptlane:*` as an active namespace
- tests keep loop features described as loop-aware continuation rather than the
  whole product identity

Initial implementation should include a focused RED test before changing
metadata.

## Migration Slices

### Slice 1 - Product Contract And Metadata

Goal:

- Add `docs/PROMPTLANE.md`
- Update package/plugin metadata
- Update README/README.ko first screen
- Add drift guards
- Mark `PromptLane` as rejected or legacy

Out of scope:

- GitHub repo rename
- removing `promptlane` binary alias
- npm package rename

### Slice 2 - Instruction And Harness Docs

Goal:

- Update `AGENTS.md`, `CLAUDE.md`, `docs/AGENT-HARNESS.md`,
  `docs/INSTRUCTION-FILES.md`, and plugin skill docs to PromptLane-first
  positioning.

Out of scope:

- changing command IDs
- changing hook installation behavior

### Slice 3 - PromptLane Alias Decision

Goal:

- Decide whether `bin.promptlane` remains as compatibility, is hidden from docs,
  or is removed before public beta.
- Retire `/promptlane:*` alias plans unless a concrete user need appears.

Out of scope:

- npm package rename

### Slice 4 - GitHub Repository Rename

Goal:

- Rename repo from `wlsdks/promptlane` to `wlsdks/promptlane`.
- Update repository URLs, docs, plugin manifests, and release checklists.
- Status: implemented on 2026-07-05.

Out of scope:

- runtime ID changes

## Acceptance Criteria

The repositioning is complete when:

- README and README.ko lead with `PromptLane`, prompt improvement, and
  local-first privacy.
- Loop/worktree/session features are presented as prompt-continuation memory.
- Product-facing package/plugin metadata says `PromptLane`.
- `promptlane` runtime IDs remain stable.
- Tests prevent accidental re-promotion of PromptLane as product name.
- The old PromptLane direction is recorded as rejected or legacy, not active
  product truth.
- No implementation slice changes prompt capture, storage privacy, MCP safety,
  or hook fail-open behavior unless covered by a separate TDD plan.

## Open Questions

1. Whether to remove the `promptlane` CLI alias before public beta or keep it as
   a silent compatibility alias until a later breaking change.
2. Whether `docs/PROMPTLANE.md` should remain as rejected-decision history or be
   deleted after `docs/PROMPTLANE.md` lands.

These are migration sequencing questions, not blockers for adopting
PromptLane as the product name.
