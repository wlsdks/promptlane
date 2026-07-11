# Independent participant handoff — candidate 3922235b

This is a human-validation candidate, not a release artifact. It does not
authorize npm publication, a GitHub Release, or movement of `v1.0.0`.

The maintainer supplies this file separately:

- filename: `looprelay-1.0.0.tgz`
- SHA-256: `d055742dc0a519019a74803dcd519ddef5b7212d87ea37982294b150f28926c7`

The participant must be a human who did not implement LoopRelay and did not
rehearse this flow. Agent operators and the maintainer do not count.

## Verify and run

Set `TARBALL` to the delivered file, verify the checksum, then follow the
canonical protocol without sending prompts, terminal output, paths, names, or
free-form notes back to the maintainer.

```sh
TARBALL="/path/to/looprelay-1.0.0.tgz"
printf '%s  %s\n' \
  'd055742dc0a519019a74803dcd519ddef5b7212d87ea37982294b150f28926c7' \
  "$TARBALL" | shasum -a 256 -c -
```

Continue with
[`INDEPENDENT_USER_PROTOCOL.md`](./INDEPENDENT_USER_PROTOCOL.md). Return only
the normalized JSON produced by the participant-intake validator. Failed and
confusing flows must still be returned; do not retry them away.

## Maintainer-only preflight evidence

The candidate passed an isolated maintainer smoke on Node 22.22.0 with an
empty HOME, isolated npm prefix and cache, and fresh Git repository. Total
install-to-first-value time was 8.975 seconds and raw-path hits were zero. This
does not count toward the 3-user gate. The raw-free manifest is
[`reports/independent-user-candidate.json`](../../reports/independent-user-candidate.json).
