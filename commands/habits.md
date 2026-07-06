---
description: Summarize recent PromptLane habits and recurring gaps
allowed-tools: Bash
---

# PromptLane Habits

Prefer the MCP tool when it is available:

```text
promptlane:score_prompt_archive max_prompts=200 low_score_limit=8
```

Summarize:

- archive score and trend signal if available
- top recurring quality gaps
- the highest priority practice rule
- low-score prompt ids that are safe to review
- the next prompt template if the user asks for a draft

If MCP is not configured, run:

```bash
promptlane score --json --limit 200 --low-score-limit 8
```

Do not print raw prompt bodies, raw hook payloads, raw absolute paths, tokens,
or secrets.
