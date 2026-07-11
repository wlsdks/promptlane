# Independent install-to-first-value protocol

This protocol is for a human who did not build LoopRelay and did not
participate in its design. Agent-operator runs do not count.

The maintainer provides one candidate tarball and its SHA-256. The participant
uses a fresh temporary directory and does not share prompts, command output,
paths, usernames, repository names, or free-form notes.

For the currently validated candidate, use the versioned handoff file in this
directory and verify its checksum before starting. A handoff is validation-only
and never authorizes publishing or moving an existing tag.

## Participant flow

1. Start a timer before installation.
2. Create a fresh temporary directory with empty `HOME` and npm prefix.
3. Install the provided tarball into that prefix.
4. Stop the install timer when `looprelay --version` succeeds.
5. From a fresh empty git repository, discover the loop commands through
   `looprelay loop --help`.
6. Create a body-free checkpoint with a synthetic summary:

   ```bash
   looprelay loop checkpoint \
     --summary "Continue independent first-value validation and verify the local brief." \
     --status in_progress \
     --evidence-ref participant:first-value \
     --json
   ```

7. Run `looprelay loop brief --json` without copying its body elsewhere.
8. First value succeeds only when the result identifies the checkpoint summary,
   provides a next continuation prompt, remains local-only, and exposes no raw
   path or unrelated project state.
9. Stop the first-value timer. Count commands that required recovery and any
   confusing or failed steps as friction; failed flows must still be returned.

## Raw-free result

Generate a template in the maintainer checkout:

```bash
pnpm --silent evidence:participant-intake -- --template
```

Replace only the typed values. Use a random label such as `participant-k7m2`;
never use a name, email, handle, hostname, or project label. Do not add fields or
notes. `independence_confirmed` defaults to `false`; change it to `true` only
after personally confirming the independence rule below. Validate the file
before sending it to the maintainer:

```bash
pnpm --silent evidence:participant-intake -- participant-result.json
```

The normalized JSON is the only evidence returned. A privacy, data-loss, or
installation blocker must be marked `true`; it must not be explained with raw
content in the result file. A recoverable install failure can remain
`install_blocker: false`, while a defect that prevents a supported clean
installation is `true`. The maintainer follows up privately and blocks release.

The maintainer appends every returned result, including failures, through the
validated atomic path and then regenerates the report:

```bash
pnpm --silent evidence:participant-intake -- \
  --append-to reports/usefulness-pairs.json participant-result.json
pnpm evidence:usefulness
```

Duplicate participant labels fail without replacing the ledger. The generated
summary keeps independent-human install success, first-value success, mean
install/TTFV, recovery, friction, and privacy/data-loss/install blocker counts
separate from matched-pair and agent-operator cohorts.

## Independence and counting

- `independence_confirmed` is true only for a human who did not implement or
  pre-rehearse this flow.
- A failed install or first-value attempt counts as a participant result, not as
  a successful completion.
- The public gate requires three independent, successful, blocker-free results.
- Results are appended only after validation and duplicate participant labels
  are rejected.
