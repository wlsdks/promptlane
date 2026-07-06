---
description: Check PromptLane capture health
allowed-tools: Bash
---

# PromptLane Status

First check that the CLI is installed:

```bash
command -v promptlane || command -v promptlane
```

If this returns nothing, report that the plugin is installed but neither the
`promptlane` CLI nor the `promptlane` alias is on `PATH` yet.

Run the `promptlane` commands by default. If only the product-name alias is
available, use the matching `promptlane` command:

```bash
promptlane doctor claude-code
promptlane doctor claude-code
promptlane statusline claude-code
```

If Codex is installed, also run:

```bash
promptlane doctor codex
```

Report whether the local server is reachable, the hook is installed, and the
MCP command access is registered. `doctor` may use read-only `mcp list`
fallbacks when config-file detection is inconclusive. Do not print raw prompt
bodies or raw hook payloads.
