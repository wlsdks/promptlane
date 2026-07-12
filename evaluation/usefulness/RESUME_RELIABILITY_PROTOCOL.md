# Resume Reliability Evaluation Protocol

Measure whether LoopRelay improves a coding agent's first correct action after
a long-running task resumes. This is a raw-free, matched observational cohort;
it does not establish causality.

## Cohort

- Collect exactly 10 distinct session-recovery pairs before changing the
  default intervention policy.
- Counterbalance order: five `baseline_first`, five `looprelay_first`.
- Cover at least three raw-free recovery classes. The current classes are
  checkpoint focus, compaction handoff, failure outcome, policy recovery,
  privacy boundary, and worktree resolution; a class records no task text.
- Use fresh coding-agent sessions and the same repository state for both
  conditions in a pair.
- This is an agent-native blind-recovery cohort, not a human-adoption study.
  Both conditions receive the same generic request to resume; the selected
  recovery contract is intentionally absent from ordinary repository evidence.
- The baseline receives only that request and ordinary repository evidence.
  The LoopRelay condition receives the selected local checkpoint or
  continuation brief. Mark `adopted` true only when supplied.

## Raw-free record

For each condition, retain only booleans and aggregate counts:

- `passed`
- `correct_target`: selected repository/worktree/branch was correct
- `correct_first_action`: first meaningful action matched the recovery plan
- `evidence_attached`: final result cited the available outcome evidence
- elapsed milliseconds, friction count, and wrong-target count

Never record prompt text, transcript text, paths, branch names, worktree
labels, session ids, secrets, or credentials.

If a fresh tool-event trace ends before the required evidence-bearing result,
retain the observation as failed with `evidence_attached: false`; do not rerun
it to replace an unfavorable treatment trace.

## Decision rule

Until all ten pairs, the 5/5 order balance, and three recovery classes are
present, the policy is `collect`: LoopRelay remains opt-in and no broad default
intervention is justified. After that,
retain opt-in resume guidance only when both correct-target and correct-first-
action rates improve without more regressions than improvements. Otherwise
narrow it to explicit recovery signals.

Generate the current report with:

```bash
node scripts/resume-reliability-report.mjs \
  reports/resume-reliability-pairs.json \
  reports/resume-reliability-summary.json
```
