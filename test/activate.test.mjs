import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

/* The BUILT bundle against a host stub that enforces the manifest, exactly as the real host does: a view whose
 * id `contributes.views` never declared is refused. Code and manifest drifting apart is the failure that
 * actually happens, and in the app it shows up as a tab that never appears, with nothing anywhere saying why.
 *
 * Run against `dist/`, not `src/` — the published sha is the bundle, and a test that read the source would pass
 * for a build that was never regenerated. That is the exact way these extensions broke the last time. */

const manifest = JSON.parse(await readFile(new URL(`../intentic-extension.json`, import.meta.url), `utf8`));

/* THE HOST BRIDGE, STOOD UP BEFORE THE BUNDLE LOADS. `@intentic/extension-ui` is marked external and its
 * components are the running app's, not this package's — so the published package's entry reads them off this
 * global and throws a plain sentence when there is no app, which is exactly what it did the first time this
 * test ran. A Proxy is enough: activate() only registers a view, and the compiled SFC touches a component
 * binding at RENDER time, not at import time. Anything more would be a fake of the app, which is what the
 * acceptance runs are for. */
globalThis.__intenticHost = {
    modules: { "@intentic/extension-ui": new Proxy({}, { get: (_, name) => ({ __stub: name }) }) },
};

const { activate } = await import(`../dist/extension.js`);

const declaredViews = new Map((manifest.contributes?.views ?? []).map((view) => [view.id, view]));
const disposable = () => ({ dispose: () => {} });

const hostStub = () => {
    const registered = [];
    const refuse = (kind) => () => assert.fail(`${kind} registered, which this manifest never declares`);
    return {
        registered,
        api: {
            apiVersion: `2.1.0`,
            views: {
                register: (view) => {
                    assert.ok(declaredViews.has(view.id), `view "${view.id}" is not declared in contributes.views`);
                    registered.push(view);
                    return disposable();
                },
            },
            viewers: { register: refuse(`a viewer`) },
            documents: { register: refuse(`a document provider`) },
            commands: { register: refuse(`a command`) },
            // The routes this extension is allowed to reach. Anything else is refused by the real host, so the
            // stub refuses it here rather than letting a typo become a dead surface in somebody's sandbox.
            sandbox: {
                json: (path) => {
                    const allowed = manifest.permissions.sandbox.some((route) => route.endsWith(path.split(`?`)[0]));
                    assert.ok(allowed, `called ${path}, which permissions.sandbox does not declare`);
                    return Promise.resolve({});
                },
            },
        },
    };
};

test(`activate registers exactly the views the manifest declares`, async () => {
    const { api, registered } = hostStub();
    const context = { extensionId: `intentic.logs`, subscriptions: [] };

    await activate(api, context);

    assert.deepEqual(
        registered.map((view) => view.id),
        [...declaredViews.keys()],
    );
    // The view is loaded lazily and must resolve from INSIDE the single file: a chunk split here 404s in the
    // browser's blob-URL import, where the failure is far less obvious than in this test.
    for (const view of registered) {
        assert.equal(typeof (await view.view()), `object`);
    }
});

/* WHAT A PUBLISHED BUNDLE MAY IMPORT — the loader imports it from a blob: URL, so a relative import resolves
 * against a base that was never created, and a bare specifier resolves only if the shell's import map publishes
 * it. Both are invisible to the author, whose own checkout loads the directory live, and fatal for every
 * installer. The daemon applies this same rule in its readiness check; asserting it here means finding out at
 * `npm test` rather than after a listing pull request. */
test(`the bundle imports only what the host publishes`, async () => {
    const source = await readFile(new URL(`../dist/extension.js`, import.meta.url), `utf8`);
    const published = new Set([`vue`, `@intentic/extension-api`, `@intentic/extension-ui`, `@tanstack/vue-query`]);
    const specifiers = [
        ...source.matchAll(/(?:^|\n)\s*(?:import|export)[^;\n]*?from\s*["'`]([^"'`]+)["'`]/gu),
        ...source.matchAll(/\bimport\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/gu),
        ...source.matchAll(/(?:^|\n)\s*import\s*["'`]([^"'`]+)["'`]/gu),
    ].map((match) => match[1]);

    assert.deepEqual(
        specifiers.filter((specifier) => specifier.startsWith(`.`) || specifier.startsWith(`/`)),
        [],
        `a relative import cannot resolve from a blob URL — check inlineDynamicImports`,
    );
    assert.deepEqual([...new Set(specifiers)].filter((specifier) => !published.has(specifier)).sort(), []);
});
