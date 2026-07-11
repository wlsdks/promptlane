# Adaptive Agent Guide Evaluation Protocol

Compare a free-choice baseline with a LoopRelay-guided condition on matched,
counterbalanced coding tasks. Include planning, implementation, and debugging.

For each pair record only raw-free metadata: task type, condition, selected
model profile, recommendation acceptance, outcome status, attempts, focused
test count, first-value seconds, and operator friction. Do not store prompt
bodies, model responses, hidden reasoning, tokens, prices, paths, credentials,
or transcripts.

Report success rate, failure transitions, recommendation adoption, first-value
time, retries, and friction. Label every report `causal_claim: false` unless a
separate randomized study establishes causality. Negative and null results are
retained; a profile mapping is narrowed or removed when local evidence does not
justify it.
