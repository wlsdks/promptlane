# Screenshots

이 디렉토리는 README와 docs에 임베드되는 스크린샷을 보관합니다.

## 캡처 방법 (수동)

1. 깨끗한 임시 데이터 디렉토리로 서버 시작:

   ```sh
   pnpm build
   PROMPTLANE_DATA_DIR="$(mktemp -d)" pnpm promptlane init --data-dir "$PROMPTLANE_DATA_DIR"
   pnpm promptlane server --data-dir "$PROMPTLANE_DATA_DIR"
   ```

2. 다른 터미널에서 fixture prompt 몇 개를 ingest (real prompt로 sensitive
   값을 노출하지 마세요. `scripts/browser-e2e.mjs`의 fixture 패턴을
   참고하면 됩니다 — `Fix /path/with/[REDACTED:path]` 같은 redaction 결과가
   그대로 보이는 prompt가 좋습니다).

3. 브라우저로 `http://127.0.0.1:17373`에 접속해서 다음 세 화면을 캡처:

   | 파일명 | 화면 | viewport |
   | --- | --- | --- |
   | `archive.png` | "Prompt archive" 첫 화면 (filter bar + 한 row 보일 정도) | 1280×900 |
   | `coach.png` | 한 prompt detail 안에서 "Improvement draft for manual resubmission" 패널까지 보이게 | 1280×900 |
   | `practice.png` | "Practice workspace" 화면 (one-click builder + score preview) | 1280×900 |

4. 결과 png를 이 디렉토리에 저장하고 `git add docs/screenshots/*.png`.

## 캡처 시 주의

- **prompt body, 토큰, 절대 경로가 화면에 보이지 않게 합니다.** fixture만
  사용하고, `[REDACTED:...]` 마스크 결과로 충분히 가시화됩니다.
- 다크 테마(default) 그대로 캡처합니다.
- 1× DPI로 저장 (Retina 2× 캡처는 README 임베드 시 너무 큽니다).
- gif/mp4가 아니라 정적 png. README는 첫 인상이고 빠른 로딩이 우선.

## 자동 UI patrol

`scripts/browser-e2e.mjs`는 fixture 주입과 페이지 네비게이션을 수행하며,
`SCREENSHOT_DIR` 환경 변수가 있으면 다음 화면의 png를 저장합니다:

- `archive-desktop.png`
- `detail-desktop.png`
- `dashboard-desktop.png`
- `coach-desktop.png`
- `projects-desktop.png`
- `mcp-desktop.png`
- `exports-desktop.png`
- `settings-desktop.png`
- `settings-mobile.png`

로컬에서 같은 점검을 실행하려면:

```sh
SCREENSHOT_DIR="$(mktemp -d)" pnpm ui-patrol
```

GitHub Actions의 `ui-patrol` workflow는 매주 한 번, 그리고 수동 실행 시
synthetic fixture로 이 점검을 실행하고 screenshot artifact를 업로드합니다.
이 artifact는 제품 스크린샷 원본이 아니라 회귀 점검용 증거입니다.
