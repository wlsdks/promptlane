# CLAUDE.md

Claude Code는 먼저 `AGENTS.md`를 읽고 따른다. 이 파일은 Claude Code 전용 차이만 기록한다.

## Claude Code 역할

- LoopRelay의 package, CLI, hook command, slash namespace, MCP server name은 모두 `looprelay`이며 별도 compatibility alias를 두지 않는다.
- Claude Code plugin/slash command 문서에서는 `/looprelay:*`를 canonical namespace로 유지한다.
- dedicated plugin rename plan 없이 command file, manifest, 또는 다른 slash alias를 추가하지 않는다.
- 기존 setup, hook, plugin command 예시는 `looprelay` 단일 identity를 유지한다.

## Hook And Stdout Safety

- Claude Code `UserPromptSubmit` stdout은 Claude 컨텍스트로 들어갈 수 있다.
- Hook stdout/stderr, MCP result, slash command 안내에는 prompt body, token, compact summary, transcript body, raw local path를 출력하지 않는다.
- Hook은 fail-open이어야 한다. capture, loop snapshot, compact boundary 기록이 실패해도 Claude Code 작업을 막지 않는다.
- Native dialog 또는 elicitation flow는 explicit opt-in이어야 하며, print-mode fallback과 실제 사용자 답변 수집 성공을 구분해서 보고한다.

## Plugin Expectations

- Claude Code plugin은 skills/commands, hooks, MCP server config, monitors를 묶는 배포 표면이다.
- Project-scope plugin이나 `.claude/settings.json` 변경은 trust/approval 경계를 고려한다.
- MCP write tool은 metadata-only 응답을 유지하고, draft body 검토와 복사는 local UI/CLI로 넘긴다.
- Subagent를 사용할 때는 병렬 탐색이나 리뷰처럼 context isolation 가치가 분명한 경우로 제한한다.

## Claude Code Verification

Claude Code integration을 변경하면 최소한 아래 중 관련 항목을 확인한다.

```bash
corepack pnpm smoke:mcp-coach-loop
corepack pnpm smoke:mcp-elicitation
corepack pnpm smoke:mcp-native-dialog
corepack pnpm smoke:hooks
corepack pnpm lint
```

관련 MCP/hook smoke와 focused Vitest를 먼저 실행한다. 전체 test suite는 넓은 공용 seam 변경 또는 release 직전에만 추가하며, 전체 release gate를 일상적인 Claude Code 변경에 사용하지 않는다.

실제 Claude Code dogfood는 `claude mcp list` 같은 health check만으로 완료 처리하지 않는다. 가능한 경우 `claude -p --output-format stream-json`에서 `mcp__looprelay__...` tool_use가 성공했는지 확인한다.

## Instruction File Changes

- AGENTS.md/CLAUDE.md 변경 전 `docs/INSTRUCTION-FILES.md`를 읽는다.
- Claude-specific 내용만 이 파일에 둔다.
- 공통 제품/아키텍처/검증 규칙은 `AGENTS.md` 또는 `docs/*`로 보낸다.
- LoopRelay memory에서 instruction patch를 만들 때도 proposal과 explicit apply gate를 유지한다.
