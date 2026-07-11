import { spawnSync } from "node:child_process";
import { platform } from "node:os";

import { decideCoachingAction } from "../analysis/coaching-decision.js";
import { HOOK_COPY } from "./rewrite-guard-copy.js";

export { isAcknowledgment } from "../analysis/coaching-decision.js";

export type PromptRewriteGuardMode =
  | "off"
  | "block-and-copy"
  | "context"
  | "ask";

export type AskEventReport = {
  tool: "claude-code" | "codex";
  score: number;
  band: "weak" | "needs_work" | "good" | "excellent";
  missing_axes: string[];
  language: "en" | "ko";
  prompt_length: number;
  triggered_at: string;
};

export type PromptRewriteGuardOptions = {
  mode?: PromptRewriteGuardMode;
  minScore?: number;
  language?: "en" | "ko";
  now?: Date;
  copyToClipboard?: (text: string) => boolean;
  /**
   * Tool that triggered the hook. Ask mode emits a Claude-Code-specific
   * AskUserQuestion instruction by default; on Codex it switches to an
   * MCP-tool-call instruction since Codex has no native AskUserQuestion
   * but can call the looprelay `ask_clarifying_questions` MCP tool.
   */
  tool?: "claude-code" | "codex";
  /**
   * When true, ask the host CLI to keep the hook output (additionalContext or
   * block reason) hidden from the user-visible chat surface and only feed it
   * to the model. Codex's UserPromptSubmit honors this `suppressOutput` field
   * from the shared hook JSON; Claude Code ignores it. Defaults to false to
   * preserve existing Claude Code behavior.
   */
  suppressOutput?: boolean;
  /**
   * Optional sink invoked exactly when ask mode actually fires
   * (additionalContext built). Lets the wrapper post a measurement event
   * to the local server for dashboard analytics.
   */
  onAskTriggered?: (report: AskEventReport) => void;
};

export type PromptRewriteGuardOutput =
  | {
      decision: "block";
      reason: string;
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit";
      };
      suppressOutput?: true;
    }
  | {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit";
        additionalContext: string;
      };
      suppressOutput?: true;
    };

export function createPromptRewriteGuardOutput(
  payload: unknown,
  options: PromptRewriteGuardOptions = {},
): PromptRewriteGuardOutput | undefined {
  const prompt = readSubmittedPrompt(payload);
  const decision = decideCoachingAction(prompt, {
    mode: options.mode ?? "off",
    minScore: options.minScore,
    language: options.language,
    now: options.now,
  });

  if (decision.action === "none") {
    return undefined;
  }

  const { analysis, improvement, language } = decision;
  const createdAt = (options.now ?? new Date()).toISOString();
  const copy = HOOK_COPY[language];

  if (decision.action === "ask") {
    const sectionLabels =
      language === "ko"
        ? {
            goal_clarity: "목표 명확성",
            background_context: "배경 맥락",
            scope_limits: "범위 제한",
            output_format: "출력 형식",
            verification_criteria: "검증 기준",
          }
        : {
            goal_clarity: "Goal clarity",
            background_context: "Background context",
            scope_limits: "Scope limits",
            output_format: "Output format",
            verification_criteria: "Verification criteria",
          };
    const axesLabel = improvement.clarifying_questions
      .map((question) => sectionLabels[question.axis])
      .join(", ");
    const numberedQuestions = improvement.clarifying_questions
      .map((question, index) => `${index + 1}. ${question.ask}`)
      .join("\n");
    const isCodex = options.tool === "codex";
    const askInstruction = isCodex
      ? copy.askInstructionCodex
      : copy.askInstruction;

    if (options.onAskTriggered) {
      try {
        options.onAskTriggered({
          tool: options.tool ?? "claude-code",
          score: analysis.quality_score.value,
          band: analysis.quality_score.band,
          missing_axes: decision.missingAxes,
          language,
          prompt_length: prompt.trim().length,
          triggered_at: createdAt,
        });
      } catch {
        // Telemetry must never block the hook.
      }
    }

    return {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: [
          copy.askHeader,
          copy.askIntro(
            analysis.quality_score.value,
            analysis.quality_score.band,
            axesLabel,
          ),
          "",
          askInstruction,
          "",
          copy.askQuestionsHeader,
          numberedQuestions,
          "",
          copy.askFooter,
        ].join("\n"),
      },
      ...(options.suppressOutput ? { suppressOutput: true as const } : {}),
    };
  }

  if (decision.action === "context") {
    return {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: [
          copy.contextHeader,
          copy.scoreLine(
            analysis.quality_score.value,
            analysis.quality_score.band,
          ),
          copy.contextHint,
          "",
          improvement.improved_prompt,
        ].join("\n"),
      },
      ...(options.suppressOutput ? { suppressOutput: true as const } : {}),
    };
  }

  const copied =
    options.copyToClipboard?.(improvement.improved_prompt) ??
    copyTextToClipboard(improvement.improved_prompt);

  return {
    decision: "block",
    reason: [
      copy.blockedReason(
        analysis.quality_score.value,
        analysis.quality_score.band,
        decision.minScore,
      ),
      copied ? copy.clipboardHit : copy.clipboardMiss,
      "",
      copy.improvedHeader,
      improvement.improved_prompt,
      "",
      copy.safetyHeader,
      ...improvement.safety_notes.map((note) => `- ${note}`),
    ].join("\n"),
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
    },
    ...(options.suppressOutput ? { suppressOutput: true as const } : {}),
  };
}

export function parsePromptRewriteGuardMode(
  value: string | undefined,
): PromptRewriteGuardMode {
  if (
    value === "block-and-copy" ||
    value === "context" ||
    value === "off" ||
    value === "ask"
  ) {
    return value;
  }

  return "off";
}

function readSubmittedPrompt(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const prompt = (payload as { prompt?: unknown }).prompt;
  return typeof prompt === "string" ? prompt : "";
}

function copyTextToClipboard(text: string): boolean {
  const currentPlatform = platform();
  if (currentPlatform === "darwin") {
    return runClipboardCommand("pbcopy", [], text);
  }

  if (currentPlatform === "win32") {
    return runClipboardCommand("clip.exe", [], text);
  }

  return (
    runClipboardCommand("wl-copy", [], text) ||
    runClipboardCommand("xclip", ["-selection", "clipboard"], text) ||
    runClipboardCommand("xsel", ["--clipboard", "--input"], text)
  );
}

function runClipboardCommand(
  command: string,
  args: string[],
  input: string,
): boolean {
  const result = spawnSync(command, args, {
    input,
    encoding: "utf8",
    timeout: 1_000,
    windowsHide: true,
  });

  return result.status === 0;
}
