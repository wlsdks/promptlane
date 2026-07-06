---
description: Set up PromptLane capture or the one-command coach profile
allowed-tools: Bash, Read, AskUserQuestion
---

# Set Up PromptLane

First check that the CLI is installed:

```bash
command -v promptlane || command -v promptlane
```

If this returns nothing, stop and tell the user to install the CLI first. After
the npm package is published, the normal install path is:

```bash
npm install -g promptlane
```

For local development from a cloned repository, use the two-line bring-up:

```bash
pnpm install   # also runs `pnpm build` via the prepare lifecycle
pnpm setup     # alias for promptlane setup --profile coach --register-mcp --open-web
```

`pnpm setup` is the same one-command path the README recommends — it
installs the Claude Code and Codex hooks, registers the MCP server with
absolute paths so PATH ordering does not matter, installs the Claude
Code status line, and enables the local-server SessionStart hook. For Codex,
this is the preferred path because it avoids relying on a global
`promptlane` binary in PATH. Use `pnpm setup` when the user just wants
"make it work"; only fall back to the explicit `promptlane setup ...`
invocations below when the user wants a different profile or a dry-run preview.
The `promptlane` CLI alias points at the same binary and can be used for manual
terminal workflows, but Claude Code slash commands remain under
`/promptlane:*` during the migration.

For the lowest-friction setup with the explicit invocation, preview the
coach profile first:

```bash
promptlane setup --profile coach --register-mcp --dry-run
# or, with the product-name CLI alias:
promptlane setup --profile coach --register-mcp --dry-run
```

Explain the planned changes to the user. The setup may initialize
`~/.promptlane`, add Claude Code or Codex hooks, and install a local server
service where supported. The coach profile also installs low-friction rewrite
guidance and the Claude Code status line when Claude Code is detected. If an
existing Claude Code status line is already configured, promptlane chains it
instead of replacing it and restores it on uninstall where possible. With
`--register-mcp`, it also runs the detected `claude mcp add` or `codex mcp add`
command so this active agent can use promptlane tools.

If the user wants the web workspace to open beside Claude Code or Codex at
agent startup, explain that this is opt-in and preview:

```bash
promptlane setup --profile coach --register-mcp --open-web --dry-run
```

If the user approves, run:

```bash
promptlane setup --profile coach --register-mcp
# or:
promptlane setup --profile coach --register-mcp
```

If the user approved automatic web opening, include `--open-web` in the real
setup command. The hook opens the browser once per agent session id and fails
open without printing prompts, paths, or tokens.

After setup, keep the first success path short:

```bash
# ask the user to send one real Claude Code or Codex coding prompt, then:
promptlane coach
```

Use `doctor` only if the prompt does not appear:

```bash
promptlane doctor claude-code
promptlane doctor codex
```

If MCP registration fails or the user chooses not to use `--register-mcp`,
first recommend rerunning the setup command. Provide manual commands only for a
published/global install where `command -v promptlane` succeeds:

```bash
claude mcp add --transport stdio promptlane -- promptlane mcp
codex mcp add promptlane -- promptlane mcp
```

Use the default capture-only profile only when the user wants passive recording
without prompt coaching:

```bash
promptlane setup
```

Verify the result:

```bash
promptlane statusline claude-code
```

Tell the user to restart Claude Code if the new status line does not appear.
