# intentic-logs

The sandbox's durable debug surface: terminal session captures (crashed ones included), `intentic` CLI run
logs, and the daemon's own log — everything it writes under `/history/logs`. Read-only, as a tab on the Sandbox
hub.

Installs as **`intentic.logs`**.

## The first screen to move out of the monorepo

This was a first-party extension compiled into the app's own bundle. It is here instead because a sandbox does
not stop being a sandbox without it.

The screens that stay built in are the ones the box is not itself without: **automations**, **workflows** and
**maintenance** — each the only window onto an engine the daemon runs whether or not anyone is looking — and
**viewers**, without which every image, PDF and video in the workspace falls back to a download. A log reader is
not in that set. It is the thing you install the week something is wrong, and it costs every other sandbox
nothing to leave it out.

Moving it required two things that did not exist before, and they are why this is possible at all:

- **The host promises its classes.** Layout, typography, spacing and colour are declared by the app's design
  system and generated whether or not anything uses them. Nothing scans this bundle for class names — nobody
  builds it but you — so before that promise existed, a screen that left the repo rendered as a near-miss of
  itself.
- **The kit is installable.** `@intentic/extension-ui` publishes declarations plus a bridge to the host's own
  components, so this view is built from the same parts the rest of the app is, and follows the reader's theme
  without being told.

## What the move actually changed

One file, and it is the interesting one. In the monorepo this view imported `@intentic/sandbox-contract` for
two schemas — the daemon's *whole* wire contract, right there, free. Out here it is the wrong dependency twice
over: nothing the host does not publish can be external, so importing the barrel bundled the entire contract and
its schema library into a log viewer. **265 kB.**

`src/wire.ts` declares the two shapes this screen actually reads. The bundle is **11 kB**.

The size is the smaller half of it. An extension is pinned to a commit while the host keeps moving, so what it
needs is a statement of the shape it depends on — a narrow claim that fails loudly, naming the field, on the day
the daemon's answer stops matching. Importing the host's own contract states the opposite: whatever the daemon
currently says, that is what I expect. One is a version boundary; the other is a coincidence.

## Building it

```sh
pnpm install     # pnpm, not npm — see pnpm-workspace.yaml for the build approvals it needs
pnpm build       # dist/extension.js — one file, host modules external
pnpm test        # the manifest against the daemon's rules, and the BUILT bundle against a host stub
pnpm typecheck
```

**Verify against the registry, not against the monorepo.** This repository was first checked with its
`node_modules` symlinked at intentic's own packages, and everything passed — because those are the CURRENT API,
not the published one. A clean `pnpm install` then failed on two things at once: a helper that only exists in the
unreleased API, and an external the bundle needs but never declared. Both are the kind of break that reaches an
installer and nobody else. `pnpm install` from a clean clone is the only check that means anything here.

`dist/extension.js` **must be committed**: there is no build step at install time, so the sha you publish is
literally the code that runs in the owner's browser. A stale `dist` publishes stale behaviour under a sha whose
source says otherwise — which is why `test/activate.test.mjs` runs against `dist/`, never `src/`.

## One thing left

`@intentic/extension-ui@1.176.3` is on npm, so this repository installs, builds, type-checks and tests from a
clean clone with nothing borrowed from the monorepo. What remains is the **listing**: a registry entry names a
repository at a full commit sha, and opening one is a pull request against
[`intentic/registry`](https://github.com/intentic/registry). Until that merges there is nowhere for the app to
discover this from, though it can already be installed by URL and sha.

Two notes for whoever touches this next:

- **The dependency ranges name the npm VERSION LINE** (`^1.176.3`), not `2.x`. `2.1.0` is the extension-API
  PROTOCOL version, which is what `engines.intentic` speaks to. The two numbers look interchangeable and are
  not — declared wrongly, npm can never resolve either dependency.
- **Bumping `engines` means opening the listing pull request in the same sitting.** Every extension in this
  family broke silently once by fixing the code and leaving the listing on the old commit: the loader refuses a
  caret range on a major it has not heard of, so the failure is total and says nothing.
