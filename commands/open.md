---
description: Open the local PromptLane archive
allowed-tools: Bash
---

# Open PromptLane

Check whether the local server is already configured:

```bash
promptlane service status || true
promptlane statusline claude-code || true
```

Open the local archive:

```text
http://127.0.0.1:17373
```

If the status line says the server is down, ask the user whether to start the
service:

```bash
promptlane service start
```

If service startup is unsupported on this platform, tell the user to run this in
a separate terminal because it stays in the foreground:

```bash
promptlane server
```
