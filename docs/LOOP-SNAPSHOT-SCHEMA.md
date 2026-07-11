# Loop Snapshot Schema

Last updated: 2026-07-05

This document defines the privacy-safe loop snapshot contract used by LoopRelay.
It reflects the current `src/loop/types.ts` domain model and the SQLite
`loop_snapshots` storage shape.

## Purpose

A loop snapshot is a compact local record of one coding-agent loop. It connects
prompt archive entries, safe project/worktree/session metadata, outcome state,
and continuation-brief readiness.

It is not a transcript store and not a tracing backend.

Snapshots must help Codex, Claude Code, and the web UI answer:

- What recent agent-loop activity exists?
- Which safe worktree/session/branch label does it belong to?
- Is there a continuation brief?
- Is there evidence that the loop passed, failed, or needs review?
- Is a user-approved memory or instruction patch candidate possible?

## Domain Type

The current TypeScript contract is:

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
    used_improvement_prompt_ids?: string[];
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

`src/loop/types.ts` is authoritative for runtime type changes. Update this
document in the same PR when the public schema contract changes.

## Field Contract

| Field                                 | Meaning                                                     | Privacy rule                                                       |
| ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `id`                                  | Local snapshot id                                           | Safe identifier, no embedded paths or prompt text                  |
| `created_at`                          | ISO timestamp                                               | Safe                                                               |
| `tool`                                | Agent/tool family                                           | Use known enum or `unknown`                                        |
| `source`                              | Collection path                                             | Use known enum; no command transcript                              |
| `session_id`                          | Safe session label/id when available                        | Do not scrape private app state                                    |
| `thread_id`                           | Safe thread label/id when available                         | Do not expose private transcript text                              |
| `cwd_label`                           | Human-safe project label                                    | Label only, not absolute cwd                                       |
| `project_id`                          | Stable local project id                                     | Derived id, not raw path                                           |
| `git_root_hash`                       | Optional hashed git root                                    | Hash only                                                          |
| `branch`                              | Branch label when available                                 | Branch name may be shown; no remote URL                            |
| `worktree_label`                      | Safe worktree label                                         | Label only, not worktree path                                      |
| `prompt_ids`                          | References to prompt archive rows                           | IDs only                                                           |
| `event_counts`                        | Aggregate counts                                            | Counts only                                                        |
| `quality`                             | Prompt score aggregate and gaps                             | No prompt body or raw transcript                                   |
| `outcome.status`                      | Human/user-recorded loop outcome state                      | Enum only                                                          |
| `outcome.summary`                     | Safe local outcome summary                                  | Must be raw-free before broad status exposure                      |
| `outcome.evidence_refs`               | User-provided evidence references                           | Keep out of aggregate status summaries unless explicitly scoped    |
| `outcome.used_improvement_prompt_ids` | Prompt ids whose LoopRelay improvements were actually used | Optional ids only; every id must belong to `prompt_ids`            |
| `next_brief`                          | Continuation brief metadata                                 | Summary metadata only; generated brief text is returned on request |
| `privacy`                             | Invariant flags                                             | Must stay `false`, `false`, `true` respectively                    |

## SQLite Storage Shape

The `loop_snapshots` table stores scalar fields directly and structured fields
as JSON.

| Column              | Source field     |
| ------------------- | ---------------- |
| `id`                | `id`             |
| `created_at`        | `created_at`     |
| `tool`              | `tool`           |
| `source`            | `source`         |
| `session_id`        | `session_id`     |
| `thread_id`         | `thread_id`      |
| `cwd_label`         | `cwd_label`      |
| `project_id`        | `project_id`     |
| `git_root_hash`     | `git_root_hash`  |
| `branch`            | `branch`         |
| `worktree_label`    | `worktree_label` |
| `prompt_ids_json`   | `prompt_ids`     |
| `event_counts_json` | `event_counts`   |
| `quality_json`      | `quality`        |
| `outcome_json`      | `outcome`        |
| `next_brief_json`   | `next_brief`     |
| `privacy_json`      | `privacy`        |

Current storage operations:

- create or replace snapshot
- get latest snapshot
- list recent snapshots with bounded limit
- update outcome metadata by snapshot id

## Privacy Invariants

Snapshots must not store or return:

- prompt bodies
- raw absolute paths
- raw worktree paths
- full Codex or Claude Code transcripts
- compact summaries or custom compact instructions
- provider credentials, cookies, account state, or API tokens
- model hidden reasoning
- browser profile data

Snapshots may store:

- prompt ids that point to the existing redacted archive
- safe labels
- hashes
- aggregate counts
- enum status fields
- safe evidence references when the user provides them for local review
- prompt ids explicitly confirmed as having their LoopRelay improvement used

## Surface Rules

### CLI

`looprelay loop status`, `loop collect`, `loop checkpoint`, and `loop brief` may
read or create snapshots. `loop checkpoint` is the first-session path: it
creates a prompt-body-free snapshot, records a validated safe outcome summary,
and returns its continuation brief in one command when hooks cannot capture the
already-running installation session.
`looprelay loop outcome` may update one latest or explicitly selected snapshot.

CLI output must:

- avoid raw prompt bodies and raw paths by default
- keep selected worktree/session/branch filters explicit
- avoid falling back to unrelated latest snapshots when filters are requested
- label service-origin snapshots as service-origin
- guide an `unknown` or `in_progress` latest snapshot to optional exact-id
  outcome recording after a verifiable checkpoint, without treating every
  intermediate hook snapshot as backlog
- expose only opaque `prmt_...` ids from the latest snapshot for explicit
  `--used-improvement-prompt` attribution, which must stay empty when no
  LoopRelay improvement was actually used

### MCP

LoopRelay MCP loop tools may expose snapshot-derived status and briefs.

MCP output must:

- use structured content where supported
- return explicit not-found/setup guidance instead of transport errors
- avoid raw prompt bodies, raw paths, transcripts, compact summaries, and
  secret-looking tokens
- expose latest snapshot prompt ids only as opaque `prmt_...` values for
  explicit improvement-use attribution
- require explicit confirmation for write paths that mutate local state

### Web API And UI

The web Loops surface may show snapshot metadata, status summaries, command
center groupings, review packets, and an explicit selected-snapshot outcome
form.

Web output must:

- exclude raw prompt bodies and raw paths
- not expose compact summary text or transcript content
- not perform automatic merge, branch checkout, or instruction-file writes
- require CSRF and shared privacy validation before recording an outcome
- not approve loop memory as a side effect of outcome recording
- fetch continuation briefs through explicit user action
- expose only safe prompt ids for explicit improvement-use attribution
- restore existing attribution after reload so outcome edits do not erase it

The selected-snapshot outcome form submits only prompt ids the operator
explicitly selected. A linked passing outcome with no selected id remains
unproven as LoopRelay improvement evidence.

### Hooks And Service Collection

Hooks and scheduled collection may create snapshots only through explicit local
configuration.

Hook/service collection must:

- fail open
- be bounded
- scope Stop-hook prompt ids to the hook payload's current `session_id`
- skip snapshot creation when a Stop payload has no valid session id instead of
  falling back to unrelated prompts from the same cwd
- preserve the known hook tool and session metadata when the scoped session has
  no captured prompts
- avoid hidden network calls
- avoid raw output
- avoid raw transcript or private app database reads

## Outcome And Evidence Rules

`outcome.status` is the main loop state. Use:

- `unknown` when no human or verifier result is known
- `in_progress` when work is underway
- `passed` when the user or verification evidence says the loop succeeded
- `failed` when verification failed
- `blocked` when the loop cannot proceed without external input
- `abandoned` when the loop was intentionally stopped

Evidence refs are local review hints. They should be safe labels such as test
names, command names, PR numbers, or artifact ids. Do not store full logs, raw
paths, transcript excerpts, or secrets as evidence refs.

The shared outcome validator runs at CLI/MCP entrypoints and again at the
storage boundary. It requires an allowed status and non-empty summary, trims
and deduplicates evidence refs, and rejects secret-looking values or raw local
paths before SQLite persistence.

## Memory And Instruction Patch Relation

Approved loop memory depends on snapshots but does not change the snapshot
privacy contract.

Memory candidates require:

- a latest or explicitly selected eligible snapshot
- `outcome.status = "passed"`
- at least one safe evidence ref
- no unsafe statement content
- explicit approval before persistence
- one unambiguous selection mode: exact snapshot id or
  worktree/session/branch filters

Instruction patch proposals require:

- approved loop memory
- reviewable unified diff
- `writes_files: false` for proposal surfaces
- explicit confirmation for apply surfaces
- idempotent source-memory markers

## Change Process

When changing the schema:

1. Update `src/loop/types.ts`.
2. Add or update focused domain tests.
3. Add or update SQLite migration/storage tests if persistence changes.
4. Update CLI/MCP/web schema tests for affected public surfaces.
5. Update this document and `docs/LOOPRELAY.md` if the product contract changes.
6. Run the relevant focused tests, then the full gate before merge.

Default full gate:

```bash
corepack pnpm test
corepack pnpm lint
corepack pnpm build
corepack pnpm pack:dry-run
git diff --check
```
