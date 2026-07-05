# PromptLane

Last updated: 2026-07-05

Product name: PromptLane.

PromptLane is a local-first prompt improvement workspace for Codex, Claude
Code, and long-running coding-agent work.

It helps developers write better coding-agent requests by recording prompts
locally, scoring them, improving them, and carrying approved lessons forward
across longer agent workflows.

## Product Thesis

PromptLane starts with prompt improvement:

- capture prompts from Codex and Claude Code
- redact and store them locally in Markdown and SQLite
- score weak requests with a deterministic local rubric
- generate copy-ready improved prompts
- review recurring prompt habits
- reuse strong prompt patterns safely

Loop features are loop-aware continuation. They help the next prompt stay
specific when work spans sessions, worktrees, branches, or compact boundaries.
They are not the product identity and they do not turn PromptLane into an
automatic agent runtime.

## Runtime Compatibility

Keep `prompt-coach` as the stable runtime identity until a dedicated migration
plan proves otherwise.

| Surface | Current value | Rule |
| --- | --- | --- |
| npm package | `prompt-coach` | Keep |
| Primary CLI | `prompt-coach` | Keep |
| Hook command | `prompt-coach hook ...` | Keep |
| Claude Code slash namespace | `/prompt-coach:*` | Keep |
| Canonical MCP server name | `prompt-coach` | Keep |
| Data directory | `~/.prompt-coach` | Keep |
| Legacy CLI alias | `loopdeck` | Compatibility only |

Do not use broad search-and-replace. `prompt-coach` is correct in commands,
package names, config paths, MCP server names, and slash namespaces.
Use `docs/LOOPDECK-LEGACY-SURFACES.md` before adding or changing any
`Loopdeck` or `loopdeck` string.

## Core Workflows

### First Coach Loop

Goal: a new user sees one useful correction for a real prompt.

1. Install and run explicit setup.
2. Send a real Codex or Claude Code prompt.
3. Run the coach workflow.
4. Review the score, gaps, and copy-ready improved draft.

Success criteria:

- setup is explicit
- nothing leaves the machine
- the user sees one actionable improvement
- no prompt is auto-submitted
- Do not auto-submit prompt drafts into Codex or Claude Code

### Loop-Aware Continuation

Goal: a user can continue a long-running coding-agent task without rebuilding
context from scattered notes.

1. PromptLane records prompt and loop metadata.
2. A hook, CLI command, or MCP tool creates a safe loop snapshot.
3. The user or active agent asks for a continuation brief.
4. PromptLane returns a raw-free brief tied to selected worktree, session, or
   branch filters when provided.

Success criteria:

- the brief references safe labels and prompt IDs, not raw transcript bodies
- selected filters do not fall back to unrelated latest activity
- the brief is copy/review first, not auto-submit

### Memory And Instruction Improvement

Goal: recurring lessons become durable only after approval.

1. A loop outcome is recorded with passing status and safe evidence refs.
2. PromptLane proposes a memory candidate.
3. The user approves the memory.
4. PromptLane can propose an AGENTS.md or CLAUDE.md patch.
5. The user explicitly applies the patch through a gated CLI/MCP path.

Success criteria:

- failed or unevidenced loops are not accepted as durable memory
- memory approval does not write instruction files
- instruction patch proposal is reviewable and idempotent
- applying a patch requires explicit confirmation

## Privacy And Local-First Boundaries

PromptLane must preserve these boundaries:

- no hidden provider calls
- no automatic prompt resubmission
- no provider credential extraction, storage, proxying, or replay
- no raw transcript ingestion
- no private app database scraping
- no raw local path disclosure in summaries, MCP results, or docs examples
- no prompt body echo in setup/status/server error paths

MCP agent rewrite and judge tools may return bounded redacted packets only when
the user explicitly asks the active agent session to evaluate or rewrite them.
PromptLane does not call the provider on the user's behalf.

## Data And Privacy Model

PromptLane stores local data in separate layers so each surface can expose only
the minimum safe shape it needs:

| Layer | Role | Boundary |
| --- | --- | --- |
| redacted Markdown prompt archive | Human-readable source of truth for captured prompts | prompt bodies remain in the redacted archive |
| SQLite/FTS index | Local query, search, scoring, tags, projects, jobs, drafts, and loop metadata | Index rows must not become a raw transcript store |
| loop snapshots | Safe labels, prompt ids, aggregate counts, outcome state, evidence refs, and continuation readiness | raw local paths are replaced with safe labels or hashes |
| approved loop memories | User-approved lessons derived from passed loops with evidence | transcripts and compact summaries are not stored as loop memory |
| instruction patch proposals | Reviewable AGENTS.md/CLAUDE.md/project-doc patches | proposal first; explicit apply gate before writes |
| storage capability registry | Shared setup/unavailable contract for storage-backed routes and MCP tools | capability errors stay raw-free and local-only |

Provider credentials are never extracted, stored, proxied, or replayed.
Markdown export of loop state is opt-in and deferred. See
`docs/LOOP-SNAPSHOT-SCHEMA.md` for the runtime loop snapshot schema and
`docs/ARCHITECTURE.md` for storage/module boundaries.

## Feature Portfolio

### Keep

- local prompt capture
- redacted Markdown archive as human-readable source of truth
- SQLite index and FTS
- deterministic prompt scoring and improvement drafts
- MCP rewrite/judge flows mediated by the active user-controlled agent session
- web archive/detail/search/settings surfaces
- setup, doctor, status, hook, and smoke commands

Decision rule: keep features that already prove the first value loop without
weakening local-first privacy or changing runtime IDs.

### Improve

- PromptLane-first README and plugin metadata
- Codex and Claude Code setup/status guidance
- selected worktree/session/branch continuation briefs
- user-approved memory and instruction patch workflows
- package/plugin docs around compatibility IDs

Decision rule: improve surfaces that make the next prompt more specific,
reviewable, and safe for plain Codex or Claude Code users.

### Build Next

- storage capability negotiation
- capability-aware MCP setup/status responses
- loop memory review surfaces that show evidence before approval
- focused smoke coverage for Codex and Claude Code happy paths

Decision rule: build only slices that reduce ambiguity, privacy risk, or setup
failure in the current local-first workflow.

### Defer

- generic durable execution runtime
- semantic vector memory by default
- cloud/team sync
- background cron collection beyond explicit local commands
- team/shared memory sync

Decision rule: defer features that need a broader trust, storage, cost, or
multi-user model before they can be safe.

### Reject

- hidden external LLM calls
- external provider judge calls from inside PromptLane
- automatic prompt resubmission
- automatic merge/rebase/branch checkout
- provider credential extraction, storage, proxying, or replay
- raw transcript scraping from private app state

Decision rule: reject features that make PromptLane act as a hidden provider
proxy, autonomous agent runtime, transcript scraper, or merge bot.

## Risk And Execution Plan

PromptLane should move through small reliability slices before adding broader
agent-loop features.

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Storage capability drift | Storage-backed routes and MCP tools can fail differently when local SQLite/archive state is unavailable | Implement storage capability negotiation through one shared path |
| MCP registry drift | Tool definitions, handlers, and setup guidance can fall out of sync | Touch registry structure only when a tool/schema change already needs it |
| Privacy regression | Loop memory and continuation features can accidentally expose prompt bodies, raw paths, transcripts, compact summaries, or credentials | Keep raw-free fixtures, packaging guards, and focused privacy tests on every slice |
| Overbuilding autonomy | Background cron, auto-submit, and merge automation would change the trust model before the local prompt loop is proven | Keep autonomy staged and require explicit approval gates |
| Runtime compatibility breakage | Renaming `prompt-coach` runtime IDs too early would break existing hooks, MCP setup, slash commands, and scripts | Keep runtime IDs stable until a dedicated migration proves compatibility |

Next MVP slices:

1. MVP Slice 1: storage capability negotiation.
2. MVP Slice 2: capability-aware MCP setup/status responses.
3. MVP Slice 3: evidence-first loop memory review.
4. MVP Slice 4: focused Codex and Claude Code smoke coverage.

TDD execution rule for each slice:

- RED: add the narrowest failing test or packaging guard first.
- GREEN: make the smallest product-aligned change.
- VERIFY: run the focused test, then broaden to the repo gate.
- INTEGRATE: commit, push, PR, local gate, review, merge, and prune.

## Autonomy Model

PromptLane may become more helpful, but autonomy must remain staged.

| Level | Behavior | Default |
| --- | --- | --- |
| 0 | observe only | allowed |
| 1 | suggest a next prompt | allowed |
| 2 | draft a patch or instruction update | allowed after eligible evidence |
| 3 | apply after explicit approval | opt-in |
| 4 | run a gated local loop with stop conditions | future only |

Level 4 must remain local, non-destructive, bounded, and verified before it is
offered as a normal workflow.

## Non-Goals

PromptLane is not:

- a hosted agent platform
- a LangGraph/Temporal replacement
- a team cloud memory backend
- a provider credential broker
- a hidden LLM judge service
- a project management suite
- an automatic merge bot

## Acceptance Criteria

The PromptLane direction is healthy when these are true:

- a plain Codex or Claude Code user can get value through setup, capture, coach,
  status, and brief workflows
- product-facing metadata uses PromptLane
- runtime IDs remain `prompt-coach` until a dedicated migration proves a rename
- prompt bodies remain in the redacted archive only
- loop snapshots and status surfaces remain raw-free
- instruction changes are proposed before they are applied
- tests and smoke commands cover each public runtime surface before release
