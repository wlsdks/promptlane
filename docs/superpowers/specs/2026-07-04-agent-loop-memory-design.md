# Agent Loop Memory Design

> **For agentic workers:** This is a product and architecture design spec. Implementation must start from a separate implementation plan and use TDD. Do not rename packages, remotes, or public commands from this document alone.

**Goal:** Reposition `prompt-coach` into a local-first agent loop memory and meta-prompting workbench that is tightly integrated with Codex and Claude Code.

**Recommended service name:** Loopdeck

**Repository target:** `wlsdks/loopdeck`

**Status:** Product planning hardening in progress. Do not start implementation until the feature portfolio and go/no-go gates in this document are accepted.

---

## 1. Why This Is Bigger Than Prompt Coaching

The current product captures prompts from Claude Code and Codex, scores them, and produces copy-based improvements. That remains useful, but it is no longer enough for the 2026 agent workflow.

The stronger product thesis is:

> Loopdeck is a local-first workbench for recording, understanding, and improving coding-agent loops across Codex, Claude Code, worktrees, and long-running sessions.

The unit of value should move from a single prompt to an agent loop:

- what the user asked
- which agent/tool/session handled it
- what worktree/branch/cwd it ran in
- what files or commands changed
- what the agent learned or failed to resolve
- what the next loop prompt should say
- whether a second agent reviewed the result

The current name `prompt-coach` is accurate for the old scope but too narrow for this. It implies prompt linting. The target product is closer to loop observability, prompt memory, agent handoff, and meta-prompt synthesis.

## 2. Current Evidence

### Internal Baseline

Verified locally:

- package name: `prompt-coach`
- current GitHub repo metadata via `gh repo view`: `wlsdks/loopdeck`
- local git remote points at `https://github.com/wlsdks/loopdeck.git`
- Node 22 baseline: `PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm test`
- test result: 83 files, 589 tests passed
- default shell currently uses Node 24 and pnpm 11; existing `better-sqlite3` native module was built for Node 22 ABI, so Node 24 tests require rebuild or fresh install before they are meaningful

Existing product surfaces:

- Claude Code and Codex adapters normalize prompt submit events.
- Hook capture is fail-open.
- MCP exposes `coach_prompt`, `score_prompt`, `improve_prompt`, `score_prompt_archive`, `prepare_agent_rewrite`, `record_agent_rewrite`, `prepare_agent_judge_batch`, and `record_agent_judgments`.
- Archive scoring already produces a practice plan and next prompt template.
- Agent rewrite/judge flows already use the active user-controlled agent session and avoid hidden provider calls.
- Storage is prompt-centric: prompt rows, events, redactions, tags, drafts, project policies, import/export jobs, judgments, ask events.

Planning gaps before development:

- The first version of this spec defined direction and a first slice, but did not explicitly decide which existing features stay unchanged, which become Loopdeck features, which should be deprecated, and which are new.
- It did not define acceptance criteria per Codex and Claude Code integration surface.
- It did not separate "core product" from "harness/instruction docs" strongly enough.
- It did not define a stop condition for avoiding overbuilt agent-runtime infrastructure.
- It did not include a clear go/no-go gate before implementation.

Missing model:

- no first-class loop/run/session snapshot
- no worktree/branch-aware agent run map
- no periodic loop collection job
- no cross-session continuation brief
- no "agent loop health" dashboard
- no canonical export path for project instruction and harness docs

## 2.1 Feature Portfolio Decision Matrix

Development must start from this portfolio decision, not from novelty.

| Area                                    | Current state                                                                                               | Decision                            | Reason                                                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Prompt capture                          | Claude Code and Codex adapters plus fail-open hooks exist                                                   | **Keep and harden**                 | This is the data foundation. Loop snapshots should reference captured prompts instead of replacing them.                   |
| Prompt archive Markdown                 | Markdown remains source of truth for prompts                                                                | **Keep unchanged in Slice 1**       | Human-readable local archive is still valuable. Do not move loop state into project docs by default.                       |
| SQLite prompt index/FTS                 | Existing local index and search                                                                             | **Keep and extend**                 | Add loop snapshot tables beside prompt tables. Do not rebuild storage around a new runtime.                                |
| Local prompt scoring                    | Rule-based `0-100` scoring exists                                                                           | **Improve later, do not replace**   | Existing score powers habit gaps. It is not enough for loop quality but remains useful input.                              |
| Prompt improvement drafts               | Copy-based deterministic drafts exist                                                                       | **Keep and reframe**                | Drafts become one kind of "next loop brief." Do not auto-submit.                                                           |
| MCP agent rewrite/judge                 | Active-agent mediated, opt-in                                                                               | **Keep and extend**                 | This is the correct safety pattern for semantic judgment. Add loop tools later using the same privacy boundary.            |
| Web archive/detail/dashboard            | Existing operational UI                                                                                     | **Keep; add Loops later**           | Web remains useful, but Slice 1 must prove loop model before UI work.                                                      |
| Import/export jobs                      | Prompt/archive-oriented                                                                                     | **Keep; defer loop export**         | Loop snapshots should not be exported into project docs until privacy and usefulness are proven.                           |
| `coach_prompt` one-call MCP workflow    | Existing one-call agent workflow                                                                            | **Improve after loop model**        | It should eventually include latest loop status and brief, but not in Slice 1.                                             |
| Project policies                        | capture/export flags exist                                                                                  | **Extend later**                    | Add loop capture/export policy only after loop data exists.                                                                |
| Agent wrappers `pc-claude` / `pc-codex` | Experimental initial prompt wrappers                                                                        | **Do not expand now**               | Hooks and MCP are tighter official surfaces. Wrappers do not cover later interactive turns.                                |
| Cron/service                            | Server service exists; `loop collect --source service` now provides an explicit one-shot collection command | **Improve after manual proof**      | Periodic collection is useful, but scheduling must stay opt-in and call an explicit command rather than hidden automation. |
| Full trace ingestion                    | Not implemented                                                                                             | **Do not build now**                | OpenAI/ADK-style traces are useful references, but ingesting full traces/transcripts risks privacy and scope explosion.    |
| Semantic vector memory                  | Not implemented                                                                                             | **Do not build by default**         | Start with structured SQLite summaries. Add embeddings only if exact search and structured fields are insufficient.        |
| Repo/package rename                     | Partially renamed repo metadata, package still `prompt-coach`                                               | **Plan, do not execute in Slice 1** | Branding is important but should not block proving the loop model.                                                         |

This matrix is the planning gate. If an implementation task is not supported by one row above, it belongs in a later proposal.

### 2026 External Direction

The current agent ecosystem points toward traces, memory, worktrees, hooks, evals, and human-in-the-loop control.

- OpenAI Agents SDK traces model generations, tool calls, handoffs, guardrails, and custom events for debugging and monitoring.
- OpenAI agent eval guidance starts with traces, then moves to graders, datasets, and repeatable eval runs.
- Codex official docs define `AGENTS.md`, MCP, hooks, worktrees, automations, record/replay, and plugin packaging as durable integration surfaces.
- Codex hooks explicitly support prompt scanning, persistent memory creation, validation after stops, and per-directory prompting.
- Claude Code docs position plugins as bundles of skills, agents, hooks, MCP servers, LSP servers, and monitors.
- Google ADK treats context like source code: sessions, memory, tool outputs, and artifacts are assembled into a structured view where irrelevant events can be filtered and older turns summarized.
- AGENTS.md has become the cross-agent project instruction convention. It should be the durable repo-level instruction file; CLAUDE.md should mirror Claude-specific operational details only when needed.
- Karpathy's Software 3.0 framing supports the idea that natural-language prompts are executable artifacts, but the practical lesson is not "fully autonomous everything." It is to expose clean APIs, docs, and verification loops so agents can safely act.

## 3. Product Positioning

### Name

Recommended name: **Loopdeck**

Why:

- "Loop" matches the current market language: loop engineering, agent loops, review loops, continuation loops.
- "Deck" suggests an operating surface: cards, runs, sessions, worktrees, next moves.
- It is broader than prompts without becoming vague like "agent platform."
- npm availability check returned 404 for `loopdeck` at the time of investigation.

Alternatives considered:

- `loopwright`: strong engineering feel, but visually close to Playwright and may imply browser automation.
- `agent-loop-memory`: descriptive but too long and not brandable.
- `prompt-loop`: better than prompt-coach, but still too prompt-centric.
- `loopdeck-ai`: useful fallback if `loopdeck` is unavailable on GitHub/npm, but less clean.

### Repository And Description

Target GitHub repository:

```text
wlsdks/loopdeck
```

Target short description:

```text
Local-first agent loop memory and meta-prompting workbench for Codex, Claude Code, and coding-agent workflows.
```

Target topics:

```text
ai-coding
agentic-development
claude-code
codex
developer-tools
local-first
loop-engineering
mcp
meta-prompting
sqlite
worktrees
```

Rename sequencing:

1. Rename GitHub repository from `wlsdks/prompt-coach` to `wlsdks/loopdeck`. (**implemented**)
2. Update local `origin` from stale prompt-coach/prompt-memory URLs to the new repo URL. (**implemented**)
3. Update README and docs to say `Loopdeck` as product name while preserving `prompt-coach` as the current CLI/package during a deprecation window. (**implemented**)
4. Add `loopdeck` CLI/package rename as a separate migration plan because it touches npm, plugin commands, docs, binary names, package files, and tests.

Do not rename the npm package and CLI command in the same commit as the product/repo rename. That would mix brand migration with runtime compatibility risk.

## 4. Integration Strategy

Codex and Claude Code are not optional integrations. They are the primary runtime surfaces.

### Codex

Use these official surfaces:

- `AGENTS.md` for repo instructions.
- `.codex/config.toml` for project-scoped trusted config.
- `.codex/hooks.json` or inline hooks for `UserPromptSubmit`, `Stop`, `PostToolUse`, `PreCompact`, `PostCompact`, `SessionStart`, `SubagentStart`, and `SubagentStop`.
- MCP server for agent-readable loop status, loop brief, prompt archive search, review packets, and record operations.
- Worktree metadata from git plus Codex-managed worktree paths when discoverable through safe local inspection.
- Automations only as a user-facing scheduling surface; Loopdeck should not secretly create Codex automations without explicit setup.

Required Codex-facing Loopdeck capabilities:

- `loopdeck status`: show whether hooks, MCP, server, and capture are active for the current repo.
- `loopdeck loop collect`: collect one loop snapshot for the current cwd/session.
- MCP `get_loopdeck_status`: expose safe readiness and next actions.
- MCP `prepare_loop_brief`: return a raw-free continuation prompt for the active agent.
- MCP `record_loop_outcome`: record user-approved outcome metadata after a loop.
- Hook `UserPromptSubmit`: capture prompt and attach safe coach context where enabled.
- Hook `Stop`: collect loop snapshot and optionally suggest next command without blocking the agent.
- Hook `PreCompact` or `PostCompact`: record compaction boundary metadata, not raw transcript dumps.

Codex acceptance criteria:

- `prompt-coach setup --profile coach --register-mcp --open-web` still works during the Loopdeck transition.
- Project `.codex/config.toml` and hook examples use current Codex surfaces: `AGENTS.md`, MCP server config, lifecycle hooks, and worktrees.
- The loop collector does not require reading `$CODEX_HOME` private state or Codex app databases.
- Worktree awareness comes from git commands and safe labels first. Codex-managed worktree metadata is used only when it is exposed through documented or user-approved local surfaces.
- A Codex user can ask the active agent for the next loop prompt through MCP without receiving prompt bodies or raw paths.
- Hook failures remain fail-open and do not block Codex.

### Claude Code

Use these Claude Code surfaces:

- plugin package that bundles slash commands, skills, hooks, MCP server config, and optional monitors
- Claude Code hooks for prompt submit, stop, subagent lifecycle, worktree events, file changes, and compact boundaries when available
- MCP server for loop memory and active-agent rewrite/judge handoff
- `CLAUDE.md` for Claude-specific repo behavior, with `AGENTS.md` as the cross-agent source of truth

Future Claude-facing Loopdeck namespace target:

- `/loopdeck:setup`
- `/loopdeck:status`
- `/loopdeck:loop`
- `/loopdeck:brief`
- `/loopdeck:review-loop`
- `/loopdeck:open`

Current Claude Code slash commands remain `/prompt-coach:*`. The `/loopdeck:*`
namespace must not ship until the dedicated plugin rename plan proves a dual
namespace migration path.

Claude Code acceptance criteria:

- Claude Code plugin setup remains explicit and consent-based.
- Claude Code hooks preserve the `UserPromptSubmit` stdout safety rule: do not print raw prompt bodies or secrets into model-visible output.
- The Claude plugin can expose `/loopdeck:*` commands later, but existing `/prompt-coach:*` commands must continue during migration.
- Claude Code MCP usage follows the same active-agent mediated pattern as the existing rewrite/judge tools.
- Hook examples use deterministic shell hooks for collection and reserve prompt/agent hooks for review suggestions only.

## 4.1 Why Not Build A Generic Agent Runtime

Loopdeck should not compete with LangGraph, ADK, Temporal, or hosted agent runtimes. Those systems own durable execution, graph orchestration, and generalized tool dispatch.

Loopdeck's lane is narrower:

- local capture of coding-agent prompts and loop metadata
- privacy-safe summaries of work across sessions/worktrees
- continuation prompts and review prompts for existing agents
- local diagnostics for whether agent loops are improving

Use runtime ecosystems as references for trace shape, memory boundaries, and eval patterns. Do not reimplement them.

## 5. Instruction And Harness Docs

The repo should move toward a layered instruction system:

### AGENTS.md

AGENTS.md should be the canonical cross-agent document.

It should contain:

- product thesis
- setup commands
- verification commands with Node 22/24 caveat
- architecture boundaries
- privacy rules
- TDD expectations
- Git/PR flow
- CodeGraph usage
- loop memory design rules
- what must never be automated without consent

Keep it concise. Codex has a default project instruction byte limit, so AGENTS.md should point to deeper docs rather than embedding every detail.

### CLAUDE.md

CLAUDE.md should be Claude-specific and shorter than AGENTS.md.

It should contain:

- "read AGENTS.md first" instruction
- Claude Code hook/stdout cautions
- plugin/slash command expectations
- subagent usage expectations
- Claude-specific verification or UI behavior

Do not duplicate the whole AGENTS.md content. Duplication causes drift.

### Harness Docs

Add or revise:

- `docs/LOOPDECK.md`: product thesis, loop model, user workflows.
- `docs/AGENT-HARNESS.md`: Codex and Claude Code integration contract, hooks, MCP tools, plugin commands, setup verification.
- `docs/INSTRUCTION-FILES.md`: AGENTS.md/CLAUDE.md structure, max-size guidance, nested override policy, examples.
- `docs/LOOP-SNAPSHOT-SCHEMA.md`: loop snapshot schema and privacy rules.

Existing `docs/PLUGINS.md` and `docs/ADAPTERS.md` should be updated after the design is approved.

Instruction-file rules:

- `AGENTS.md` is the source of truth for cross-agent behavior because Codex and the broader AGENTS.md convention both use it as a predictable agent README.
- `CLAUDE.md` should become a Claude Code adapter document, not a duplicate full project manual.
- Long-lived product and harness rules belong in docs files linked from AGENTS.md, not embedded in AGENTS.md until it exceeds useful context size.
- Harness docs must include exact setup verification commands, not prose-only intent.
- Generated loop briefs must not overwrite AGENTS.md or CLAUDE.md. They can propose patches for user review.

Required harness document set before large implementation:

| Document                       | Purpose                                                            | Required before                 |
| ------------------------------ | ------------------------------------------------------------------ | ------------------------------- |
| `docs/LOOPDECK.md`             | Product thesis, loop model, user workflows, feature portfolio      | Brand migration or web Loops UI |
| `docs/AGENT-HARNESS.md`        | Codex/Claude Code hooks, MCP, plugin commands, setup verification  | Hook/MCP loop integration       |
| `docs/INSTRUCTION-FILES.md`    | AGENTS.md/CLAUDE.md layering, size limits, examples, anti-patterns | AGENTS/CLAUDE rewrite           |
| `docs/LOOP-SNAPSHOT-SCHEMA.md` | Storage schema, privacy fields, raw-data exclusions                | SQLite loop snapshot migration  |

## 6. Data Model

Add a first-class loop snapshot model without replacing the prompt archive.

```ts
type LoopSnapshot = {
  id: string;
  created_at: string;
  tool: "codex" | "claude-code" | "gemini" | "unknown";
  source: "hook" | "cli" | "mcp" | "service";
  session_id?: string;
  thread_id?: string;
  cwd_label: string;
  project_id: string;
  git_root_hash?: string;
  branch?: string;
  worktree_label?: string;
  prompt_ids: string[];
  event_counts: {
    prompts: number;
    tool_calls?: number;
    files_changed?: number;
    tests_run?: number;
    errors?: number;
  };
  quality: {
    average_prompt_score?: number;
    top_gaps: string[];
    unresolved_questions: string[];
  };
  outcome: {
    status:
      | "unknown"
      | "in_progress"
      | "passed"
      | "failed"
      | "blocked"
      | "abandoned";
    summary: string;
    evidence_refs: string[];
  };
  next_brief: {
    generated: boolean;
    prompt_id?: string;
    summary: string;
  };
  privacy: {
    stores_prompt_bodies: false;
    stores_raw_paths: false;
    local_only: true;
  };
};
```

Storage rules:

- Store prompt bodies only in the existing redacted prompt archive.
- Loop snapshots reference prompt IDs and redacted summaries.
- Store hashed git roots and masked cwd labels by default.
- Store changed file paths only as masked labels or hashed paths unless the local user explicitly requests raw local diagnostics.
- Do not ingest full Codex/Claude private transcript databases.
- Do not store provider tokens, cookies, account state, browser profile data, or model hidden reasoning.

## 7. Self-Improving Behavior

Loopdeck can improve itself only through an approval-based loop.

Allowed:

1. collect local events
2. summarize recurring friction
3. propose prompt/instruction/doc changes
4. generate a patch or copy-ready brief
5. ask the user or active agent session to approve
6. record outcome and whether the recommendation helped

Not allowed:

- silently edit AGENTS.md or CLAUDE.md
- silently change Codex/Claude settings
- auto-submit prompts into Codex or Claude Code
- run hidden external LLM calls
- proxy provider credentials
- mark its own proposed change as accepted without user or test evidence

The right autonomy model is an "autonomy slider":

- level 0: observe only
- level 1: suggest next prompt
- level 2: draft patch or instruction update
- level 3: apply after explicit approval
- level 4: run gated loop with stop conditions and mandatory verification

Level 4 should be opt-in and limited to local, non-destructive operations until there is strong evidence from tests and real user feedback.

## 8. What Not To Build Yet

Do not build these in the first slice:

- cloud sync or team backend
- semantic embeddings as a default dependency
- provider-routed hidden judge calls
- raw transcript scraping from private Codex/Claude state
- automatic prompt resubmission
- full Temporal/LangGraph-style durable runtime
- generalized project management app
- massive all-at-once package rename

These are either outside the local-first promise or too large before proving the loop snapshot model.

## 8.1 Technical Risks And Mitigations

| Risk                     | Why it matters                                                                          | Mitigation                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Prompt body leakage      | Hook stdout, CLI JSON, MCP results, tests, or docs can accidentally expose user prompts | Add privacy assertions for prompt bodies, raw paths, tokens, transcript paths, and redaction placeholders on every new surface. |
| Raw path leakage         | Worktree/session features naturally tempt raw path output                               | Store `cwd_label`, `project_id`, optional hash fields by default. Raw local diagnostics require explicit flags.                 |
| Overbuilding runtime     | Building a graph runtime would delay product proof                                      | Keep Slice 1 as snapshot/brief only. No background cron until manual collection proves value.                                   |
| Brand migration churn    | Renaming package/CLI/plugin/repo together can break users                               | Split brand migration into repo/docs first, CLI aliases second, package rename last.                                            |
| Hook fragility           | Codex/Claude hook surfaces are powerful but can disrupt agent use                       | Hook collection must be fail-open, bounded, and raw-free. Manual CLI path comes first.                                          |
| Multi-worktree ambiguity | Git branch ownership and detached worktrees make identity confusing                     | Use git root hash, branch label, worktree label, and session id separately. Do not assume branch uniquely identifies a loop.    |
| Scoring tunnel vision    | Existing prompt score may optimize form over actual agent outcome                       | Treat prompt score as one signal. Add outcome status and verification evidence fields before any "loop quality" score.          |
| External-source drift    | Codex/Claude/ADK docs change quickly                                                    | Keep source URLs and reviewed date in planning docs. Re-check before hook/plugin implementation.                                |

## 8.2 Go/No-Go Gate Before Development

Implementation can begin only when these are true:

- The feature portfolio matrix has an explicit decision for every existing major feature surface.
- Slice 1 is still limited to domain/storage/CLI/docs.
- The plan does not require package, CLI, GitHub repo, plugin, hook, MCP, or web UI rename.
- Privacy invariants are testable in focused unit/integration tests.
- Node 22 pnpm verification command is recorded.
- `.serena/project.yml` and `.codex/` local changes remain out of unrelated commits.

If any item is false, update this spec before coding.

## 9. MVP Slices

### Slice 1: Loop Snapshot CLI

Goal: prove the loop model without touching hooks or UI.

Add:

- `src/loop/snapshot.ts`
- `src/loop/brief.ts`
- storage port and SQLite migration for loop snapshots
- CLI `prompt-coach loop status`
- CLI `prompt-coach loop collect`
- CLI `prompt-coach loop brief`
- tests for privacy-safe snapshots and continuation brief generation

Verification:

```bash
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm test -- src/loop src/cli/commands/loop.test.ts
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm test
PATH=/Users/jinan/.nvm/versions/node/v22.15.0/bin:$PATH corepack pnpm lint
```

### Slice 2: MCP Loop Tools

Add:

- `get_loopdeck_status`
- `prepare_loop_brief`
- `record_loop_outcome`

Keep old MCP tool names during migration.

Verification:

- MCP tool list includes new tools.
- `structuredContent` is returned.
- results contain no prompt bodies or raw paths.
- existing `prompt-coach` MCP tools still pass.

### Slice 3: Codex/Claude Hook Snapshot

Add:

- Stop hook loop collection (**implemented first under the current
  `prompt-coach` CLI/package name**)
- PreCompact/PostCompact boundary metadata (**implemented as metadata plus
  optional HMAC content hash; raw summaries and custom instructions are not
  stored**)
- setup dry-run preview (**implemented for Stop/PreCompact/PostCompact hook
  registration**)
- hook trust/setup docs (**updated for metadata-only compact boundaries**)
- loop status and brief awareness (**implemented for CLI `loop status`, CLI
  `loop brief`, MCP `get_loopdeck_status`, and MCP `prepare_loop_brief`; it
  only reports safe compact boundary metadata newer than the latest loop
  snapshot**)

Verification:

- hook output remains raw-free
- failure is fail-open
- hook can run from subdirectories by resolving git root
- compact hooks do not store `custom_instructions`, `compact_summary`,
  transcript bodies, or raw paths
- compact-aware status and brief output do not return compact summary bodies,
  custom instructions, transcript bodies, or raw paths

### Slice 4: Web Loops View

Add:

- left nav item: Loops (**implemented**)
- `/api/v1/loops` safe metadata endpoint (**implemented**)
- loop list grouped by safe project/worktree/session metadata (**first list
  slice implemented**)
- loop detail with next brief copy action (**implemented as a row-level copy
  action backed by `/api/v1/loops/:id/brief`; no raw prompt detail panel yet**)
- privacy-safe empty state and diagnostics (**first empty state implemented**)
- compact boundary refresh marker when the latest loop snapshot is pre-compact
  (**implemented without compact summary/custom instruction replay**)

Verification:

- Playwright desktop and mobile screenshots
- no horizontal overflow
- console/network clean
- API and web output contain no prompt bodies, compact summaries, custom
  compact instructions, transcript bodies, or raw paths

### Slice 4.5: Explicit Service Collection Entry Point

Add:

- `prompt-coach loop collect --source service` for cron or LaunchAgent one-shot
  collection (**implemented**)
- output that labels service-origin snapshots without prompt bodies or raw paths
  (**implemented**)
- opt-in macOS LaunchAgent preview/install via `prompt-coach loop schedule
install` (**implemented; dry-run supported**)
- explicit scheduler lifecycle commands via `prompt-coach loop schedule status`
  and `prompt-coach loop schedule uninstall` (**implemented; plist-only status
  and removal**)

Do not add:

- hidden background scheduling without explicit user command
- hidden launchctl load/unload or app service mutation behind status/uninstall
- automatic prompt resubmission
- transcript or compact summary ingestion

### Slice 4.6: Semantic Memory Decision Gate

Add:

- deterministic decision gate for the latest loop outcome
  (**implemented in `decideLoopMemoryCandidate`**)
- CLI `prompt-coach loop memory-candidate` for a local, copy-reviewable memory
  candidate (**implemented**)
- MCP `propose_loop_memory_candidate` so Codex and Claude Code can ask whether
  a verified loop outcome is eligible for user-approved memory (**implemented**)
- acceptance rule: only `passed` outcomes with non-empty safe evidence refs can
  produce a candidate (**implemented**)
- privacy rule: no prompt bodies, raw paths, transcripts, compact summaries,
  external LLM results, or automatic memory writes (**implemented**)

Do not add:

- automatic writes to AGENTS.md, CLAUDE.md, memory files, or project docs
- semantic vector storage before the candidate gate proves useful
- hidden external LLM calls for memory extraction
- storing rejected unsafe summaries

### Slice 4.7: Approved Memory Record

Add:

- local SQLite `loop_memories` records for user-approved memory candidates
  (**implemented**)
- CLI `prompt-coach loop memory-approve` to record the latest eligible
  candidate after approval (**implemented**)
- MCP `record_loop_memory` so Codex and Claude Code can persist approved loop
  memory metadata without touching instruction files (**implemented**)
- migration `018_loop_memories` and storage list/read contract (**implemented**)

Do not add:

- automatic AGENTS.md, CLAUDE.md, or project-doc edits
- vector/embedding storage
- raw prompt bodies, raw paths, transcripts, compact summaries, or external LLM
  results
- automatic approval of failed, unevidenced, or unsafe candidates

### Slice 4.8: Instruction File Patch Proposal

Add:

- pure proposal generator that converts the latest approved Loopdeck memory
  into a reviewable unified diff for `AGENTS.md` or `CLAUDE.md`
  (**implemented**)
- CLI `prompt-coach loop instruction-patch --target-file AGENTS.md` for local
  review without file writes (**implemented**)
- MCP `propose_instruction_patch` so Codex and Claude Code can ask for the
  same proposal through a structured local-only tool (**implemented**)

Do not add:

- automatic AGENTS.md, CLAUDE.md, or project-doc edits
- applying patches without explicit user review
- returning prompt bodies, raw paths, transcripts, compact summaries, or
  external LLM results
- generating instruction changes from unapproved or unsafe memory candidates

### Slice 4.9: Explicit Instruction Patch Apply

Add:

- pure apply function that appends the latest approved Loopdeck memory to
  `AGENTS.md` or `CLAUDE.md` only when explicit confirmation is present
  (**implemented**)
- CLI `prompt-coach loop instruction-apply --target-file AGENTS.md
--confirm-apply` for deliberate local file writes (**implemented**)
- MCP `apply_instruction_patch` for Codex and Claude Code, requiring
  `confirm_apply=true` and returning no raw paths (**implemented**)
- idempotency by `source_memory` marker so repeat calls do not duplicate the
  same memory (**implemented**)

Do not add:

- applying patches without explicit confirmation
- applying unapproved or unsafe memory candidates
- editing any file outside `AGENTS.md` or `CLAUDE.md`
- returning prompt bodies, raw paths, transcripts, compact summaries, or
  external LLM results

### Slice 4.10: Product-Facing Brand Migration

Add:

- product name in README/docs: Loopdeck (**implemented**)
- GitHub repo rename and remote update (**implemented**)
- package/plugin product-facing metadata update (**implemented**)
- explicit compatibility statement that npm package name, CLI binary, and
  plugin command ids remain `prompt-coach` during the transition
  (**implemented**)

Do not add:

- `loopdeck` CLI/package alias in the same slice
- npm package rename
- plugin command id rename
- marketplace command rename without compatibility aliases

### Slice 4.11: Shared Loop Status Model

Add:

- `src/loop/status.ts` pure model for readiness, latest safe snapshot,
  compact refresh marker, next action, and privacy contract
- model-level tests proving no prompt bodies, compact summaries, custom
  instructions, transcript bodies, raw paths, or secret-looking tokens are
  returned
- CLI `prompt-coach loop status` powered by the shared model
- MCP `get_loopdeck_status` powered by the shared model, with MCP-only
  `available_tools` added at the boundary
- `/api/v1/loops` response with a top-level `status` object from the shared
  model plus list items from the same safe snapshot mapper
- web Loops header that consumes server-provided status instead of inferring
  readiness from list length

Do not add:

- package or CLI alias migration
- new scheduler behavior
- hidden external LLM calls
- raw prompt detail panel
- compact summary replay

### Slice 4.12: Approved Memory In Continuation Briefs

Add:

- `createLoopBrief` optional approved memory input for local, raw-free memory
  statements
- CLI `prompt-coach loop brief` inclusion of latest approved loop memories
- MCP `prepare_loop_brief` inclusion of latest approved loop memories
- `/api/v1/loops/:id/brief` inclusion of latest approved loop memories
- focused tests proving the brief includes memory statements and safe evidence
  refs without prompt bodies, compact summaries, raw paths, transcripts, custom
  instructions, or secret-looking tokens

Do not add:

- automatic AGENTS.md, CLAUDE.md, or project-doc writes
- vector/embedding storage
- hidden external LLM summarization
- project-specific memory filtering until the storage model has an explicit
  project relation
- package or CLI alias migration

### Slice 4.13: Project-Scoped Loop Memory Briefs

Add:

- `listLoopMemories({ projectId })` storage filtering that joins
  `loop_memories.snapshot_id` to `loop_snapshots.id`
- CLI `prompt-coach loop brief` project-scoped approved memory lookup using
  the latest snapshot `project_id`
- MCP `prepare_loop_brief` project-scoped approved memory lookup using the
  latest snapshot `project_id`
- `/api/v1/loops/:id/brief` project-scoped approved memory lookup using the
  requested snapshot `project_id`
- focused tests proving memories approved from other projects do not appear in
  the continuation prompt

Do not add:

- new memory schema columns before a stronger project relation is needed
- semantic/vector memory retrieval
- cross-project global memory injection
- automatic instruction-file writes
- package or CLI alias migration

### Slice 4.14: Project-Scoped Memory Status

Add:

- shared `LoopdeckStatus.project_memory` summary with only
  `approved_count` and `included_in_brief`
- CLI `prompt-coach loop status` text and JSON showing the latest snapshot
  project's approved memory count
- MCP `get_loopdeck_status` result and schema exposing the same count
- `/api/v1/loops` status payload exposing the same count for the latest
  snapshot project
- web Loops summary header showing the approved memory count
- focused tests proving status surfaces do not expose memory statements,
  evidence refs, prompt bodies, raw paths, or unrelated project memory text

Do not add:

- memory statements or evidence refs to status payloads
- global cross-project memory counts in project status
- semantic/vector memory retrieval
- automatic instruction-file writes
- package or CLI alias migration

### Slice 4.15: CLI Alias Migration

Add:

- `package.json#bin.loopdeck` pointing to the same compiled CLI entrypoint as
  `prompt-coach`
- packaging tests proving `prompt-coach` remains the package name and primary
  compatibility command while `loopdeck` is available as a product-name CLI
  alias
- README and package contents docs explaining that existing scripts and plugin
  commands should keep using `prompt-coach`, while new manual terminal workflows
  may use `loopdeck`

Do not add:

- npm package rename
- removal of `prompt-coach` bin
- plugin command id rename
- hook marker rename
- MCP server name rename

### Slice 4.16: Memory Candidate Status

Add:

- shared `LoopdeckStatus.memory_candidate` summary with only `eligible`,
  `reason`, and `next_action`
- CLI `prompt-coach loop status` text and JSON showing whether the latest loop
  can be approved into local project memory
- MCP `get_loopdeck_status` result and schema exposing the same raw-free
  candidate summary
- `/api/v1/loops` status payload exposing the same candidate summary for the
  latest snapshot
- web Loops summary header showing whether a candidate is eligible
- focused tests proving status surfaces do not expose candidate statements,
  evidence refs, prompt bodies, raw paths, compact summaries, or unrelated
  project memory text

Do not add:

- memory statements or evidence refs to status payloads
- automatic memory approval
- automatic AGENTS.md or CLAUDE.md writes
- hidden external LLM summarization
- plugin command id rename

### Slice 4.17: Plugin CLI Alias Guidance

Add:

- Claude Code command docs that check for either `prompt-coach` or `loopdeck`
  when running manual CLI fallbacks
- setup/status/coach command docs that show `loopdeck` as the product-name CLI
  alias while preserving existing `prompt-coach` examples
- Codex plugin default prompt that advertises the `loopdeck` CLI alias for
  manual terminal workflows
- README and PLUGINS documentation clarifying that Claude Code slash commands
  remain under `/prompt-coach:*` during the migration
- packaging tests proving this compatibility guidance is present

Do not add:

- `/loopdeck:*` slash command namespace before a dedicated plugin rename plan
- removal of `/prompt-coach:*` commands
- plugin id rename
- hook marker rename
- MCP server name rename

### Slice 4.18: Memory Approval Next Actions

Add:

- CLI `prompt-coach loop memory-approve --json` result with structured
  `next_actions`
- CLI text output that lists the immediate follow-up commands after recording
  memory
- MCP `record_loop_memory` result and schema with structured `next_actions`
- focused tests proving approval still does not write AGENTS.md, CLAUDE.md, or
  project docs

Do not add:

- automatic instruction-file writes
- automatic memory approval
- hidden external LLM calls
- removal of the existing `next_action` compatibility field

### Slice 4.19: Web Memory Approval UX

Add:

- web API `POST /api/v1/loops/memory/approve` protected by the existing app
  session and CSRF boundary
- server-side latest-candidate revalidation before recording approved memory
- web client `approveLoopMemory()` helper using the same CSRF pattern as other
  write actions
- Loops summary CTA for eligible memory candidates, showing only raw-free
  status and command guidance
- App wiring that refreshes `/api/v1/loops` after approval so approved memory
  count and candidate status stay server-derived
- duplicate approval prevention for the same latest snapshot; once approved,
  the web status no longer exposes an approval candidate for that snapshot
- focused tests proving the web path does not write AGENTS.md, CLAUDE.md,
  project docs, prompt bodies, raw paths, transcripts, compact summaries, or
  external LLM results

Do not add:

- automatic memory approval
- automatic instruction-file writes
- candidate statement exposure in the status/list payload
- external LLM calls
- plugin rename or slash command namespace changes

### Slice 4.20: Web Instruction Patch Review UX

Add:

- web API `GET /api/v1/loops/instruction-patch?target_file=AGENTS.md` for the
  latest approved Loopdeck memory
- server-side reuse of the same pure `proposeInstructionPatchFromMemory`
  generator as CLI and MCP
- web client `getLoopInstructionPatch()` helper
- Loops summary CTA that fetches and displays a review-only unified diff after
  an approved memory exists
- focused tests proving the web path returns `writes_files: false`,
  `requires_user_approval: true`, and does not expose prompt bodies, raw paths,
  compact summaries, transcripts, or secrets

Do not add:

- automatic instruction-file writes
- `apply_instruction_patch` from the web UI
- editing any file outside `AGENTS.md` or `CLAUDE.md`
- external LLM calls
- plugin rename or slash command namespace changes

### Slice 4.21: Dedicated Plugin Rename Plan

Add:

- `docs/superpowers/plans/2026-07-04-loopdeck-plugin-rename-plan.md` as the
  compatibility gate for plugin id and slash namespace migration
- packaging tests proving the plan exists and locks the current
  `prompt-coach` package, primary CLI, plugin id, `/prompt-coach:*` slash
  namespace, hook marker, and MCP server compatibility requirements
- README and PLUGINS links that route future rename work through the dedicated
  plan instead of ad hoc copy changes

Do not add:

- `/loopdeck:*` slash commands
- plugin id rename
- npm package rename
- removal of the `prompt-coach` CLI
- hook marker rename
- MCP server name rename

### Slice 4.22: Web Instruction Apply Gate

Add:

- structured `apply_gate` on instruction patch proposals explaining that web
  review cannot write files
- CLI confirm command in that gate:
  `prompt-coach loop instruction-apply --target-file AGENTS.md --confirm-apply`
- MCP apply tool name in that gate: `apply_instruction_patch`
- web review panel copy that shows the gate and keeps the panel review-only
- focused tests proving CLI/MCP/API/web client proposals expose the same gate
  without prompt bodies, raw paths, transcripts, compact summaries, secrets, or
  external LLM results

Do not add:

- web apply endpoint
- web apply button
- automatic instruction-file writes
- editing any file outside `AGENTS.md` or `CLAUDE.md`
- hidden external LLM calls

### Slice 4.23: Worktree And Session Activity Summary

Add:

- shared `LoopdeckStatus.activity` summary derived from existing loop snapshots
- raw-free counts for active worktrees and active sessions
- latest branch and latest worktree label when already present in safe snapshot
  metadata
- `needs_review` signal when multiple worktrees or multiple agent sessions are
  represented in recent snapshots
- CLI, MCP, API, and web Loops summary display of the same activity model
- focused tests proving activity summary does not expose prompt bodies, raw
  paths, compact summaries, secrets, or external LLM results

Do not add:

- raw worktree paths
- reading private Codex or Claude Code state
- automatic git merge/rebase decisions
- background worktree scanning outside explicit loop snapshots
- hidden external LLM summarization

### Slice 4.24: Worktree Activity Detail

Add:

- `LoopdeckStatus.activity.worktrees` detail derived only from existing local
  loop snapshots
- per-worktree safe label, session count, snapshot count, latest snapshot id,
  latest timestamp, latest branch when already present, and latest outcome
  status
- CLI `loop status` worktree detail lines capped to the first recent groups
- MCP `get_loopdeck_status`, `/api/v1/loops`, web API type, and Loops summary
  display of the same raw-free detail model
- focused tests proving worktree detail does not expose prompt bodies, raw
  paths, compact summaries, secrets, transcripts, or external LLM results

Do not add:

- raw worktree paths or cwd disclosure
- reading Codex or Claude Code private session state
- automatic git merge/rebase recommendations
- background scanning of uncollected worktrees
- full drilldown routes, filters, or branch comparison UI
- external LLM summarization

### Slice 4.25: Worktree Drilldown Surface

Add:

- read-only `/api/v1/loops/worktrees/:worktree` endpoint scoped to one safe
  worktree label
- web client helper `getLoopWorktree(worktree)` using the existing local app
  session boundary
- Loops summary open action for recent worktree groups
- selected worktree detail panel listing safe loop snapshot metadata for that
  worktree
- focused tests proving drilldown excludes other worktrees and does not return
  prompt bodies, raw paths, compact summaries, secrets, transcripts, or
  external LLM results

Do not add:

- prompt body or transcript drilldown
- raw cwd/worktree path disclosure
- automatic branch comparison, merge, rebase, or conflict resolution advice
- background scanning of worktrees that do not have explicit loop snapshots
- persistent deep-link routing or query-state until a later slice
- hidden external LLM summarization

### Slice 4.26: Worktree Drilldown Query State

Add:

- `/loops?worktree=<safe-label>` route parsing so a selected worktree drilldown
  can be reopened after refresh or shared into another local browser session
- `pathForView({ name: "loops", worktree })` helper to keep URL generation in
  the same routing module as parsing
- App initialization that fetches the selected worktree detail when the route
  includes `worktree`
- Loops summary open action that updates browser history to the matching
  query-state after fetching the selected worktree detail
- focused tests proving URL parsing/generation preserves worktree labels without
  introducing raw paths or prompt bodies into the route contract

Do not add:

- raw worktree paths in URLs
- prompt body, transcript, compact summary, or evidence expansion in query-state
- automatic cross-worktree comparison or merge recommendation
- background scanning of uncollected worktrees
- external LLM summarization

### Slice 4.27: Worktree Drilldown Session Filter

Add:

- optional `session_id` query on `/api/v1/loops/worktrees/:worktree` to narrow
  the drilldown to one existing safe loop snapshot session id
- `getLoopWorktree(worktree, { sessionId })` client helper support
- `/loops?worktree=<safe-label>&session=<safe-session-id>` route parsing and
  URL generation
- App deep-link restoration that passes the route session to the worktree
  drilldown API
- selected worktree detail panel label showing the active session filter
- focused tests proving session filtering excludes other sessions without
  exposing prompt bodies, raw paths, transcripts, compact summaries, secrets,
  or external LLM results

Do not add:

- reading private Codex or Claude Code session stores
- transcript, prompt body, compact summary, or evidence drilldown
- raw cwd/worktree paths in URLs or API responses
- automatic session merge/rebase/conflict recommendations
- external LLM summarization

### Slice 4.28: Worktree Drilldown Branch Filter

Add:

- optional `branch` query on `/api/v1/loops/worktrees/:worktree` to narrow the
  drilldown to one existing safe snapshot branch
- `getLoopWorktree(worktree, { branch })` client helper support, composable with
  the existing `sessionId` option
- `/loops?worktree=<safe-label>&session=<safe-session-id>&branch=<safe-branch>`
  route parsing and URL generation
- App deep-link restoration that passes the route branch to the worktree
  drilldown API
- selected worktree detail panel label showing the active branch filter
- focused tests proving branch filtering excludes other sessions/worktrees
  without exposing prompt bodies, raw paths, transcripts, compact summaries,
  secrets, or external LLM results

Do not add:

- raw git remotes, repository paths, or unredacted cwd values
- automatic merge/rebase/conflict recommendations
- background branch scanning outside explicit loop snapshots
- transcript, prompt body, compact summary, or evidence drilldown
- external LLM summarization

### Slice 4.29: Plugin Rename Issue Slices

Add:

- dedicated `docs/superpowers/plans/2026-07-04-loopdeck-plugin-rename-issue-slices.md`
  that decomposes the rename plan into independently shippable issues
- compatibility invariants that preserve `prompt-coach` package, binary,
  plugin id, hook command, slash command, and MCP server-name contracts until
  each later phase has proof
- per-slice RED/GREEN expectations and smoke gates for Fresh install, Codex
  plugin, Claude Code plugin, hook binary, MCP server-name, and release notes
- packaging test coverage that locks the issue-slice plan into the npm package
  files list

Do not add:

- `/loopdeck:*` command files
- package, plugin id, hook marker, or MCP server-name rename
- deprecation banners
- hidden external LLM, hosted migration, or provider credential proxy

### Slice 4.30: Runtime ID Compatibility Inventory

Add:

- dedicated `docs/superpowers/plans/2026-07-04-loopdeck-runtime-id-inventory.json`
  with the current package, binary, Claude Code plugin, Codex plugin, command,
  hook, and MCP server-name compatibility surface
- packaging test coverage that compares the inventory against live manifests,
  command files, and hook events
- package contents documentation that explains why the inventory ships

Do not add:

- runtime rename behavior
- `/loopdeck:*` command aliases
- package, plugin id, hook command, or MCP server-name changes
- prompt bodies, transcript text, compact summaries, raw paths, API tokens, or
  provider credentials

### Slice 4.31: Alias-Only Slash Namespace Docs

Add:

- README, README.ko, and PLUGINS documentation that names `/loopdeck:*` as a
  future alias-only slash namespace
- packaging test coverage that proves the docs mention both `/prompt-coach:*`
  and `/loopdeck:*` while package, plugin ids, and Claude Code command files
  remain unchanged
- compatibility wording that `/loopdeck:*` must not become the only namespace
  and is not shipped as command files in this slice

Do not add:

- `/loopdeck:*` command files
- Claude Code plugin manifest command entries for loopdeck aliases
- package, plugin id, hook command, or MCP server-name changes
- runtime command alias behavior

### Slice 4.32: Claude Code Dual Namespace Decision

Add:

- R3 decision artifact documenting that current Claude Code command namespace is
  tied to plugin identity, so `commands/loopdeck-*.md` would not create
  `/loopdeck:*`
- packaging test coverage that keeps `/prompt-coach:*` required and prevents
  accidental loopdeck command file/manifest additions
- safe future paths: dual plugin package, official namespace alias support, or a
  later major rename window with smoke and rollback gates

Do not add:

- `/loopdeck:*` command files
- Claude Code plugin manifest command entries for loopdeck aliases
- package, plugin id, hook command, or MCP server-name changes

### Slice 4.33: Codex Plugin Display Rename Without ID Rename

Add:

- Codex plugin interface copy and default prompts that use Loopdeck as the
  product-facing name
- Codex skill copy that explains the compatibility CLI command remains
  `prompt-coach`
- packaging test coverage that locks Codex plugin id, install path, skill path,
  and hook command compatibility while display copy says Loopdeck

Do not add:

- Codex plugin id rename
- `plugins/prompt-coach` install path rename
- hook command changes
- MCP server-name changes

### Slice 4.34: Hook Binary Compatibility Smoke

Add:

- hook binary smoke script that runs built `prompt-coach` and `loopdeck`
  entrypoints through `hook status`, `hook claude-code`, and `hook codex`
- packaging test coverage that ships the smoke script and keeps both package
  binaries mapped to the same compiled CLI entrypoint
- privacy checks proving fail-open hook smoke output does not print synthetic
  prompt text or API-key-shaped markers

Do not add:

- hook command changes in installed Claude Code or Codex configs
- `loopdeck hook ...` as the primary installed hook command
- raw prompt, transcript, compact summary, raw path, API token, or provider
  credential output

### Slice 4.35: MCP Server Name Compatibility Decision

Add:

- R6 decision artifact documenting that `prompt-coach` remains the canonical MCP
  server name during the Loopdeck compatibility window
- official Codex and Claude Code MCP command-shape references showing the server
  name is user-chosen persisted configuration
- packaging test coverage that keeps README, README.ko, PLUGINS, slash setup
  docs, and web MCP snippets on `prompt-coach mcp`

Do not add:

- `mcp add loopdeck` examples
- MCP server-name rename
- hidden hosted service, provider credential proxy, or external LLM call
- prompt body, transcript, compact summary, raw path, API token, or provider
  credential output

### Slice 4.36: Deprecation Window Readiness

Add:

- R7 readiness artifact with alias-only, deprecation, and breaking release note
  templates
- support guidance for saved `/prompt-coach:*` slash command snippets
- minimum evidence gates before marking any `prompt-coach` runtime id deprecated
- rollback and upgrade smoke requirements for future rename slices
- packaging test coverage that confirms readiness exists while public README and
  PLUGINS do not show a deprecation banner yet

Do not add:

- deprecation banners
- removal of `/prompt-coach:*`, plugin ids, hook commands, package names, or MCP
  server names
- breaking-change language outside the readiness artifact

### Slice 4.37: Selected Worktree Continuation Brief Parity

Add:

- next runtime value artifact selecting worktree/session/branch-scoped
  continuation briefs as the first post-rename-line product slice
- CLI `loop brief` plan for optional `--worktree`, `--session`, and `--branch`
  filters while preserving latest-only default behavior
- MCP `prepare_loop_brief` plan for equivalent optional `worktree`,
  `session_id`, and `branch` arguments
- shared snapshot selector boundary so CLI and MCP do not drift from each other
- focused TDD target proving selected briefs do not fall back to the global
  latest snapshot when another worktree has newer activity

Do not add:

- package, plugin, slash command, hook, or MCP server-name renames
- database schema changes before a filtered-list performance need exists
- background scanning of uncollected worktrees
- automatic external model calls or auto-submission
- prompt body, transcript, compact summary, raw path, API token, or provider
  credential output

### Slice 4.38: CLI/MCP Selected Brief Implementation

Add:

- shared `src/loop/snapshot-selection.ts` helper for newest matching snapshot
  selection from already-loaded recent snapshots
- CLI `loop brief --worktree <label> --session <id> --branch <name>` filters
  while keeping no-filter latest behavior
- MCP `prepare_loop_brief` optional `worktree`, `session_id`, and `branch`
  arguments with `source: "selected"` result metadata
- not-found handling when selected filters match no local snapshot
- focused CLI and MCP tests proving selected continuation briefs do not fall
  back to a newer unrelated worktree snapshot

Do not add:

- DB schema/index migration
- background worktree scanning
- web selected-detail brief action
- package, plugin, slash command, hook, or MCP server-name rename
- prompt body, transcript, compact summary, raw path, API token, or provider
  credential output

### Slice 4.39: Web Selected Detail Brief Action

Add:

- read-only `/api/v1/loops/brief` endpoint using the same worktree/session/branch
  selection semantics as CLI and MCP
- web client helper for selected loop brief filters
- selected worktree detail action that copies the filtered continuation brief
  for the active worktree/session/branch
- focused server/API/LoopsView tests proving the selected detail action does
  not fall back to a newer unrelated worktree snapshot

Do not add:

- web apply/write behavior
- background worktree scanning
- DB schema/index migration
- prompt body, transcript, compact summary, raw path, API token, or provider
  credential output

### Slice 4.40: Multi-Worktree Command Center Summary

Add:

- shared `LoopdeckStatus.activity.command_center` summary for review-before-merge
  situations
- raw-free review queue items derived from existing safe worktree metadata:
  worktree label, branch, latest snapshot id/time, outcome status, sessions,
  snapshots, and recommendation
- CLI `loop status` text output that names the command center, primary action,
  and top review items
- MCP `get_loopdeck_status` output schema coverage for the command center
- web Loops summary rendering that shows the command center before inline
  worktree open actions
- focused domain, CLI, MCP schema, and web tests proving the command center does
  not include prompt bodies, outcome summaries, raw paths, transcripts, compact
  summaries, API tokens, or provider credentials

Do not add:

- automatic merge, conflict resolution, or branch checkout
- background worktree scanning
- external LLM calls or hidden agent evaluation
- write behavior to `AGENTS.md`, `CLAUDE.md`, project docs, memory files, or
  git state
- package, plugin, slash command, hook, or MCP server-name rename
- prompt body, outcome summary, transcript, compact summary, raw path, API
  token, or provider credential output

### Slice 4.41: Command Center Selected Brief Shortcuts

Add:

- `continuation_command` metadata on each command-center review item so Codex
  and Claude Code can see the exact filtered `loop brief` command for that
  worktree
- CLI `loop status` output that prints each review item's continuation command
- MCP `get_loopdeck_status` schema coverage for `continuation_command`
- web command-center item `Copy review brief` actions that call the existing
  selected worktree brief API with worktree/branch filters
- App-level clipboard handling that reuses the existing local-only
  `/api/v1/loops/brief` path instead of adding a new write surface
- continuation brief privacy hardening: unsafe outcome summaries that contain
  raw local paths or secret-looking tokens are omitted from generated prompts
- focused domain, CLI, MCP schema, and web tests proving the shortcut metadata
  does not include prompt bodies, outcome summaries, raw paths, transcripts,
  compact summaries, API tokens, or provider credentials

Do not add:

- automatic merge, conflict resolution, branch checkout, or git writes
- background worktree scanning
- new database schema/index migration
- external LLM calls or hidden agent evaluation
- writes to `AGENTS.md`, `CLAUDE.md`, project docs, memory files, or git state
- package, plugin, slash command, hook, or MCP server-name rename
- prompt body, outcome summary, transcript, compact summary, raw path, API
  token, or provider credential output

### Slice 4.42: Command Center Merge-Readiness Evidence Grouping

Add:

- `evidence_count` metadata on worktree activity and command-center review
  items, derived only from the latest snapshot outcome evidence ref count
- `merge_readiness` metadata on each command-center review item with safe
  status, evidence presence, and next-action labels
- shared readiness rules:
  - no evidence refs means `missing_evidence`
  - non-passed latest outcome with evidence means `needs_review`
  - passed latest outcome with evidence means `ready`
- CLI `loop status` text output that prints merge readiness and evidence count
  for each review item
- MCP `get_loopdeck_status` output schema coverage for the new fields
- web Loops command-center rendering for merge readiness and evidence ref count
- focused domain, CLI, MCP schema/runtime, and web tests proving the grouping
  does not reveal evidence ref strings, outcome summaries, prompt bodies, raw
  paths, transcripts, compact summaries, API tokens, or provider credentials

Do not add:

- raw evidence ref strings to status, command-center, or web summary output
- automatic merge, conflict prediction, branch checkout, or git writes
- hidden external model calls or background agent evaluation
- new database schema/index migration
- writes to `AGENTS.md`, `CLAUDE.md`, project docs, memory files, or git state
- package, plugin, slash command, hook, or MCP server-name rename
- prompt body, outcome summary, transcript, compact summary, raw path, API
  token, or provider credential output

### Slice 4.43: Review-Before-Merge Packet

Add:

- `review_packet` metadata on `LoopdeckStatus.activity.command_center`, derived
  only from existing command-center review items
- aggregate packet status with explicit precedence:
  - any missing evidence means `blocked`
  - otherwise any non-passing worktree means `needs_review`
  - otherwise all reviewed worktrees are `ready`
- packet counts for ready, needs-review, and missing-evidence worktrees
- packet summary and next action labels designed for Codex and Claude Code to
  read before a human decides whether to merge or continue a worktree
- CLI `loop status` output for packet status, summary, and next action
- MCP `get_loopdeck_status` output schema coverage for the packet contract
- web Loops command-center rendering for the packet summary
- focused domain, CLI, MCP schema/runtime, and web tests proving the packet does
  not reveal evidence ref strings, outcome summaries, prompt bodies, raw paths,
  transcripts, compact summaries, API tokens, or provider credentials

Do not add:

- automatic merge, branch checkout, conflict prediction, diff inspection, or
  git writes
- raw evidence ref strings to status, command-center, packet, or web summary
  output
- hidden external model calls or background agent evaluation
- new database schema/index migration
- writes to `AGENTS.md`, `CLAUDE.md`, project docs, memory files, or git state
- package, plugin, slash command, hook, or MCP server-name rename
- prompt body, outcome summary, transcript, compact summary, raw path, API
  token, or provider credential output

### Slice 4.44: Review Packet Human Checklist

Add:

- `review_packet.checklist` entries derived from the packet's safe aggregate
  actions
- checklist labels for the human merge-review path:
  - record missing evidence before merge
  - review non-passing worktrees before merge
  - compare ready evidence before merge
- read-only `required` status for each checklist item; completion persistence is
  deferred to a later explicit journal slice
- CLI `loop status` output for checklist labels and status
- MCP `get_loopdeck_status` output schema coverage for checklist entries
- web Loops command-center rendering for the human checklist
- focused domain, CLI, MCP schema/runtime, and web tests proving checklist
  entries do not reveal evidence ref strings, outcome summaries, prompt bodies,
  raw paths, transcripts, compact summaries, API tokens, or provider credentials

Do not add:

- checklist write/complete state, merge decision journal, automatic merge,
  branch checkout, conflict prediction, diff inspection, or git writes
- raw evidence ref strings to status, command-center, packet, checklist, or web
  summary output
- hidden external model calls or background agent evaluation
- new database schema/index migration
- writes to `AGENTS.md`, `CLAUDE.md`, project docs, memory files, or git state
- package, plugin, slash command, hook, or MCP server-name rename
- prompt body, outcome summary, transcript, compact summary, raw path, API
  token, or provider credential output

### Slice 4.45: Local Merge Decision Journal CLI Boundary

Decision:

- Add a local merge decision journal, but start with an explicit CLI write
  boundary only.
- Codex and Claude Code may suggest the command, and a human/local operator runs
  it. Do not expose a write-capable MCP tool or web button in this slice.
- The first journal record stores only safe merge-review metadata:
  - latest matching loop snapshot id
  - project id
  - worktree label
  - decision: `merge`, `continue`, or `defer`
  - privacy-safe reason
  - actor label
  - created time
  - privacy flags proving no prompt bodies, raw paths, git writes, or external
    calls

Add:

- `prompt-coach loop decision record --worktree <name> --decision <merge|continue|defer> --reason <text>`
- `prompt-coach loop decision list`
- local SQLite journal table for merge decisions
- privacy guard rejecting raw local paths and secret-looking tokens in decision
  reasons
- focused CLI/storage coverage proving records are local-only and do not include
  prompt bodies, raw paths, evidence refs, transcripts, compact summaries, API
  tokens, provider credentials, or git writes

Do not add:

- automatic merge, branch checkout, conflict prediction, diff inspection, or git
  writes
- MCP write tool for merge decisions
- web write button or checklist completion state
- hidden external model calls or background agent evaluation
- writes to `AGENTS.md`, `CLAUDE.md`, project docs, memory files, or git state
- package, plugin, slash command, hook, or MCP server-name rename
- prompt body, outcome summary, transcript, compact summary, raw path, API
  token, provider credential, or raw evidence ref output

### Slice 4.46: Recent Merge Decisions Read-Only Exposure

Decision:

- Expose recent local merge decisions read-only through existing status surfaces
  so Codex and Claude Code can see prior human intent before continuing a loop.
- Keep the write boundary CLI-only. Do not add MCP or web write paths.
- Decision records remain advisory context only; they must not trigger merge,
  checkout, diff inspection, conflict prediction, or git writes.

Add:

- `LoopdeckStatus.activity.recent_decisions`, limited to the latest three local
  decisions
- CLI `loop status` lines for recent decisions
- MCP `get_loopdeck_status` schema/runtime coverage for the read-only field
- `/api/v1/loops` status propagation for recent decisions
- web Loops summary rendering for recent decisions
- focused domain, CLI, MCP schema/runtime, and web tests proving the field does
  not reveal prompt bodies, outcome summaries, evidence refs, raw paths,
  transcripts, compact summaries, API tokens, provider credentials, external
  calls, or git writes

Do not add:

- merge decision writes outside `prompt-coach loop decision record`
- MCP write tools, web write buttons, checklist completion state, or approval
  toggles
- automatic merge, branch checkout, conflict prediction, diff inspection, or git
  writes
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename
- prompt body, outcome summary, transcript, compact summary, raw path, API
  token, provider credential, or raw evidence ref output

### Slice 4.47: Review Packet Decision Advisory

Decision:

- Recent merge decisions may influence review packet next-action text only as an
  advisory. They must not change merge-readiness status, checklist completion,
  branch state, git state, or command execution.
- Keep `review_packet.next_action` deterministic from aggregate readiness.
  Add a separate `review_packet.decision_advisory` when a recent decision
  exists for a reviewed worktree.

Add:

- optional `review_packet.decision_advisory`
- advisory summaries such as `recent continue decision recorded for <worktree>`
- advisory next actions:
  - `honor recent continue decision before merge`
  - `honor recent defer decision before merge`
  - `confirm recent merge decision before merge`
- CLI `loop status` advisory output
- MCP `get_loopdeck_status` schema/runtime coverage for the advisory
- web Loops command-center rendering for the advisory
- focused domain, CLI, MCP schema/runtime, and web tests proving the advisory
  remains read-only and does not reveal prompt bodies, outcome summaries,
  evidence refs, raw paths, transcripts, compact summaries, API tokens, provider
  credentials, external calls, or git writes

Do not add:

- automatic merge, branch checkout, conflict prediction, diff inspection, or git
  writes
- MCP write tools, web write buttons, checklist completion state, approval
  toggles, or stateful acknowledgement
- changes to `review_packet.status` or `review_packet.next_action` based solely
  on a decision record
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.48: Selected Worktree Latest Decision Detail

Decision:

- Selected worktree detail should show the matching latest local merge decision
  read-only. This closes the gap where the Loops summary can show recent
  decisions, but a user reviewing one worktree cannot see the latest relevant
  decision in that worktree's drilldown.
- Scope the latest decision by selected worktree and the selected snapshot
  project. Do not infer merge readiness, checklist completion, branch state, or
  git state from the decision.

Add:

- optional `/api/v1/loops/worktrees/:worktree` response field
  `latest_decision`
- project-scoped recent decision loading for `/api/v1/loops`, so the Loops
  summary does not show decisions from unrelated projects while a selected
  worktree detail is open
- web API typing for `latest_decision`
- selected worktree detail rendering for latest decision value and reason
- focused server/API/web tests proving the detail remains read-only and does
  not reveal prompt bodies, outcome summaries, evidence refs, raw paths,
  transcripts, compact summaries, API tokens, provider credentials, external
  calls, or git writes

Do not add:

- web or MCP decision write tools
- merge/checkout/rebase/diff/conflict inspection
- checklist completion state, approval toggles, or persistent acknowledgement
- changes to command-center readiness or review packet status
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.49: Selected Worktree Review Packet Summary Link

Decision:

- Selected worktree detail should include a raw-free review packet summary so
  Codex, Claude Code, and the web UI can connect a selected worktree to the
  current review-before-merge packet without reading prompt bodies, outcome
  summaries, evidence refs, diffs, or git state.
- Reuse the existing command-center review packet. The selected detail response
  should only expose the aggregate packet status/summary/next action and the
  selected worktree's merge-readiness status/action.

Add:

- optional `/api/v1/loops/worktrees/:worktree` response field
  `review_packet_summary`
- web API typing for `review_packet_summary`
- selected worktree detail rendering for review packet summary, packet next
  action, and worktree action
- focused server/API/web tests proving the summary remains read-only and does
  not reveal prompt bodies, outcome summaries, evidence refs, raw paths,
  transcripts, compact summaries, API tokens, provider credentials, external
  calls, or git writes

Do not add:

- web or MCP write tools for decisions, checklist completion, merge actions, or
  acknowledgements
- merge/checkout/rebase/diff/conflict inspection
- changes to command-center readiness or review packet status
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.50: Selected Worktree Review Command Hint

Decision:

- Selected worktree detail should expose a CLI-equivalent read-only command hint
  for the selected review packet context. This lets Codex, Claude Code, and the
  web UI see the exact continuation command for the reviewed worktree without
  adding a write-capable button or hidden execution path.
- Reuse the existing command-center review item `continuation_command`; do not
  introduce a second command-building rule.

Add:

- `review_packet_summary.command_hint` with:
  - label: `Copy review brief command`
  - command: existing selected worktree `continuation_command`
- web API typing for the command hint
- selected worktree detail rendering for the command hint label and command
- focused server/API/web tests proving the hint remains read-only and does not
  reveal prompt bodies, outcome summaries, evidence refs, raw paths,
  transcripts, compact summaries, API tokens, provider credentials, external
  calls, or git writes

Do not add:

- web or MCP write tools, command execution, merge actions, checklist
  completion, or acknowledgements
- a second command formatter separate from the command-center review item
- merge/checkout/rebase/diff/conflict inspection
- changes to command-center readiness or review packet status
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.51: Selected Worktree Missing-Evidence Explanation

Decision:

- Selected worktree detail should explain a blocked `missing_evidence` state
  without returning evidence refs, outcome summaries, prompt bodies, diffs, or
  git state. The explanation is only a safe reason and next action derived from
  the selected worktree merge-readiness status.
- Do not show the explanation for `ready` or `needs_review` worktrees.

Add:

- optional `review_packet_summary.missing_evidence_explanation` when the
  selected worktree merge readiness is `missing_evidence`
- explanation fields:
  - label: `Missing evidence`
  - reason: `latest selected worktree outcome has no evidence refs`
  - next_action: `record loop outcome evidence`
- web API typing for the explanation
- selected worktree detail rendering for the explanation
- focused server/API/web tests proving the explanation remains read-only and
  does not reveal prompt bodies, outcome summaries, evidence refs, raw paths,
  transcripts, compact summaries, API tokens, provider credentials, external
  calls, or git writes

Do not add:

- raw evidence refs, evidence counts beyond existing aggregate packet counts,
  outcome summaries, prompt bodies, diffs, or transcript content
- web or MCP write tools, command execution, merge actions, checklist
  completion, or acknowledgements
- merge/checkout/rebase/diff/conflict inspection
- changes to command-center readiness or review packet status
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.52: Selected Worktree Reviewer Checklist Preview

Decision:

- Selected worktree detail should show the reviewer checklist item that matches
  the selected worktree merge-readiness action. This gives a human operator the
  local review step in context without introducing checklist completion state,
  acknowledgements, merge automation, command execution, or web writes.
- The preview should be derived from the existing command-center
  `review_packet.checklist` and filtered by the selected worktree action, not
  rebuilt with a second checklist rule.

Add:

- `review_packet_summary.reviewer_checklist_preview` in selected worktree detail
  with the matching existing checklist item:
  - label
  - status: `required`
  - action
- web API typing for the preview
- selected worktree detail rendering for the preview label/status
- focused server/API/web tests proving the preview remains read-only and does
  not reveal prompt bodies, outcome summaries, evidence refs, raw paths,
  transcripts, compact summaries, API tokens, provider credentials, external
  calls, or git writes

Do not add:

- checklist completion state, acknowledgements, approvals, or persistent
  operator state
- web or MCP write tools, command execution, merge actions, or git writes
- raw evidence refs, outcome summaries, prompt bodies, diffs, transcript
  content, compact summaries, raw paths, or provider credentials
- a second checklist derivation rule separate from the command-center review
  packet
- merge/checkout/rebase/diff/conflict inspection
- changes to command-center readiness or review packet status
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.53: Selected Worktree Readiness Summary

Decision:

- Selected worktree detail should include a small `readiness_summary` for every
  selected worktree merge-readiness state: `ready`, `needs_review`, and
  `missing_evidence`.
- The summary should be available even when there is only one ready worktree and
  the top-level command center is not shown, because selected detail still needs
  to explain why the local continuation/review action is safe.
- The selected detail fallback should reuse the existing command-center
  readiness/checklist/continuation-command derivation rather than creating a
  second readiness rule.

Add:

- `review_packet_summary.readiness_summary` with:
  - label: `Readiness summary`
  - status: `ready` | `needs_review` | `missing_evidence`
  - reason:
    - `selected worktree has recorded evidence and passing outcome`
    - `latest selected worktree outcome is not passing`
    - `latest selected worktree outcome has no evidence refs`
  - next_action: selected worktree readiness action
- selected detail fallback that can build the same review packet summary for a
  single ready worktree without exposing a top-level command center
- web API typing and selected worktree detail rendering
- focused server/API/web tests proving all readiness states remain raw-free

Do not add:

- evidence refs, evidence bodies, outcome summaries, prompt bodies, diffs,
  transcript content, compact summaries, raw paths, or provider credentials
- web or MCP write tools, command execution, merge actions, git writes,
  checklist completion, acknowledgements, or approvals
- a second merge-readiness/checklist/command derivation rule
- merge/checkout/rebase/diff/conflict inspection
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.54: Selected Worktree Evidence-Count Explanation

Decision:

- Selected worktree detail should explain the selected worktree evidence count
  without exposing evidence ref strings, evidence bodies, output summaries,
  diffs, or raw paths.
- A zero count should tell the operator to record evidence. A positive count
  should tell the operator evidence exists and can be compared before merge.
- This is a display-only explanation derived from existing safe aggregate
  `evidence_count`; it does not inspect evidence content or add write actions.

Add:

- `review_packet_summary.evidence_count_explanation` with:
  - label: `Evidence count`
  - count: selected worktree evidence count
  - reason:
    - `selected worktree has evidence refs recorded`
    - `selected worktree has no evidence refs recorded`
  - next_action:
    - `compare evidence before merge`
    - `record loop outcome evidence`
- web API typing and selected worktree detail rendering
- focused server/API/web tests proving only the count and safe reason/action are
  returned

Do not add:

- evidence ref strings, evidence bodies, outcome summaries, prompt bodies,
  diffs, transcript content, compact summaries, raw paths, or provider
  credentials
- evidence previews, filesystem reads, diff inspection, test log inspection, or
  merge/conflict inspection
- web or MCP write tools, command execution, merge actions, git writes,
  checklist completion, acknowledgements, or approvals
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.55: Selected Worktree Selection Scope Explanation

Decision:

- Selected worktree detail should explain which safe selection scope produced
  the current detail response: worktree only, worktree plus session, worktree
  plus branch, or worktree plus session and branch.
- This is necessary for concurrent Codex and Claude Code worktrees because the
  selected continuation brief action can otherwise look equivalent across
  global, session-filtered, and branch-filtered views.
- The explanation should be derived only from explicit request filters and safe
  labels already shown in the UI. It should not inspect prompt bodies,
  transcripts, evidence, diffs, filesystem paths, or git state.

Add:

- top-level selected worktree detail `selection_scope` with:
  - label: `Selection scope`
  - filters:
    - `worktree`
    - optional `session`
    - optional `branch`
  - reason:
    - `showing latest snapshots for selected worktree`
    - `showing snapshots filtered by selected worktree and session`
    - `showing snapshots filtered by selected worktree and branch`
    - `showing snapshots filtered by selected worktree, session, and branch`
  - next_action:
    - `copy selected worktree brief`
    - `copy selected session brief`
    - `copy selected branch brief`
    - `copy selected session and branch brief`
- web API typing and selected worktree detail rendering near the selected
  session/branch labels
- focused server/API/web tests for worktree-only, session-filtered,
  branch-filtered, and session-plus-branch scope preservation

Do not add:

- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, diffs, raw paths, provider credentials, or
  secret-looking tokens
- new selector semantics, database schema changes, filesystem reads, branch
  checkout, diff/conflict inspection, or merge automation
- web or MCP write tools, command execution, checklist completion,
  acknowledgements, or approvals
- hidden external model calls or background agent evaluation
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.56: Selected Snapshot Age/Staleness Explanation

Decision:

- Selected worktree detail should explain whether the selected snapshot is the
  latest recorded loop snapshot or whether another worktree/session has a newer
  recorded snapshot.
- This is necessary for concurrent Codex and Claude Code loops because a
  selected continuation brief can be valid for its worktree while still being
  older than newer loop activity elsewhere.
- The explanation should compare safe snapshot ids and `created_at` metadata
  only. It should not depend on wall-clock age thresholds, git status reads,
  filesystem reads, or background polling.

Add:

- top-level selected worktree detail `snapshot_age` when a selected snapshot
  exists, with:
  - label: `Selected snapshot age`
  - latest_selected_created_at: selected latest snapshot timestamp
  - status:
    - `latest`
    - `older_than_latest`
  - reason:
    - `selected snapshot is the latest recorded loop snapshot`
    - `another loop snapshot was recorded after this selection`
  - next_action:
    - `copy selected worktree brief`
    - `refresh selected worktree before merging`
- web API typing and selected worktree detail rendering near selection scope
- focused server/API/web tests for latest and older-than-latest states

Do not add:

- wall-clock freshness thresholds, timers, polling, git status reads,
  filesystem reads, branch checkout, diff/conflict inspection, merge
  automation, or background scanning
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, diffs, raw paths, provider credentials, or
  secret-looking tokens
- web or MCP write tools, command execution, checklist completion,
  acknowledgements, approvals, or external model calls
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.57: Selected Brief Action Rationale

Decision:

- Selected worktree detail should explain why the `Copy selected brief` action
  is the correct handoff action for the current selected worktree/session/branch
  scope.
- This is necessary because the page now shows selection scope, snapshot age,
  review packet summary, and command hints; without a direct action rationale,
  Codex and Claude Code operators still need to infer whether the copy action
  is filtered, read-only, and safe to use for continuation.
- The rationale should reuse the selected worktree/session/branch filters and
  expose a copyable CLI-equivalent command. It should not execute the command,
  submit the brief, write files, call external services, or inspect git state.

Add:

- top-level selected worktree detail `selected_brief_action` when a selected
  snapshot exists, with:
  - label: `Selected brief action`
  - action: `copy selected continuation brief`
  - reason:
    - `uses the selected worktree/session/branch filters without auto-submitting`
  - command: `prompt-coach loop brief --worktree ...` plus optional `--session`
    and `--branch` filters
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering near selection scope and
  snapshot age
- focused server/API/web tests proving the command preserves selected filters
  and the UI states the no-write/no-external-call boundary

Do not add:

- command execution, clipboard mutation beyond the existing copy flow, hidden
  auto-submit, file writes, git state reads, filesystem reads, branch checkout,
  diff/conflict inspection, merge automation, or background scanning
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- web or MCP write tools, checklist completion, acknowledgements, approvals, or
  external model calls
- package, plugin, slash command, hook, or MCP server-name rename

### Slice 4.58: Merge-Readiness-To-Brief Rationale

Decision:

- Selected worktree detail should explicitly connect selected merge-readiness
  state to the selected brief action.
- The selected brief is a continuation handoff, not a merge approval. When the
  selected worktree needs review or evidence, the UI/API should make clear that
  copying the brief can continue work while the merge gate remains separate.
- This rationale should be derived only from existing safe merge-readiness
  metadata. It should not inspect evidence contents, diffs, git state,
  filesystem state, prompt bodies, or transcript content.

Add:

- `review_packet_summary.brief_rationale` with:
  - label: `Brief rationale`
  - merge_readiness:
    - `ready`
    - `needs_review`
    - `missing_evidence`
  - reason:
    - `selected brief continues a ready worktree after evidence comparison`
    - `selected brief continues review work without marking it merge-ready`
    - `selected brief can continue evidence collection before merge`
  - next_action: `copy selected continuation brief`
  - merge_gate: selected worktree readiness next action
- web API typing and selected worktree detail rendering near readiness summary
- focused server/API/web tests proving selected brief action and merge gate stay
  separate

Do not add:

- command execution, merge approval, checklist completion, acknowledgements,
  file writes, git state reads, filesystem reads, branch checkout,
  diff/conflict inspection, merge automation, or background scanning
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- web or MCP write tools, external model calls, package/plugin/slash/hook/MCP
  rename work

### Slice 4.59: Compact Selected-Detail Guidance Sections

Decision:

- Selected worktree detail has accumulated several related read-only guidance
  blocks. It should group them with compact, explicit section labels so
  operators can distinguish continuation guidance, merge review guidance, and
  evidence guidance while scanning.
- This is a presentation-only slice. It should not add API fields, storage
  state, command execution, copy behavior, checklist completion state, or merge
  readiness semantics.

Add:

- `Continuation guidance` label before selected brief action details
- `Merge review guidance` label before review packet summary details
- `Evidence guidance` label before evidence-count explanation
- focused web rendering test proving these labels appear with the existing
  selected worktree detail content

Do not add:

- new server/API/MCP fields, write buttons, acknowledgements, checklist
  completion state, merge approval, git reads/writes, filesystem reads,
  command execution, or background scanning
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.60: Selected Review Detail Visual Hierarchy

Decision:

- The selected worktree detail panel should use compact visual hierarchy for
  the review packet area because the panel now contains continuation, merge,
  evidence, checklist, command, and missing-evidence guidance.
- The hierarchy should be implemented as presentation structure only: section
  wrappers, section titles, and a responsive review grid. It must preserve the
  existing read-only text and selected brief command behavior.

Add:

- `loop-worktree-detail` wrapper for selected detail spacing
- `loop-detail-section` and `loop-detail-section-title` for compact grouped
  guidance
- `loop-review-grid` and `loop-review-item` for readiness, brief rationale,
  evidence, checklist, and missing-evidence details
- focused web rendering test proving the structural classes are present with
  the existing selected detail content

Do not add:

- new API fields, storage state, server behavior, web write actions, checklist
  completion state, merge approval, command execution, git reads/writes,
  filesystem reads, or background scanning
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.61: Selected Review Command Hint Provenance

Decision:

- Selected worktree detail should explain where the review command hint comes
  from, because the UI now shows multiple continuation and review commands.
- The provenance should be raw-free and deterministic: it is derived from the
  existing command-center continuation command that was already computed from
  safe selected worktree metadata.
- The provenance must not imply that Loopdeck read git state, checked branch
  freshness, executed the command, wrote files, or contacted external services.

Add:

- `review_packet_summary.command_hint.provenance` with:
  - label: `Command provenance`
  - source: `existing command-center continuation command`
  - reason:
    `reuses safe selected worktree metadata without reading git or executing commands`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering under the command hint
- focused server/API/web tests proving the provenance is present

Do not add:

- command execution, git reads/writes, filesystem reads, branch freshness
  checks, merge approval, checklist completion state, external model calls,
  background scanning, or web write actions
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.62: Selected vs Review Command Distinction

Decision:

- Selected worktree detail should distinguish the selected continuation command
  from the review packet command hint. Operators may see both commands in the
  same panel, and they can legitimately differ when session or branch filters
  are active.
- The distinction should be raw-free and explanatory only. It should not choose
  one command, execute either command, check git state, or imply merge
  readiness.

Add:

- top-level selected worktree detail `command_distinction` with:
  - label: `Command distinction`
  - selected_command_role:
    `continue the selected worktree/session/branch filters`
  - review_command_role:
    `copy the review packet command-center hint for merge review`
  - reason:
    `selected continuation and review packet commands can differ when session or branch filters are active`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering near selected brief
  action
- focused server/API/web tests proving the distinction is present

Do not add:

- command execution, git reads/writes, filesystem reads, branch freshness
  checks, merge approval, automatic command selection, checklist completion
  state, external model calls, background scanning, or web write actions
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.63: Visible Command Filter Explanation

Decision:

- Selected worktree detail should show which filter categories are represented
  in each visible command. This makes it easier to understand why the selected
  continuation command can include session and branch filters while the review
  command hint follows command-center review scope.
- The explanation should expose only filter names, not raw paths, prompt
  content, evidence refs, or hidden command execution state.

Add:

- top-level selected worktree detail `command_filters` with:
  - label: `Command filters`
  - selected_command_filters:
    - `["worktree"]`
    - `["worktree", "session"]`
    - `["worktree", "branch"]`
    - `["worktree", "session", "branch"]`
  - review_command_filters:
    - `["worktree"]`
    - `["worktree", "branch"]`
  - reason:
    `selected command reflects the current selection while review command reflects command-center review scope`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering near command
  distinction
- focused server/API/web tests proving the filter explanation is present

Do not add:

- command execution, git reads/writes, filesystem reads, branch freshness
  checks, merge approval, automatic command selection, checklist completion
  state, external model calls, background scanning, or web write actions
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.64: Selected Copy Side-Effect Summary

Decision:

- Selected worktree detail should explain what the selected brief copy button
  does and does not change. The panel now contains multiple visible commands and
  review concepts, so Codex and Claude Code operators need a raw-free reminder
  that copying is clipboard/UI feedback only, not command execution or merge
  approval.
- This is needed because the product is a local-first workbench: users should be
  able to inspect copy actions before running or pasting anything into another
  agent session.

Add:

- top-level selected worktree detail `copy_side_effects` with:
  - label: `Copy side effects`
  - clipboard:
    `copies the selected continuation brief to the local clipboard`
  - ui_feedback:
    `temporarily marks the selected brief copy button as copied`
  - does_not:
    `does not write files, execute commands, call external services, submit prompts, or change merge state`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the side-effect summary is present

Do not add:

- extra clipboard writes beyond the existing explicit copy action, command
  execution, hidden prompt submission, git reads/writes, filesystem reads,
  merge-state mutation, checklist completion, background analysis, or external
  model calls
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.65: Selected Paste Destination Hint

Decision:

- Selected worktree detail should show where the copied selected continuation
  brief is meant to go: the active Codex or Claude Code request box. This makes
  the Codex/Claude Code handoff explicit without trying to control either tool's
  UI or submit prompts on the user's behalf.
- This is necessary because Codex and Claude Code are primary runtime surfaces
  for Loopdeck, and the web detail panel should connect copy-ready loop memory
  to the next human-controlled agent request.

Add:

- top-level selected worktree detail `paste_destination` with:
  - label: `Paste destination`
  - targets:
    - `Codex active request`
    - `Claude Code active request`
  - instruction:
    `paste the copied continuation brief into the active agent request box`
  - reason:
    `keeps Loopdeck as the local handoff source while the user controls submission`
  - auto_submit: `false`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the paste destination hint is present

Do not add:

- Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads, merge-state mutation, checklist
  completion, background analysis, external model calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.66: Selected Continuation Handoff Checklist

Decision:

- Selected worktree detail should expose a short continuation handoff checklist:
  copy the selected brief, paste it into Codex or Claude Code, submit manually,
  then collect the next loop snapshot after the agent turn. This closes the
  operator loop without automating either agent UI.
- This is needed because Loopdeck is not just a prompt archive; it is a
  local-first loop memory workbench. The selected detail panel should tell a
  human or active agent how to continue and how to return the result to local
  loop memory.

Add:

- top-level selected worktree detail `handoff_checklist` with:
  - label: `Continuation handoff checklist`
  - steps:
    - `copy selected continuation brief`
    - `paste into Codex or Claude Code active request`
    - `submit manually after review`
    - `collect the next loop snapshot after the agent turn`
  - reason:
    `keeps continuation handoff explicit without automating agent UI or reading transcripts`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the checklist is present

Do not add:

- Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads, transcript reads, merge-state
  mutation, checklist completion state, background analysis, external model
  calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.67: Selected Post-Handoff Reminder

Decision:

- Selected worktree detail should distinguish the next local action after a
  continuation handoff: collect a new loop snapshot. This is not the same as
  approving a loop memory or making a merge decision.
- This is needed because the selected detail panel now describes the full
  handoff path. Without a separate reminder, users and active agents can mistake
  “collect next loop” for memory approval or merge readiness.

Add:

- top-level selected worktree detail `post_handoff_reminder` with:
  - label: `Post-handoff reminder`
  - collect_next:
    `collect a new loop snapshot after the next agent turn`
  - not_memory_approval:
    `memory approval remains a separate explicit review`
  - not_merge:
    `merge remains a separate review-before-merge decision`
  - reason:
    `continuation handoff records the next loop before any memory approval or merge decision`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the reminder is present

Do not add:

- memory approval, merge decision writes, checklist completion state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution, git
  reads/writes, filesystem reads, transcript reads, background analysis,
  external model calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.68: Selected Source-of-Truth Note

Decision:

- Selected worktree detail should state that the next loop snapshot is the
  source of truth for local loop memory. It should explicitly say this is not a
  transcript import flow.
- This is needed because Loopdeck is becoming an agent loop memory workbench,
  not a transcript vault. The selected detail panel must keep the local-first
  memory boundary visible during Codex/Claude Code continuation handoff.

Add:

- top-level selected worktree detail `source_of_truth_note` with:
  - label: `Source-of-truth note`
  - local_memory_input:
    `next loop snapshot is the source of truth for local loop memory`
  - not_transcript_import:
    `transcript import is not used as the source of truth`
  - reason:
    `Loopdeck records explicit loop snapshots instead of importing agent transcripts`
  - stores_transcripts: `false`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the note is present

Do not add:

- transcript import, transcript storage, prompt body storage, compact summary
  import, memory approval writes, merge decision writes, Codex or Claude Code UI
  automation, hidden prompt submission, command execution, git reads/writes,
  filesystem reads, background analysis, external model calls, or new write
  tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.69: Selected Privacy Boundary Note

Decision:

- Selected worktree detail should show the privacy boundary for the
  source-of-truth model. It should say that Loopdeck stores local loop metadata
  in the local database and Markdown archive, while not storing prompt bodies,
  transcripts, raw paths, or provider credentials.
- This is needed because the source-of-truth note explains what should count as
  memory input, but not which private materials stay out of that memory model.

Add:

- top-level selected worktree detail `privacy_boundary_note` with:
  - label: `Privacy boundary`
  - storage_scope:
    `stores loop metadata in the local database and Markdown archive only`
  - does_not_store:
    `does not store prompt bodies, transcripts, raw paths, or provider credentials`
  - reason:
    `keeps source-of-truth loop memory local-first and reviewable`
  - local_only: `true`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the boundary note is present

Do not add:

- transcript import, transcript storage, prompt body storage, compact summary
  import, provider credential handling, memory approval writes, merge decision
  writes, Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads, background analysis, external
  model calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.70: Selected Operator Review Gate

Decision:

- Selected worktree detail should show an operator review gate for continuation
  handoff. It should state that the copied continuation brief is reviewed by the
  operator before manual submission in Codex or Claude Code.
- This is needed because paste destination and handoff checklist explain where
  the brief goes, but the UI should also make clear that Loopdeck does not
  automatically submit or execute the handoff.

Add:

- top-level selected worktree detail `operator_review_gate` with:
  - label: `Operator review gate`
  - review_step:
    `operator reviews the copied continuation brief before submitting`
  - manual_submit:
    `submission remains manual in Codex or Claude Code`
  - does_not:
    `does not auto-submit prompts, execute commands, write files, or change merge state`
  - auto_submit: `false`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the gate is present

Do not add:

- Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads, merge-state mutation, checklist
  completion state, background analysis, external model calls, memory approval
  writes, merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.71: Selected Collection Responsibility Note

Decision:

- Selected worktree detail should show who is responsible for collecting the
  next loop snapshot after continuation handoff. It should state that the
  operator runs the loop collection flow after the agent turn.
- This is needed because the handoff checklist says to collect the next
  snapshot, but does not explicitly prevent misreading Loopdeck as a background
  transcript watcher or agent UI scraper.

Add:

- top-level selected worktree detail `collection_responsibility_note` with:
  - label: `Collection responsibility`
  - responsible_party:
    `operator collects the next loop snapshot after the agent turn`
  - trigger:
    `collection starts only when the operator runs the loop collection flow`
  - does_not:
    `does not watch transcripts, scrape agent UI, or collect in the background`
  - automatic_collection: `false`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the note is present

Do not add:

- background transcript watching, agent UI scraping, automatic collection,
  command execution, git reads/writes, filesystem reads/writes, merge-state
  mutation, checklist completion state, background analysis, external model
  calls, memory approval writes, merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.72: Selected Pre-Merge Advisory

Decision:

- Selected worktree detail should show a pre-merge advisory after continuation
  handoff. It should tell the operator to hold merge decisions until the next
  loop snapshot has been collected and reviewed.
- This is needed because continuation handoff can change the selected
  worktree's readiness after the next agent turn, and memory approval remains a
  separate review from merge readiness.

Add:

- top-level selected worktree detail `pre_merge_advisory` with:
  - label: `Pre-merge advisory`
  - hold_merge:
    `hold merge decisions until the next loop snapshot is collected and reviewed`
  - reason:
    `continuation handoff can change readiness after the next agent turn`
  - not_memory_approval:
    `memory approval remains separate from merge readiness`
  - writes_merge_decision: `false`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the advisory is present

Do not add:

- merge decision writes, memory approval writes, git reads/writes, command
  execution, filesystem reads/writes, automatic merge checks, checklist
  completion state, background analysis, external model calls, or new write
  tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.73: Selected Post-Collection Review Note

Decision:

- Selected worktree detail should show a post-collection review note after
  continuation handoff. It should state that the collected loop snapshot's
  quality and evidence are reviewed before memory approval or merge readiness is
  reconsidered.
- This is needed because the selected detail panel now explains collection
  responsibility and pre-merge hold, but does not yet name the review step that
  happens after collection.

Add:

- top-level selected worktree detail `post_collection_review_note` with:
  - label: `Post-collection review`
  - review_step:
    `review the collected loop snapshot quality and evidence before approval`
  - before_memory_approval:
    `approve memory only after the collected snapshot is reviewed`
  - before_merge:
    `merge readiness can be reconsidered after post-collection review`
  - writes_memory: `false`
  - writes_merge_decision: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the note is present

Do not add:

- memory approval writes, merge decision writes, git reads/writes, command
  execution, filesystem reads/writes, automatic merge checks, checklist
  completion state, background analysis, external model calls, or new write
  tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.74: Selected Continuation Safety Grouping Label

Decision:

- Selected worktree detail should label the continuation safety guidance as one
  read-only group for Codex and Claude Code continuation.
- This is needed because the selected detail panel now has many adjacent safety
  notes; users need a local-first grouping label before reading the individual
  copy, paste, review, collect, privacy, and merge gating notes.

Add:

- top-level selected worktree detail `continuation_safety_group` with:
  - label: `Continuation safety guidance`
  - scope:
    `read-only handoff boundaries for Codex and Claude Code continuation`
  - includes:
    `copy, paste, review, collect, privacy, and merge gating notes`
  - reason:
    `keeps the selected continuation path explicit without automating agents`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance
- focused server/API/web tests proving the group label is present

Do not add:

- Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads/writes, transcript import,
  checklist completion state, background analysis, external model calls, memory
  approval writes, merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.75: Selected Continuation Safety Ordering Note

Decision:

- Selected worktree detail should state that the continuation safety guidance is
  reviewed before copying or pasting selected continuation briefs.
- This is needed because the group label names the safety boundary, but does not
  yet tell the operator which step comes first when continuing a Codex or Claude
  Code loop.

Add:

- top-level selected worktree detail `continuation_safety_ordering_note` with:
  - label: `Safety guidance order`
  - first:
    `review the continuation safety guidance before copying or pasting briefs`
  - then:
    `follow copy, paste, review, collect, privacy, and merge gating notes in order`
  - reason:
    `keeps continuation handoff reviewable before any manual agent submission`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the grouping label
- focused server/API/web tests proving the ordering note is present

Do not add:

- Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads/writes, transcript import,
  checklist completion state, background analysis, external model calls, memory
  approval writes, merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.76: Selected Continuation Safety Non-Persistence Note

Decision:

- Selected worktree detail should state that reviewing the continuation safety
  guidance does not create stored state or synchronize review state elsewhere.
- This is needed because the ordering note tells the operator to review safety
  guidance first, but should not imply Loopdeck tracks a completed checklist or
  persists a reviewed flag.

Add:

- top-level selected worktree detail
  `continuation_safety_non_persistence_note` with:
  - label: `Safety review state`
  - state:
    `reviewed guidance state is not stored or synchronized by Loopdeck`
  - reminder:
    `operator re-checks safety guidance each time before manual agent submission`
  - reason:
    `keeps continuation review local to the current operator session`
  - stores_state: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the ordering note
- focused server/API/web tests proving the non-persistence note is present

Do not add:

- Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads/writes, transcript import,
  persisted review state, checklist completion state, background analysis,
  external model calls, memory approval writes, merge decision writes, or new
  write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.77: Selected Continuation Safety Re-Check Cue

Decision:

- Selected worktree detail should state that continuation safety guidance is
  re-checked after each selected brief copy before pasting into Codex or Claude
  Code.
- This is needed because the non-persistence note explains review state is not
  stored; the operator still needs a concrete cue tied to the repeated copy
  action.

Add:

- top-level selected worktree detail `continuation_safety_recheck_cue` with:
  - label: `Safety re-check cue`
  - trigger: `after each selected brief copy`
  - instruction:
    `re-check continuation safety guidance before pasting into Codex or Claude Code`
  - reason:
    `each copied brief can represent a new handoff decision even in the same session`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the non-persistence note
- focused server/API/web tests proving the re-check cue is present

Do not add:

- Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads/writes, transcript import,
  persisted review state, checklist completion state, background analysis,
  external model calls, memory approval writes, merge decision writes, or new
  write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.78: Selected Continuation Copy Feedback Reminder

Decision:

- Selected worktree detail should state that copied feedback only means the
  selected brief reached the local clipboard, and should point the operator back
  to the safety re-check cue before paste.
- This is needed because copy feedback can otherwise be mistaken for safety
  approval or successful agent submission.

Add:

- top-level selected worktree detail
  `continuation_safety_copy_feedback_reminder` with:
  - label: `Copy feedback reminder`
  - feedback_scope:
    `copied state only confirms the brief reached the local clipboard`
  - next_step:
    `return to the safety re-check cue before pasting the copied brief`
  - reason:
    `copy feedback is not safety approval or agent submission`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the re-check cue
- focused server/API/web tests proving the copy feedback reminder is present

Do not add:

- Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads/writes, transcript import,
  persisted review state, checklist completion state, background analysis,
  external model calls, memory approval writes, merge decision writes, or new
  write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.79: Selected Brief Copy Feedback Accessibility Note

Decision:

- Selected worktree detail should state that selected brief copy feedback keeps
  the visible button label stable and exposes copied status through accessible
  feedback instead of replacing the visible command.
- This is needed because copy feedback guidance should not introduce layout
  shift or imply that copying completed safety review or agent submission.

Add:

- top-level selected worktree detail
  `continuation_safety_copy_feedback_accessibility_note` with:
  - label: `Copy feedback accessibility`
  - visible_label:
    `selected brief copy button label remains stable`
  - assistive_feedback:
    `copied status belongs in accessible feedback instead of replacing the visible command`
  - reason:
    `keeps copy feedback clear without implying safety approval or changing layout`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the copy feedback reminder
- focused server/API/web tests proving the accessibility note is present

Do not add:

- button label rewrites, layout changes, Codex or Claude Code UI automation,
  hidden prompt submission, command execution, git reads/writes, filesystem
  reads/writes, transcript import, persisted review state, checklist completion
  state, background analysis, external model calls, memory approval writes,
  merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.80: Selected Brief Copy Feedback Timeout Note

Decision:

- Selected worktree detail should state that copied feedback clears after a
  short local timeout and that timeout expiry is not review completion or agent
  submission state.
- This is needed because transient copy feedback can otherwise be mistaken for
  durable safety review, successful handoff, or hidden state synchronization.

Add:

- top-level selected worktree detail
  `continuation_safety_copy_feedback_timeout_note` with:
  - label: `Copy feedback timeout`
  - timeout_scope:
    `copied feedback clears after a short local timeout`
  - not_state:
    `timeout does not record review completion or submission state`
  - reason:
    `keeps copied feedback temporary while preserving the manual safety review boundary`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the copy feedback accessibility note
- focused server/API/web tests proving the timeout note is present

Do not add:

- timeout duration changes, button behavior changes, persisted copied state,
  Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads/writes, transcript import,
  persisted review state, checklist completion state, background analysis,
  external model calls, memory approval writes, merge decision writes, or new
  write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.81: Selected Brief Copy Feedback Failure Note

Decision:

- Selected worktree detail should state that clipboard failure requires a manual
  retry and does not submit prompts or store review state.
- This is needed because a failed copy path should not imply hidden recovery,
  background agent submission, or persisted safety review state.

Add:

- top-level selected worktree detail
  `continuation_safety_copy_feedback_failure_note` with:
  - label: `Copy feedback failure`
  - failure_scope:
    `clipboard failure requires a manual retry`
  - not_state:
    `failure does not submit prompts or store review state`
  - reason:
    `keeps copy failure handling local to the operator without hidden recovery actions`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the copy feedback timeout note
- focused server/API/web tests proving the failure note is present

Do not add:

- automatic retry, hidden clipboard recovery, button behavior changes,
  persisted copied/failure state, Codex or Claude Code UI automation, hidden
  prompt submission, command execution, git reads/writes, filesystem reads/writes,
  transcript import, persisted review state, checklist completion state,
  background analysis, external model calls, memory approval writes, merge
  decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.82: Selected Brief Copy Retry Note

Decision:

- Selected worktree detail should state that retrying the selected brief copy is
  a manual operator action and that Loopdeck does not automatically retry
  clipboard writes or submit prompts.
- This is needed because retry guidance should not be mistaken for background
  clipboard recovery, hidden prompt submission, or agent UI automation.

Add:

- top-level selected worktree detail
  `continuation_safety_copy_retry_note` with:
  - label: `Copy retry`
  - retry_scope:
    `operator manually retries the selected brief copy action`
  - not_automatic:
    `Loopdeck does not automatically retry clipboard writes or submit prompts`
  - reason:
    `keeps retry control with the operator before any Codex or Claude Code paste`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the copy feedback failure note
- focused server/API/web tests proving the retry note is present

Do not add:

- automatic retry, hidden clipboard recovery, button behavior changes,
  persisted copied/failure/retry state, Codex or Claude Code UI automation,
  hidden prompt submission, command execution, git reads/writes, filesystem
  reads/writes, transcript import, persisted review state, checklist completion
  state, background analysis, external model calls, memory approval writes,
  merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.83: Selected Brief Pre-Paste Confirmation Note

Decision:

- Selected worktree detail should state that the operator confirms the copied
  brief and target agent request before paste.
- This is needed because final handoff confirmation should not be mistaken for
  prompt submission, safety approval, or persisted review state.

Add:

- top-level selected worktree detail
  `continuation_safety_pre_paste_confirmation_note` with:
  - label: `Pre-paste confirmation`
  - confirmation:
    `operator confirms the copied brief and target agent request before paste`
  - not_submission:
    `confirmation does not submit prompts or approve safety review`
  - reason:
    `keeps the final handoff check manual before Codex or Claude Code receives the brief`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the copy retry note
- focused server/API/web tests proving the pre-paste confirmation note is present

Do not add:

- paste automation, target-agent UI inspection, persisted confirmation state,
  safety approval state, Codex or Claude Code UI automation, hidden prompt
  submission, command execution, git reads/writes, filesystem reads/writes,
  transcript import, persisted review state, checklist completion state,
  background analysis, external model calls, memory approval writes, merge
  decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.84: Selected Brief Target-Agent Check Note

Decision:

- Selected worktree detail should state that the operator verifies the active
  Codex or Claude Code request box before paste.
- This is needed because target-agent checking should not be mistaken for
  Loopdeck inspecting agent UI state, reading target contents, or validating
  target-agent safety automatically.

Add:

- top-level selected worktree detail
  `continuation_safety_target_agent_check_note` with:
  - label: `Target-agent check`
  - check:
    `operator verifies the active Codex or Claude Code request box before paste`
  - not_inspection:
    `Loopdeck does not inspect agent UI state or target contents`
  - reason:
    `keeps target selection manual before any continuation handoff`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the pre-paste confirmation note
- focused server/API/web tests proving the target-agent check note is present

Do not add:

- target-agent UI inspection, active window detection, clipboard target
  validation, paste automation, persisted target state, safety approval state,
  Codex or Claude Code UI automation, hidden prompt submission, command
  execution, git reads/writes, filesystem reads/writes, transcript import,
  persisted review state, checklist completion state, background analysis,
  external model calls, memory approval writes, merge decision writes, or new
  write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.85: Paste Destination Verification Boundary Note

Decision:

- Selected worktree detail should state that paste destination verification is
  a manual operator boundary in Codex or Claude Code.
- This is needed because destination guidance should not be mistaken for active
  window detection, target content validation, paste success verification, or
  hidden agent UI automation.

Add:

- top-level selected worktree detail
  `continuation_safety_paste_destination_boundary_note` with:
  - label: `Paste destination boundary`
  - boundary:
    `paste destination is a manual operator choice in Codex or Claude Code`
  - not_verified:
    `Loopdeck does not verify active windows, target contents, or paste success`
  - reason:
    `keeps destination verification outside Loopdeck automation before submission`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the target-agent check note
- focused server/API/web tests proving the paste destination boundary note is
  present

Do not add:

- active window detection, target-agent UI inspection, target content
  validation, paste success verification, clipboard target validation, paste
  automation, persisted destination state, persisted target state, safety
  approval state, Codex or Claude Code UI automation, hidden prompt submission,
  command execution, git reads/writes, filesystem reads/writes, transcript
  import, persisted review state, checklist completion state, background
  analysis, external model calls, memory approval writes, merge decision writes,
  or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.86: Manual Submission Boundary Note

Decision:

- Selected worktree detail should state that the operator submits the pasted
  brief manually in Codex or Claude Code.
- This is needed because final submission guidance should not be mistaken for
  Loopdeck pressing Enter, clicking submit, detecting submission success, or
  recording submitted state.

Add:

- top-level selected worktree detail
  `continuation_safety_manual_submission_boundary_note` with:
  - label: `Manual submission boundary`
  - submission:
    `operator submits the pasted brief manually in Codex or Claude Code`
  - not_automated:
    `Loopdeck does not press enter, click submit, or record submitted state`
  - reason:
    `keeps final agent execution under operator control after paste`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the paste destination boundary note
- focused server/API/web tests proving the manual submission boundary note is
  present

Do not add:

- submit automation, Enter key automation, button clicking, submission success
  detection, submitted state persistence, active window detection, target-agent
  UI inspection, target content validation, paste success verification,
  clipboard target validation, paste automation, persisted destination state,
  persisted target state, safety approval state, Codex or Claude Code UI
  automation, hidden prompt submission, command execution, git reads/writes,
  filesystem reads/writes, transcript import, persisted review state,
  checklist completion state, background analysis, external model calls, memory
  approval writes, merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.87: Submission Result Non-Persistence Note

Decision:

- Selected worktree detail should state that agent response and submission
  result stay outside Loopdeck until the next explicit loop snapshot.
- This is needed because post-submission guidance should not be mistaken for
  submission result detection, submitted state persistence, transcript watching,
  or agent UI monitoring.

Add:

- top-level selected worktree detail
  `continuation_safety_submission_result_non_persistence_note` with:
  - label: `Submission result non-persistence`
  - result_scope:
    `agent response and submission result stay outside Loopdeck until the next explicit loop snapshot`
  - not_stored:
    `Loopdeck does not detect, store, or sync submitted state after handoff`
  - reason:
    `keeps post-submission evidence tied to explicit loop collection instead of UI monitoring`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the manual submission boundary note
- focused server/API/web tests proving the submission result non-persistence note
  is present

Do not add:

- submission result detection, submitted state persistence, transcript watching,
  agent UI monitoring, submit automation, Enter key automation, button clicking,
  submission success detection, active window detection, target-agent UI
  inspection, target content validation, paste success verification, clipboard
  target validation, paste automation, persisted destination state, persisted
  target state, safety approval state, Codex or Claude Code UI automation,
  hidden prompt submission, command execution, git reads/writes, filesystem
  reads/writes, transcript import, persisted review state, checklist completion
  state, background analysis, external model calls, memory approval writes,
  merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.88: Post-Submission Collection Reminder Boundary Note

Decision:

- Selected worktree detail should state that the operator collects the next
  loop snapshot explicitly after the agent response is ready.
- This is needed because post-submission collection should not be mistaken for
  automatic collection from submission events, transcript changes, agent UI
  activity, or background monitoring.

Add:

- top-level selected worktree detail
  `continuation_safety_post_submission_collection_reminder_note` with:
  - label: `Post-submission collection reminder`
  - reminder:
    `collect the next loop snapshot explicitly after the agent response is ready`
  - not_background:
    `Loopdeck does not start collection from submission, transcript changes, or agent UI activity`
  - reason:
    `keeps post-submission collection operator-triggered and local-first`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the submission result non-persistence note
- focused server/API/web tests proving the post-submission collection reminder
  note is present

Do not add:

- automatic collection, transcript watching, agent UI monitoring, submission
  event hooks, submission result detection, submitted state persistence, submit
  automation, Enter key automation, button clicking, submission success
  detection, active window detection, target-agent UI inspection, target
  content validation, paste success verification, clipboard target validation,
  paste automation, persisted destination state, persisted target state, safety
  approval state, Codex or Claude Code UI automation, hidden prompt submission,
  command execution, git reads/writes, filesystem reads/writes, transcript
  import, persisted review state, checklist completion state, background
  analysis, external model calls, memory approval writes, merge decision writes,
  or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, or secret-looking
  tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.89: Collection Result Non-Persistence Note

Decision:

- Selected worktree detail should state that collection result state is not
  persisted until the operator records the next explicit loop snapshot.
- This is needed because the post-submission collection reminder should not be
  mistaken for a background collection result tracker, agent UI monitor, or
  synced collection-state workflow.

Add:

- top-level selected worktree detail
  `continuation_safety_collection_result_non_persistence_note` with:
  - label: `Collection result non-persistence`
  - result_scope:
    `collection result is not persisted until the operator records the next explicit loop snapshot`
  - not_stored:
    `Loopdeck does not store, sync, or infer collection result state from agent UI activity`
  - reason:
    `keeps collection evidence tied to explicit local snapshot recording`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-submission collection reminder note
- focused server/API/web tests proving the collection result non-persistence
  note is present

Do not add:

- collection result state persistence, collection result detection, background
  collection, automatic collection, collection command execution, retry
  automation, transcript watching, agent UI monitoring, submission event hooks,
  submission result detection, submitted state persistence, submit automation,
  Enter key automation, button clicking, active window detection, target-agent
  UI inspection, target content validation, paste success verification,
  clipboard target validation, paste automation, persisted destination state,
  persisted target state, safety approval state, Codex or Claude Code UI
  automation, hidden prompt submission, command execution, git reads/writes,
  filesystem reads/writes, transcript import, persisted review state,
  checklist completion state, background analysis, external model calls, memory
  approval writes, merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, or secret-looking
  tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.90: Collection Retry Boundary Note

Decision:

- Selected worktree detail should state that collection retry is an explicit
  operator action: rerun the loop collection flow when retry is needed.
- This is needed because a collection result uncertainty state should not be
  mistaken for automatic retry, hidden recovery, command execution, or
  background collection.

Add:

- top-level selected worktree detail
  `continuation_safety_collection_retry_boundary_note` with:
  - label: `Collection retry boundary`
  - retry:
    `operator reruns the explicit loop collection flow when retry is needed`
  - not_automated:
    `Loopdeck does not automatically retry collection commands or hidden recovery actions`
  - reason:
    `keeps retry control local and operator-triggered after collection uncertainty`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the collection result non-persistence note
- focused server/API/web tests proving the collection retry boundary note is
  present

Do not add:

- retry automation, automatic collection retry, hidden recovery actions,
  collection command execution, collection result state persistence, collection
  result detection, background collection, automatic collection, transcript
  watching, agent UI monitoring, submission event hooks, submission result
  detection, submitted state persistence, submit automation, Enter key
  automation, button clicking, active window detection, target-agent UI
  inspection, target content validation, paste success verification, clipboard
  target validation, paste automation, persisted destination state, persisted
  target state, safety approval state, Codex or Claude Code UI automation,
  hidden prompt submission, command execution, git reads/writes, filesystem
  reads/writes, transcript import, persisted review state, checklist completion
  state, background analysis, external model calls, memory approval writes,
  merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, retry result state, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.91: Retry Outcome Non-Persistence Note

Decision:

- Selected worktree detail should state that retry attempt and retry outcome
  state stay outside Loopdeck until the next explicit loop snapshot.
- This is needed because manual collection retry guidance should not be mistaken
  for retry success/failure detection, retry outcome persistence, or retry state
  synchronization.

Add:

- top-level selected worktree detail
  `continuation_safety_retry_outcome_non_persistence_note` with:
  - label: `Retry outcome non-persistence`
  - outcome_scope:
    `retry attempt and outcome stay outside Loopdeck until the next explicit loop snapshot`
  - not_stored:
    `Loopdeck does not detect, store, or sync retry success or failure state`
  - reason:
    `keeps retry evidence tied to explicit local snapshot recording`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the collection retry boundary note
- focused server/API/web tests proving the retry outcome non-persistence note is
  present

Do not add:

- retry outcome persistence, retry success/failure detection, retry state
  synchronization, retry automation, automatic collection retry, hidden recovery
  actions, collection command execution, collection result state persistence,
  collection result detection, background collection, automatic collection,
  transcript watching, agent UI monitoring, submission event hooks, submission
  result detection, submitted state persistence, submit automation, Enter key
  automation, button clicking, active window detection, target-agent UI
  inspection, target content validation, paste success verification, clipboard
  target validation, paste automation, persisted destination state, persisted
  target state, safety approval state, Codex or Claude Code UI automation,
  hidden prompt submission, command execution, git reads/writes, filesystem
  reads/writes, transcript import, persisted review state, checklist completion
  state, background analysis, external model calls, memory approval writes,
  merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, retry result state, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.92: Collection Evidence Freshness Boundary Note

Decision:

- Selected worktree detail should state that evidence freshness is checked by
  the operator against the latest explicit loop snapshot evidence.
- This is needed because collection evidence freshness should not be mistaken
  for automatic git status reads, transcript inspection, agent UI monitoring,
  or hidden freshness verification.

Add:

- top-level selected worktree detail
  `continuation_safety_collection_evidence_freshness_boundary_note` with:
  - label: `Collection evidence freshness boundary`
  - freshness_check:
    `operator checks freshness against the latest explicit loop snapshot evidence`
  - not_verified:
    `Loopdeck does not verify freshness from git status, transcripts, or agent UI activity`
  - reason:
    `keeps evidence freshness review tied to local snapshot metadata`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the retry outcome non-persistence note
- focused server/API/web tests proving the collection evidence freshness
  boundary note is present

Do not add:

- evidence freshness verification, git status reads, transcript inspection,
  agent UI monitoring, hidden freshness checks, retry outcome persistence,
  retry success/failure detection, retry state synchronization, retry
  automation, automatic collection retry, hidden recovery actions, collection
  command execution, collection result state persistence, collection result
  detection, background collection, automatic collection, submission event
  hooks, submission result detection, submitted state persistence, submit
  automation, Enter key automation, button clicking, active window detection,
  target-agent UI inspection, target content validation, paste success
  verification, clipboard target validation, paste automation, persisted
  destination state, persisted target state, safety approval state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution,
  filesystem reads/writes, persisted review state, checklist completion state,
  background analysis, external model calls, memory approval writes, merge
  decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, retry result state,
  freshness result state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.93: Freshness Result Non-Persistence Note

Decision:

- Selected worktree detail should state that freshness result state stays
  outside Loopdeck until the next explicit loop snapshot.
- This is needed because the collection evidence freshness boundary should not
  be mistaken for freshness result detection, persistence, or state
  synchronization.

Add:

- top-level selected worktree detail
  `continuation_safety_freshness_result_non_persistence_note` with:
  - label: `Freshness result non-persistence`
  - result_scope:
    `freshness result stays outside Loopdeck until the next explicit loop snapshot`
  - not_stored:
    `Loopdeck does not detect, store, or sync freshness result state`
  - reason:
    `keeps freshness evidence tied to explicit local snapshot recording`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the collection evidence freshness boundary note
- focused server/API/web tests proving the freshness result non-persistence
  note is present

Do not add:

- freshness result persistence, freshness result detection, freshness state
  synchronization, evidence freshness verification, git status reads,
  transcript inspection, agent UI monitoring, hidden freshness checks, retry
  outcome persistence, retry success/failure detection, retry state
  synchronization, retry automation, automatic collection retry, hidden recovery
  actions, collection command execution, collection result state persistence,
  collection result detection, background collection, automatic collection,
  submission event hooks, submission result detection, submitted state
  persistence, submit automation, Enter key automation, button clicking, active
  window detection, target-agent UI inspection, target content validation, paste
  success verification, clipboard target validation, paste automation,
  persisted destination state, persisted target state, safety approval state,
  Codex or Claude Code UI automation, hidden prompt submission, command
  execution, filesystem reads/writes, persisted review state, checklist
  completion state, background analysis, external model calls, memory approval
  writes, merge decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, retry result state,
  freshness result state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.94: Freshness Uncertainty Collection Reminder

Decision:

- Selected worktree detail should remind the operator to collect a new explicit
  loop snapshot when evidence freshness is uncertain.
- This is needed because freshness uncertainty should resolve through an
  operator-triggered local snapshot, not through hidden freshness checks,
  automatic collection, git status reads, transcript inspection, or agent UI
  monitoring.

Add:

- top-level selected worktree detail
  `continuation_safety_freshness_uncertainty_collection_reminder` with:
  - label: `Freshness uncertainty collection reminder`
  - reminder:
    `collect a new explicit loop snapshot when evidence freshness is uncertain`
  - not_automated:
    `Loopdeck does not verify freshness or start collection automatically`
  - reason:
    `keeps freshness uncertainty resolution operator-triggered and local-first`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the freshness result non-persistence note
- focused server/API/web tests proving the freshness uncertainty collection
  reminder is present

Do not add:

- freshness verification, automatic collection, background collection,
  collection command execution, freshness result persistence, freshness result
  detection, freshness state synchronization, git status reads, transcript
  inspection, agent UI monitoring, hidden freshness checks, retry outcome
  persistence, retry success/failure detection, retry state synchronization,
  retry automation, automatic collection retry, hidden recovery actions,
  collection result state persistence, collection result detection, submission
  event hooks, submission result detection, submitted state persistence, submit
  automation, Enter key automation, button clicking, active window detection,
  target-agent UI inspection, target content validation, paste success
  verification, clipboard target validation, paste automation, persisted
  destination state, persisted target state, safety approval state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution,
  filesystem reads/writes, persisted review state, checklist completion state,
  background analysis, external model calls, memory approval writes, merge
  decision writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, retry result state,
  freshness result state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.95: Pre-Merge Freshness Advisory

Decision:

- Selected worktree detail should advise the operator to review freshness
  uncertainty before merge decisions.
- This is needed because freshness uncertainty can affect whether a continuation
  handoff is ready to merge, but Loopdeck should not approve merges, verify
  freshness, or write merge readiness state from this note.

Add:

- top-level selected worktree detail
  `continuation_safety_pre_merge_freshness_advisory` with:
  - label: `Pre-merge freshness advisory`
  - advisory:
    `review freshness uncertainty before merge decisions`
  - not_decision:
    `Loopdeck does not approve merges or verify freshness before merge`
  - reason:
    `keeps merge readiness separate from freshness uncertainty review`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the freshness uncertainty collection reminder
- focused server/API/web tests proving the pre-merge freshness advisory is
  present

Do not add:

- merge approval, merge readiness writes, freshness verification, automatic
  collection, background collection, collection command execution, freshness
  result persistence, freshness result detection, freshness state
  synchronization, git status reads, transcript inspection, agent UI monitoring,
  hidden freshness checks, retry outcome persistence, retry success/failure
  detection, retry state synchronization, retry automation, automatic collection
  retry, hidden recovery actions, collection result state persistence,
  collection result detection, submission event hooks, submission result
  detection, submitted state persistence, submit automation, Enter key
  automation, button clicking, active window detection, target-agent UI
  inspection, target content validation, paste success verification, clipboard
  target validation, paste automation, persisted destination state, persisted
  target state, safety approval state, Codex or Claude Code UI automation,
  hidden prompt submission, command execution, filesystem reads/writes,
  persisted review state, checklist completion state, background analysis,
  external model calls, memory approval writes, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, retry result state,
  freshness result state, merge decision state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.96: Pre-Memory-Approval Freshness Advisory

Decision:

- Selected worktree detail should advise the operator to review freshness
  uncertainty before approving loop memory.
- This is needed because memory approval should remain a separate explicit
  review and should not be confused with freshness verification, memory approval
  writes, or hidden state changes from this note.

Add:

- top-level selected worktree detail
  `continuation_safety_pre_memory_approval_freshness_advisory` with:
  - label: `Pre-memory-approval freshness advisory`
  - advisory:
    `review freshness uncertainty before approving loop memory`
  - not_decision:
    `Loopdeck does not approve memory or verify freshness from this note`
  - reason:
    `keeps memory approval separate from freshness uncertainty review`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the pre-merge freshness advisory
- focused server/API/web tests proving the pre-memory-approval freshness
  advisory is present

Do not add:

- memory approval writes, memory approval state, freshness verification, merge
  approval, merge readiness writes, automatic collection, background collection,
  collection command execution, freshness result persistence, freshness result
  detection, freshness state synchronization, git status reads, transcript
  inspection, agent UI monitoring, hidden freshness checks, retry outcome
  persistence, retry success/failure detection, retry state synchronization,
  retry automation, automatic collection retry, hidden recovery actions,
  collection result state persistence, collection result detection, submission
  event hooks, submission result detection, submitted state persistence, submit
  automation, Enter key automation, button clicking, active window detection,
  target-agent UI inspection, target content validation, paste success
  verification, clipboard target validation, paste automation, persisted
  destination state, persisted target state, safety approval state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution,
  filesystem reads/writes, persisted review state, checklist completion state,
  background analysis, external model calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, retry result state,
  freshness result state, merge decision state, memory approval state, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.97: Post-Memory-Approval Collection Reminder

Decision:

- Selected worktree detail should remind the operator to collect a new explicit
  loop snapshot after approving loop memory.
- This is needed because memory approval can influence future continuation
  context, but collection after approval should remain an explicit
  operator-triggered action, not an automatic side effect of approval state.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_collection_reminder` with:
  - label: `Post-memory-approval collection reminder`
  - reminder:
    `collect a new explicit loop snapshot after approving loop memory`
  - not_automated:
    `Loopdeck does not start collection from memory approval or approval state changes`
  - reason:
    `keeps post-approval collection operator-triggered and local-first`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the pre-memory-approval freshness advisory
- focused server/API/web tests proving the post-memory-approval collection
  reminder is present

Do not add:

- memory approval writes, memory approval state, memory approval result
  persistence, approval state synchronization, automatic post-approval
  collection, background collection, collection command execution, collection
  result persistence, collection result detection, collection state
  synchronization, freshness verification, freshness result persistence, git
  status reads, transcript inspection, agent UI monitoring, hidden collection
  actions, retry automation, automatic collection retry, hidden recovery
  actions, submission event hooks, submitted state persistence, submit
  automation, Enter key automation, button clicking, active window detection,
  target-agent UI inspection, target content validation, paste success
  verification, clipboard target validation, paste automation, persisted
  destination state, persisted target state, safety approval state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution,
  filesystem reads/writes, persisted review state, checklist completion state,
  merge decision writes, background analysis, external model calls, or new write
  tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, retry result state,
  freshness result state, merge decision state, memory approval state, approval
  result state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.98: Post-Memory-Approval Collection Result Non-Persistence

Decision:

- Selected worktree detail should state that post-memory-approval collection
  result state stays outside Loopdeck until the next explicit loop snapshot is
  recorded.
- This is needed because the operator may collect after memory approval, but
  Loopdeck should not infer, persist, or synchronize that collection result from
  approval state, agent UI activity, transcripts, or hidden collection checks.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_collection_result_non_persistence_note`
  with:
  - label: `Post-memory-approval collection result non-persistence`
  - result_scope:
    `post-approval collection result stays outside Loopdeck until the next explicit loop snapshot`
  - not_stored:
    `Loopdeck does not detect, store, or sync post-approval collection result state`
  - reason:
    `keeps post-approval collection evidence tied to explicit local snapshot recording`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval collection reminder
- focused server/API/web tests proving the post-memory-approval collection
  result non-persistence note is present

Do not add:

- collection result persistence, post-approval collection result persistence,
  collection result detection, collection state synchronization, approval result
  persistence, approval state synchronization, memory approval writes, memory
  approval state, automatic post-approval collection, background collection,
  collection command execution, freshness verification, freshness result
  persistence, git status reads, transcript inspection, agent UI monitoring,
  hidden collection actions, retry automation, automatic collection retry,
  hidden recovery actions, submission event hooks, submitted state persistence,
  submit automation, Enter key automation, button clicking, active window
  detection, target-agent UI inspection, target content validation, paste
  success verification, clipboard target validation, paste automation,
  persisted destination state, persisted target state, safety approval state,
  Codex or Claude Code UI automation, hidden prompt submission, command
  execution, filesystem reads/writes, persisted review state, checklist
  completion state, merge decision writes, background analysis, external model
  calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, retry result state, freshness result state, merge
  decision state, memory approval state, approval result state, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.99: Post-Memory-Approval Collection Retry Boundary

Decision:

- Selected worktree detail should state that post-memory-approval collection
  retry is a manual operator action: rerun the explicit post-approval loop
  collection flow when retry is needed.
- This is needed because retry after memory approval should stay local and
  operator-triggered, not become automatic command retry, hidden recovery, or
  approval-state-driven collection automation.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_collection_retry_boundary_note`
  with:
  - label: `Post-memory-approval collection retry boundary`
  - retry:
    `operator reruns the explicit post-approval loop collection flow when retry is needed`
  - not_automated:
    `Loopdeck does not automatically retry post-approval collection commands or hidden recovery actions`
  - reason:
    `keeps post-approval collection retry control local and operator-triggered`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval collection result
  non-persistence note
- focused server/API/web tests proving the post-memory-approval collection retry
  boundary note is present

Do not add:

- retry automation, automatic post-approval collection retry, hidden recovery
  actions, collection command execution, collection result persistence,
  post-approval collection result persistence, retry result persistence, retry
  success/failure detection, retry state synchronization, collection result
  detection, collection state synchronization, approval result persistence,
  approval state synchronization, memory approval writes, memory approval state,
  automatic post-approval collection, background collection, freshness
  verification, freshness result persistence, git status reads, transcript
  inspection, agent UI monitoring, submission event hooks, submitted state
  persistence, submit automation, Enter key automation, button clicking, active
  window detection, target-agent UI inspection, target content validation, paste
  success verification, clipboard target validation, paste automation, persisted
  destination state, persisted target state, safety approval state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution,
  filesystem reads/writes, persisted review state, checklist completion state,
  merge decision writes, background analysis, external model calls, or new write
  tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, retry result state, post-approval retry result state,
  freshness result state, merge decision state, memory approval state, approval
  result state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.100: Post-Memory-Approval Retry Outcome Non-Persistence

Decision:

- Selected worktree detail should state that post-memory-approval retry outcome
  stays outside Loopdeck until the next explicit loop snapshot.
- This is needed because the retry boundary would otherwise imply that Loopdeck
  can observe retry success or failure. It cannot and should not detect, store,
  or sync post-approval retry outcome state.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_retry_outcome_non_persistence_note`
  with:
  - label: `Post-memory-approval retry outcome non-persistence`
  - outcome_scope:
    `post-approval retry outcome stays outside Loopdeck until the next explicit loop snapshot`
  - not_stored:
    `Loopdeck does not detect, store, or sync post-approval retry success or failure state`
  - reason:
    `keeps post-approval retry evidence tied to explicit local snapshot recording`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval collection retry boundary
  note
- focused server/API/web tests proving the post-memory-approval retry outcome
  non-persistence note is present

Do not add:

- retry result persistence, post-approval retry result persistence, retry
  success/failure detection, retry state synchronization, retry outcome
  detection, collection command execution, collection result persistence,
  post-approval collection result persistence, collection result detection,
  collection state synchronization, approval result persistence, approval state
  synchronization, memory approval writes, memory approval state, automatic
  post-approval collection, automatic post-approval collection retry, background
  collection, hidden recovery actions, freshness verification, freshness result
  persistence, git status reads, transcript inspection, agent UI monitoring,
  submission event hooks, submitted state persistence, submit automation, Enter
  key automation, button clicking, active window detection, target-agent UI
  inspection, target content validation, paste success verification, clipboard
  target validation, paste automation, persisted destination state, persisted
  target state, safety approval state, Codex or Claude Code UI automation,
  hidden prompt submission, command execution, filesystem reads/writes,
  persisted review state, checklist completion state, merge decision writes,
  background analysis, external model calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, retry result state, post-approval retry result state,
  retry outcome state, freshness result state, merge decision state, memory
  approval state, approval result state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.101: Post-Memory-Approval Retry Evidence Freshness Boundary

Decision:

- Selected worktree detail should state that post-memory-approval retry evidence
  freshness is checked manually against the latest explicit loop snapshot.
- This is needed because post-approval retry outcome can be stale after another
  loop turn. Loopdeck should present the review boundary without reading git
  status, transcripts, or agent UI activity.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_retry_evidence_freshness_boundary_note`
  with:
  - label: `Post-memory-approval retry evidence freshness boundary`
  - review:
    `operator checks retry evidence freshness against the latest explicit loop snapshot`
  - not_verified:
    `Loopdeck does not verify post-approval retry freshness from git status, transcripts, or agent UI activity`
  - reason:
    `keeps post-approval retry freshness review tied to local snapshot metadata`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval retry outcome
  non-persistence note
- focused server/API/web tests proving the post-memory-approval retry evidence
  freshness boundary note is present

Do not add:

- freshness verification, freshness result persistence, retry freshness result
  persistence, post-approval retry freshness result persistence, git status
  reads, transcript inspection, agent UI monitoring, retry result persistence,
  post-approval retry result persistence, retry success/failure detection, retry
  state synchronization, retry outcome detection, collection command execution,
  collection result persistence, post-approval collection result persistence,
  collection result detection, collection state synchronization, approval result
  persistence, approval state synchronization, memory approval writes, memory
  approval state, automatic post-approval collection, automatic post-approval
  collection retry, background collection, hidden recovery actions, submission
  event hooks, submitted state persistence, submit automation, Enter key
  automation, button clicking, active window detection, target-agent UI
  inspection, target content validation, paste success verification, clipboard
  target validation, paste automation, persisted destination state, persisted
  target state, safety approval state, Codex or Claude Code UI automation,
  hidden prompt submission, command execution, filesystem reads/writes,
  persisted review state, checklist completion state, merge decision writes,
  background analysis, external model calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, retry result state, post-approval retry result state,
  retry outcome state, freshness result state, retry freshness result state,
  merge decision state, memory approval state, approval result state, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.102: Post-Memory-Approval Retry Freshness Result Non-Persistence

Decision:

- Selected worktree detail should state that post-memory-approval retry
  freshness result stays outside Loopdeck until the next explicit loop snapshot.
- This is needed because the freshness boundary should not imply that Loopdeck
  can observe or retain freshness review outcomes. It cannot and should not
  detect, store, or sync post-approval retry freshness result state.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_retry_freshness_result_non_persistence_note`
  with:
  - label: `Post-memory-approval retry freshness result non-persistence`
  - result_scope:
    `post-approval retry freshness result stays outside Loopdeck until the next explicit loop snapshot`
  - not_stored:
    `Loopdeck does not detect, store, or sync post-approval retry freshness result state`
  - reason:
    `keeps post-approval retry freshness evidence tied to explicit local snapshot recording`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval retry evidence freshness
  boundary note
- focused server/API/web tests proving the post-memory-approval retry freshness
  result non-persistence note is present

Do not add:

- freshness result persistence, retry freshness result persistence,
  post-approval retry freshness result persistence, freshness result detection,
  freshness state synchronization, freshness verification, git status reads,
  transcript inspection, agent UI monitoring, retry result persistence,
  post-approval retry result persistence, retry success/failure detection, retry
  state synchronization, retry outcome detection, collection command execution,
  collection result persistence, post-approval collection result persistence,
  collection result detection, collection state synchronization, approval result
  persistence, approval state synchronization, memory approval writes, memory
  approval state, automatic post-approval collection, automatic post-approval
  collection retry, background collection, hidden recovery actions, submission
  event hooks, submitted state persistence, submit automation, Enter key
  automation, button clicking, active window detection, target-agent UI
  inspection, target content validation, paste success verification, clipboard
  target validation, paste automation, persisted destination state, persisted
  target state, safety approval state, Codex or Claude Code UI automation,
  hidden prompt submission, command execution, filesystem reads/writes,
  persisted review state, checklist completion state, merge decision writes,
  background analysis, external model calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, retry result state, post-approval retry result state,
  retry outcome state, freshness result state, retry freshness result state,
  post-approval retry freshness result state, merge decision state, memory
  approval state, approval result state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.103: Post-Memory-Approval Retry Freshness Uncertainty Collection Reminder

Decision:

- Selected worktree detail should state that a new explicit loop snapshot should
  be collected when post-memory-approval retry freshness is uncertain.
- This is needed because freshness uncertainty after memory approval and retry
  should resolve through the same local-first source of truth: an explicit loop
  snapshot, not hidden verification, automatic collection, or transcript/git/UI
  inspection.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_retry_freshness_uncertainty_collection_reminder`
  with:
  - label:
    `Post-memory-approval retry freshness uncertainty collection reminder`
  - reminder:
    `collect a new explicit loop snapshot when post-approval retry freshness is uncertain`
  - not_automated:
    `Loopdeck does not verify post-approval retry freshness or start collection automatically`
  - reason:
    `keeps post-approval retry freshness uncertainty resolution operator-triggered and local-first`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval retry freshness result
  non-persistence note
- focused server/API/web tests proving the post-memory-approval retry freshness
  uncertainty collection reminder is present

Do not add:

- automatic collection, automatic post-approval collection, automatic
  post-approval retry collection, freshness verification, freshness result
  persistence, retry freshness result persistence, post-approval retry
  freshness result persistence, freshness result detection, freshness state
  synchronization, git status reads, transcript inspection, agent UI monitoring,
  retry result persistence, post-approval retry result persistence, retry
  success/failure detection, retry state synchronization, retry outcome
  detection, collection command execution, collection result persistence,
  post-approval collection result persistence, collection result detection,
  collection state synchronization, approval result persistence, approval state
  synchronization, memory approval writes, memory approval state, background
  collection, hidden recovery actions, submission event hooks, submitted state
  persistence, submit automation, Enter key automation, button clicking, active
  window detection, target-agent UI inspection, target content validation, paste
  success verification, clipboard target validation, paste automation, persisted
  destination state, persisted target state, safety approval state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution,
  filesystem reads/writes, persisted review state, checklist completion state,
  merge decision writes, background analysis, external model calls, or new write
  tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, retry result state, post-approval retry result state,
  retry outcome state, freshness result state, retry freshness result state,
  post-approval retry freshness result state, memory approval state, approval
  result state, merge decision state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.104: Post-Memory-Approval Retry Pre-Memory-Approval Freshness Advisory

Decision:

- Selected worktree detail should state that post-approval retry freshness
  uncertainty should be reviewed before approving loop memory again.
- This is needed because a retry after memory approval can make the previous
  approval stale; any renewed memory approval should stay operator-controlled
  and separate from automatic freshness verification or approval state.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_retry_pre_memory_approval_freshness_advisory`
  with:
  - label:
    `Post-memory-approval retry pre-memory-approval freshness advisory`
  - advisory:
    `review post-approval retry freshness uncertainty before approving loop memory again`
  - not_decision:
    `Loopdeck does not approve memory or verify post-approval retry freshness from this advisory`
  - reason:
    `keeps renewed memory approval separate from retry freshness uncertainty review`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval retry freshness
  uncertainty collection reminder
- focused server/API/web tests proving the post-memory-approval retry
  pre-memory-approval freshness advisory is present

Do not add:

- memory approval writes, memory approval state, renewed memory approval state,
  approval result persistence, approval state synchronization, automatic
  collection, automatic post-approval collection, automatic post-approval retry
  collection, automatic renewed approval collection, freshness verification,
  freshness result persistence, retry freshness result persistence,
  post-approval retry freshness result persistence, freshness result detection,
  freshness state synchronization, git status reads, transcript inspection,
  agent UI monitoring, retry result persistence, post-approval retry result
  persistence, retry success/failure detection, retry state synchronization,
  retry outcome detection, collection command execution, collection result
  persistence, post-approval collection result persistence, collection result
  detection, collection state synchronization, background collection, hidden
  recovery actions, submission event hooks, submitted state persistence, submit
  automation, Enter key automation, button clicking, active window detection,
  target-agent UI inspection, target content validation, paste success
  verification, clipboard target validation, paste automation, persisted
  destination state, persisted target state, safety approval state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution,
  filesystem reads/writes, persisted review state, checklist completion state,
  merge decision writes, background analysis, external model calls, or new write
  tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, retry result state, post-approval retry result state,
  retry outcome state, freshness result state, retry freshness result state,
  post-approval retry freshness result state, memory approval state, renewed
  memory approval state, approval result state, merge decision state, or
  secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.105: Post-Memory-Approval Retry Renewed-Memory-Approval Collection Reminder

Decision:

- Selected worktree detail should state that a new explicit loop snapshot should
  be collected after approving loop memory again following a post-approval
  retry.
- This is needed because renewed memory approval can be mistaken for a trigger
  that starts collection automatically; Loopdeck should keep the collection
  boundary operator-triggered and local-first.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_reminder`
  with:
  - label:
    `Post-memory-approval retry renewed-memory-approval collection reminder`
  - reminder:
    `collect a new explicit loop snapshot after approving loop memory again`
  - not_automated:
    `Loopdeck does not start collection from renewed memory approval or approval state changes`
  - reason:
    `keeps renewed-memory-approval collection operator-triggered and local-first`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval retry pre-memory-approval
  freshness advisory
- focused server/API/web tests proving the post-memory-approval retry
  renewed-memory-approval collection reminder is present

Do not add:

- collection command execution, automatic collection, automatic post-approval
  collection, automatic post-approval retry collection, automatic renewed
  approval collection, memory approval writes, memory approval state, renewed
  memory approval state, approval result persistence, approval state
  synchronization, freshness verification, freshness result persistence, retry
  freshness result persistence, post-approval retry freshness result
  persistence, freshness result detection, freshness state synchronization, git
  status reads, transcript inspection, agent UI monitoring, retry result
  persistence, post-approval retry result persistence, retry success/failure
  detection, retry state synchronization, retry outcome detection, collection
  result persistence, post-approval collection result persistence, renewed
  memory approval collection result persistence, collection result detection,
  collection state synchronization, background collection, hidden recovery
  actions, submission event hooks, submitted state persistence, submit
  automation, Enter key automation, button clicking, active window detection,
  target-agent UI inspection, target content validation, paste success
  verification, clipboard target validation, paste automation, persisted
  destination state, persisted target state, safety approval state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution,
  filesystem reads/writes, persisted review state, checklist completion state,
  merge decision writes, background analysis, external model calls, or new write
  tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, renewed memory approval collection result state,
  retry result state, post-approval retry result state, retry outcome state,
  freshness result state, retry freshness result state, post-approval retry
  freshness result state, memory approval state, renewed memory approval state,
  approval result state, merge decision state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.106: Post-Memory-Approval Retry Renewed-Memory-Approval Collection Result Non-Persistence

Decision:

- Selected worktree detail should state that renewed-memory-approval collection
  result state stays outside Loopdeck until the next explicit loop snapshot.
- This is needed because the renewed approval collection reminder should not
  imply that Loopdeck detects, stores, or synchronizes the result of that
  collection attempt.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_result_non_persistence_note`
  with:
  - label:
    `Post-memory-approval retry renewed-memory-approval collection result non-persistence`
  - result_scope:
    `renewed-memory-approval collection result stays outside Loopdeck until the next explicit loop snapshot`
  - not_stored:
    `Loopdeck does not detect, store, or sync renewed-memory-approval collection result state`
  - reason:
    `keeps renewed-memory-approval collection evidence tied to explicit local snapshot recording`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval retry
  renewed-memory-approval collection reminder
- focused server/API/web tests proving the post-memory-approval retry
  renewed-memory-approval collection result non-persistence note is present

Do not add:

- collection result persistence, collection result detection, collection state
  synchronization, renewed memory approval collection result persistence,
  renewed memory approval collection result detection, renewed memory approval
  collection state synchronization, collection command execution, automatic
  collection, automatic post-approval collection, automatic post-approval retry
  collection, automatic renewed approval collection, memory approval writes,
  memory approval state, renewed memory approval state, approval result
  persistence, approval state synchronization, freshness verification,
  freshness result persistence, retry freshness result persistence,
  post-approval retry freshness result persistence, freshness result detection,
  freshness state synchronization, git status reads, transcript inspection,
  agent UI monitoring, retry result persistence, post-approval retry result
  persistence, retry success/failure detection, retry state synchronization,
  retry outcome detection, post-approval collection result persistence,
  background collection, hidden recovery actions, submission event hooks,
  submitted state persistence, submit automation, Enter key automation, button
  clicking, active window detection, target-agent UI inspection, target content
  validation, paste success verification, clipboard target validation, paste
  automation, persisted destination state, persisted target state, safety
  approval state, Codex or Claude Code UI automation, hidden prompt submission,
  command execution, filesystem reads/writes, persisted review state, checklist
  completion state, merge decision writes, background analysis, external model
  calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, renewed memory approval collection result state,
  retry result state, post-approval retry result state, retry outcome state,
  freshness result state, retry freshness result state, post-approval retry
  freshness result state, memory approval state, renewed memory approval state,
  approval result state, merge decision state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.107: Post-Memory-Approval Retry Renewed-Memory-Approval Collection Uncertainty Reminder

Decision:

- Selected worktree detail should state that a new explicit loop snapshot should
  be collected when renewed-memory-approval collection result is uncertain.
- This is needed because result uncertainty after renewed memory approval should
  resolve through an operator-triggered snapshot, not hidden verification,
  automatic collection, or collection result state synchronization.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_collection_uncertainty_reminder`
  with:
  - label:
    `Post-memory-approval retry renewed-memory-approval collection uncertainty reminder`
  - reminder:
    `collect a new explicit loop snapshot when renewed-memory-approval collection result is uncertain`
  - not_automated:
    `Loopdeck does not verify renewed-memory-approval collection result or start collection automatically`
  - reason:
    `keeps renewed-memory-approval collection uncertainty resolution operator-triggered and local-first`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval retry
  renewed-memory-approval collection result non-persistence note
- focused server/API/web tests proving the post-memory-approval retry
  renewed-memory-approval collection uncertainty reminder is present

Do not add:

- hidden verification, collection command execution, automatic collection,
  automatic post-approval collection, automatic post-approval retry collection,
  automatic renewed approval collection, collection result persistence,
  collection result detection, collection state synchronization, renewed memory
  approval collection result persistence, renewed memory approval collection
  result detection, renewed memory approval collection state synchronization,
  memory approval writes, memory approval state, renewed memory approval state,
  approval result persistence, approval state synchronization, freshness
  verification, freshness result persistence, retry freshness result
  persistence, post-approval retry freshness result persistence, freshness
  result detection, freshness state synchronization, git status reads,
  transcript inspection, agent UI monitoring, retry result persistence,
  post-approval retry result persistence, retry success/failure detection, retry
  state synchronization, retry outcome detection, post-approval collection result
  persistence, background collection, hidden recovery actions, submission event
  hooks, submitted state persistence, submit automation, Enter key automation,
  button clicking, active window detection, target-agent UI inspection, target
  content validation, paste success verification, clipboard target validation,
  paste automation, persisted destination state, persisted target state, safety
  approval state, Codex or Claude Code UI automation, hidden prompt submission,
  command execution, filesystem reads/writes, persisted review state, checklist
  completion state, merge decision writes, background analysis, external model
  calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, renewed memory approval collection result state,
  retry result state, post-approval retry result state, retry outcome state,
  freshness result state, retry freshness result state, post-approval retry
  freshness result state, memory approval state, renewed memory approval state,
  approval result state, merge decision state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

### Slice 4.108: Post-Memory-Approval Retry Renewed-Memory-Approval Pre-Merge Freshness Advisory

Decision:

- Selected worktree detail should state that renewed-memory-approval freshness
  uncertainty should be reviewed before merge decisions.
- This is needed because renewed memory approval after retry and collection
  uncertainty can make merge readiness stale; merge readiness remains separate
  from freshness uncertainty review.

Add:

- top-level selected worktree detail
  `continuation_safety_post_memory_approval_retry_renewed_memory_approval_pre_merge_freshness_advisory`
  with:
  - label:
    `Post-memory-approval retry renewed-memory-approval pre-merge freshness advisory`
  - advisory:
    `review renewed-memory-approval freshness uncertainty before merge decisions`
  - not_decision:
    `Loopdeck does not approve merges or verify renewed-memory-approval freshness before merge`
  - reason:
    `keeps merge readiness separate from renewed-memory-approval freshness uncertainty review`
  - writes_files: `false`
  - external_calls: `false`
- web API typing and selected worktree detail rendering inside continuation
  guidance, immediately after the post-memory-approval retry
  renewed-memory-approval collection uncertainty reminder and before paste
  destination guidance
- focused server/API/web tests proving the post-memory-approval retry
  renewed-memory-approval pre-merge freshness advisory is present

Do not add:

- merge decision writes, merge approval, merge state persistence, merge state
  synchronization, merge readiness recalculation, freshness verification,
  automatic collection, collection command execution, automatic renewed
  approval collection, renewed memory approval state, memory approval writes,
  memory approval state, approval result persistence, approval state
  synchronization, hidden verification, git status reads, transcript
  inspection, agent UI monitoring, retry automation, retry result persistence,
  post-approval retry result persistence, retry outcome detection, freshness
  result persistence, retry freshness result persistence, post-approval retry
  freshness result persistence, collection result persistence, renewed memory
  approval collection result persistence, background collection, hidden recovery
  actions, submission event hooks, submitted state persistence, submit
  automation, Enter key automation, button clicking, active window detection,
  target-agent UI inspection, target content validation, paste success
  verification, clipboard target validation, paste automation, persisted
  destination state, persisted target state, safety approval state, Codex or
  Claude Code UI automation, hidden prompt submission, command execution,
  filesystem reads/writes, persisted review state, checklist completion state,
  background analysis, external model calls, or new write tools
- prompt bodies, transcript content, compact summaries, outcome summaries,
  evidence refs, evidence bodies, raw paths, provider credentials, target
  content, active-window titles, pasted content, paste result state, submitted
  state, agent response content, collection result state, post-approval
  collection result state, renewed memory approval collection result state,
  retry result state, post-approval retry result state, retry outcome state,
  freshness result state, retry freshness result state, post-approval retry
  freshness result state, memory approval state, renewed memory approval state,
  approval result state, merge decision state, or secret-looking tokens
- package/plugin/slash/hook/MCP rename work

## 10. First Implementation Plan Boundary

The first implementation plan should cover only Slice 1.

Files likely touched:

- create `src/loop/snapshot.ts`
- create `src/loop/brief.ts`
- create `src/cli/commands/loop.ts`
- modify `src/cli/index.ts`
- modify `src/storage/ports.ts`
- modify `src/storage/sqlite-migrations.ts`
- modify `src/storage/sqlite.ts`
- create focused tests under `src/loop/*.test.ts` and `src/cli/commands/loop.test.ts`
- update `docs/ARCHITECTURE.md`

Do not touch web UI or rename package in Slice 1.

## 11. Open Questions

Resolved for the first development phase:

- Keep the public CLI command as `prompt-coach` through Slice 1. `loopdeck` can become an alias or package rename only in a brand migration slice.
- Raw local paths are not stored or returned by default. A future explicit local diagnostic flag may show them to the local user only.
- Loop snapshots are stored in the local SQLite database first. Markdown export into a project is opt-in and deferred.
- Codex and Claude Code plugin surfaces may keep separate packaging, but command text and workflow docs should eventually be generated from shared source to reduce drift.
- Do not read Codex-managed private state. Worktree metadata starts from documented hooks, current cwd, git commands, and user-approved configuration.
- Selected brief actions should move toward a broader multi-worktree command
  center, but the first step is a read-only safe-metadata summary, not automatic
  merge or conflict recommendation.

Still open:

- What exact product/package migration date should move from `prompt-coach` to `loopdeck`?
- Should loop snapshots get a numeric "loop quality" score, or only structured outcome status and evidence?

## 12. Decision

Proceed with Loopdeck as the product direction, but treat the planning document as the primary artifact until the go/no-go gate is satisfied.

The immediate next artifact should be:

```text
docs/superpowers/plans/2026-07-04-loop-snapshot-cli-implementation.md
```

The plan must use TDD and preserve the existing `prompt-coach` command until a separate brand migration plan is approved.

## 13. Sources Checked

- OpenAI Codex manual fetched on 2026-07-04: AGENTS.md discovery, MCP configuration, hooks, worktrees, record/replay.
- OpenAI Agents SDK tracing: https://openai.github.io/openai-agents-python/tracing/
- OpenAI agent evals: https://developers.openai.com/api/docs/guides/agent-evals
- Claude Code features overview: https://code.claude.com/docs/en/features-overview
- Claude Code hooks reference: https://code.claude.com/docs/en/hooks
- Claude Code plugins reference: https://code.claude.com/docs/en/plugins-reference
- Google ADK sessions/state/memory/events/artifacts docs: https://google.github.io/adk-docs/sessions/
- AGENTS.md official site: https://agents.md/
- Andrej Karpathy Software Is Changing Again talk summary via YC Startup Library: https://www.ycombinator.com/library/MW-andrej-karpathy-software-is-changing-again
