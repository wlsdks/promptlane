# LoopRelay Architecture

LoopRelay is the local continuity and evidence layer for long-running Claude Code
and Codex loops. It keeps work recoverable across sessions, worktrees, branches,
and compact boundaries. The npm package and CLI command are `looprelay`. The architecture
is intentionally modular without copying a
Spring-style class hierarchy into Node.js. The project uses TypeScript modules,
plain functions, explicit ports, and small runtime entrypoints.

## Runtime Model

- Node.js runs the CLI, local server, hook wrapper, MCP server, import/export
  jobs, and release scripts.
- The package is ESM (`"type": "module"`) and the server build uses
  `module: NodeNext` / `moduleResolution: NodeNext`.
- Browser UI code is compiled separately with Vite and `moduleResolution:
Bundler`.
- The npm package ships `dist/`, web assets, plugin files, command docs, and
  operational docs. Runtime users should not need TypeScript or Vite.

Node.js package entrypoints should stay explicit. If library-style imports are
added later, define them through package `exports` instead of exposing arbitrary
internal files.

Both TypeScript projects enforce `noUnusedLocals` and `noUnusedParameters`.
This turns unused imports and abandoned local branches into a compile-time
failure rather than review debt. Keep a declaration only when it contributes to
an intentional exported interface or a tested runtime entrypoint.

`pnpm lint` is the repository's complete fast hygiene check: it runs Prettier
verification first, then both TypeScript compilers and the structural quality
gate. Run a focused test before it; do not rely on a successful typecheck to
hide formatting or source-hygiene drift.

References:

- Node.js package entry points and `exports`:
  https://nodejs.org/api/packages.html#package-entry-points
- TypeScript modules:
  https://www.typescriptlang.org/docs/handbook/2/modules.html
- TypeScript Node module theory:
  https://www.typescriptlang.org/docs/handbook/modules/theory.html

## Module Boundaries

```text
src/
  adapters/    external hook payload -> normalized prompt events
  analysis/    deterministic local scoring, coaching, improvement logic
  cli/         Commander commands and terminal formatting
  config/      local config, tokens, path initialization
  exporter/    anonymized export preview and execution
  hooks/       fail-open hook wrapper and delivery status
  importer/    markdown/source import and dry-run planning
  loop/        loop snapshots, continuation briefs, and local agent-loop summaries
  mcp/         MCP tool definitions, typed contracts, handlers, and stdio server
  redaction/   secret detection and redacted prompt representations
  server/      Fastify routes, auth, browser/API boundary
  shared/      shared schemas, ids, hashing, version helpers
  storage/     SQLite/Markdown persistence, row contracts, JSON decoders, and storage ports
  web/         React app, browser-only models, styles, charts
```

The direction of dependency should normally be:

```text
entrypoints -> orchestration -> domain/local services -> storage/shared
```

Entry points are `cli`, `server`, `hooks`, `mcp`, and `web`. They may orchestrate
work but should not own domain rules that need to be reused elsewhere. Shared
rules such as scoring, redaction, project instruction review, and archive
analysis belong in `analysis`, `redaction`, or `storage`.

`src/loop/` owns privacy-safe loop snapshot collection, snapshot domain rules,
and continuation brief formatting. It may consume prompt summaries and storage
ports, but it must not read raw transcripts, provider credentials, or private
agent state databases. CLI, MCP, hook, and web surfaces should call into
`src/loop/` instead of formatting loop state independently.

## Spring-To-Node Translation

For contributors coming from Spring:

| Spring habit             | Node/TypeScript equivalent in this repo                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Controller               | Fastify route module in `src/server/routes/*`                                                   |
| Service                  | Pure function module in `src/analysis/*`, `src/exporter/*`, or `src/importer/*`                 |
| Repository               | `src/storage/ports.ts` plus `src/storage/sqlite.ts` (and `sqlite-migrations.ts` for schema/DDL) |
| DTO / validation         | Zod schemas and exported TypeScript types in `src/shared/schema.ts`                             |
| Configuration bean       | Explicit functions in `src/config/*`                                                            |
| Scheduled/background job | CLI script or command with explicit input/output                                                |
| Aspect/interceptor       | Fastify hook/auth helper or CLI wrapper, not hidden global behavior                             |

Prefer plain modules and explicit function parameters over container-style
dependency injection. When a dependency must be swappable, define a small port
interface and pass it into the function that needs it.

## File Size And Extraction Rules

Large files are allowed when they protect a cohesive local boundary, but new
code should avoid making the largest files larger unless the change genuinely
belongs there.

Use these extraction rules:

- If a function is reused by CLI, web, MCP, or server, move it out of the
  entrypoint layer.
- If a route or command starts formatting complex domain output, split
  formatting from data creation.
- If a SQLite helper grows because of one feature area, consider a focused
  module such as `storage/<feature>.ts` or an internal helper near the query
  group.
- If a React component grows because it contains browser-only domain logic,
  move that logic into `src/web/src/<feature>.ts` and test it separately.
- `src/web/src/api.ts` is a transport facade, not a home for feature UI logic.
  When a domain's request/response contract becomes hard to change locally,
  extract a domain API module and re-export its public interface deliberately;
  do not force all callers to know private response validators.
- If code touches prompt bodies, tokens, raw paths, or hook payloads, keep the
  privacy boundary explicit in the function name, type, or test.

Current known large modules:

- `src/web/src/App.tsx`: UI composition hub. New browser models should live in
  separate files and be imported into the app.
- `src/web/src/api.ts`: browser-side API client for every server route. Keep
  request shaping here; render and copy logic stay in components. Its quality
  budget is intentionally tight; extract a feature contract before a new
  response parser materially expands it.
- `src/web/src/i18n.ts`: web UI translation table. Korean strings stay grouped
  by screen so a single localization change touches one section.
- `src/storage/sqlite.ts`: SQLite implementation boundary for queries,
  transactions, and storage-port assembly. Keep migrations, row contracts, and
  JSON decoding out of this file. Its budget intentionally leaves little room
  for new helpers; feature-specific SQL predicates belong in a focused module.
- `src/storage/sqlite-migrations.ts`: schema/DDL and the `applyMigrations`
  orchestrator plus the in-file `apply*Migration` helpers. Per-domain
  migrations (`agent-judgments.ts`, `coach-feedback.ts`, `judge-score.ts`)
  keep their migrations next to their domain code and are imported here.
- `src/storage/sqlite-rows.ts`: SQLite result-row contracts only. Do not add
  queries or mappers here.
- `src/storage/sqlite-json.ts`: defensive JSON decoding for SQLite JSON
  columns. Keep malformed data fail-safe and covered by unit tests.
- `src/storage/sqlite-prompt-filters.ts`: the sole prompt list/search SQL
  predicate builder. Keep alias handling, date bounds, and filter-value order
  here; `sqlite.ts` only supplies the query-specific cursor and execution.
- Storage capability decisions are governed by
  `docs/adr/0002-storage-capability-registry.md`: future storage-backed
  routes and MCP tools should declare required capabilities at registration,
  with a shared guard helper allowed as an intermediate migration step.
- `src/mcp/score-tool-definitions.ts`: agent-facing MCP names, descriptions,
  input schemas, output schemas, and safety annotations.
- `src/mcp/score-tool-types.ts`: argument/result TypeScript contracts for MCP
  handlers and tests.
- `src/mcp/score-tool.ts`: MCP handler orchestration and privacy-safe result
  shaping. Do not add tool schemas here.
- MCP layout decisions are governed by
  `docs/adr/0001-mcp-per-tool-modules.md`: new tools default to per-tool
  modules, while existing split-layout tools stay put until feature or
  risk-driven work touches them.
- `src/mcp/tool-registry.ts`: explicit MCP definition/handler pairs. Both
  `tools/list` and `tools/call` derive from this array; tool modules must not
  register themselves through import-time mutation.
- `src/mcp/server.ts`: JSON-RPC stdio transport and tool-call routing only.
- `src/hooks/rewrite-guard.ts`: hook decision logic only (mode dispatch,
  language detection, clipboard side effect, ask-mode trigger gate +
  acknowledgment patterns). Bilingual user-facing strings live in
  `src/hooks/rewrite-guard-copy.ts` so the budget stays under 290 lines.
- `src/cli/agent-wrapper.ts`: lr-claude/lr-codex argv parsing, prompt
  rewriting, and child-process spawning. New domain logic should land in a
  helper module rather than expanding the wrapper.
- `src/cli/commands/loop.ts`: Commander registration and loop-command
  orchestration. Its user-visible terminal rendering lives in
  `src/cli/commands/loop-formatters.ts`; keep new text-only formatting there
  so storage selection and CLI wiring remain independently reviewable.

### Shared helpers

Small focused modules that exist so the same primitive isn't redefined in
multiple places. Check these before adding a new derivation, hash, or
formatter:

- `src/storage/project-id.ts`: `createProjectKey(sourcePath, hmacSecret)` —
  the canonical `proj_…` derivation used by storage policy lookups and
  anonymized export.
- `src/storage/project-label.ts`: storage-style human label for a project
  path (strip trailing slashes, take last `/`-segment, fall back to
  `unknown`). Used by storage and exporter.
- `src/mcp/project-label.ts`: MCP-side variant of the label helper
  (`[\\/]` separator handling, fall back to `project`). Used by all three
  MCP scoring/agent tools. Intentionally distinct from the storage variant
  because the agent-facing surface needs Windows-aware paths and a
  generic-friendly fallback.
- `src/adapters/idempotency.ts`: `buildIdempotencyKey(tool, sessionId, parts)`
  — the `tool:sessionId:sha256-16` format shared by every prompt adapter.
- `src/shared/clamp-score.ts`: `clampScore(score)` — round and clamp a
  raw score into the `[0, 100]` integer band. Used by judge persistence,
  the auto-judge worker, the rewrite-guard hook, and CLI flag parsers
  that accept a `--rewrite-min-score` value.
- `src/shared/time.ts`: `MINUTE_MS`, `HOUR_MS`, `DAY_MS`, plus
  `compactTimestamp` for the `prmt_…` id format. Use the constants
  instead of repeating `60 * 60 * 1000`.
- `src/shared/shell-quote.ts`: `quoteForShell(value)` for copyable local command
  examples and recovery hints. Use it before rendering argv-like strings that
  may include user-controlled labels or paths.

These are not release blockers by themselves, but new work should reduce
pressure on them rather than expanding them casually. The line-budget gate in
`scripts/quality-gate.mjs` is the enforcing rail.

## Privacy And Local-First Boundaries

- Hook capture is fail-open. The wrapper still records a failed
  `last_ingest_status` so `doctor` can surface the failure without leaking
  prompt content.
- Hook stdout must not include prompt bodies because some clients may treat it
  as context.
- CLI, MCP, server errors, docs examples, and status lines must not print raw
  prompt bodies, raw absolute paths, tokens, hook payloads, or instruction file
  bodies. `/api/v1/health` returns only `{ ok, version, instance_id }` and never
  the local data directory. `instance_id` is a random per-server-boot UUID used
  only to deduplicate explicit `SessionStart --open-web` behavior.
- Direct MCP prompt input is analyzed locally and is not stored.
- Stored prompt scoring returns metadata, score, checklist (per-axis status,
  reason, suggestion, earned/weight), and an optional `redaction_notice`,
  but never the stored original body.
- Agent-judge MCP mode is explicit and user-session mediated. `looprelay`
  can prepare locally redacted prompt packets and store advisory judgment
  metadata, but it must not launch hidden provider calls, proxy provider
  credentials, or store raw prompt bodies for judgments.
- Markdown remains the human-readable archive source of truth.
- SQLite/FTS is the index and query layer; delete and rebuild flows must keep
  Markdown, DB rows, FTS rows, tags, analysis, drafts, judgments, and events
  coherent.
- `src/shared/version.ts` `VERSION` must equal `package.json#version`. The
  vitest in `src/shared/version.test.ts` is the release gate.
- The redaction detector list in `src/redaction/detectors.ts`,
  `docs/PRE_PUBLISH_PRIVACY_AUDIT.md`'s grep pattern, and the privacy
  regression fixture in `src/security/privacy-regression.test.ts` must agree
  on which token shapes are masked.

## Testing Expectations

Use risk-based coverage:

- Domain logic: direct Vitest unit tests.
- Storage changes: SQLite integration tests and privacy regression checks.
- CLI changes: command help, JSON output, text output, and real built CLI smoke
  when behavior matters.
- MCP changes: tool list, schemas, `structuredContent`, and privacy-safe
  result tests.
- Web changes: model unit tests plus browser E2E/screenshots when UI changes.
- Packaging changes: `corepack pnpm pack:dry-run` and plugin package tests.

The normal release gate is:

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
corepack pnpm looprelay quality-evidence --require-complete
git diff --check
```

`corepack pnpm smoke:package-install` also verifies the installed
`looprelay start --open-web --json` first-success guide from an isolated npm
prefix.
