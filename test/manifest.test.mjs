import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

/* The manifest, against the rules the daemon actually enforces at install time.
 *
 * These are cheap and they are the failures that reach an installer rather than an author: the daemon validates
 * a staged checkout BEFORE it goes live, so a manifest that lies about its entry bundle is a failed install
 * somebody else has to read the log of. */

const manifest = JSON.parse(await readFile(new URL(`../intentic-extension.json`, import.meta.url), `utf8`));

test(`installs under the identity the registry lists`, () => {
    assert.equal(`${manifest.publisher}.${manifest.name}`, `intentic.logs`);
});

/* THE ENGINE RANGE IS THE THING THAT BREAKS SILENTLY, and it has already broken every extension in this folder
 * once. The loader refuses a caret range on a major it has never heard of — rightly, since activating on a
 * guess is worse — so a stale range is not a degraded install but no install at all, with nothing in the UI to
 * say why. Bumping it means opening the listing pull request in the same sitting. */
test(`declares an engine range the current host satisfies`, () => {
    assert.match(manifest.engines.intentic, /^\^2\./u);
});

/* The entry is the file the host fetches and imports from a blob URL. In the monorepo this extension had no
 * `entry` at all — its code was compiled into the web bundle — so this is the field the move added, and the one
 * most likely to be forgotten by anyone doing the same move next. */
test(`promises an entry bundle that exists`, () => {
    assert.equal(manifest.entry, `dist/extension.js`);
    assert.ok(existsSync(new URL(`../dist/extension.js`, import.meta.url)), `run \`npm run build\` before publishing`);
});

/* Every route the view calls has to be declared, or the host refuses the request at run time — the manifest is
 * the approval surface, and an undeclared route is a feature that silently does nothing in an owner's sandbox
 * rather than a build error here. */
test(`declares exactly the daemon routes the view reads`, () => {
    assert.deepEqual([...manifest.permissions.sandbox].sort(), [`GET /logs`, `GET /logs/file`]);
});
