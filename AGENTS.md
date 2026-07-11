# AGENTS.md

이 문서는 Codex와 다른 코딩 에이전트가 이 저장소에서 작업할 때 따를 repo-level source of truth다. 기본 응답과 작업 메모는 한국어로 작성한다.

## 프로젝트 요약

- 제품명은 **LoopRelay**이다.
- npm package, 기본 CLI, hook command, Claude Code slash namespace, canonical MCP server name은 모두 `looprelay`다. 다른 제품 식별자나 호환 alias는 두지 않는다.
- 포지셔닝은 "local continuity and evidence layer for long-running Codex and Claude Code loops"다.
- 핵심 가치는 session/worktree/branch 상태를 복구하고, 다음 세션 continuation brief를 만들며, 요청과 성공·실패 outcome을 연결하고, 반복 실패 패턴과 필요한 질문을 드러내는 것이다. 승인된 lesson만 memory 또는 AGENTS.md 제안으로 전환한다.
- MVP 원칙은 local-first, explicit setup, fail-open hooks, redacted Markdown archive, SQLite index, no hidden provider calls, no automatic prompt resubmission이다.
- 현재 스택은 TypeScript, Node.js, Commander CLI, Fastify, SQLite, React/Vite, Vitest, Playwright, pnpm이다.

## 필수 문서 라우팅

- 구조 판단 전: `docs/ARCHITECTURE.md`
- 제품/LoopRelay 기획 판단 전: `docs/LOOPRELAY.md`, `docs/superpowers/specs/2026-07-05-looprelay-repositioning-design.md`
- 과거 LoopRelay 결정 확인 전: `docs/LOOPRELAY.md`
- LoopRelay/`looprelay` 문자열 추가 또는 변경 전: `docs/LOOPRELAY-RUNTIME-SURFACES.md`
- loop snapshot/schema/privacy 판단 전: `docs/LOOP-SNAPSHOT-SCHEMA.md`
- 현재 우선순위 확인: `docs/NEXT_BACKLOG.md`, `tasks/todo.md`
- Codex/Claude Code harness 판단 전: `docs/AGENT-HARNESS.md`
- AGENTS.md/CLAUDE.md 수정 전: `docs/INSTRUCTION-FILES.md`
- UI 작업 전: `DESIGN.md`
- plugin/adapter 변경 전: `docs/PLUGINS.md`, `docs/ADAPTERS.md`

## 작업 방식

- 3단계 이상이거나 아키텍처 판단이 필요한 작업은 먼저 계획하고 `tasks/todo.md`를 갱신한다.
- 구현은 TDD를 기본으로 한다. 실패 테스트를 먼저 만들고, 최소 구현으로 통과시킨 뒤 리팩터링한다.
- 사용자가 정정하거나 반복 실수를 지적하면 `tasks/lessons.md`에 재발 방지 규칙을 추가한다.
- 기존 패턴을 우선한다. 새 추상화는 실제 중복, drift, privacy risk, 테스트 불가능성을 줄일 때만 만든다.
- Node와 web TypeScript는 `noUnusedLocals`와 `noUnusedParameters`를 강제한다. 미사용 선언은 억제 주석으로 숨기지 말고 제거하거나 실제 공용 interface로 승격한다. `pnpm lint`는 Prettier 검사, 두 TypeScript 컴파일, 구조 품질 게이트를 모두 실행한다.
- 큰 파일인 `src/web/src/App.tsx`, `src/storage/sqlite.ts`, `src/mcp/score-tool.ts`는 가능한 한 작은 모델/formatter/helper로 분리하고 더 키우는 변경은 이유를 남긴다.

## 검증 명령

일상 변경은 focused-first로 검증한다. 변경한 seam의 직접 테스트와 아래 정적 검사를 먼저 실행하고, public runtime·패키징·브라우저 surface를 건드렸을 때만 해당 build, pack, UI 검사를 추가한다.

```bash
corepack pnpm lint
git diff --check
```

전체 `corepack pnpm test`와 release gate는 release 직전, 넓은 공용 seam 변경, 또는 focused 증거가 부족할 때만 확장한다. release gate는 공개 직전에 한 번만 실행한다.

웹 UI 또는 브라우저 동작 변경 후 추가 게이트:

```bash
corepack pnpm ui-patrol
```

npm package 또는 public runtime entrypoint 변경 후 추가 게이트:

```bash
corepack pnpm build
corepack pnpm pack:dry-run
```

Node 지원 범위는 `package.json#engines.node`가 authoritative하다. dependency update가 더 좁은 Node engine을 요구하면 package engine, README, local gate 정책을 함께 검토하기 전에는 머지하지 않는다.

## Privacy And Local-First Invariants

- 사용자 프롬프트 원문, 토큰, provider credential, cookie, compact summary, transcript body, raw local path를 stdout, stderr, server error, MCP result, web API, docs 예시에 노출하지 않는다.
- Hook은 fail-open이어야 한다. 실패가 Codex/Claude Code 작업을 막으면 안 된다.
- `UserPromptSubmit` stdout은 agent context 또는 사용자-visible output이 될 수 있으므로 특히 raw-free로 유지한다.
- Agent judge/rewrite 기능은 사용자가 제어하는 Codex/Claude Code/Gemini CLI 세션이 MCP로 redacted packet을 받아 평가하는 opt-in 흐름만 허용한다.
- `looprelay`가 provider 인증정보를 추출, 저장, proxy하거나 숨은 외부 LLM 호출을 해서는 안 된다.
- Loop snapshot은 prompt IDs, safe labels, counts, outcome metadata, approved memory metadata를 저장한다. raw transcript ingestion이나 private Codex/Claude state scraping은 금지한다.
- AGENTS.md/CLAUDE.md/project docs 변경은 proposal 또는 explicit confirmation이 있는 apply command로만 수행한다. 자동 instruction write는 금지한다.

## Architecture Boundaries

- `cli`, `server`, `hooks`, `mcp`, `web`은 entrypoint다.
- 재사용되는 규칙은 `analysis`, `loop`, `redaction`, `storage`, `shared` 같은 pure/domain boundary로 이동한다.
- CLI command 파일은 Commander 등록, orchestration, terminal formatting을 담당한다.
- Fastify route는 HTTP/auth/validation/response shaping에 집중한다. 저장소 접근은 storage port나 명확한 storage 함수로 제한한다.
- SQLite 변경은 migration/query/transaction, row contract, defensive JSON decoding 경계를 유지한다.
- MCP 변경은 tool/schema definition, TypeScript contract, handler/result shaping, JSON-RPC routing 경계를 유지한다.
- 새 public runtime entrypoint를 만들면 `package.json#files`, packaging tests, README/PLUGINS 문서까지 같이 갱신한다.

## Codex And Claude Code Integration

- Codex와 Claude Code는 부가 통합이 아니라 LoopRelay의 1급 실행 표면이다.
- Codex integration은 AGENTS.md, hooks, MCP, plugins, skills, worktrees, explicit automations를 기준으로 설계한다.
- Claude Code integration은 plugin components, skills/commands, hooks, MCP servers, monitors, `CLAUDE.md`를 기준으로 설계한다.
- 모든 public runtime ID는 `looprelay` 단일 identity를 사용한다. 별도 compatibility alias를 추가하지 않는다.
- Worktree/session 분석은 기존 loop snapshots와 git-safe metadata에서만 파생한다. private app DB나 raw transcript store를 읽는 방향으로 확장하지 않는다.

## UI And Design

- 이 제품은 운영형 developer tool이다. 마케팅 landing/hero보다 archive, loops, search, detail, settings, status diagnosis를 우선한다.
- 화면은 조용하고 밀도 있게 설계한다. 장식용 gradient/orb, 중첩 card, 과도한 rounded corner를 피한다.
- 구현 후 `corepack pnpm ui-patrol` 또는 Playwright 기반 실제 렌더링 확인으로 빈 화면, overflow, console/network 문제를 점검한다.

## Git

- 사용자가 만들었을 수 있는 변경은 되돌리지 않는다.
- `main`은 보호 브랜치다. 새 브랜치에서 작업하고 PR로 머지한다.
- 커밋 메시지는 Conventional Commits를 따른다.
- 커밋 단위는 너무 잘게 쪼개지지 않게 한다. 하나의 PR은 "검증 가능한 행동 변화", "문서/의사결정 단위", "dependency update" 중 하나로 묶는다.
- solo-maintainer 단계에서는 focused tests와 local gate가 통과하고 unresolved conversation이 없으면 머지할 수 있다. 일반 PR/main test CI는 사용하지 않는다.
- 최종 보고에는 커밋 해시, 푸시 여부, 검증 결과, 남은 리스크를 짧게 포함한다.
