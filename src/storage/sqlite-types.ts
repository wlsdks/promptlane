import type { ExperimentalRuleId } from "../analysis/analyze.js";
import type { RedactionPolicy } from "../shared/schema.js";
import type {
  AgentPromptJudgmentStoragePort,
  AgentRunStoragePort,
  AskEventStoragePort,
  CoachFeedbackStoragePort,
  CompactBoundaryStoragePort,
  ContinuationReceiptStoragePort,
  ExportJobStoragePort,
  ImportJobStoragePort,
  JudgeScoreStoragePort,
  LoopMemoryStoragePort,
  LoopMergeDecisionStoragePort,
  LoopSnapshotStoragePort,
  ProjectInstructionStoragePort,
  ProjectPolicyStoragePort,
  PromptReadStoragePort,
  PromptStoragePort,
} from "./ports.js";
import type { PromptRow } from "./sqlite-rows.js";

export type SqlitePromptStorageOptions = {
  dataDir: string;
  hmacSecret: string;
  now?: () => Date;
  experimentalRules?: readonly ExperimentalRuleId[];
};

export type AppliedMigration = { version: number; name: string };

export type SqlitePromptStorage = PromptStoragePort &
  PromptReadStoragePort &
  ProjectPolicyStoragePort &
  ProjectInstructionStoragePort &
  ImportJobStoragePort &
  ExportJobStoragePort &
  AgentPromptJudgmentStoragePort &
  CoachFeedbackStoragePort &
  JudgeScoreStoragePort &
  AskEventStoragePort &
  LoopSnapshotStoragePort &
  CompactBoundaryStoragePort &
  LoopMemoryStoragePort &
  LoopMergeDecisionStoragePort &
  AgentRunStoragePort &
  ContinuationReceiptStoragePort & {
    close(): void;
    getAppliedMigrations(): AppliedMigration[];
    listPromptRows(): PromptRow[];
    searchPromptIds(query: string): string[];
    rebuildIndex(options: { redactionMode: RedactionPolicy }): {
      rebuilt: string[];
      hashMismatches: string[];
    };
    reconcileStorage(): {
      missingFiles: string[];
    };
  };
