---
description: Check Loopdeck capture health
allowed-tools: Bash
---

# Loopdeck Status

First check that the CLI is installed:

```bash
command -v prompt-coach || command -v loopdeck
```

If this returns nothing, report that the plugin is installed but neither the
`prompt-coach` CLI nor the `loopdeck` alias is on `PATH` yet.

Run the `prompt-coach` commands by default. If only the product-name alias is
available, use the matching `loopdeck` command:

```bash
prompt-coach doctor claude-code
loopdeck doctor claude-code
prompt-coach statusline claude-code
```

If Codex is installed, also run:

```bash
prompt-coach doctor codex
```

Report whether the local server is reachable, the hook is installed, and the
MCP command access is registered. `doctor` may use read-only `mcp list`
fallbacks when config-file detection is inconclusive. Do not print raw prompt
bodies or raw hook payloads.
