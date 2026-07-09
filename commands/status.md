---
description: Check PromptLane capture health
allowed-tools: Bash
---

# PromptLane Status

First check that the CLI is installed:

```bash
command -v promptlane
```

If this returns nothing, report that the plugin is installed but the
`promptlane` CLI is not on `PATH` yet.

After the npm package is published, the normal install path is:

```bash
npm install -g promptlane
```

Before npm publish, or for local development, use a cloned repository:

```bash
git clone https://github.com/wlsdks/promptlane.git
cd promptlane
pnpm install
pnpm setup
```

Run the canonical `promptlane` commands:

```bash
promptlane doctor claude-code
promptlane statusline claude-code
```

If Codex is installed, also run:

```bash
promptlane doctor codex
promptlane doctor codex --json
```

Report whether the local server is reachable, the hook is installed, and the
MCP command access is registered. In JSON output, report top-level
`status: ready` or `status: needs_attention` instead of recomputing readiness
from nested booleans. `doctor` may use read-only `mcp list` fallbacks when
config-file detection is inconclusive. Do not print raw prompt bodies or raw
hook payloads.
