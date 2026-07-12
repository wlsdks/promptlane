import mainReport from "../../../reports/usefulness-summary.json" with { type: "json" };
import realTaskReport from "../../../reports/usefulness-real-task-summary.json" with { type: "json" };
import solTerraReport from "../../../reports/usefulness-sol-terra-summary.json" with { type: "json" };
import resumeReliabilityReport from "../../../reports/resume-reliability-summary.json" with { type: "json" };

type DirectionalReport = {
  causal_claim: boolean;
  design: string;
  independent_humans: {
    successful_flow_count: number;
  };
  independent_user_count: number;
  looprelay: {
    mean_actionability: number;
    mean_input_tokens: number;
    mean_time_to_first_value_ms: number;
    success_rate: number;
  };
  pair_count: number;
  public_readiness: {
    ready: boolean;
    reason: string;
  };
  status: string;
  task_type_count: number;
  transitions: {
    improved: number;
    regressed: number;
    unchanged_failed: number;
    unchanged_passed: number;
  };
  baseline: {
    mean_actionability: number;
    mean_input_tokens: number;
    mean_time_to_first_value_ms: number;
    success_rate: number;
  };
  by_task_type: Record<
    string,
    {
      decision: { action: string; evidence_status: string };
      pair_count: number;
      success_rate_delta: number;
    }
  >;
};

export type ProductEvidenceReport = DirectionalReport;

export const PRODUCT_EVIDENCE = {
  primary: mainReport as ProductEvidenceReport,
  cohorts: [
    {
      label: "Maintainer matched pairs",
      report: mainReport as ProductEvidenceReport,
      scope: "Broad task coverage",
    },
    {
      label: "Unseen real tasks",
      report: realTaskReport as ProductEvidenceReport,
      scope: "Separate real-repository cohort",
    },
    {
      label: "Sol plan / Terra execution",
      report: solTerraReport as ProductEvidenceReport,
      scope: "Counterbalanced model workflow",
    },
  ],
} as const;

export const RESUME_RELIABILITY_PROGRAM = resumeReliabilityReport as {
  causal_claim: false;
  cohort: "agent_native_blind_recovery";
  counterbalanced: boolean;
  intervention: {
    decision: "collect" | "narrow" | "retain_opt_in";
    rationale: string;
  };
  minimum_pairs: number;
  pair_count: number;
  pairs_remaining: number;
  order: {
    baseline_first: number;
    looprelay_first: number;
  };
  recovery_class_coverage: {
    observed: number;
    required: number;
  };
  scoring: {
    method: "tool_event_trace";
    model_self_report_used: false;
  };
  status: "collecting" | "directional_evidence_ready";
};
