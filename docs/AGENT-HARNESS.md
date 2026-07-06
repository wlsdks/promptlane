# Agent Harness

Last updated: 2026-07-05

This document defines PromptLane's Codex and Claude Code integration contract.
Current repeatable dogfood evidence is recorded in
`docs/DOGFOOD_CODEX_CLAUDE_2026-07-05.md`.
It complements `AGENTS.md`, `CLAUDE.md`, and the PromptLane product contract.

## Product Boundary

PromptLane is not a generic agent runtime. It is a local-first prompt
improvement workspace for coding-agent work that already happens in Codex,
Claude Code, and similar tools. Loop features are loop-aware continuation for the
next prompt, not autonomous agent control.

The harness should provide:

- prompt capture and redacted archive lookup
- loop snapshots across sessions, branches, and safe worktree labels
- continuation briefs for the active agent
- review-before-merge status for multi-worktree activity
- user-approved memory and instruction patch proposals
- setup/status diagnostics for hooks, MCP, plugin commands, and local server

The harness must not provide:

- hidden external LLM calls
- provider credential proxying
- raw transcript scraping from private app state
- automatic prompt resubmission
- automatic merge/rebase/branch checkout
- automatic writes to AGENTS.md, CLAUDE.md, or project docs

## Codex Surfaces

Use Codex's current durable surfaces:

- `AGENTS.md` for repo guidance
- project/user config for trusted setup
- lifecycle hooks for prompt capture and loop boundary metadata
- MCP for agent-readable tools and structured status
- plugins and skills for packaged workflows
- worktree metadata from git-safe local inspection and explicit loop snapshots
- automations only through explicit user setup

Codex-facing setup should keep these commands working:

```bash
corepack pnpm promptlane setup --profile coach --register-mcp --open-web
corepack pnpm promptlane doctor codex
corepack pnpm smoke:agent-setup
corepack pnpm dogfood:first-coach-loop
corepack pnpm dogfood:loop-memory-approval
corepack pnpm promptlane loop status
corepack pnpm promptlane loop collect
corepack pnpm promptlane loop brief
```

Acceptance criteria:

- Hook failures are fail-open.
- Hook output is raw-free.
- MCP status and brief tools return structured, local-only data.
- Worktree awareness is derived from git-safe labels and existing snapshots.
- No feature reads private Codex databases or raw transcript stores.
- Any scheduled collection is opt-in and calls explicit `promptlane` commands.

## Claude Code Surfaces

Use Claude Code's plugin-oriented surfaces:

- plugin skills and command markdown files
- hooks for capture and lifecycle metadata
- MCP server config for PromptLane tools
- optional monitors only when they are explicit and local
- `CLAUDE.md` for Claude-specific caveats, with `AGENTS.md` as the shared rule
  file

Claude-facing setup should keep these commands and checks working:

```bash
corepack pnpm promptlane doctor claude-code
corepack pnpm smoke:agent-setup
corepack pnpm dogfood:first-coach-loop
corepack pnpm dogfood:loop-memory-approval
corepack pnpm smoke:mcp-coach-loop
corepack pnpm smoke:mcp-elicitation
corepack pnpm smoke:mcp-native-dialog
corepack pnpm smoke:hooks
```

Acceptance criteria:

- `/promptlane:*` remains the supported slash namespace during the migration.
- `/promptlane:*` is not added until a dedicated namespace migration plan is
  implemented.
- MCP write flows return metadata-only responses.
- User-visible or model-visible hook output does not include raw prompt bodies,
  compact summaries, transcripts, tokens, or raw local paths.
- Native dialog or elicitation paths clearly distinguish transport success from
  actual user-answer collection.

## MCP Tool Contract

PromptLane MCP tools are an agent-readable local API for prompt improvement and
loop-aware continuation.

Required properties:

- use structured content where supported
- include clear `next_action` or `next_actions` fields for human approval paths
- expose `score_prompt effectiveness evidence` for stored prompt ids when linked
  loop outcomes exist, including raw-free verdict, evidence refs, and
  calibration counts
- expose archive-level `effectiveness_summary` through `score_prompt_archive`
  so agents can judge measured vs unmeasured prompts, proven/mixed/unproven
  counts, linked outcome counts, tests run, safe evidence refs, and next action
  before treating prompt-score improvements as actual workflow improvement
- route the same archive effectiveness coverage into `coach_prompt` agent
  briefs so the default one-call Codex/Claude Code path tells the agent to
  review unmeasured prompts before claiming archive-wide improvement
- return explicit unavailable/setup guidance instead of transport-level crashes
- avoid raw prompt bodies, compact summaries, transcripts, raw local paths,
  secret-looking tokens, and provider credentials
- keep old `promptlane` tool/server compatibility during the PromptLane
  compatibility window

Write-capable tools must require explicit user-approved arguments when they
affect local state. Instruction-file writes require an explicit apply gate.

## Hook Contract

Hooks are for capture and loop boundary metadata, not for autonomous execution.

Required properties:

- fail-open by default
- bounded runtime
- no hidden network calls
- no prompt auto-submission
- no raw prompt, transcript, compact summary, or raw path output
- same privacy assertions in tests and smoke scripts

Allowed hook events:

- prompt submit capture where configured
- stop/compact boundary collection
- safe loop snapshot updates
- status hints that do not block agent work

Disallowed hook behavior:

- rewriting user prompts in place without approval
- printing large guidance blocks into Codex/Claude visible output
- opening dialogs without explicit opt-in
- reading private app state or provider credentials

## Verification Matrix

Use the narrowest relevant gate first, then broaden before PR.

| Change type           | Minimum verification                                        |
| --------------------- | ----------------------------------------------------------- |
| MCP tool/schema       | `corepack pnpm test -- src/mcp`, relevant smoke script      |
| Hook behavior         | `corepack pnpm smoke:hooks`, focused hook tests             |
| Loop CLI/status/brief | `corepack pnpm test -- src/loop src/cli`                    |
| Web Loops UI          | `corepack pnpm ui-patrol` plus focused web tests            |
| Web user-flow dogfood | `corepack pnpm dogfood:web-user-flow` and `docs/DOGFOOD_WEB_USER_FLOW_2026-07-05.md` |
| Plugin/packaging      | `corepack pnpm pack:dry-run`, package contents tests        |
| Instruction docs      | `git diff --check`, packaging docs tests if shipped         |
| Dependency update     | local test/lint/build/pack gate, engine compatibility review |

Full gate before merge unless the change is docs-only and the risk is clearly
bounded:

```bash
corepack pnpm test
corepack pnpm lint
corepack pnpm build
corepack pnpm pack:dry-run
git diff --check
```

## External Design References Reviewed

This harness strategy is aligned with the 2026-07 public direction of:

- Codex project guidance, hooks, MCP, plugins, skills, worktrees, and explicit
  record/replay workflows
- Claude Code plugins as bundles of skills, agents, hooks, MCP servers, LSP
  servers, and monitors
- OpenAI Agents SDK tracing and harness patterns for agent runs, tools,
  memory, sandboxed workspaces, and evaluation
- Google ADK's separation of durable state from the compiled working context

These references are design inputs, not implementation dependencies. Re-check
current official docs before changing hook, plugin, MCP, or automation behavior.

Reviewed references:

- Codex AGENTS.md:
  <https://developers.openai.com/codex/guides/agents-md>
- Codex hooks:
  <https://developers.openai.com/codex/hooks>
- Codex MCP:
  <https://developers.openai.com/codex/mcp>
- Codex worktrees:
  <https://developers.openai.com/codex/app/worktrees>
- Codex Record & Replay:
  <https://developers.openai.com/codex/record-and-replay>
- Claude Code plugin reference:
  <https://code.claude.com/docs/en/plugins-reference>
- OpenAI Agents SDK tracing:
  <https://openai.github.io/openai-agents-python/tracing/>
- OpenAI Agents SDK harness update:
  <https://openai.com/index/the-next-evolution-of-the-agents-sdk/>
- Google context-aware multi-agent framework:
  <https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/>
