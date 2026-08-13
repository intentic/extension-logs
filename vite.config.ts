import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

/* The extension bundle, built as /developers/build/ prescribes.
 *
 * externals          — everything the host publishes through the app's import map. A second copy of `vue` forks
 *                      reactivity; a second `@tanstack/vue-query` forks the query cache; and a second
 *                      `@intentic/extension-ui` renders components that are not the shell's, so they lose the
 *                      theme, the accent and every other thing that makes an extension look native.
 *
 *                      `@intentic/sandbox-contract` is deliberately NOT external — the host does not publish it,
 *                      and this view needs its schemas at run time to validate what the daemon answered. It is
 *                      bundled in, which is the rule for anything the host does not hand you.
 *
 * one file, no chunks — the loader fetches the bundle with an auth header and imports it from a blob: URL,
 *                      where a relative chunk import has no base to resolve against. */
export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: "dist",
        lib: { entry: "src/extension.ts", formats: ["es"], fileName: () => "extension.js" },
        rollupOptions: {
            external: ["vue", "@tanstack/vue-query", "@intentic/extension-api", "@intentic/extension-ui"],
            output: { inlineDynamicImports: true },
        },
    },
});
