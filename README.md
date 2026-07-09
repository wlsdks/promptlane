# PromptLane

[English](README.md) | [한국어](README.ko.md)

**Local-first prompt improvement workspace for Claude Code, Codex, and long-running coding-agent work.**

- 🗂️ Captures every prompt you send to Claude Code / Codex into a local
  Markdown + SQLite archive — nothing leaves your machine.
- 🧠 Scores each prompt 0–100 across five criteria and tells you which
  axis cost points, so you learn instead of guessing.
- ✍️ Generates a copy-ready improved draft on demand (English or Korean,
  auto-detected) without auto-resubmitting anything.
- 🔁 Reuses approved lessons and loop snapshots when long-running agent work
  needs a better next request.

After the npm package is published:

```sh
npm install -g promptlane
promptlane setup --profile coach --register-mcp --open-web
# then send one Codex or Claude Code prompt and run:
promptlane coach
```

Until then, run the same first coach loop from a local checkout:

```sh
git clone https://github.com/wlsdks/promptlane.git
cd promptlane
pnpm install
pnpm setup
pnpm promptlane coach
```

PromptLane is a developer tool that safely records prompts and loop metadata from AI coding tools such as Claude Code and Codex, helps you find them again, analyzes weak prompting patterns, and helps you write better follow-up requests. The npm package, primary CLI, MCP server name, hook command, and plugin identity are `promptlane`.

Use `promptlane` in scripts, terminal commands, MCP registration, and plugin commands. Claude Code slash commands are exposed under the active `/promptlane:*` namespace.

It collects supported tool prompts locally, redacts sensitive values before storage, writes Markdown files, indexes them in SQLite, and serves a local PromptLane web server for search, review, archive scoring, prompt practice, analysis, deletion, and copy-based prompt improvement. The same local PromptLane MCP server exposes scoring, rewrite, clarification, loop-aware continuation, and review tools to connected agents.

Loop features are loop-aware continuation. They help select safe worktree,
session, branch, and snapshot context for the next prompt; they do not turn
PromptLane into an automatic agent runtime, transcript scraper, or merge bot.

This project is not affiliated with, endorsed by, or sponsored by Anthropic, OpenAI, or any other AI tool provider. Product names such as Claude Code and Codex are used only to describe compatibility.

## First 3-Minute Coach Loop

The first success is not the web dashboard. It is seeing a score and one useful
fix for a real Codex or Claude Code prompt you just sent.

For most users, the happy path is:

```sh
promptlane start --open-web
promptlane setup --profile coach --register-mcp --open-web
# send one Codex or Claude Code coding prompt
promptlane coach
```

Skip `--open-web` if you do not want the web workspace to open automatically on
new agent sessions.

Only troubleshoot after that path fails:

```sh
promptlane doctor claude-code
promptlane doctor codex
```

If MCP registration failed, rerun the one-command setup first:

```sh
promptlane setup --profile coach --register-mcp --open-web
```

Manual `claude mcp add` / `codex mcp add` commands are only for advanced
troubleshooting. `setup --register-mcp` is preferred because it uses the current
CLI entrypoint; from a cloned checkout that means absolute Node + `dist/` paths,
so Codex does not depend on `promptlane` being globally available in `PATH`.

Open the local archive only when you want dashboard, search, history review, or
export.

## Status

PromptLane 1.0.0 is the first stable public release line for local-first
Claude Code and Codex prompt memory workflows.

- Claude Code support: MVP path
- Codex support: beta adapter
- Local rule-based analysis preview: implemented
- Prompt Quality Score: implemented as a local deterministic `0-100` rubric
- MCP prompt scoring tools: implemented as a local stdio server
- Copy-based PromptLane improvement drafts: implemented, including raw-free next request briefs
- Prompt Practice workspace: implemented as a local draft-and-score UI with
  score history and outcome feedback that do not store draft text
- Transcript import: CLI only
- Anonymized export: web UI and CLI preview/job flow
- Benchmark v1: implemented as a local regression baseline
- English/Korean web UI: implemented
- External LLM analysis: no hidden provider calls from `promptlane`;
  optional MCP agent rewrite/judge packets can enter the active
  user-controlled Claude Code/Codex/Gemini CLI provider session when requested
- Default data handling: local only

## Requirements

- Node.js `>=22.12 <25`
- pnpm `10.x`
- A platform supported by `better-sqlite3`

The local release gate is validated on Node 22 and Node 24.

## Quick Start

There are two pieces:

1. the `promptlane` CLI, which owns the local server, hooks, storage, and web UI
2. the Claude Code or Codex marketplace plugin, which gives the agent an easy setup/status/open workflow

The marketplace plugin does not install the CLI binary by itself. Install the CLI first, then add the marketplace.

The examples below use the published CLI command `promptlane`. When running
from a cloned development checkout, use `pnpm promptlane` instead.

### 1. Install The CLI

After the package is published:

```sh
npm install -g promptlane
```

For local development from this repository:

```sh
git clone https://github.com/wlsdks/promptlane.git
cd promptlane
pnpm install   # also builds dist via the prepare lifecycle
pnpm setup     # installs Claude Code + Codex hooks, MCP, status line, and service
```

`pnpm install` runs `pnpm build` automatically through the `prepare` lifecycle,
so a fresh checkout has a working `dist/` after the install finishes.

`pnpm setup` is an alias for
`pnpm promptlane setup --profile coach --register-mcp --open-web` — one
command that connects every detected agent (Claude Code and Codex), registers
the MCP server with absolute paths, installs the Claude Code status line, and
enables the local server on session start.

### 2. Add The Claude Code Marketplace

Inside Claude Code:

```text
/plugin marketplace add wlsdks/promptlane
/plugin install promptlane
/reload-plugins
/promptlane:setup
```

`/promptlane:setup` checks that the CLI is available, previews
`promptlane setup --profile coach --register-mcp`, asks before writing
settings, and then runs the real setup if approved.

### 3. Add The Codex Marketplace

From your shell:

```sh
codex plugin marketplace add wlsdks/promptlane
```

Then run the local coach setup:

```sh
promptlane setup --profile coach --register-mcp --open-web
```

Codex currently exposes marketplace management through `codex plugin marketplace add/upgrade/remove`. The prompt capture hook is installed by `promptlane setup`, which writes the Codex hook config, enables `[features].hooks`, and registers the MCP server. In a development checkout, run the same flow as `pnpm setup`; it registers MCP with absolute paths to this repo's built CLI.

### 4. Check Capture

```sh
promptlane doctor claude-code
promptlane doctor codex
promptlane doctor codex --json
promptlane statusline claude-code
promptlane buddy --once
promptlane coach
```

For automation, `doctor --json` includes top-level `status` as `ready` or
`needs_attention` so scripts do not need to recompute nested readiness checks.

Open the local archive:

```text
http://127.0.0.1:17373
```

## Supported Platforms

Release validation is local-first and currently targets:

- Node.js 22 and 24
- the local release gate documented below
- local browser, release, and package smoke on the maintainer machine

Linux x64 is the primary development environment currently exercised by the local gate. macOS, Linux arm64, and Windows support are intended, but they still require explicit maintainer/operator smoke for `better-sqlite3`, filesystem permissions, and hook command behavior before making broad platform claims.

## Install (Development Checkout) And Setup Options

This section is for contributors and for users who want every `setup` flag
documented. End users who installed `promptlane` from npm should follow
[Quick Start](#quick-start) instead and treat this section as a reference.

For local development without the agent marketplace flow:

```sh
pnpm install
pnpm build
```

Run the guided local coach setup:

```sh
pnpm promptlane setup --profile coach --register-mcp
```

`setup` is intentionally explicit. Installing an npm/pnpm package should not
silently edit Claude Code or Codex settings, install a login service, or start a
local background server. `promptlane setup` is the consent step that prepares
the local archive, connects supported tools that are installed on your machine,
and configures the local server startup where supported.

The setup command:

- initializes the local data directory
- detects `claude` and `codex`
- installs Claude Code and/or Codex hooks for detected tools
- with `--profile coach`, adds low-friction rewrite guidance through hook
  context instead of making you run separate score/improve commands
- with `--profile coach`, installs the Claude Code status line when Claude Code
  is detected. Existing Claude Code status line commands are chained and
  restored on uninstall where possible.
- with `--register-mcp`, registers the MCP server with detected Claude Code
  and/or Codex CLIs using the current CLI entrypoint
- with `--open-web`, installs a `SessionStart` hook that ensures the local
  server is running and opens `http://127.0.0.1:17373` once per agent session
- enables `[features].hooks` when Codex is detected
- installs and starts a macOS LaunchAgent for the local server when supported
- prints next steps and paths that were changed

Preview setup without writing files:

```sh
pnpm promptlane setup --profile coach --register-mcp --dry-run
```

Opt in to web workspace startup when you want the local workspace to open
automatically beside Claude Code or Codex:

```sh
pnpm promptlane setup --profile coach --register-mcp --open-web
```

This is not enabled by default. It writes an explicit `SessionStart` hook, opens
the browser at most once per agent session id, and keeps the hook fail-open with
no prompt body, raw path, or token output.

Use passive capture only when you do not want coaching:

```sh
pnpm promptlane setup
```

If you do not want a background service, use:

```sh
pnpm promptlane setup --no-service
pnpm promptlane server
```

The web UI URL is the same as in Quick Start: `http://127.0.0.1:17373`.

You can still run each setup step manually.

Initialize the local data directory:

```sh
pnpm promptlane init
```

By default, data is stored under:

```text
~/.promptlane
```

You can use a different location with `--data-dir`:

```sh
pnpm promptlane init --data-dir /path/to/promptlane-data
```

## Start The Local Server

```sh
pnpm promptlane server
```

The server defaults to:

```text
http://127.0.0.1:17373
```

Open that URL in a browser to use the web UI.

On macOS, `setup` can install a LaunchAgent so the server starts automatically
at login. You can also manage it directly:

```sh
pnpm promptlane service install
pnpm promptlane service status
pnpm promptlane service start
pnpm promptlane service stop
```

## Connect Claude Code

Install the Claude Code hook:

```sh
pnpm promptlane install-hook claude-code
```

Optional Prompt Rewrite Guard:

```sh
pnpm promptlane install-hook claude-code --rewrite-guard block-and-copy --rewrite-min-score 80
```

Optional web auto-open:

```sh
pnpm promptlane install-hook claude-code --open-web
```

`block-and-copy` uses the supported `UserPromptSubmit` decision path: weak
prompts are blocked before Claude Code processes them, an improved local draft
is shown, and promptlane tries to copy that draft to the clipboard. It does
not type into the terminal, press Enter, replace the composer contents, or
auto-submit anything. If the local ingest server is unavailable or ingest fails,
the hook fails open and does not block the prompt.

The same installation also registers fail-open `Stop`, `PreCompact`, and
`PostCompact` hooks. On stop events, promptlane collects a local PromptLane
snapshot from recent prompt metadata for the current project. On compact events,
it records only compaction boundary metadata and an optional HMAC content hash;
it does not store prompt bodies, raw paths, transcript contents, custom compact
instructions, or compact summaries.

The `--rewrite-guard` flag accepts four modes:

- `off` — capture only; no coaching or blocking
- `context` — soft. Injects an improved draft as `additionalContext` alongside
  the user's submission. Claude sees both
- `ask` — instructs the agent to ask one or two clarifying questions before
  answering. On Claude Code this uses the native `AskUserQuestion` tool; on
  Codex it calls the `ask_clarifying_questions` MCP tool with a native OS
  dialog fallback
- `block-and-copy` — described above

When `ask` mode triggers, promptlane records the event (tool, score, band,
missing axes, language, prompt length) and surfaces a 7-day **Ask mode** panel
on the dashboard so you can see whether the trigger gate (`length ≥ 30`,
`score < 60`, not an acknowledgment) is firing on the right cases.

Preview the settings change without writing:

```sh
pnpm promptlane install-hook claude-code --dry-run
```

Diagnose the setup:

```sh
pnpm promptlane doctor claude-code
```

`doctor` checks local server reachability, ingest token, hook installation, and
MCP command access. For MCP, it first inspects known local config files and then
falls back to read-only `claude mcp list` when needed.

Remove the hook:

```sh
pnpm promptlane uninstall-hook claude-code
```

The installer writes a promptlane command into the Claude Code settings file and creates a backup before changing an existing file. The hook command does not contain the ingest token.

## Connect Codex Beta

Codex hook support is beta.

Install the Codex hook:

```sh
pnpm promptlane install-hook codex
```

Optional Prompt Rewrite Guard:

```sh
pnpm promptlane install-hook codex --rewrite-guard block-and-copy --rewrite-min-score 80
```

Optional web auto-open:

```sh
pnpm promptlane install-hook codex --open-web
```

Codex support uses the same safe hook command path. Because Codex plugin-local
hooks may vary by Codex version, `promptlane setup` / `install-hook` still
writes the user-level hook config. If the local ingest server is unavailable or
ingest fails, the hook fails open and does not block the prompt.

Codex may render `UserPromptSubmit` hook stdout directly in the chat. To keep
the agent surface readable, Codex `context` / `ask` rewrite guidance is captured
locally but not printed to hook stdout by default. Use `promptlane coach`,
`promptlane score`, the web UI, or the MCP tools when you want to review and
copy an improved brief.

The Codex install also registers fail-open `Stop`, `PreCompact`, and
`PostCompact` hooks. Stop and compact lifecycle handling is local-only and does
not post those payloads to the prompt ingest route.

Preview the `hooks.json` and `config.toml` changes without writing:

```sh
pnpm promptlane install-hook codex --dry-run
```

Diagnose the setup:

```sh
pnpm promptlane doctor codex
```

`doctor` checks local server reachability, ingest token, hook installation,
Codex hook feature status, and MCP command access. For MCP, it first inspects
known local config files and then falls back to read-only `codex mcp list` when
needed.

Remove the hook:

```sh
pnpm promptlane uninstall-hook codex
```

The Codex installer targets user-level config by default:

```text
~/.codex/hooks.json
~/.codex/config.toml
```

It enables:

```toml
[features]
hooks = true
```

Uninstall removes the promptlane hook entry but leaves the Codex feature flag in place.

## Agent Wrappers Experimental

`pl-claude` and `pl-codex` are experimental front-door wrappers for the initial
prompt argument. They score the prompt locally, generate a redacted improvement
when it is weak, and then launch the real `claude` or `codex` binary with the
selected prompt.

```sh
pl-claude --pc-mode auto -- "fix this"
pl-codex --pc-mode auto -- "fix this"
pl-codex --pc-mode auto -- exec "fix this"
```

Use dry-run first to verify what would be sent without launching the agent:

```sh
pl-claude --pc-mode auto --pc-dry-run -- "fix this"
pl-codex --pc-mode auto --pc-dry-run -- "fix this"
```

Wrapper options are prefixed with `--pc-*` so normal Claude/Codex options can
still be forwarded. The default mode is `ask`; `--pc-mode auto` is the one-click
mode that replaces a low-score initial prompt without asking. Management
subcommands such as `auth`, `mcp`, `plugin`, and `login` pass through without
rewriting. These wrappers do not intercept every later message typed inside an
interactive session.

## Plugin Packaging

This repository also ships plugin packaging artifacts:

```text
.claude-plugin
commands
plugins/promptlane
integrations/claude-code
docs/PLUGINS.md
```

Recommended order:

1. install the `promptlane` CLI
2. add the agent marketplace
3. run `promptlane setup` or `/promptlane:setup`

Claude Code can consume this repository as a marketplace:

```text
/plugin marketplace add wlsdks/promptlane
/plugin install promptlane
/reload-plugins
/promptlane:setup
```

The Claude Code plugin provides slash commands:

```text
/promptlane:setup
/promptlane:status
/promptlane:guard
/promptlane:buddy
/promptlane:coach
/promptlane:score
/promptlane:judge
/promptlane:improve-last
/promptlane:habits
/promptlane:open
```

Claude Code slash commands remain under `/promptlane:*` during the PromptLane
compatibility window. Existing plugin users should keep those commands. The
canonical CLI remains `promptlane`; do not introduce alternate CLI aliases or
alternate slash namespaces without a dedicated migration plan.

`/promptlane:guard` opens an interactive picker (off / context / ask /
block-and-copy) that flips the `UserPromptSubmit` rewrite-guard mode without
requiring you to remember CLI flags. Run `promptlane hook status` to see
the mode currently installed for each detected tool.

`/promptlane:setup` runs `promptlane setup --dry-run` first, asks before
writing local settings, and can optionally install a small Claude Code
`statusLine` indicator with the latest prompt score:

```sh
pnpm promptlane install-statusline claude-code
```

If another Claude Code HUD is already installed, promptlane preserves it by
running both commands through one chained `statusLine` command. Uninstalling
promptlane restores the previous command when it was captured during install.

For Claude Code or Codex, open a second terminal pane beside the agent and run
the always-on prompt buddy:

```sh
pnpm promptlane buddy
```

Use `pnpm promptlane buddy --once` for a one-shot text snapshot, or
`pnpm promptlane buddy --json` for automation.

The Codex package under `plugins/promptlane` contains a `.codex-plugin`
manifest and a small skill that helps Codex install, diagnose, and use the local
archive. It does not bundle active Codex hooks; `promptlane setup` installs
user-level hooks explicitly so plugin and setup hooks do not both fire.

Claude Code prompt capture is exposed through its documented hook settings, so
`integrations/claude-code/settings.example.json` is provided as a manual example.
For normal use, prefer:

```sh
pnpm promptlane setup
```

The explicit setup command is still required because plugin discovery should not
silently edit user settings, install a login service, or start a local server.
See `docs/PLUGINS.md` for the packaging boundary and manual configuration notes.

Render the Claude Code status line manually:

```sh
pnpm promptlane statusline claude-code
```

Render a side-pane buddy snapshot manually:

```sh
pnpm promptlane buddy --once
```

Codex can add the same repository as a marketplace:

```sh
codex plugin marketplace add wlsdks/promptlane
```

After that, use `promptlane setup` to install the Codex hook and enable Codex hooks.

## CLI

List prompts:

```sh
pnpm promptlane list
```

Search prompts:

```sh
pnpm promptlane search "migration plan"
```

Show a prompt Markdown body:

```sh
pnpm promptlane show <prompt-id>
```

Delete a prompt:

```sh
pnpm promptlane delete <prompt-id>
```

Open a prompt in the local web UI:

```sh
pnpm promptlane open <prompt-id>
```

Rebuild SQLite/FTS from Markdown:

```sh
pnpm promptlane rebuild-index
```

Preview and import JSONL transcripts:

```sh
pnpm promptlane import --dry-run --file ./transcript.jsonl --save-job
pnpm promptlane import --execute --file ./transcript.jsonl
pnpm promptlane import-job <job-id>
```

Import is currently CLI-centered. The web UI can browse imported prompts through
the normal archive and imported-only filters, but there is no web import upload
screen.

Create and execute an anonymized export:

```sh
pnpm promptlane export --anonymized --preview --preset anonymized_review --json
pnpm promptlane export --anonymized --job <export-job-id> --json
```

The web UI exposes only anonymized export. Raw export is not implemented.
Previewed export jobs expire and are invalidated when the selected prompt set,
project policy versions, redaction version, or preview counts change.

Generate a copy-based PromptLane improvement draft:

```sh
pnpm promptlane coach
pnpm promptlane coach --json
pnpm promptlane improve --text "make this request clearer" --json
pnpm promptlane improve --latest --json
```

Score accumulated prompt habits without returning prompt bodies:

```sh
pnpm promptlane score --json
pnpm promptlane score --latest --json
pnpm promptlane score --tool codex --json
```

Inspect the PromptLane 9.5 quality evidence gate:

```sh
corepack pnpm promptlane quality-evidence
corepack pnpm promptlane quality-evidence --json
corepack pnpm promptlane quality-evidence --operator-brief
corepack pnpm promptlane quality-evidence --require-complete
```

`--require-complete` fails while scorecard axes or direct evidence blockers are
still pending. Use it only as a release/goal-completion gate.
`--operator-brief` prints the focused approval checklist for the remaining
native dialog dogfood without opening the dialog. It also includes the refusal
preflight command that should stop before opening a native dialog unless
`PROMPTLANE_NATIVE_DIALOG_APPROVED=1` is set.
Run `corepack pnpm dogfood:mcp-native-dialog-refusal` for that refusal
preflight.
The JSON output also includes `recommended_next_slices` (shown as recommended next slices
in the text output), which separates immediately runnable local
evidence work from items blocked on an external event or explicit operator
approval.

## Local Analysis Preview

Prompt detail views include a local rule-based analysis preview. It summarizes whether a prompt includes clear targets, context, constraints, output format, and verification criteria. Each prompt also receives a deterministic `0-100` Prompt Quality Score with a checklist-based breakdown.

This preview runs locally against the stored, redacted prompt body. It does not call an external LLM provider.

## Project Instruction Review

The Projects screen can analyze project-local `AGENTS.md` and `CLAUDE.md`
files. The review stores a local snapshot with file names, hashes, timestamps,
checklist status, score, and improvement hints.

It does not store or return instruction file bodies, raw absolute paths, or
external LLM results. The score is a deterministic local rubric for project
context, agent workflow, verification commands, privacy/safety, and reporting
rules.

## MCP Prompt Scoring

`promptlane` can expose the same local Prompt Quality Score to Claude Code,
Codex, or any MCP client through a stdio MCP server:

```sh
promptlane mcp
```

The MCP server exposes 20 tools:

- `get_promptlane_status`: check whether the local archive is initialized,
  whether prompts have been captured, and which MCP tool to call next.
- `coach_prompt`: run the default one-call agent workflow for Claude Code or
  Codex: local readiness, latest prompt score, approval-required rewrite,
  recent habit review, project instruction review, and next request guidance.
- `score_prompt`: score either direct prompt text, a stored `prompt_id`, or the
  latest stored prompt.
- `improve_prompt`: generate an approval-ready improved prompt draft for direct
  prompt text, a stored `prompt_id`, or the latest stored prompt. The result
  also includes a `clarifying_questions` array (with JSON-Schema-shaped
  `answer_schema.examples`) the agent should ask the user via its native ask UI.
- `apply_clarifications`: take the user's verbatim answers (each must be tagged
  `origin: "user"`) and compose the final approval-ready draft. Use this after
  the agent has collected answers through its own ask UI.
- `ask_clarifying_questions`: promptlane drives the entire ask-then-apply
  flow itself. Three layered paths, in order:
  1. MCP `elicitation/create` when the client advertises
     `capabilities.elicitation` (Claude Code 2.1.76+).
  2. Native OS dialog (macOS `osascript`, Linux `zenity`,
     Windows PowerShell `Microsoft.VisualBasic.InputBox`) when the caller
     opts in via `allow_native_dialog: true` or
     `PROMPTLANE_NATIVE_DIALOG=1`. Useful on Codex today, before
     `ask_user_question` ships upstream.
  3. Otherwise returns `clarifying_questions` metadata
     (`interaction_status: unsupported|declined|timeout`).
     Never auto-submits a rewrite.
     In non-interactive Claude Code print runs (`claude -p`), the MCP tool can be
     routed successfully but still return `interaction_status: declined` when no
     user answer is provided. Treat that as a safe fallback: ask the returned
     `clarifying_questions` through the agent's native ask UI, call
     `apply_clarifications` first to compose and show the final approval-ready
     draft in chat, and call `record_clarifications` only if the user also wants
     to save that draft against a stored prompt.
- `record_clarifications`: persist the user's verbatim answers and the
  resulting draft against a stored prompt in the local archive
  (`prompt_improvement_drafts`). Returns metadata only (`draft_id`,
  `answers_count`, `changed_sections`, …) — the prompt body and the draft
  text are never echoed in the response. Local-only write tool.
- `get_promptlane_loop_status`: check whether local PromptLane loop snapshots
  exist and return safe latest-loop metadata plus compact-boundary awareness
  when a compact happened after the latest snapshot.
- `prepare_loop_brief`: prepare a copy-ready continuation prompt from the
  latest local PromptLane snapshot, or from the newest snapshot matching optional
  `worktree`, `session_id`, and `branch` filters, without returning prompt
  bodies or raw paths. If the selected snapshot is older than a compact
  boundary, the brief says to refresh the loop snapshot but does not include
  compact summaries or custom compact instructions.
- `record_loop_outcome`: store user-approved loop outcome metadata for a
  PromptLane snapshot without storing prompt bodies or raw paths.
- `propose_loop_memory_candidate`: decide whether the latest verified loop
  outcome is safe and evidence-backed enough to become a user-approved memory
  candidate. It is read-only and never writes AGENTS.md, CLAUDE.md, memory
  files, prompt bodies, raw paths, transcripts, compact summaries, or external
  LLM results.
- `record_loop_memory`: record a user-approved PromptLane memory from the latest
  eligible candidate into local PromptLane storage. It does not write
  AGENTS.md, CLAUDE.md, project docs, prompt bodies, raw paths, transcripts,
  compact summaries, or external LLM results. Its structured `next_actions`
  point agents to `prepare_loop_brief` and
  `propose_instruction_patch target_file=AGENTS.md`.
- `propose_instruction_patch`: propose a reviewable unified diff for adding the
  latest approved PromptLane memory to `AGENTS.md` or `CLAUDE.md`. It returns the
  patch text and an explicit apply gate only; web review does not write files,
  and application must go through CLI or MCP with explicit confirmation.
- `apply_instruction_patch`: apply the latest approved PromptLane memory to
  `AGENTS.md` or `CLAUDE.md` only when the caller explicitly confirms the file
  write. It is idempotent by source memory id and does not return raw paths.
- `score_prompt_archive`: score accumulated prompt habits across recent stored
  prompts and return aggregate score, recurring gaps, a practice plan, a next
  prompt template, and low-score prompt ids.
- `review_project_instructions`: review local `AGENTS.md` / `CLAUDE.md`
  instruction files for the latest or selected project and return score,
  checklist status, and improvement hints.

The matching local CLI surface is `promptlane loop status`,
`promptlane loop collect`, `promptlane loop brief`, and
`promptlane loop memory-candidate`; approved memories are recorded with
`promptlane loop memory-approve`. `promptlane loop brief` accepts optional
`--worktree`, `--session`, and `--branch` filters so a continuation prompt can
resume the same worktree/session/branch selected in the Loops view instead of
falling back to the global latest snapshot. Use
`promptlane loop instruction-patch --target-file AGENTS.md` to generate the
review-only instruction patch from the latest approved memory. Use
`promptlane loop instruction-apply --target-file AGENTS.md --confirm-apply`
only after reviewing the proposal and intending to write the instruction file;
the web review panel intentionally has no apply button.
`get_promptlane_loop_status`, `/api/v1/loops`, and `promptlane loop status` also
include a raw-free worktree/session activity summary with per-worktree safe
labels, session counts, snapshot counts, and latest outcome status so agents can
notice when recent snapshots span multiple worktrees or sessions before merging
output. The web Loops view can open and deep-link a selected worktree detail
panel backed by `/api/v1/loops/worktrees/:worktree`, still returning only safe
loop metadata. That drilldown can be narrowed with optional safe session and
branch query state
(`/loops?worktree=<safe-label>&session=<safe-session-id>&branch=<safe-branch>`),
backed by the API `session_id` and `branch` filters.
`loop collect` also accepts `--source service` for explicit cron or LaunchAgent
one-shot collection without creating hidden background automation. Users who
want an opt-in macOS schedule can preview or install it with
`promptlane loop schedule install --dry-run` or
`promptlane loop schedule install --cwd-prefix <project>`, check it with
`promptlane loop schedule status`, and remove the plist with
`promptlane loop schedule uninstall`.
`loop status` shows snapshot readiness, latest safe metadata, and compact
refresh guidance without printing prompt bodies, compact summaries, custom
compact instructions, or raw paths.
The web UI also includes a Loops view for local snapshot readiness, recent loop
metadata, compact refresh markers, and a copy action for the next loop brief.
When the latest loop has an eligible memory candidate, the Loops summary can
record that approved memory through the local web session; this only writes the
local PromptLane memory record and still leaves AGENTS.md/CLAUDE.md changes to
the explicit instruction patch workflow. After a memory is approved, the Loops
summary can fetch a review-only AGENTS.md patch preview without writing files.
It does not render prompt bodies, compact summaries, custom compact
instructions, transcript bodies, or raw paths.

- `prepare_agent_rewrite`: prepare one locally redacted prompt packet, local
  score metadata, local baseline draft, and rewrite contract so the active
  Claude Code/Codex/Gemini CLI session can semantically improve the prompt.
- `record_agent_rewrite`: save that agent-produced rewrite as a redacted
  improvement draft after user approval, without returning the rewrite body.
- `prepare_agent_judge_batch`: prepare a bounded, locally redacted prompt
  packet and rubric for the active Claude Code/Codex/Gemini CLI session to
  judge. `promptlane` does not call the provider for you.
- `record_agent_judgments`: store advisory scores and notes produced by the
  active agent session, without storing prompt bodies or raw paths.

All read tools are local-only and declare an MCP `outputSchema` for structured
JSON metadata plus a text JSON fallback. `record_agent_rewrite` and
`record_agent_judgments` are non-destructive write tools. Archive-backed local
tools do not return stored prompt bodies, raw absolute paths, secrets, or hidden
external LLM results. Agent rewrite/judge modes are opt-in and use the current
agent session as the rewriter or evaluator.

Practical agent prompts:

```text
Use promptlane coach_prompt and give me the one-call coaching result for my
latest request. Do not auto-submit the rewrite.

Use promptlane get_promptlane_status and tell me whether prompt capture is
working before you score anything.

Use promptlane score_prompt with latest=true and tell me what to improve in
my last request.

Use promptlane improve_prompt with latest=true and give me an
approval-ready draft I can copy and resubmit.

Use promptlane ask_clarifying_questions with prompt: "<my draft>". If your
client supports MCP elicitation, promptlane will ask me via your native ask
UI; otherwise return the clarifying_questions metadata so you can ask through
AskUserQuestion or Codex ask_user_question and pass my answers to
apply_clarifications.

Use promptlane prepare_agent_rewrite with latest=true. Rewrite that redacted
prompt yourself, ask for my approval, then call record_agent_rewrite if I want
the draft saved.

Use promptlane score_prompt_archive for recent Codex prompts and summarize my
top recurring prompt habit gaps.

Use promptlane review_project_instructions with latest=true and tell me
whether my AGENTS.md/CLAUDE.md rules are strong enough for coding agents.

Use promptlane prepare_agent_judge_batch with selection=low_score and
max_prompts=5. Judge those redacted prompts yourself, then call
record_agent_judgments with your scores and suggestions.
```

The tools return score metadata, checklist breakdowns, warnings, recurring gaps,
approval-ready rewrite drafts, and improvement hints. They do not store direct
prompt text or make hidden external LLM calls. Archive-backed score/rewrite
flows do not return stored original prompt bodies. The archive scoring tool also
avoids raw absolute paths. The project instruction review tool also avoids
instruction file bodies and raw absolute paths. The status tool returns only
safe counts, latest prompt metadata, available tool names, and next actions.

Agent-judge packets are different: when explicitly requested, they return
locally redacted prompt bodies so the active Claude Code/Codex/Gemini CLI
session can judge them. This is documented in
[Legal usage guide](docs/LEGAL_USAGE_GUIDE.md). `promptlane` does not extract
or proxy Claude.ai OAuth tokens, Claude Code internal auth tokens,
OpenAI/Codex/ChatGPT session tokens, or provider API keys.

Example Claude Code registration:

```sh
claude mcp add --transport stdio promptlane -- promptlane mcp
```

Example Codex registration:

```sh
codex mcp add promptlane -- promptlane mcp
```

Those manual examples assume the published `promptlane` binary is available
in `PATH`. For local development, prefer:

```sh
pnpm setup
```

or rerun:

```sh
pnpm promptlane setup --profile coach --register-mcp --open-web
```

The setup command registers MCP with absolute Node + `dist/cli/index.js` paths,
which is the safer Codex configuration for a cloned checkout.

If you use a custom data directory:

```sh
promptlane mcp --data-dir /path/to/promptlane-data
```

## Benchmark

Benchmark v1 measures local regression signals for privacy, retrieval,
rule-based prompt improvement, `coach_prompt` actionability, prompt quality
score calibration, analytics, and latency:

```sh
promptlane benchmark --json
promptlane benchmark init-fixture --output "$FIXTURE_FILE"
# Replace every example with consent-bearing redacted fixtures.
promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE"

corepack pnpm benchmark
corepack pnpm --silent benchmark -- --json
```

The default synthetic fixture set is the deterministic local regression gate.
The real fixture set is an opt-in soft trend signal for consent-bearing,
redacted prompts stored in an operator-owned local file. Neither signal alone
is a claim that real user prompt quality is fully solved. See
`docs/BENCHMARK_V1.md` for the fixture contract.

## Release Smoke

Run the local release smoke before publishing or tagging a release:

```sh
corepack pnpm smoke:release
```

The smoke script builds the package, creates an isolated temporary data directory and HOME, starts the local server, captures fixture-like Claude Code and Codex prompts, verifies CLI list/search/show/delete/rebuild-index, checks SQLite WAL/FTS5, and confirms deleted prompt metadata is removed.

Browser regression smoke is also available:

```sh
corepack pnpm e2e:browser
```

It checks the archive, prompt detail, improvement draft copy/save flow, projects,
anonymized export, and mobile overflow against a real local server.

## Storage

`promptlane` treats Markdown as the source of truth and SQLite as an index.

Default files:

```text
~/.promptlane/config.json
~/.promptlane/hook-auth.json
~/.promptlane/promptlane.sqlite
~/.promptlane/prompts/
~/.promptlane/logs/
~/.promptlane/quarantine/
~/.promptlane/spool/
```

On POSIX systems, promptlane creates sensitive directories as `0700` and token/config files as `0600`.

## Privacy And Security

Default behavior:

- Prompt capture is local to `127.0.0.1`.
- Hook ingest uses a local bearer token stored in `hook-auth.json`.
- The browser UI uses a same-origin session cookie and CSRF token.
- Sensitive values are redacted before Markdown, SQLite, and FTS indexing in `mask` mode.
- External LLM analysis is never triggered as a hidden background call by
  `promptlane`. Optional MCP agent rewrite/judge workflows can return
  redacted prompt packets to the active user-controlled Claude Code, Codex, or
  Gemini CLI session when requested, and that agent may send the packet through
  its provider session according to the user's tool setup.
- PromptLane improvement drafts are copy-based. They do not automatically type into, replace, or resubmit prompts into Claude Code or Codex.
- Prompt Rewrite Guard is opt-in. In `block-and-copy` mode it blocks weak prompts and offers a copied local rewrite for manual paste/enter. In `context` mode it adds model-visible rewrite guidance but does not replace the original prompt.
- Settings and local diagnostics may show local filesystem paths to the local user. Browser prompt/archive/export surfaces mask prompt-body paths and avoid raw prompt identifiers.

Important limits:

- This tool stores prompts you submit to connected tools. Only enable hooks where you are allowed to store that content.
- Redaction is best-effort and should not be treated as a complete data loss prevention system.
- Deletion removes promptlane Markdown and SQLite rows, but it does not erase copies that may exist in terminal history, editor buffers, backups, filesystem snapshots, or the upstream AI tool transcript.
- This project does not extract, store, proxy, sell, or reuse Claude.ai OAuth tokens, Claude Code internal auth tokens, OpenAI/Codex session tokens, or ChatGPT account tokens.

## Remove Data

Remove a single prompt:

```sh
pnpm promptlane delete <prompt-id>
```

Remove hooks:

```sh
pnpm promptlane uninstall-hook claude-code
pnpm promptlane uninstall-hook codex
```

Remove all promptlane data:

```sh
rm -rf ~/.promptlane
```

Use your configured `--data-dir` path if you initialized promptlane somewhere else.

## Development

Run the full local gate:

```sh
corepack pnpm format
corepack pnpm test
corepack pnpm lint
corepack pnpm build
corepack pnpm pack:dry-run
corepack pnpm --silent benchmark -- --json
corepack pnpm e2e:browser
corepack pnpm smoke:release
corepack pnpm smoke:package-install
corepack pnpm evidence:quality -- --require-complete
corepack pnpm promptlane quality-evidence --require-complete
git diff --check
```

The dry-run package uses the local wrapper documented in
`docs/PACKAGE_CONTENTS.md`; it should include built CLI files, built web
assets, README, and release documentation.

See [Package contents](docs/PACKAGE_CONTENTS.md) before publishing to confirm
which files ship to npm, and [Pre-publish privacy audit](docs/PRE_PUBLISH_PRIVACY_AUDIT.md)
for the current privacy review checklist.

## Contributing

Please read [CONTRIBUTING](CONTRIBUTING.md), [CODE OF CONDUCT](CODE_OF_CONDUCT.md),
[SUPPORT](SUPPORT.md), and [SECURITY](SECURITY.md) before opening issues,
pull requests, or security reports.

## Documentation

- [PRD](docs/PRD.md)
- [Phase 2 PRD](docs/PRD_PHASE2.md)
- [Package contents](docs/PACKAGE_CONTENTS.md)
- [Pre-publish privacy audit](docs/PRE_PUBLISH_PRIVACY_AUDIT.md)
- [Efficiency review](docs/EFFICIENCY_REVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Tech spec](docs/TECH_SPEC.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Adapter guide](docs/ADAPTERS.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Security policy](SECURITY.md)

## License

MIT
