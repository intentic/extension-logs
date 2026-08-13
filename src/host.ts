import type { IntenticApi } from "@intentic/extension-api";

/* The activated host handle. `activate(api)` binds it once, before anything can render — the view is registered
 * during activate and mounts later — so the modules below reach the authenticated daemon transport without an
 * ambient global. There is none to reach for: the host passes the api in as an argument precisely so an
 * extension cannot acquire more reach than the manifest it was approved under.
 *
 * FIFTEEN LINES RATHER THAN AN IMPORT, and that is the lesson of moving out. In the monorepo this was
 * `hostSlot("ext-logs")` from `@intentic/extension-api` — a shared helper doing exactly this. That helper is
 * CURRENT-API; the PUBLISHED `@intentic/extension-api` is several protocol versions behind the host and does
 * not have it, so the import type-checked in the monorepo and could never have resolved for anybody installing
 * this extension. Every other extension in this family hand-rolls the same slot, for the same reason.
 *
 * How that was caught is worth as much as the fix. This repository was first verified with its `node_modules`
 * symlinked at the monorepo's own packages — the CURRENT API, not the published one — and everything passed.
 * It failed the moment a clean clone ran `npm install` and got what the registry actually serves. An extension
 * that lives outside has to be checked against the registry, not against the tree it came from. */
let current: IntenticApi | undefined;

export const bindHost = (api: IntenticApi): void => {
    current = api;
};

export const host = (): IntenticApi => {
    if (current === undefined) {
        throw new Error(`intentic.logs: host() called before activate()`);
    }
    return current;
};
