# LoopRelay Plugin Packaging

LoopRelay is a local-first coding-agent continuity and evidence layer with loop-aware continuation
for Codex, Claude Code, and long-running coding-agent work.
`looprelay` remains the compatibility package, CLI, hook command, slash
namespace, and MCP server name.

`looprelay` supports two integration layers:

- an explicit setup command that installs hooks and, where supported, a local
  server service
- packaging artifacts that let coding agents discover the integration as a
  plugin or reusable workflow

## Why Setup Is Still Required

Installing a package should not silently edit user-level agent settings, install
login services, or start a background server. `looprelay setup` is the
consent step that performs those local changes.

The plugin package is therefore discovery and convenience, not hidden
installation. After the npm package is published, install the CLI first:

```sh
npm install -g looprelay
```

If `looprelay` is not available yet because the npm package has not been
published, use a local checkout first:

```sh
git clone https://github.com/wlsdks/looprelay.git
cd looprelay
pnpm install
pnpm setup
```

Users who want active prompt coaching should then run:

```sh
looprelay start
looprelay setup --profile coach --register-mcp --open-web
```

The coach profile installs capture hooks, low-friction rewrite guidance through
hook context, local server startup where supported, and the Claude Code status
line when Claude Code is detected. `--register-mcp` is explicit consent to run
the detected agent CLI registration commands for the LoopRelay MCP server,
which gives the active agent session access to coach/rewrite/judge tools. From a
development checkout, run `pnpm setup`; it registers MCP with absolute Node +
`dist/cli/index.js` paths so Codex does not require a global `looprelay`
binary in `PATH`. Plain `looprelay setup` remains available for passive
capture only.

Users who want the web workspace to open automatically when Claude Code or Codex
starts can explicitly add `--open-web`:

```sh
looprelay setup --profile coach --register-mcp --open-web
```

This installs a `SessionStart` hook, ensures the local server is available, and
opens the web UI at most once per agent session id. It is opt-in because
installing a plugin should not surprise users by launching a browser.

Use a preview first when reviewing changes:

```sh
looprelay setup --profile coach --register-mcp --dry-run
```

## Codex Plugin

The repo-local Codex plugin lives in:

```text
plugins/looprelay
```

It includes:

- `.codex-plugin/plugin.json` for plugin metadata
- `skills/looprelay/SKILL.md` so Codex can help install, diagnose, and use
  the archive

The Codex plugin does not bundle active Codex hooks; setup installs user-level hooks explicitly. This prevents plugin-managed hooks and setup-installed hooks from both firing for the same `UserPromptSubmit` event. `looprelay setup`
remains the reliable path for normal users because setup records an absolute CLI
command and can configure the local service.

## Claude Code Plugin

Claude Code can consume this repository as a plugin marketplace:

```text
/plugin marketplace add wlsdks/looprelay
/plugin install looprelay
/reload-plugins
/looprelay:setup
```

The Claude Code plugin files live in:

```text
.claude-plugin
commands
```

The plugin exposes:

- `/looprelay:setup` to preview and run local setup
- `/looprelay:status` to run doctor and statusLine checks
- `/looprelay:buddy` to show the side-pane buddy command and one-shot
  checks
- `/looprelay:coach` to run the one-call prompt coach workflow inside
  Claude Code
- `/looprelay:score` to score the latest captured request or the
  accumulated archive
- `/looprelay:judge` to ask the active Claude Code session to judge a
  bounded batch of low-scoring redacted prompts through MCP
- `/looprelay:improve-last` to generate an approval-ready rewrite for the
  latest captured request, in either deterministic or active-agent mode
- `/looprelay:habits` to summarize recurring prompt habit gaps
- `/looprelay:open` to open the local archive

Claude Code slash commands use `/looprelay:*`. The npm package installs the
canonical `looprelay` CLI for terminal workflows. No alternate slash namespace
or CLI alias is shipped.

Prompt capture still uses Claude Code hook configuration in settings files. The
supported install paths are:

```sh
looprelay setup --profile coach --register-mcp --open-web
looprelay install-hook claude-code
```

The coach profile also installs the optional Claude Code status line. It can be
managed manually with:

```sh
looprelay install-statusline claude-code
looprelay statusline claude-code
```

This status line reports capture readiness, server health, the latest prompt
score when available, and the last ingest status. Claude Code supports one
`statusLine` command, so looprelay preserves an existing HUD by chaining the
previous command and the looprelay command into one status line. Uninstall
restores the previous command when looprelay captured it during install. The
setup command must ask before installing it.

Claude Code and Codex can also use an always-on side-pane buddy in a second
terminal pane:

```sh
looprelay buddy
looprelay buddy --once
looprelay buddy --json
```

The buddy prints latest prompt score, tool, top gap, habit score, and the next
move without returning prompt bodies, raw paths, or secrets.

## Agent Wrappers

The npm package also ships experimental `lr-claude` and `lr-codex` binaries.
They sit in front of the real agent binary for the initial prompt argument:

```sh
lr-claude --lr-mode auto -- "fix this"
lr-codex --lr-mode auto -- "fix this"
lr-codex --lr-mode auto -- exec "fix this"
```

Use `--lr-dry-run` to inspect the local rewrite plan without launching the real
agent:

```sh
lr-claude --lr-mode auto --lr-dry-run -- "fix this"
lr-codex --lr-mode auto --lr-dry-run -- "fix this"
```

Run `lr-claude --lr-help` or `lr-codex --lr-help` to see every supported flag
(`--lr-mode`, `--lr-min-score`, `--lr-language`, `--lr-dry-run`) with working
example invocations.

The wrappers intentionally do not rewrite management subcommands such as
`auth`, `mcp`, `plugin`, and `login`. They also do not intercept every later
message typed inside the interactive UI. For the latter, use hook-based coach
profile feedback or future wrapper work.

For manual configuration, see:

```text
integrations/claude-code/settings.example.json
```

That example is intentionally PATH-based. The installer is preferred because it
uses the exact CLI path from the current installation.

## MCP Prompt Scoring

`looprelay` also ships a local stdio MCP server:

```sh
looprelay mcp
```

This server exposes 25 model-controlled tools:

- `get_looprelay_status`
- `coach_prompt`
- `score_prompt`
- `improve_prompt`
- `apply_clarifications`
- `ask_clarifying_questions`
- `record_clarifications`
- `record_continuation_receipt`
- `get_looprelay_loop_status`
- `get_benchmark_candidates`
- `get_paired_benchmark_candidates`
- `prepare_loop_brief`
- `record_loop_outcome`
- `propose_loop_memory_candidate`
- `record_loop_memory`
- `propose_instruction_patch`
- `apply_instruction_patch`
- `score_prompt_archive`
- `review_project_instructions`
- `prepare_agent_rewrite`
- `record_agent_rewrite`
- `prepare_agent_judge_batch`
- `record_agent_judgments`
- `recommend_agent_strategy`
- `record_agent_run`

`coach_prompt` is the default agent-facing workflow. It combines local archive
status, latest prompt score, approval-required rewrite, recent habit review,
project instruction review, and next request guidance in one read-only call.
`get_looprelay_status` checks local archive readiness and returns safe
counts, latest prompt metadata, available tool names, and next actions.
`get_looprelay_loop_status` checks whether local loop snapshots exist and
returns safe latest-loop metadata. It also reports safe compact-boundary
metadata when a compact happened after the latest snapshot.
`get_benchmark_candidates` reads at most the latest 100 snapshots and returns
only staged readiness counts, opaque candidate ids, status, and next actions;
it never returns outcome summaries, evidence refs, prompt bodies, or raw paths.
`get_paired_benchmark_candidates` returns separate body-free baseline and
explicitly attributed LoopRelay candidate groups without snapshot ids or
outcome content. It supports agent-native paired-fixture preparation but leaves
task-equivalence and causal interpretation to the operator.
`prepare_loop_brief`
returns a copy-ready continuation prompt from the latest LoopRelay snapshot, or
from the newest snapshot matching optional `worktree`, `session_id`, and
`branch` filters, without prompt bodies, raw paths, or auto-submission; when the
selected snapshot is pre-compact, it asks the user to refresh the snapshot
instead of replaying compact summaries or custom compact instructions.
`record_loop_outcome` writes only user-approved status, summary, and evidence
references for a LoopRelay snapshot; it does not store prompt bodies, raw paths,
or external LLM results.
`propose_loop_memory_candidate` is the semantic-memory decision gate: it checks
the latest passed loop outcome and safe evidence refs, then returns a
user-reviewable candidate without writing memory or instruction files.
`record_loop_memory` records a user-approved candidate into local
LoopRelay storage only; instruction-file patches remain a separate explicit
workflow. Its structured `next_actions` point agents to `prepare_loop_brief`
and `propose_instruction_patch target_file=AGENTS.md`.
`propose_instruction_patch` returns a reviewable unified diff for
adding the latest approved memory to `AGENTS.md` or `CLAUDE.md`, plus an
explicit apply gate. The web review panel does not write those files.
`apply_instruction_patch` writes the latest approved memory only when
`confirm_apply` is true, is idempotent by source memory id, and does not return
raw paths.

The local CLI mirrors that loop surface with `looprelay loop status`,
`looprelay loop collect`, `looprelay loop brief`, and
`looprelay loop memory-candidate`; approved memories are recorded with
`looprelay loop memory-approve`. `looprelay loop brief` accepts optional
`--worktree`, `--session`, and `--branch` filters so Codex or Claude Code can
continue the same selected worktree/session/branch even when another worktree
has a newer snapshot. Use
`looprelay loop instruction-patch --target-file AGENTS.md` to generate the
review-only instruction patch. Use
`looprelay loop instruction-apply --target-file AGENTS.md --confirm-apply`
only after reviewing the proposal and intending to write the file; the web
review panel intentionally has no apply button. `get_looprelay_loop_status`,
`/api/v1/loops`, and `looprelay loop status` include raw-free worktree and
session activity counts plus per-worktree safe labels, snapshot counts, and
latest outcome status so active agents can notice parallel work before merging
or handing off. The web Loops view can open and deep-link a selected worktree
detail panel through `/api/v1/loops/worktrees/:worktree`, still limited to safe
loop metadata. The drilldown can also be narrowed with
`/loops?worktree=<safe-label>&session=<safe-session-id>&branch=<safe-branch>`,
backed by the API `session_id` and `branch` filters and still raw-free. Use
`looprelay loop collect --source service` as the explicit one-shot command
for cron or LaunchAgent collection; it does not silently install a scheduler.
The opt-in macOS schedule is `looprelay loop schedule install`; use
`--dry-run` to inspect the LaunchAgent before writing it. Use
`looprelay loop schedule status` to check whether the plist exists and
`looprelay loop schedule uninstall` to remove it. `loop status` prints
snapshot readiness, latest safe loop metadata, and compact refresh guidance
without prompt bodies, compact summaries, custom compact instructions, or raw
paths.
The web Loops view uses the same privacy boundary for recent loop snapshots,
empty state guidance, compact refresh markers, and copy-ready next loop briefs;
it can also record an eligible latest memory candidate through the local web
session. That web approval only writes the local LoopRelay memory record;
after approval, the same view can fetch a review-only AGENTS.md patch preview.
Instruction-file writes still require the separate explicit apply workflow. It
does not render prompt bodies, compact summaries, custom compact instructions,
transcript bodies, or raw paths.
`score_prompt` scores direct prompt text, a stored prompt id, or the latest
stored prompt with the same local deterministic `0-100` Prompt Quality Score
used by the web UI. The response also includes a per-criterion `breakdown`
(`weight` and `earned` for each of `goal_clarity`, `background_context`,
`scope_limits`, `output_format`, `verification_criteria`) plus the same
`weight`/`earned` on every `checklist` item, so an agent can tell the user
exactly which axis cost points instead of repeating only the overall score.
`improve_prompt` returns an approval-ready copy-based
rewrite draft for direct prompt text, a stored prompt id, or the latest stored
prompt. `prepare_agent_rewrite` is the opt-in semantic rewrite handoff: it
returns one locally redacted prompt, local score metadata, a local baseline
draft, and a rewrite contract so the current Claude Code, Codex, or Gemini CLI
session can produce a better prompt itself. `record_agent_rewrite` saves that
agent-produced rewrite as a redacted improvement draft after user approval,
without returning the rewrite body. `score_prompt_archive` scores accumulated
prompt habits across recent stored prompts and returns aggregate score,
recurring gaps, a practice plan, a next prompt template, and low-score prompt
ids. `review_project_instructions`
scores local `AGENTS.md` / `CLAUDE.md` rules for the latest or selected project
and returns file metadata, checklist status, and improvement hints.
`prepare_agent_judge_batch` is the opt-in LLM-as-judge handoff: it returns a
bounded set of locally redacted prompt bodies, local score metadata, and a
rubric so the current Claude Code, Codex, or Gemini CLI session can evaluate
prompt quality itself. `record_agent_judgments` stores that active agent
session's advisory scores, confidence, risks, and suggestions without storing
prompt bodies or raw paths.

`coach_prompt`, `improve_prompt`, and `score_prompt_archive` accept an optional
`language: "en" | "ko"` argument. When unset, `improve_prompt` auto-detects
Korean inputs by Hangul ratio and returns a Korean draft; the archive review
falls back to English unless the agent explicitly forwards `language: "ko"` (or
`coach_prompt` does so on the agent's behalf).

These tools do not make hidden external LLM calls. Archive-backed score/rewrite
flows do not return stored original prompt bodies. The archive and status tools
avoid raw absolute paths, and the instruction review tool avoids file bodies and
raw absolute paths. The agent rewrite/judge packets are explicit because they
return redacted prompt bodies to the active user-controlled agent session for
rewrite or evaluation; that agent may send the packet through its provider
session according to the user's tool setup. `looprelay` does not extract,
proxy, or reuse provider credentials. Read tool definitions are marked
read-only, idempotent, and local-only through MCP annotations.
`record_agent_rewrite` and
`record_agent_judgments` are marked as non-destructive write tools. Each
`tools/call` response includes
`structuredContent` plus a JSON text block for clients that still expect text
content, and each tool definition declares an MCP `outputSchema` for the
structured result. If MCP is not configured, users can run the same local archive
review through:

```sh
looprelay score --json
```

## Prompt Rewrite Guard

For users who want a stronger query-rewriting workflow, the hook can be
installed with an opt-in guard:

```sh
looprelay install-hook claude-code --rewrite-guard block-and-copy --rewrite-min-score 80
looprelay install-hook codex --rewrite-guard block-and-copy --rewrite-min-score 80
```

This uses the official `UserPromptSubmit` hook decision path where supported.
It blocks low-score prompts before the agent processes them, shows a local
improved draft, and tries to copy the draft to the clipboard. The user still
pastes and submits the draft manually. It does not simulate keyboard input,
rewrite the interactive composer, or auto-submit prompts. If local ingest is
unavailable or fails, the hook fails open and does not block.

The installed hook set also includes `Stop`, `PreCompact`, and `PostCompact`.
Stop events are handled locally: looprelay collects a LoopRelay snapshot from
recent prompt metadata without posting the lifecycle event to the prompt ingest
route. Compact events record only safe boundary metadata and an optional HMAC
content hash; looprelay does not store prompt bodies, raw paths, transcript
contents, custom compact instructions, or compact summaries.

`--rewrite-guard context` is less disruptive: it allows the original prompt to
continue and adds model-visible rewrite guidance. That mode is not a true
replacement because the original submitted prompt remains part of the turn.

Claude Code registration:

```sh
claude mcp add --transport stdio looprelay -- looprelay mcp
```

Codex registration:

```sh
codex mcp add looprelay -- looprelay mcp
```

The manual commands above assume `looprelay` is globally available in
`PATH`. In a cloned checkout, use `pnpm setup` or
`pnpm looprelay setup --profile coach --register-mcp --open-web` so the MCP
registration uses absolute paths.

After registration, `looprelay doctor claude-code` and
`looprelay doctor codex` report MCP command access. The doctor command first
inspects known local config files, then uses read-only `claude mcp list` or
`codex mcp list` as a fallback when config-file detection is inconclusive.

Use `--data-dir` when the archive is not in the default location:

```sh
looprelay mcp --data-dir /path/to/looprelay-data
```

For agent-native usage, prefer MCP first and CLI fallback second:

```text
looprelay:score_prompt latest=true
looprelay:improve_prompt latest=true
looprelay:score_prompt_archive max_prompts=200
looprelay:review_project_instructions latest=true
looprelay:coach_prompt
looprelay:prepare_agent_rewrite latest=true
looprelay:record_agent_rewrite provider=codex prompt_id=...
looprelay:prepare_agent_judge_batch selection=low_score max_prompts=5
looprelay:record_agent_judgments provider=codex judgments=[...]
```

```sh
looprelay coach
looprelay coach --json
looprelay score --latest --json
looprelay improve --latest --json
looprelay score --json --limit 200
```

## Local-First Boundary

The plugin and hook commands do not contain the ingest token. The hook wrapper
loads local configuration, posts only to the local server, and fails open if the
server is unavailable.
