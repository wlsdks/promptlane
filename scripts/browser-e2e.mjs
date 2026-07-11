#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import net from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { chromium } from "playwright";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const cliPath = join(repoRoot, "dist", "cli", "index.js");
const tempRoot = mkdtempSync(join(tmpdir(), "looprelay-browser-e2e-"));
const dataDir = join(tempRoot, "data");
const homeDir = join(tempRoot, "home");
const screenshotDir = process.env.SCREENSHOT_DIR
  ? resolve(process.env.SCREENSHOT_DIR)
  : undefined;
const rawPathPrefix = join(tempRoot, "workspace");
const privateProjectDir = join(rawPathPrefix, "private-project");
const rawSecret = "sk-proj-1234567890abcdef";
const cliEnv = {
  ...process.env,
  HOME: homeDir,
  USERPROFILE: homeDir,
};

let serverProcess;
let browser;

try {
  assert(existsSync(cliPath), "Run `pnpm build` before browser E2E.");
  mkdirSync(homeDir, { recursive: true });
  mkdirSync(privateProjectDir, { recursive: true });
  writeFileSync(
    join(privateProjectDir, "AGENTS.md"),
    [
      "# looprelay",
      "looprelay is a local-first developer tool built with TypeScript and SQLite.",
      "Agents plan in tasks/todo.md, avoid reverting user changes, commit, and push.",
      "Run pnpm test, pnpm lint, pnpm build, and Playwright E2E after UI changes.",
      "Never expose secrets, prompt bodies, raw paths, tokens, stdout, or stderr leaks.",
      "Respond with concise verification evidence.",
    ].join("\n"),
  );
  const serverPort = await freePort();
  const serverBaseUrl = `http://127.0.0.1:${serverPort}`;

  step("Initialize isolated data directory");
  runCli(["init", "--data-dir", dataDir]);
  configurePort(serverPort);

  step("Start local server");
  serverProcess = startServer();
  await waitForHealth(`${serverBaseUrl}/api/v1/health`);

  step("Capture prompt fixtures");
  await ingest(serverBaseUrl, "/api/v1/ingest/claude-code", {
    session_id: "browser-e2e-claude",
    transcript_path: `${rawPathPrefix}/.claude/session.jsonl`,
    cwd: privateProjectDir,
    permission_mode: "default",
    hook_event_name: "UserPromptSubmit",
    prompt: `Fix ${rawPathPrefix}/private-project/src/secret.ts with token ${rawSecret}. Run pnpm test.`,
  });
  await ingest(serverBaseUrl, "/api/v1/ingest/codex", {
    session_id: "browser-e2e-codex",
    turn_id: "turn-1",
    transcript_path: `${rawPathPrefix}/.codex/sessions/session.jsonl`,
    cwd: privateProjectDir,
    hook_event_name: "UserPromptSubmit",
    model: "gpt-5.5",
    prompt: `Review ${rawPathPrefix}/private-project/src/web/App.tsx and return Markdown summary.`,
  });

  step("Seed a judge score so the JudgeScorePanel renders");
  insertJudgeScoreForClaudePrompt({
    score: 88,
    reason: "Goal explicit, verification implied via pnpm test.",
  });
  step("Seed loop outcome evidence for the selected prompt");
  insertLoopOutcomeForClaudePrompt();

  step("Run browser flow");
  browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  await context
    .grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: serverBaseUrl,
    })
    .catch(() => undefined);
  const page = await context.newPage();
  const consoleErrors = [];
  const requestErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      requestErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(serverBaseUrl);
  await page.getByRole("heading", { name: "Prompt archive" }).waitFor();
  await page.getByRole("button", { name: "KO" }).click();
  await page.getByRole("heading", { name: "프롬프트 아카이브" }).waitFor();
  await page.getByRole("button", { name: "EN" }).click();
  await page.getByRole("heading", { name: "Prompt archive" }).waitFor();
  await page.getByText("private-project").first().waitFor();
  await assertBrowserSafe(page, "archive");
  await captureScreenshot(page, "archive-desktop");
  await assertText(
    page,
    "private-project",
    "Archive should show project label.",
  );
  await assertText(
    page,
    "[REDACTED:path]",
    "Archive should mask prompt paths.",
  );

  await page.getByRole("row", { name: /claude-code private-project/ }).click();
  await page
    .getByRole("heading", { name: "Improvement draft for manual resubmission" })
    .waitFor();
  await page.locator(".analysis-score-box .score-value").first().waitFor();
  await page.locator(".quality-points").first().waitFor();
  await assertText(
    page,
    "/25",
    "Detail should expose per-criterion score breakdown chips (weight 25 for Goal clarity).",
  );
  await assertText(
    page,
    "Continue in Claude Code or Codex",
    "Detail should show selected-prompt agent follow-up actions.",
  );
  await assertText(
    page,
    "looprelay:score_prompt prompt_id=",
    "Detail should expose a stored prompt MCP score command.",
  );
  await assertText(
    page,
    "looprelay:prepare_agent_rewrite prompt_id=",
    "Detail should expose a stored prompt agent rewrite command.",
  );
  await captureScreenshot(page, "detail-desktop");
  await page.locator(".prompt-comparison").first().waitFor();
  await page.locator(".expected-impact").first().waitFor();
  await assertTextAny(
    page,
    ["Expected impact"],
    "Detail should show local expected-impact evidence before copy/save actions.",
  );
  await assertTextAny(
    page,
    ["Improved score"],
    "Detail should show the improved draft score in the expected-impact row.",
  );
  await page
    .locator('.prompt-comparison-heading:has-text("Original")')
    .first()
    .waitFor();
  await page
    .locator('.prompt-comparison-heading:has-text("Improved draft")')
    .first()
    .waitFor();
  await page.locator(".prompt-comparison-changed").first().waitFor();
  await assertText(
    page,
    "changed",
    "Detail should show the changed-sections badge.",
  );
  await page.locator(".judge-score-panel").first().waitFor();
  await assertText(
    page,
    "Independent score from Claude Code",
    "Detail should label the LLM judge panel with the tool that scored it.",
  );
  await assertText(
    page,
    "88",
    "Detail should show the seeded LLM judge score value.",
  );
  await page.locator(".loop-outcome-panel").first().waitFor();
  const promptDetail = await currentPromptDetail(page);
  assert(
    promptDetail.effectiveness?.verdict === "proven",
    "Prompt detail API should include the raw-free effectiveness verdict.",
  );
  await assertTextAny(
    page,
    ["Outcome evidence"],
    "Detail should show linked loop outcome evidence for the selected prompt.",
  );
  await assertText(
    page,
    "browser e2e outcome passed",
    "Detail should show the safe loop outcome summary.",
  );
  await assertText(
    page,
    "4 tests",
    "Detail should show loop outcome test-count evidence.",
  );
  await assertText(
    page,
    "Effectiveness: Proven",
    "Detail should summarize whether actual loop evidence proves the prompt effective.",
  );
  await assertText(
    page,
    "Attributed improvement evidence passed with 4 tests across 1 outcome.",
    "Detail should show the raw-free effectiveness verdict summary.",
  );
  await assertText(
    page,
    "1 attributed · 1 passed / 0 failed",
    "Detail should show prompt effectiveness calibration counts.",
  );
  await assertText(
    page,
    "main CI 28748001738",
    "Detail should show safe loop outcome evidence refs.",
  );
  await assertBrowserSafe(page, "detail");
  await forceClipboardFailure(page);
  await page.getByRole("button", { name: "Copy draft" }).click();
  await page.getByRole("textbox", { name: "Manual copy draft text" }).waitFor();
  await assertText(
    page,
    "select the draft below and copy it manually",
    "Detail should expose a manual-copy fallback when current draft clipboard writes fail.",
  );
  await page.getByRole("button", { name: "Dismiss" }).click();
  await restoreClipboard(page);
  await page.getByRole("button", { name: "Copy draft" }).click();
  await page.getByRole("button", { name: "Copied" }).waitFor();
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.getByRole("button", { name: "Saved", exact: true }).waitFor();
  await page.getByRole("button", { name: "Copy saved draft" }).waitFor();
  await forceClipboardFailure(page);
  await page.getByRole("button", { name: "Copy saved draft" }).click();
  await page.getByRole("textbox", { name: "Manual copy draft text" }).waitFor();
  await assertText(
    page,
    "select the draft below and copy it manually",
    "Detail should expose a manual-copy fallback when saved draft clipboard writes fail.",
  );
  await page.getByRole("button", { name: "Dismiss" }).click();
  await restoreClipboard(page);

  // Lock in PR #161 — answering a clarifying-question textarea must flow
  // through Save into the persisted draft (and pill it as "From your answers").
  const clarifyInput = page.locator(".clarifying-question-input").first();
  if ((await clarifyInput.count()) > 0) {
    const savedClarification =
      "Run pnpm test and confirm 0 failures end-to-end.";
    const unsavedClarification = "Run only the browser regression path.";
    await clarifyInput.fill(savedClarification);
    await page.getByRole("button", { name: "Save draft" }).click();
    await page.getByRole("button", { name: "Saved", exact: true }).waitFor();
    await page.locator(".saved-draft-source-clarifications").first().waitFor();
    await clarifyInput.fill(unsavedClarification);
    await assertText(
      page,
      unsavedClarification,
      "Detail should update the current draft while editing clarification answers.",
    );
    await page
      .getByRole("button", { name: "Use as current draft" })
      .first()
      .click();
    await assertText(
      page,
      savedClarification,
      "Detail should reopen a saved draft as the current improvement draft.",
    );
    await assertText(
      page,
      "Saved draft",
      "Detail should label reopened saved drafts with user-facing copy.",
    );
    const reopenedSaveButton = page.getByRole("button", {
      name: "Already saved",
    });
    await reopenedSaveButton.waitFor();
    assert(
      await reopenedSaveButton.isDisabled(),
      "Reopened saved drafts should not expose a second save action.",
    );
    await assertNotText(
      page,
      unsavedClarification,
      "Reopening a saved draft should replace the unsaved generated draft.",
    );
    await assertNotText(
      page,
      "saved-draft",
      "Detail should not expose the saved-draft enum as visible UI copy.",
    );
  }

  await page.getByRole("button", { name: "Dashboard" }).click();
  await page.getByRole("heading", { name: "Quality dashboard" }).waitFor();
  // Archive score review is rendered inside a <details> panel that is
  // collapsed by default; open it before asserting on its contents.
  await page.getByRole("heading", { name: "Archive score review" }).click();
  await page.getByText("Average archive score").waitFor();
  await assertText(
    page,
    "Average archive score",
    "Dashboard should show average archive score after opening Archive score review.",
  );
  await assertText(
    page,
    "Effectiveness evidence",
    "Dashboard should show archive-level prompt effectiveness evidence.",
  );
  await assertText(
    page,
    "measured 1 / unmeasured 1",
    "Dashboard should show measured vs unmeasured prompt effectiveness coverage.",
  );
  await assertText(
    page,
    "Link recent prompts to loop outcomes before claiming archive-wide effectiveness.",
    "Dashboard should show the archive effectiveness next action.",
  );
  await assertChartVisible(page, "dashboard", 1);
  await assertBrowserSafe(page, "dashboard");
  await captureScreenshot(page, "dashboard-desktop");

  await page.getByRole("button", { name: "Coach", exact: true }).click();
  await page.getByRole("heading", { name: "Prompt coach" }).waitFor();
  await assertTextAny(
    page,
    ["Prompt improvement workspace", "프롬프트 개선 작업공간"],
    "Coach should use the prompt improvement product identity.",
  );
  await page.getByText("Prompt habit command center").waitFor();
  await assertText(
    page,
    "Prompt habit command center",
    "Coach should show prompt habit command center.",
  );
  await assertText(
    page,
    "Fix these next",
    "Coach should show next habit fixes.",
  );
  await assertText(
    page,
    "Bad prompt review queue",
    "Coach should show low score review queue.",
  );
  await assertTextAny(
    page,
    ["Next request brief", "다음 요청 브리프"],
    "Coach should expose a copyable next request brief.",
  );
  await assertTextAny(
    page,
    [
      "Preview and copy an approval-ready coaching prompt",
      "승인 가능한 코칭 프롬프트 미리보기와 복사",
    ],
    "Coach should show the brief preview before copying.",
  );
  await assertTextAny(
    page,
    ["First fix", "첫 보완"],
    "Coach should show the first habit fix in the brief preview.",
  );
  await assertTextAny(
    page,
    ["Review target", "리뷰 대상"],
    "Coach should show the review target in the brief preview.",
  );
  await page.getByRole("button", { name: /Copy brief|브리프 복사/ }).click();
  await assertTextAny(
    page,
    ["Copied brief", "브리프 복사됨"],
    "Coach should confirm that the next request brief was copied.",
  );
  await assertBrowserSafe(page, "coach");
  await captureScreenshot(page, "coach-desktop");

  // The standalone Scores tab was dropped in PR #174 (dashboard nav-card
  // cleanup). Archive score review now lives inside the Dashboard panel and
  // is already exercised above. Practice plan, benchmark, insights, and
  // import surfaces were removed at the same time, so there is nothing left
  // to assert on between Coach and Projects.

  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await page.getByRole("heading", { name: "Projects" }).waitFor();
  await page.getByText("Agent rules").waitFor();
  await page.getByRole("button", { name: "Analyze rules" }).click();
  await page.getByText("rules file").waitFor();
  await assertBrowserSafe(page, "projects");
  await page.getByRole("button", { name: "capture on" }).click();
  await page.getByRole("button", { name: "paused" }).waitFor();
  await captureScreenshot(page, "projects-desktop");

  // MCP is now a sub-route of Settings (/mcp); the standalone sidebar
  // button is gone. Navigate via URL so the admin-fold <details> opens
  // through its open={view.name === "mcp"} prop.
  await page.goto(`${serverBaseUrl}/mcp`);
  await page.getByRole("heading", { name: "MCP tools", level: 1 }).waitFor();
  await assertTextAny(
    page,
    ["Agent-native coach tools", "에이전트 네이티브 코치 도구"],
    "MCP page should use the agent-native coach identity.",
  );
  await assertText(
    page,
    "MCP readiness",
    "MCP page should show live readiness before the tool catalog.",
  );
  await assertTextAny(
    page,
    ["Stored prompts", "저장된 프롬프트"],
    "MCP page should expose archive readiness metrics.",
  );
  await assertTextAny(
    page,
    ["First MCP call", "첫 MCP 호출"],
    "MCP page should recommend the next agent tool call.",
  );
  await assertText(
    page,
    "Core call order",
    "MCP page should show the core tool call order.",
  );
  await assertTextAny(
    page,
    ["6 core tools", "핵심 도구 6개"],
    "MCP page should show the updated core tool count.",
  );
  await assertText(
    page,
    "coach_prompt",
    "MCP page should recommend the default one-call coach tool.",
  );
  await assertText(
    page,
    "improve_prompt",
    "MCP page should expose approval-ready prompt rewriting.",
  );
  await assertText(
    page,
    "get_looprelay_status",
    "MCP page should expose the preflight status tool.",
  );
  await assertText(
    page,
    "review_project_instructions",
    "MCP page should expose project instruction review.",
  );
  await assertBrowserSafe(page, "mcp");
  await captureScreenshot(page, "mcp-desktop");

  step("Verify selected worktree memory approval without latest fallback");
  const selectedMemorySnapshot = seedSelectedMemoryWorktrees();
  await page.goto(
    `${serverBaseUrl}/loops?worktree=browser-selected-memory&session=browser-selected-session&branch=codex%2Fbrowser-selected-memory`,
  );
  await page.getByRole("heading", { name: "Loops", level: 1 }).waitFor();
  const benchmarkReadiness = page.getByRole("region", {
    name: /Effectiveness evidence|효과성 증거/,
  });
  await benchmarkReadiness.waitFor();
  assert(
    /completed|완료/.test(await benchmarkReadiness.innerText()),
    "Loops should expose body-free benchmark readiness diagnostics.",
  );
  const selectedMemoryDetail = await page.evaluate(async () => {
    const response = await fetch(
      "/api/v1/loops/worktrees/browser-selected-memory?session_id=browser-selected-session&branch=codex%2Fbrowser-selected-memory",
    );
    return response.json();
  });
  assertEqual(
    selectedMemoryDetail.data?.items?.[0]?.id,
    selectedMemorySnapshot.id,
    "Selected worktree detail should resolve the exact browser fixture.",
  );
  assert(
    selectedMemoryDetail.data?.items?.[0]?.prompt_ids?.includes(
      selectedMemorySnapshot.prompt_ids[0],
    ),
    "Selected worktree detail should expose its safe prompt ids for explicit improvement attribution.",
  );
  assertEqual(
    selectedMemoryDetail.data?.memory_candidate?.eligible,
    true,
    "Selected worktree detail should expose an eligible memory candidate.",
  );
  const selectedMemoryApprovalButton = page.getByRole("button", {
    name: /Approve selected memory|선택 메모리 승인/,
  });
  await selectedMemoryApprovalButton.waitFor();
  const attributedPromptId = selectedMemorySnapshot.prompt_ids[0];
  assert(
    typeof attributedPromptId === "string",
    "Selected memory fixture should include a prompt id for attribution.",
  );
  await page.getByRole("checkbox", { name: attributedPromptId }).check();
  await page
    .getByRole("textbox", { name: "Summary" })
    .fill(
      "Selected browser worktree checks passed with the LoopRelay improvement.",
    );
  await page
    .getByRole("textbox", { name: "Evidence" })
    .fill("test:browser-selected-memory-attribution");
  await page.getByRole("button", { name: "Save outcome" }).click();
  await page
    .locator(".loop-outcome-statuses")
    .getByText("Recorded", { exact: true })
    .waitFor();
  assert(
    readUsedImprovementPromptIds(selectedMemorySnapshot.id).includes(
      attributedPromptId,
    ),
    "Web outcome recording should persist the checked LoopRelay improvement attribution.",
  );
  await page.reload();
  await page.getByRole("heading", { name: "Loops", level: 1 }).waitFor();
  assertEqual(
    await page.getByRole("checkbox", { name: attributedPromptId }).isChecked(),
    true,
    "Web outcome attribution should remain selected after a page reload.",
  );
  await assertText(
    page,
    "browser-newer-unrelated",
    "Loops should show that another worktree is globally newer.",
  );
  await selectedMemoryApprovalButton.click();
  await page.getByText(/Memory approved|메모리 승인됨/).waitFor();
  assertEqual(
    await selectedMemoryApprovalButton.count(),
    0,
    "Selected approval button should disappear after exact snapshot approval.",
  );
  assertEqual(
    selectedMemorySnapshot.worktree_label,
    "browser-selected-memory",
    "Selected memory fixture should preserve its worktree label.",
  );
  await assertBrowserSafe(page, "selected loop memory approval");
  await captureScreenshot(page, "loops-selected-memory-desktop");

  // Export is now a sub-route of Settings (/exports); same reason as MCP.
  await page.goto(`${serverBaseUrl}/exports`);
  await page
    .getByRole("heading", { name: "Anonymized export", level: 1 })
    .waitFor();
  await page.getByRole("button", { name: "Create preview" }).click();
  await page.getByRole("heading", { name: "Preview job" }).waitFor();
  await assertBrowserSafe(page, "export preview");
  await page.getByRole("button", { name: "Run export" }).click();
  await page.getByRole("heading", { name: "Export JSON" }).waitFor();
  await assertBrowserSafe(page, "export result");
  await assertText(
    page,
    "[REDACTED:path]",
    "Export JSON preview should include anonymized paths.",
  );
  await captureScreenshot(page, "exports-desktop");

  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("heading", { name: "Settings" }).waitFor();
  await page.getByText("[local path]").first().waitFor();
  await assertText(
    page,
    "Run looprelay setup --profile coach, then send one Codex or Claude Code prompt.",
    "Settings should show an actionable next step when hook capture is waiting.",
  );
  await assertBrowserSafe(page, "settings");
  await assertText(
    page,
    "[local path]",
    "Settings should show masked local paths.",
  );
  await assertNotText(page, tempRoot, "Settings must not show raw temp paths.");
  await captureScreenshot(page, "settings-desktop");

  await page.setViewportSize({ width: 390, height: 844 });
  const viewport = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  assert(
    viewport.scrollWidth <= viewport.innerWidth,
    `Mobile layout should not overflow horizontally. scrollWidth=${viewport.scrollWidth}, innerWidth=${viewport.innerWidth}.`,
  );
  await captureScreenshot(page, "settings-mobile");

  assertEqual(
    consoleErrors.length,
    0,
    `Browser console errors: ${consoleErrors.join("\n")}`,
  );
  assertEqual(
    requestErrors.length,
    0,
    `Browser request errors: ${requestErrors.join("\n")}`,
  );

  console.log("browser e2e passed");
} finally {
  if (browser) {
    await browser.close();
  }
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
    await waitForExit(serverProcess);
  }
  rmSync(tempRoot, { recursive: true, force: true });
}

function step(message) {
  console.log(`- ${message}`);
}

function insertJudgeScoreForClaudePrompt({ score, reason }) {
  const dbPath = join(dataDir, "looprelay.sqlite");
  const db = new Database(dbPath);
  try {
    const row = db
      .prepare(
        "SELECT id FROM prompts WHERE tool = 'claude-code' AND deleted_at IS NULL ORDER BY received_at DESC LIMIT 1",
      )
      .get();
    if (!row) {
      throw new Error("No claude-code prompt found to seed a judge score.");
    }
    db.prepare(
      `
      INSERT INTO prompt_judge_scores
        (id, prompt_id, judge_tool, score, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
    ).run(
      `jdg_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
      row.id,
      "claude",
      score,
      reason,
      new Date().toISOString(),
    );
  } finally {
    db.close();
  }
}

function insertLoopOutcomeForClaudePrompt() {
  const dbPath = join(dataDir, "looprelay.sqlite");
  const db = new Database(dbPath);
  try {
    const row = db
      .prepare(
        "SELECT id FROM prompts WHERE tool = 'claude-code' AND deleted_at IS NULL ORDER BY received_at DESC LIMIT 1",
      )
      .get();
    if (!row) {
      throw new Error("No claude-code prompt found to seed loop outcome.");
    }

    db.prepare(
      `
      INSERT INTO loop_snapshots (
        id,
        created_at,
        tool,
        source,
        session_id,
        thread_id,
        cwd_label,
        project_id,
        git_root_hash,
        branch,
        worktree_label,
        prompt_ids_json,
        event_counts_json,
        quality_json,
        outcome_json,
        next_brief_json,
        privacy_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      "loop_browser_effectiveness",
      new Date().toISOString(),
      "codex",
      "mcp",
      "browser-e2e-loop",
      null,
      "private-project",
      "proj_browser",
      null,
      "codex/browser-effectiveness",
      "browser-effectiveness",
      JSON.stringify([row.id]),
      JSON.stringify({ prompts: 1, tests_run: 4 }),
      JSON.stringify({
        average_prompt_score: 88,
        top_gaps: ["verification_criteria"],
        unresolved_questions: [],
      }),
      JSON.stringify({
        status: "passed",
        summary: "browser e2e outcome passed",
        evidence_refs: [
          "PR #451",
          "main CI 28748001738",
          join(rawPathPrefix, "private-project", "secret.txt"),
          rawSecret,
        ],
        used_improvement_prompt_ids: [row.id],
      }),
      JSON.stringify({
        generated: true,
        prompt_id: row.id,
        summary: "Continue from browser e2e outcome evidence.",
      }),
      JSON.stringify({
        stores_prompt_bodies: false,
        stores_raw_paths: false,
        local_only: true,
      }),
    );
  } finally {
    db.close();
  }
}

function seedSelectedMemoryWorktrees() {
  const selected = JSON.parse(
    runCli([
      "loop",
      "collect",
      "--data-dir",
      dataDir,
      "--cwd-prefix",
      privateProjectDir,
      "--worktree",
      "browser-selected-memory",
      "--branch",
      "codex/browser-selected-memory",
      "--json",
    ]),
  );
  runCli([
    "loop",
    "outcome",
    "--data-dir",
    dataDir,
    "--snapshot-id",
    selected.id,
    "--status",
    "passed",
    "--summary",
    "Selected browser worktree checks passed.",
    "--evidence-ref",
    "test:browser-selected-memory",
    "--json",
  ]);
  runCli([
    "loop",
    "collect",
    "--data-dir",
    dataDir,
    "--cwd-prefix",
    privateProjectDir,
    "--worktree",
    "browser-newer-unrelated",
    "--branch",
    "codex/browser-newer-unrelated",
    "--json",
  ]);

  const db = new Database(join(dataDir, "looprelay.sqlite"));
  try {
    db.prepare("UPDATE loop_snapshots SET session_id = ? WHERE id = ?").run(
      "browser-selected-session",
      selected.id,
    );
  } finally {
    db.close();
  }

  return { ...selected, worktree_label: "browser-selected-memory" };
}

function readUsedImprovementPromptIds(snapshotId) {
  const db = new Database(join(dataDir, "looprelay.sqlite"));
  try {
    const row = db
      .prepare("SELECT outcome_json FROM loop_snapshots WHERE id = ?")
      .get(snapshotId);
    if (!row) return [];
    const outcome = JSON.parse(row.outcome_json);
    return Array.isArray(outcome.used_improvement_prompt_ids)
      ? outcome.used_improvement_prompt_ids
      : [];
  } finally {
    db.close();
  }
}

function runCli(args) {
  const result = spawnSync("node", [cliPath, ...args], {
    env: cliEnv,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(
      `CLI failed: looprelay ${args.join(" ")}\n${result.stderr}`,
    );
  }
  return result.stdout.trim();
}

function configurePort(port) {
  const configPath = join(dataDir, "config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  config.server.port = port;
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
}

function startServer() {
  const child = spawn("node", [cliPath, "server", "--data-dir", dataDir], {
    env: cliEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stderr.on("data", (chunk) => {
    const text = Buffer.from(chunk).toString("utf8").trim();
    if (text) {
      console.error(text);
    }
  });
  return child;
}

async function ingest(serverBaseUrl, path, payload) {
  const hookAuth = JSON.parse(
    readFileSync(join(dataDir, "hook-auth.json"), "utf8"),
  );
  const response = await fetch(`${serverBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${hookAuth.ingest_token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok || !body.data?.stored) {
    throw new Error(`Ingest failed for ${path}: ${JSON.stringify(body)}`);
  }
  return body.data.id;
}

async function launchBrowser() {
  try {
    return await chromium.launch({
      headless: process.env.PWDEBUG !== "1",
    });
  } catch (error) {
    throw new Error(
      `Unable to launch Playwright Chromium. Run \`pnpm exec playwright install chromium\` and retry.\n${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function assertBrowserSafe(page, label) {
  const text = await page.locator("body").innerText();
  assertNotIncludes(text, rawPathPrefix, `${label} must not show raw paths.`);
  assertNotIncludes(text, rawSecret, `${label} must not show raw secrets.`);
}

async function captureScreenshot(page, name) {
  if (!screenshotDir) {
    return;
  }

  mkdirSync(screenshotDir, { recursive: true });
  const path = join(screenshotDir, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log(`- captured ${path}`);
}

async function forceClipboardFailure(page) {
  await page.evaluate(() => {
    if (!window.__loopRelayE2eClipboard) {
      Object.defineProperty(window, "__loopRelayE2eClipboard", {
        configurable: true,
        value: {
          clipboard: navigator.clipboard,
          execCommand: document.execCommand,
        },
      });
    }
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: () => false,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error("clipboard denied")),
      },
    });
  });
}

async function restoreClipboard(page) {
  await page.evaluate(() => {
    const clipboardState = window.__loopRelayE2eClipboard;
    if (!clipboardState) {
      return;
    }
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: clipboardState.execCommand,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: clipboardState.clipboard,
    });
    Reflect.deleteProperty(window, "__loopRelayE2eClipboard");
  });
}

async function assertText(page, expected, message) {
  const text = await page.locator("body").innerText();
  assertIncludes(text, expected, message);
}

async function currentPromptDetail(page) {
  const text = await page.locator("body").innerText();
  const match = text.match(/looprelay:score_prompt prompt_id=(\S+)/);
  assert(match, "Detail view should expose the selected prompt id.");
  return page.evaluate(async (promptId) => {
    const response = await fetch(`/api/v1/prompts/${promptId}`);
    if (!response.ok) {
      throw new Error(`Prompt detail API failed with ${response.status}`);
    }
    const body = await response.json();
    return body.data;
  }, match[1]);
}

async function assertTextAny(page, expectedOptions, message) {
  const text = await page.locator("body").innerText();
  const normalized = text.toLowerCase();
  if (
    expectedOptions.some((expected) =>
      normalized.includes(expected.toLowerCase()),
    )
  ) {
    return;
  }
  throw new Error(`${message} Missing one of ${expectedOptions.join(", ")}.`);
}

async function assertChartVisible(page, label, minCount) {
  await page.locator(".recharts-surface").first().waitFor();
  const count = await page.locator(".recharts-surface").count();
  assert(
    count >= minCount,
    `${label} should render at least ${minCount} Recharts SVG chart(s). Found ${count}.`,
  );
}

async function assertNotText(page, unexpected, message) {
  const text = await page.locator("body").innerText();
  assertNotIncludes(text, unexpected, message);
}

async function waitForHealth(url) {
  const started = Date.now();
  while (Date.now() - started < 10_000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the server starts listening.
    }
    await delay(100);
  }
  throw new Error("Server did not become healthy within 10 seconds.");
}

function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolvePort(address.port));
    });
    server.on("error", reject);
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message} Expected ${expected}, got ${actual}.`);
  }
}

function assertIncludes(value, expected, message) {
  if (!value.includes(expected)) {
    throw new Error(`${message} Missing ${expected}.`);
  }
}

function assertNotIncludes(value, unexpected, message) {
  if (value.includes(unexpected)) {
    throw new Error(`${message} Found ${unexpected}.`);
  }
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function waitForExit(child) {
  return new Promise((resolveExit) => {
    if (child.exitCode !== null) {
      resolveExit();
      return;
    }
    child.once("exit", () => resolveExit());
  });
}
