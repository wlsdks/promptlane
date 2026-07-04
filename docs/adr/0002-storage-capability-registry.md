# 0002 — Storage Capability Registry

- Status: Accepted
- Date: 2026-07-05
- Tracks: Track A4 from the 2026-05-08 multi-track improvement pass

## Context

`src/storage/ports.ts` exposes the storage surface as a union of small ports.
Some are required (e.g. `PromptStoragePort`); several are optional and the
ingest/route layer guards each call site by hand:

```ts
// server/routes/ingest.ts
if (!options.storage.recordAskEvent) {
  throw problem(503, "Service Unavailable", ...);
}
options.storage.recordAskEvent({...});

// server/routes/projects.ts
if (!storage.getProjectPolicyForEvent) {...}

// server/routes/coach-feedback.ts
if (!storage.recordCoachFeedback || !storage.getCoachFeedbackSummary) {...}
```

There are roughly eight such guards across `server/routes/ingest.ts`,
`server/routes/projects.ts`, and `server/routes/coach-feedback.ts`. Each guard
chooses its own failure shape (some throw a Problem, some do narrowing). The
typing prevents NULL crashes, but the policy ("server returns 503 if the
storage backend lacks this capability") is duplicated and easy to forget when
a new optional method is added.

`MCP` calls into the same storage and tends to use optional chaining
(`storage.recordAskEvent?.(...)`) to silently no-op. The two surfaces have
inconsistent reactions to a missing capability.

## Friction signals

- Adding a new optional capability requires touching every call site to add a
  guard.
- The "fail loudly at the route" vs. "no-op at the MCP" choice is not stated
  anywhere; it is implicit in each call site.
- Tests that swap storage implementations rely on the type system noticing
  missing methods, which only works when the consumer narrows correctly.

## Considered options

### Option A — capability negotiation at server start

Each route or handler declares the capabilities it requires when it
registers:

```ts
registerIngestRoutes(server, {
  storage,
  capabilities: ["recordAskEvent"],
});
```

The registration helper checks the storage object exposes those methods and
fails server bootstrap with a clear error if any are missing. Inside the
route, the code can assume the methods exist (TypeScript narrows the storage
type to `PromptStoragePort & AskEventStoragePort`). MCP can do the same: if a
tool needs a capability and the storage does not provide it, the tool is not
registered, and the agent gets a clean "tool not available" instead of a
silent no-op.

Pros: removes per-call guards. Gives the user a fast and unambiguous failure
("`recordAskEvent` is required but the SQLite backend does not provide it").
Makes "what does this surface need" explicit at registration.

Cons: slight refactor of every route/MCP tool registration to declare its
capability set; a new helper module to negotiate.

### Option B — make every port required

Drop `Partial<...>` and require all ports on every storage impl. SQLite
already implements them; alternative storage backends would have to as well,
even if just as no-op stubs that throw "not supported".

Pros: removes the optionality entirely.

Cons: punts the policy to the implementation. Stub methods that throw at call
time are worse than missing methods that fail at registration. Future
backends (test fakes, in-memory) get extra surface to satisfy.

### Option C — shared guard helper, files unchanged

Introduce `requireCapability(storage, "recordAskEvent")` that throws a
Problem if missing and returns a typed reference. Replace the eight
hand-rolled guards. No registration-time check.

Pros: minimal churn, easy migration.

Cons: still pays the cost at every call site; just centralizes the failure
shape. The "is the capability available" check still happens once per request
instead of once at startup.

## Decision

Adopt **Option A as the target architecture** with **Option C allowed as an
intermediate migration step**.

Storage capability requirements should be declared once at route/tool
registration, not rediscovered inside every request handler. A route or MCP
tool that requires `recordAskEvent`, project policy methods, project
instruction review, loop snapshots, loop memories, or feedback summaries
should declare that capability up front. Registration should fail with a clear
local configuration error if the active storage backend lacks that capability.

Until the registration-time helper exists, new code may use a shared
`requireCapability` helper to centralize the failure shape. New hand-written
`if (!storage.someMethod)` guards should not be added unless the call site is
being preserved temporarily during migration.

Option B is rejected. Making every port required would turn unsupported
features into implementation stubs and move the failure later, which is worse
for local-first reliability and harder for agent-facing MCP tools to explain.

## Consequences

- SQLite remains the fully supported storage backend and should implement every
  production capability.
- Test fakes and future alternate backends may implement only the capabilities
  their surface declares, but the route/tool registration must make that
  limitation explicit.
- Server routes should return one coherent local configuration failure when a
  required capability is missing.
- MCP should not silently no-op writes when a capability is missing. Either
  the tool should be absent from `tools/list`, or the handler should return a
  structured `storage_unavailable`/configuration error.
- Optional storage methods are still allowed in `src/storage/ports.ts`, but
  optionality must represent backend capability, not an excuse for scattered
  call-site policy.

## Migration Gate

Implement the registration-time capability helper when the next storage-backed
route or MCP tool is added, or when an existing route/tool touches its storage
guard for feature work.

The helper should support this shape:

```ts
const storage = requireStorageCapabilities(options.storage, [
  "recordAskEvent",
  "getAskEventSummary",
]);
```

For Fastify routes, missing capabilities should fail during route
registration or server creation with a clear message. For MCP, the same
capability declaration should feed the tool catalogue so unavailable write
tools are not advertised as usable.
