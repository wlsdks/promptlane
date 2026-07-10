# PromptLane

[English](README.md) | [한국어](README.ko.md)

**Claude Code, Codex, 장기 coding-agent 작업을 위한 local-first prompt improvement workspace.**

- 🗂️ Claude Code / Codex에 보낸 모든 prompt를 로컬 Markdown + SQLite에
  보관합니다 — 외부로 나가지 않습니다.
- 🧠 각 prompt를 5개 기준으로 0–100점 평가하고 어떤 항목에서 점수가
  깎였는지 알려줍니다. 추측 대신 학습합니다.
- ✍️ 자동 재제출 없이 복사해서 바로 쓸 수 있는 개선안 초안을 만들어
  줍니다 (영어/한국어 자동 감지).
- 🔁 장기 agent 작업에서는 승인된 lesson과 loop snapshot을 다음 요청
  작성에 재사용합니다.

npm package가 publish된 뒤:

```sh
npm install -g promptlane
promptlane setup --profile coach --register-mcp --open-web
# Codex 또는 Claude Code에 prompt 한 번 보낸 뒤:
promptlane coach
```

그 전에는 local checkout에서 같은 첫 coach loop를 실행합니다:

```sh
git clone https://github.com/wlsdks/promptlane.git
cd promptlane
pnpm install
pnpm setup
pnpm promptlane coach
```

PromptLane은 Claude Code, Codex 같은 AI 코딩 도구에 입력한 프롬프트와 loop metadata를 안전하게 로컬에 기록하고, 나중에 다시 찾고, 반복되는 약한 프롬프트 패턴을 분석하고, 다음 요청을 더 잘 쓰도록 돕는 developer tool입니다. npm package, 기본 CLI, MCP server name, hook command, plugin identity는 `promptlane`입니다.

script, terminal command, MCP registration, plugin command에는 `promptlane`를 사용합니다. Claude Code slash command는 active `/promptlane:*` namespace로 제공됩니다.

지원되는 도구의 프롬프트를 로컬에서 수집하고, 민감값을 저장 전에 마스킹하고, 사람이 읽을 수 있는 Markdown을 원본으로 남기며, SQLite/FTS 인덱스와 로컬 웹 UI를 통해 검색, 상세 보기, 누적 점수 측정, 프롬프트 연습, 분석, 삭제, 승인형 PromptLane 개선안을 제공합니다.

loop 기능은 loop-aware continuation입니다. worktree, session, branch,
snapshot context를 안전하게 골라 다음 prompt를 더 잘 쓰게 돕지만,
PromptLane을 자동 agent runtime, transcript scraper, merge bot으로 만들지
않습니다.

이 프로젝트는 Anthropic, OpenAI 또는 다른 AI 도구 제공사와 제휴, 보증, 후원 관계가 없습니다. Claude Code, Codex 같은 제품명은 호환성을 설명하기 위해서만 사용합니다.

## 첫 3분 Coach Loop

첫 성공은 웹 dashboard가 아닙니다. 방금 Codex 또는 Claude Code에 보낸
실제 prompt의 점수와 바로 고칠 한 가지를 확인하는 것입니다.

대부분의 사용자는 아래 happy path로 시작하면 됩니다.

```sh
promptlane start --open-web
promptlane setup --profile coach --register-mcp --open-web
# 실제 Codex 또는 Claude Code coding prompt를 하나 보냅니다
promptlane coach
```

새 agent session마다 웹 workspace가 자동으로 열리는 것이 싫다면
`--open-web`은 빼고 시작하세요.

아래는 이 happy path가 실패했을 때만 확인하세요.

```sh
promptlane doctor claude-code
promptlane doctor codex
```

MCP 등록이 실패했다면 먼저 one-command setup을 다시 실행하세요.

```sh
promptlane setup --profile coach --register-mcp --open-web
```

수동 `claude mcp add` / `codex mcp add` 명령은 고급 troubleshooting에만
사용하세요. `setup --register-mcp`는 현재 CLI entrypoint를 사용하므로 더
안전합니다. clone한 checkout에서는 절대 Node + `dist/` 경로를 등록해 Codex가
전역 `promptlane` PATH에 의존하지 않게 합니다.

로컬 archive는 dashboard, 검색, history review, export가 필요할 때만
열면 됩니다.

## 상태

PromptLane 1.0.0은 local-first Claude Code 및 Codex prompt memory workflow를
위한 첫 stable public release 라인입니다.

- Claude Code 지원: MVP 경로
- Codex 지원: beta adapter
- 로컬 rule-based 분석 preview: 구현됨
- Prompt Quality Score: 로컬 deterministic `0-100` rubric으로 구현됨
- MCP prompt scoring tools: 로컬 stdio server로 구현됨
- 승인형 PromptLane 개선안: raw-free 다음 요청 브리프 복사까지 구현됨
- Prompt Practice 작업면: 초안 본문을 저장하지 않는 로컬 작성/점수
  history와 outcome feedback UI로 구현됨
- Transcript import: CLI 중심
- 익명화 export: 웹 UI와 CLI preview/job 흐름
- Benchmark v1: 로컬 회귀 baseline
- English/Korean 웹 UI: 구현됨
- 외부 LLM 분석: `promptlane`의 숨은 provider 호출 없음. 명시적으로
  요청한 경우에만 MCP agent rewrite/judge packet이 현재 사용자가 제어하는
  Claude Code/Codex/Gemini CLI provider 세션으로 들어갈 수 있음
- 기본 데이터 처리: 로컬 전용

## 요구사항

- Node.js `>=22.12 <25`
- pnpm `10.x`
- `better-sqlite3`가 지원하는 플랫폼

local release gate는 Node 22와 Node 24에서 검증합니다.

## 빠른 시작

구성은 두 부분입니다.

1. `promptlane` CLI: 로컬 서버, hook, 저장소, 웹 UI를 담당합니다.
2. Claude Code 또는 Codex marketplace plugin: setup/status/open 흐름을 쉽게 실행하게 돕습니다.

marketplace plugin은 CLI binary를 자동 설치하지 않습니다. 먼저 CLI를 설치한 뒤 marketplace를 추가하세요.

아래 예시는 publish된 CLI 명령 `promptlane`를 기준으로 합니다. 이 저장소를
clone해서 개발 모드로 실행할 때만 `pnpm promptlane`를 사용하세요.

### 1. CLI 설치

패키지 publish 이후:

```sh
npm install -g promptlane
```

이 저장소에서 로컬 개발로 실행:

```sh
git clone https://github.com/wlsdks/promptlane.git
cd promptlane
pnpm install   # prepare lifecycle이 dist도 함께 build합니다
pnpm setup     # Claude Code + Codex hook, MCP, status line, service를 설치합니다
```

`pnpm install`은 `prepare` lifecycle을 통해 `pnpm build`를 실행하므로, fresh
checkout도 install이 끝나면 동작하는 `dist/`를 갖습니다.

`pnpm setup`은
`pnpm promptlane setup --profile coach --register-mcp --open-web`의 alias입니다.
감지된 agent(Claude Code와 Codex)를 연결하고, MCP server를 절대 경로로
등록하며, Claude Code status line을 설치하고, 세션 시작 시 로컬 server가
준비되도록 합니다.

### 2. Claude Code Marketplace 추가

Claude Code 안에서:

```text
/plugin marketplace add wlsdks/promptlane
/plugin install promptlane
/reload-plugins
/promptlane:setup
```

`/promptlane:setup`은 CLI 사용 가능 여부를 확인하고, `promptlane setup --profile coach --register-mcp --dry-run`을 먼저 실행한 뒤, 설정 파일을 쓰기 전에 사용자의 승인을 받습니다.

### 3. Codex Marketplace 추가

쉘에서:

```sh
codex plugin marketplace add wlsdks/promptlane
```

그 다음 로컬 coach setup을 실행합니다.

```sh
promptlane setup --profile coach --register-mcp --open-web
```

Codex는 marketplace 관리를 `codex plugin marketplace add/upgrade/remove`로 제공합니다. 프롬프트 capture hook은 `promptlane setup`이 Codex hook config를 쓰고 Codex hooks를 활성화하면서 설치합니다.

### 4. Capture 확인

```sh
promptlane doctor claude-code
promptlane doctor codex
promptlane doctor codex --json
promptlane statusline claude-code
promptlane buddy --once
promptlane coach
```

자동화에서는 `doctor --json`의 top-level `status`가 `ready` 또는
`needs_attention`으로 나오므로 nested readiness check를 다시 계산하지 않아도
됩니다.

로컬 archive 열기:

```text
http://127.0.0.1:17373
```

## 지원 플랫폼

release validation은 local-first이며 현재 기준은:

- Node.js 22와 24
- 아래에 문서화된 local release gate
- maintainer machine의 local browser, release, package smoke

Linux x64는 현재 local gate로 직접 검증되는 primary development environment입니다. macOS, Linux arm64, Windows 지원을 목표로 하지만 broad platform claim을 하려면 `better-sqlite3`, 파일 권한, hook command 동작에 대한 명시적인 maintainer/operator smoke 검증이 더 필요합니다.

## 설치 (Development Checkout)와 setup 옵션 reference

이 섹션은 contributor와 모든 `setup` 옵션이 필요한 사용자를 위한 reference입니다.
npm으로 설치한 일반 사용자는 위의 [빠른 시작](#빠른-시작)을 따라가면 됩니다.

agent marketplace 흐름 없이 로컬 개발로 설치:

```sh
pnpm install
pnpm build
pnpm promptlane setup --profile coach --register-mcp
```

`setup`은 의도적으로 명시적입니다. npm/pnpm package 설치만으로 Claude Code 또는 Codex 설정을 조용히 수정하거나, login service를 설치하거나, 로컬 background server를 시작하지 않습니다. `promptlane setup --profile coach`가 사용자의 동의 단계이며, hook capture, 낮은 마찰의 rewrite guidance, Claude Code status line, 로컬 server startup을 한 번에 준비합니다. 기존 Claude Code status line이 있으면 덮어쓰지 않고 하나의 chained command 안에서 함께 실행하며, 제거 시 가능한 경우 이전 command를 복구합니다. `--register-mcp`를 붙이면 감지된 Claude Code/Codex CLI에 `promptlane mcp`도 함께 등록합니다.

dry-run으로 변경 사항만 preview:

```sh
pnpm promptlane setup --profile coach --register-mcp --dry-run
```

agent를 시작할 때 웹 workspace도 같이 열고 싶으면 명시적으로 opt-in합니다.

```sh
pnpm promptlane setup --profile coach --register-mcp --open-web
```

이 옵션은 기본값이 아닙니다. `SessionStart` hook을 설치해 로컬 server를
확인하고, 실행 중인 server boot마다 브라우저를 최대 한 번만 엽니다. health의
무작위 boot UUID(`instance_id`)는 이 중복 방지에만 사용하며
user/project/session 식별자가 아닙니다. hook은 fail-open이며 prompt 본문, raw
path, token을 stdout/stderr에 출력하지 않습니다.

프롬프트 coaching 없이 수동 capture만 원하면 기본 profile을 사용합니다.

```sh
pnpm promptlane setup
```

background service를 원하지 않으면:

```sh
pnpm promptlane setup --no-service
pnpm promptlane server
```

웹 UI URL은 빠른 시작과 동일합니다: `http://127.0.0.1:17373`.

기본 데이터 위치:

```text
~/.promptlane
```

다른 위치를 쓰려면:

```sh
pnpm promptlane init --data-dir /path/to/promptlane-data
```

## 로컬 서버 시작

```sh
pnpm promptlane server
```

기본 주소:

```text
http://127.0.0.1:17373
```

브라우저에서 위 주소를 열면 웹 UI를 사용할 수 있습니다.

macOS에서는 `setup`이 LaunchAgent를 설치해서 로그인 시 서버를 자동 시작할
수 있습니다. 직접 관리도 가능합니다:

```sh
pnpm promptlane service install
pnpm promptlane service status
pnpm promptlane service start
pnpm promptlane service stop
```

`service status --json`은 안정적인 `error_code`와 raw-free 복구 안내를
반환합니다. LaunchAgent가 없으면 `not_loaded`로 분류하고 `service install`을
안내합니다.

## Claude Code 연결

Claude Code hook 설치:

```sh
pnpm promptlane install-hook claude-code
```

선택 기능: Prompt Rewrite Guard

```sh
pnpm promptlane install-hook claude-code --rewrite-guard block-and-copy --rewrite-min-score 80
```

선택 기능: 웹 자동 open

```sh
pnpm promptlane install-hook claude-code --open-web
```

`block-and-copy`는 공식 `UserPromptSubmit` decision 흐름만 사용합니다.
점수가 낮은 prompt는 Claude Code가 처리하기 전에 block하고, 로컬 개선안을
보여주며 clipboard 복사를 best-effort로 시도합니다. 터미널에 자동 입력하거나
Enter를 누르거나 composer 내용을 비공식적으로 바꾸지는 않습니다. 로컬 ingest
server가 꺼져 있거나 ingest가 실패하면 hook은 fail-open으로 prompt를 막지
않습니다.

`--rewrite-guard` 플래그는 네 가지 모드를 받습니다.

- `off` — capture만; coaching이나 blocking 없음
- `context` — soft. 개선된 draft를 `additionalContext`로 사용자 prompt와 함께
  주입합니다. Claude는 둘 다 봅니다
- `ask` — 답변 전에 agent가 한두 개의 clarifying question을 묻도록 지시합니다.
  Claude Code에서는 native `AskUserQuestion` tool을 사용하고, Codex에서는
  native OS dialog fallback이 있는 `ask_clarifying_questions` MCP tool을
  호출합니다
- `block-and-copy` — 위 설명 참고

`ask` 모드가 발동하면 promptlane가 이벤트(tool, score, band, missing axes,
language, prompt length)를 로컬에 기록하고, 대시보드의 7일 **Ask mode**
패널에 노출합니다. trigger gate(`length ≥ 30`, `score < 60`, ack 패턴 아님)가
적절한 경우에 작동하는지 확인할 수 있습니다.

설정 변경 preview:

```sh
pnpm promptlane install-hook claude-code --dry-run
```

진단:

```sh
pnpm promptlane doctor claude-code
```

`doctor`는 로컬 server 접근성, ingest token, hook 설치, MCP command access를
확인합니다. MCP는 알려진 로컬 config 파일을 먼저 보고, 필요하면 read-only
`claude mcp list`로 한 번 더 확인합니다.

hook 제거:

```sh
pnpm promptlane uninstall-hook claude-code
```

installer는 Claude Code settings 파일에 promptlane command를 쓰고, 기존 파일이 있으면 backup을 만듭니다. hook command에는 ingest token이 포함되지 않습니다.

## Codex Beta 연결

Codex hook 지원은 beta입니다.

Codex hook 설치:

```sh
pnpm promptlane install-hook codex
```

선택 기능: Prompt Rewrite Guard

```sh
pnpm promptlane install-hook codex --rewrite-guard block-and-copy --rewrite-min-score 80
```

선택 기능: 웹 자동 open

```sh
pnpm promptlane install-hook codex --open-web
```

Codex도 같은 안전한 hook command 경로를 사용합니다. Codex plugin-local hook
동작은 버전에 따라 다를 수 있으므로 `promptlane setup` /
`install-hook`은 여전히 user-level hook config를 작성합니다. 로컬 ingest
server가 꺼져 있거나 ingest가 실패하면 hook은 fail-open으로 prompt를 막지
않습니다.

Codex는 `UserPromptSubmit` hook stdout을 채팅 화면에 직접 보여줄 수
있습니다. 화면을 어지럽히지 않기 위해 Codex의 `context` / `ask` rewrite
guidance는 기본적으로 로컬에 capture만 하고 hook stdout으로 출력하지
않습니다. 개선안을 보고 복사하려면 `promptlane coach`,
`promptlane score`, 웹 UI, MCP tool을 사용합니다.

Codex 설치는 fail-open `Stop`, `PreCompact`, `PostCompact` hook도 등록합니다.
Stop/compact lifecycle 처리는 local-only이며 해당 payload를 prompt ingest
route로 보내지 않습니다.

`hooks.json`과 `config.toml` 변경 preview:

```sh
pnpm promptlane install-hook codex --dry-run
```

진단:

```sh
pnpm promptlane doctor codex
```

`doctor`는 로컬 server 접근성, ingest token, hook 설치, Codex hook feature
상태, MCP command access를 확인합니다. MCP는 알려진 로컬 config 파일을 먼저
보고, 필요하면 read-only `codex mcp list`로 한 번 더 확인합니다.

hook 제거:

```sh
pnpm promptlane uninstall-hook codex
```

Codex installer는 기본적으로 사용자 레벨 config를 대상으로 합니다.

```text
~/.codex/hooks.json
~/.codex/config.toml
```

다음 feature flag를 활성화합니다.

```toml
[features]
codex_hooks = true
```

uninstall은 promptlane hook entry를 제거하지만 Codex feature flag는 그대로 둡니다.

## Agent Wrappers Experimental

`pl-claude`와 `pl-codex`는 초기 prompt 인자를 먼저 다루는 실험적 front-door
wrapper입니다. prompt를 로컬에서 점수화하고, 약하면 redaction된 개선안을 만든 뒤,
선택된 prompt를 실제 `claude` 또는 `codex` binary에 넘깁니다.

```sh
pl-claude --pc-mode auto -- "fix this"
pl-codex --pc-mode auto -- "fix this"
pl-codex --pc-mode auto -- exec "fix this"
```

실제 agent를 실행하지 않고 먼저 검증하려면 dry-run을 사용합니다.

```sh
pl-claude --pc-mode auto --pc-dry-run -- "fix this"
pl-codex --pc-mode auto --pc-dry-run -- "fix this"
```

wrapper 전용 옵션은 `--pc-*` prefix를 사용하므로 일반 Claude/Codex 옵션을
그대로 전달할 수 있습니다. 기본 mode는 `ask`이고, `--pc-mode auto`가 낮은
점수의 초기 prompt를 묻지 않고 교체하는 딸깍 모드입니다. `auth`, `mcp`,
`plugin`, `login` 같은 관리 subcommand는 rewrite하지 않고 그대로 통과시킵니다.
이 wrapper는 interactive session 안에서 이후에 입력하는 모든 메시지를 계속
가로채지는 않습니다.

## Plugin Packaging

이 저장소는 plugin packaging artifact도 함께 제공합니다.

```text
.claude-plugin
commands
plugins/promptlane
integrations/claude-code
docs/PLUGINS.md
```

권장 순서:

1. `promptlane` CLI 설치
2. agent marketplace 추가
3. `promptlane setup` 또는 `/promptlane:setup` 실행

Claude Code plugin slash commands:

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

PromptLane compatibility window 중 Claude Code slash command는 `/promptlane:*`에
남아 있습니다. 기존 plugin 사용자는 이 command를 계속 사용하면 됩니다.
canonical CLI는 `promptlane`이며, dedicated migration plan 없이 alternate CLI
alias나 alternate slash namespace를 추가하지 않습니다.

`/promptlane:guard`는 `off / context / ask / block-and-copy` 네 가지
`UserPromptSubmit` rewrite-guard 모드를 인터랙티브 picker로 전환합니다.
CLI 옵션을 외울 필요 없이 슬래시 명령 한 번으로 모드를 바꿀 수 있습니다.
`promptlane hook status`로 현재 설치된 모드를 도구별로 확인할 수 있습니다.

`/promptlane:setup`은 먼저 dry-run을 실행하고, 로컬 설정을 쓰기 전에 승인받습니다. Claude Code status line은 최신 prompt score HUD로 쓸 수 있으며 다음 명령으로 설치할 수 있습니다.

```sh
pnpm promptlane install-statusline claude-code
```

다른 Claude Code HUD가 이미 있으면 promptlane는 기존 command를 보존하고 하나의 `statusLine` command에서 둘 다 실행합니다. promptlane를 제거하면 설치 시 보존한 이전 command로 복구합니다.

Claude Code 또는 Codex 옆에 두 번째 터미널 pane을 열고 항상 켜두는 buddy를 실행할 수도 있습니다.

```sh
pnpm promptlane buddy
```

한 번만 확인하려면 `pnpm promptlane buddy --once`, 자동화에는 `pnpm promptlane buddy --json`을 사용합니다.

Codex package는 `.codex-plugin` manifest와 로컬 archive를 설치/진단/사용하도록 돕는 skill을 포함합니다. active Codex hook은 번들하지 않으며, plugin hook과 setup hook이 동시에 실행되지 않도록 `promptlane setup`이 user-level hook을 명시적으로 설치합니다.

## CLI

프롬프트 목록:

```sh
pnpm promptlane list
```

검색:

```sh
pnpm promptlane search "migration plan"
```

프롬프트 Markdown 보기:

```sh
pnpm promptlane show <prompt-id>
```

삭제:

```sh
pnpm promptlane delete <prompt-id>
```

로컬 웹 UI에서 열기:

```sh
pnpm promptlane open <prompt-id>
```

Markdown archive에서 SQLite/FTS 재구축:

```sh
pnpm promptlane rebuild-index
```

JSONL transcript import preview/실행:

```sh
pnpm promptlane import --dry-run --file ./transcript.jsonl --save-job
pnpm promptlane import --execute --file ./transcript.jsonl
pnpm promptlane import-job <job-id>
```

import는 현재 CLI 중심입니다. 웹 UI에서는 imported prompt를 일반 archive와 imported-only filter로 볼 수 있지만, 웹 업로드 화면은 없습니다.

익명화 export preview/실행:

```sh
pnpm promptlane export --anonymized --preview --preset anonymized_review --json
pnpm promptlane export --anonymized --job <export-job-id> --json
```

웹 UI는 익명화 export만 제공합니다. Raw export는 구현되어 있지 않습니다.

승인형 PromptLane 개선안 생성:

```sh
pnpm promptlane coach
pnpm promptlane coach --json
pnpm promptlane improve --text "make this request clearer" --json
```

누적 prompt 습관 점수 측정:

```sh
pnpm promptlane score --json
pnpm promptlane score --tool codex --json
```

PromptLane 9.5 품질 evidence gate 확인:

```sh
corepack pnpm promptlane quality-evidence
corepack pnpm promptlane quality-evidence --json
corepack pnpm promptlane quality-evidence --operator-brief
corepack pnpm promptlane quality-evidence --require-complete
```

`--require-complete`는 scorecard axis나 직접 evidence blocker가 남아 있으면
실패합니다. release/goal-completion gate로만 사용하세요.
`--operator-brief`는 남은 native dialog dogfood를 실행하지 않고, 승인 전에
확인해야 할 focused checklist만 출력합니다. 또한
`PROMPTLANE_NATIVE_DIALOG_APPROVED=1`이 없으면 native dialog를 열기 전에
거부되어야 하는 refusal preflight command도 함께 보여줍니다.
해당 refusal preflight는 `corepack pnpm dogfood:mcp-native-dialog-refusal`로
실행합니다.
JSON 출력에는 `recommended_next_slices`도 포함됩니다. 텍스트 출력에서는 recommended next slices로
표시되며, 바로 실행할 수 있는 로컬 evidence
작업과 외부 이벤트 또는 명시적 운영자 승인이 필요한 작업을 분리합니다.

## 로컬 분석 Preview

프롬프트 상세 화면은 로컬 rule-based analysis preview를 제공합니다. 목표, 배경 맥락, 범위 제한, 출력 형식, 검증 기준이 포함되어 있는지 요약합니다. 각 프롬프트에는 checklist breakdown 기반의 deterministic `0-100` Prompt Quality Score도 표시됩니다.

이 preview는 저장된 redacted prompt body를 로컬에서만 분석합니다. 외부 LLM provider를 호출하지 않습니다.

## 프로젝트 규칙 파일 리뷰

Projects 화면에서 프로젝트별 `AGENTS.md`와 `CLAUDE.md`를 분석할 수
있습니다. 리뷰 결과는 파일명, 해시, 수정 시각, checklist 상태, 점수,
개선 힌트를 로컬 snapshot으로 저장합니다.

instruction file 본문, raw absolute path, 외부 LLM 결과는 저장하거나
반환하지 않습니다. 점수는 프로젝트 맥락, 에이전트 작업 방식, 검증 명령,
privacy/safety, 보고 규칙을 보는 deterministic local rubric입니다.

## MCP 프롬프트 점수 측정

`promptlane`는 같은 로컬 Prompt Quality Score를 Claude Code, Codex 또는
다른 MCP client가 호출할 수 있도록 stdio MCP server로 노출할 수 있습니다.

```sh
promptlane mcp
```

MCP server는 20개의 tool을 제공합니다.

- `get_promptlane_status`: 로컬 archive가 초기화되었는지, prompt가 캡처되었는지, 다음에 어떤 MCP tool을 호출하면 좋은지 확인합니다.
- `coach_prompt`: Claude Code/Codex 안에서 로컬 readiness, 최신 prompt 점수, 승인형 rewrite, 누적 습관, 프로젝트 규칙, 다음 요청 가이드를 한 번에 받습니다.
- `score_prompt`: 직접 전달한 prompt text, 저장된 `prompt_id`, 또는 최신 저장 prompt를 점수화합니다.
- `improve_prompt`: 직접 전달한 prompt text, 저장된 `prompt_id`, 또는 최신 저장 prompt를 승인 가능한 개선 prompt 초안으로 재작성합니다. 결과에는 사용자에게 native ask UI로 물어야 할 `clarifying_questions` 배열(JSON-Schema 형태의 `answer_schema.examples` 포함)이 포함됩니다.
- `apply_clarifications`: 사용자가 직접 답한 답변(각 항목은 `origin: "user"` 필수)을 받아 최종 승인용 draft를 합성합니다. agent가 자기 ask UI로 답을 모은 뒤 호출합니다.
- `ask_clarifying_questions`: promptlane가 ask-then-apply 흐름 자체를 주도합니다. 클라이언트가 elicitation capability를 광고하면(Claude Code 2.1.76+) MCP `elicitation/create`로 직접 사용자에게 묻고 final draft를 합성하며, 미지원 / 거부 / 타임아웃 시 clarifying_questions metadata로 fallback합니다. rewrite를 자동 제출하지 않습니다. 비대화형 Claude Code print 실행(`claude -p`)에서는 MCP tool routing이 성공해도 사용자가 답하지 않으면 `interaction_status: declined`가 반환될 수 있습니다. 이 경우 실패로 보지 말고 반환된 `clarifying_questions`를 agent의 native ask UI로 다시 물은 뒤, 먼저 `apply_clarifications`로 최종 승인용 draft를 채팅에 보여주고, 사용자가 저장도 원할 때만 `record_clarifications`를 호출합니다.
- `record_clarifications`: 사용자가 답한 verbatim 답변과 합성된 최종 draft를 prompt id에 묶어 로컬 archive(`prompt_improvement_drafts`)에 영구 저장합니다. 응답에는 metadata(`draft_id`, `answers_count`, `changed_sections` 등)만 들어가고 prompt body나 draft 본문은 echo하지 않습니다.
- `get_promptlane_loop_status`: 로컬 loop snapshot 존재 여부, 최신 loop metadata, compact-boundary 상태를 prompt body/raw path 없이 확인합니다.
- `prepare_loop_brief`: 최신 snapshot 또는 선택한 `worktree`, `session_id`, `branch`에 맞는 snapshot에서 copy-ready continuation prompt를 준비합니다.
- `record_loop_outcome`: 사용자가 승인한 loop outcome metadata와 evidence ref만 저장하고 prompt body/raw path는 저장하지 않습니다.
- `propose_loop_memory_candidate`: 검증된 loop outcome이 사용자 승인 memory 후보가 될 만큼 evidence-backed인지 판단합니다. 이 단계는 read-only입니다.
- `record_loop_memory`: 사용자가 승인한 PromptLane memory를 로컬 storage에 기록합니다. instruction file은 쓰지 않습니다.
- `propose_instruction_patch`: 최신 승인 memory를 `AGENTS.md` 또는 `CLAUDE.md`에 반영하는 review-only patch와 explicit apply gate를 반환합니다.
- `apply_instruction_patch`: caller가 명시적으로 확인한 경우에만 instruction patch를 적용하며, source memory id 기준으로 idempotent합니다.
- `score_prompt_archive`: 최근 저장 prompt 전체를 대상으로 누적 prompt 습관을 점수화하고, 평균 점수, 반복 부족 항목, practice plan, 다음 prompt template, 낮은 점수 prompt id를 반환합니다.
- `review_project_instructions`: 최신 또는 선택한 프로젝트의 `AGENTS.md` / `CLAUDE.md` 규칙 파일을 리뷰하고 점수, checklist 상태, 개선 힌트를 반환합니다.
- `prepare_agent_rewrite`: 현재 Claude Code/Codex/Gemini CLI 세션이 의미론적으로 더 좋은 prompt를 만들 수 있도록, 하나의 redacted prompt packet, 로컬 점수 metadata, 로컬 baseline draft, rewrite contract를 준비합니다.
- `record_agent_rewrite`: 사용자가 승인한 agent rewrite를 redacted improvement draft로 저장하고, rewrite 본문은 반환하지 않습니다.
- `prepare_agent_judge_batch`: 현재 Claude Code/Codex/Gemini CLI 세션이 직접 LLM judge로 평가할 수 있도록, bounded redacted prompt packet과 rubric을 준비합니다. `promptlane`가 provider를 대신 호출하지 않습니다.
- `record_agent_judgments`: 현재 agent 세션이 만든 advisory score와 제안을 prompt body/raw path 없이 저장합니다.

CLI만 사용하는 경우에도 검증 결과를 기록한 뒤 승인형 memory 흐름을 이어갈 수 있습니다.
`promptlane loop status`는 최신 snapshot이 `unknown` 또는 `in_progress`이면
검증 가능한 checkpoint에 도달한 뒤 해당 snapshot id로 outcome을 기록하라고
안내합니다. 중간 hook snapshot 전체를 outcome backlog로 표시하지 않습니다.
latest status에는 해당 snapshot의 opaque `prmt_...` id만 포함됩니다. 실제로
PromptLane 개선안을 사용한 경우에만 `--used-improvement-prompt`로 선택하고,
사용하지 않았다면 attribution을 비워 둡니다.

```sh
promptlane loop outcome --status passed --summary "Focused checks passed." \
  --evidence-ref "test:focused" --evidence-ref "build:pnpm-build"
promptlane loop memory-candidate
promptlane loop memory-approve --approved-by user
```

병렬 worktree에서는 `memory-candidate`와 `memory-approve`에 동일한
`--snapshot-id` 또는 `--worktree`/`--session`/`--branch` 선택자를 전달합니다.
MCP도 `snapshot_id`, `worktree`, `session_id`, `branch`를 지원하며 exact id와
filter를 섞으면 global latest로 fallback하지 않고 거부합니다.

`loop outcome`은 기본적으로 최신 snapshot을 사용하며 `--snapshot-id` 또는
`--worktree`, `--session`, `--branch` 선택자를 지원합니다. summary와 evidence
ref에 secret 또는 raw local path가 있으면 SQLite에 쓰기 전에 거부합니다.
웹 Loops의 worktree detail에서도 선택 snapshot의 outcome을 명시적으로 기록할
수 있으며, 기록 후 local readiness만 갱신하고 memory는 자동 승인하지 않습니다.
별도 선택 memory 승인 버튼은 exact snapshot만 승인하고 완료 후 다시 노출되지
않습니다.

읽기 tool은 local-only로 동작하고 구조화 JSON metadata에 대한 MCP
`outputSchema`와 text JSON fallback을 함께 제공합니다.
`record_agent_rewrite`와 `record_agent_judgments`는 non-destructive write tool입니다.
전자는 redacted rewrite draft를 저장하고, 후자는 judgment metadata만 저장합니다.
archive 기반 로컬 tool은 저장된 prompt 본문, raw absolute path, secret,
숨은 외부 LLM 결과를 반환하지 않습니다. agent-judge 모드는 opt-in이며 현재
agent 세션을 evaluator로 사용합니다. agent-rewrite 모드도 opt-in이며 현재
agent 세션을 rewriter로 사용합니다.

Agent에게 이렇게 요청할 수 있습니다.

```text
promptlane get_promptlane_status를 사용해서 점수 측정 전에 prompt capture가 제대로 동작하는지 확인해줘.

promptlane score_prompt를 latest=true로 사용해서 방금 내 요청에서 고칠 점을 알려줘.

promptlane improve_prompt를 latest=true로 사용해서 내가 복사해 다시 입력할 수 있는 승인용 개선안을 만들어줘.

promptlane prepare_agent_rewrite를 latest=true로 사용해줘. redacted prompt를 네가 직접 더 좋은 요청으로 고친 뒤, 내가 승인하면 record_agent_rewrite로 저장해줘.

최근 Codex 프롬프트를 promptlane score_prompt_archive로 측정하고 반복되는 프롬프트 습관 약점을 요약해줘.

promptlane review_project_instructions를 latest=true로 사용해서 내 AGENTS.md/CLAUDE.md 규칙이 코딩 에이전트에게 충분한지 평가해줘.

promptlane prepare_agent_judge_batch를 selection=low_score, max_prompts=5로 사용해줘. redacted prompt를 네가 직접 평가한 뒤 record_agent_judgments로 점수와 제안을 저장해줘.
```

이 tool들은 점수, band, checklist breakdown(축별 earned/weight 포인트), redaction 알림, 반복 부족 항목, clarifying_questions, 승인 가능한 재작성 초안을 반환합니다.
직접 전달한 prompt text는 저장하지 않고, 숨은 외부 LLM 호출도 하지 않습니다. archive 기반 score/rewrite 흐름은 저장된 원문 prompt body를 반환하지 않습니다. archive scoring tool은 raw absolute path도 반환하지 않습니다. project instruction review tool은 instruction file 본문과 raw absolute path를 반환하지 않습니다. status tool은 안전한 개수, 최신 prompt metadata, 사용 가능한 tool 이름, 다음 행동만 반환합니다.

Agent-judge packet은 예외적으로 명시 요청 시 로컬에서 redaction된 prompt body를 반환합니다. 이는 현재 Claude Code/Codex/Gemini CLI 세션이 직접 평가할 수 있게 하기 위한 것이며, `promptlane`가 provider 계정이나 token을 대신 호출하거나 proxy하지 않습니다. 근거와 경계는 [Legal usage guide](docs/LEGAL_USAGE_GUIDE.md)에 기록되어 있습니다.

Claude Code 등록 예시:

```sh
claude mcp add --transport stdio promptlane -- promptlane mcp
```

Codex 등록 예시:

```sh
codex mcp add promptlane -- promptlane mcp
```

custom data directory를 쓴다면:

```sh
promptlane mcp --data-dir /path/to/promptlane-data
```

## Benchmark

Benchmark v1은 privacy, retrieval, rule-based prompt improvement, `coach_prompt` actionability, prompt quality score calibration, analytics, latency에 대한 로컬 회귀 신호를 측정합니다.

```sh
promptlane benchmark --json
promptlane benchmark prepare-fixture --prompt-id "$PROMPT_ID" --consent-note "$CONSENT_NOTE" --confirm-consent --output "$FIXTURE_FILE"
promptlane benchmark init-fixture --output "$FIXTURE_FILE"
# 모든 example을 동의·비식별 fixture로 교체합니다.
# passed/failed outcome과 안전한 evidence ref를 추가합니다.
# fixture 확인 후 template_only를 false로 설정합니다.
promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE"
promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE" --json --report-file "$BASELINE_REPORT"
promptlane benchmark --fixture-set real --fixture-file "$FIXTURE_FILE" --baseline-file "$BASELINE_REPORT" --json

corepack pnpm benchmark
corepack pnpm --silent benchmark -- --json
```

기본 synthetic fixture set은 결정적인 로컬 회귀 gate입니다. real fixture
set은 operator가 관리하는 로컬 파일의 동의·비식별 prompt를 사용하는 opt-in
soft trend signal입니다. 어느 결과도 단독으로 실제 사용자 prompt 품질을
완전히 해결했다는 주장은 아닙니다. 실제 outcome이 없는 real prompt는
`unproven`으로 남습니다. fixture contract는
`docs/BENCHMARK_V1.md`의 `template_only` 확인 절차를 참고하세요.
먼저 `promptlane benchmark candidates --json`으로 실제 사용이 귀속된 완료
outcome의 body-free prompt id를 확인할 수 있습니다. 후보 조회는 local-only로
최신 loop snapshot 100개까지만 검사하며 prompt 본문, raw path, outcome 요약,
evidence ref를 반환하지 않습니다.
archive에서 준비할 때는 `prepare-fixture`가 기본 경로입니다. 반복 지정한
`--prompt-id`만 명시적 `--confirm-consent` 후 읽고, prompt와 outcome
evidence를 다시 검사하며, 실제 사용이 귀속된 완료 outcome만 포함합니다.
결과는 경로나 prompt 내용을 출력하지 않고 새 0600 파일로 기록합니다.
`init-fixture`는 수동 template 작성이 필요한 경우의 대안입니다.
real 실행은 synthetic 점수 calibration과 score delivery integrity를
분리하며, 효용 추세를 healthy로 판단하려면 `outcome_pass_rate`를
충족해야 합니다.
`--baseline-file`이 없으면 real evidence는 trend가 아니라 snapshot입니다.
raw-free corpus fingerprint가 변경된 prompt set 사이의 비교를 차단합니다.
`--report-file`은 `--json`과 함께 사용하며, 성공한 JSON 실행 후에만 새
private local file을 만들고 기존 evidence를 덮어쓰지 않습니다.

## Release Smoke

release publish 또는 tag 전 release smoke를 실행하세요.

```sh
corepack pnpm smoke:release
```

이 script는 package를 build하고, 격리된 임시 data directory와 HOME을 만들고, 로컬 서버를 시작하고, fixture 형태의 Claude Code/Codex prompt를 capture하고, CLI list/search/show/delete/rebuild-index, SQLite WAL/FTS5, 삭제 cleanup을 검증합니다.

브라우저 회귀 smoke:

```sh
corepack pnpm e2e:browser
```

archive, detail, PromptLane improvement copy/save, projects, anonymized export, mobile overflow, English/Korean language switch를 실제 로컬 서버에서 확인합니다.

## Storage

`promptlane`는 Markdown을 source of truth로 보고 SQLite를 index로 사용합니다.

기본 파일:

```text
~/.promptlane/config.json
~/.promptlane/hook-auth.json
~/.promptlane/promptlane.sqlite
~/.promptlane/prompts/
~/.promptlane/logs/
~/.promptlane/quarantine/
~/.promptlane/spool/
```

POSIX 시스템에서는 민감 directory를 `0700`, token/config 파일을 `0600`으로 생성합니다.

## Privacy And Security

기본 동작:

- Prompt capture는 `127.0.0.1` 로컬에서만 동작합니다.
- Hook ingest는 `hook-auth.json`에 저장된 로컬 bearer token을 사용합니다.
- Browser UI는 same-origin session cookie와 CSRF token을 사용합니다.
- `mask` mode에서는 민감값을 Markdown, SQLite, FTS indexing 전에 redaction합니다.
- 외부 LLM 분석은 `promptlane`의 숨은 background 호출로 실행되지
  않습니다. 선택형 MCP agent rewrite/judge workflow는 사용자가 요청한
  경우에만 redacted prompt packet을 현재 user-controlled Claude Code,
  Codex, Gemini CLI 세션에 제공할 수 있고, 해당 agent는 사용자 tool 설정에
  따라 provider 세션으로 packet을 보낼 수 있습니다.
- PromptLane 개선안은 copy-based입니다. Claude Code 또는 Codex에 prompt를 자동 입력, 교체, 재제출하지 않습니다.
- Prompt Rewrite Guard는 opt-in입니다. `block-and-copy` mode에서는 낮은 점수 prompt를 block하고 로컬 개선안을 사용자가 paste/enter할 수 있게 제공합니다. `context` mode는 model-visible rewrite guidance를 추가하지만 원문 prompt를 교체하지는 않습니다.
- Settings와 local diagnostics는 로컬 사용자에게 filesystem path를 보여줄 수 있습니다. Browser prompt/archive/export 표면은 prompt-body path를 mask하고 raw prompt identifier를 피합니다.

중요한 한계:

- 이 도구는 연결된 도구에 제출하는 prompt를 저장합니다. 해당 content를 저장해도 되는 환경에서만 hook을 켜세요.
- Redaction은 best-effort이며 완전한 DLP로 취급하면 안 됩니다.
- 삭제는 promptlane의 Markdown과 SQLite row를 제거하지만 terminal history, editor buffer, backup, filesystem snapshot, upstream AI tool transcript에 남은 복사본까지 지우지는 않습니다.
- 이 프로젝트는 Claude.ai OAuth token, Claude Code internal auth token, OpenAI/Codex session token, ChatGPT account token을 추출, 저장, proxy, 판매, 재사용하지 않습니다.

## 데이터 제거

단일 prompt 삭제:

```sh
pnpm promptlane delete <prompt-id>
```

hook 제거:

```sh
pnpm promptlane uninstall-hook claude-code
pnpm promptlane uninstall-hook codex
```

promptlane 데이터 전체 제거:

```sh
rm -rf ~/.promptlane
```

다른 `--data-dir`를 사용했다면 해당 경로를 지우세요.

## 개발

전체 로컬 gate:

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

dry-run package는 `docs/PACKAGE_CONTENTS.md`에 기록된 local wrapper를 사용합니다.
package에는 built CLI, built web assets, README, release documentation이 포함되어야 합니다.

publish 전 [Package contents](docs/PACKAGE_CONTENTS.md)와 [Pre-publish privacy audit](docs/PRE_PUBLISH_PRIVACY_AUDIT.md)를 확인하세요.

## 기여

Issue, pull request, security report를 열기 전에 [CONTRIBUTING](CONTRIBUTING.md), [CODE OF CONDUCT](CODE_OF_CONDUCT.md), [SUPPORT](SUPPORT.md), [SECURITY](SECURITY.md)를 읽어주세요.

## 문서

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
