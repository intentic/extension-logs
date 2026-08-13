import { hostSlot as e } from "@intentic/extension-api";
import { Fragment as t, computed as n, createBlock as r, createCommentVNode as i, createElementBlock as a, createElementVNode as o, createSlots as ee, createTextVNode as s, createVNode as c, defineComponent as l, nextTick as te, normalizeClass as u, openBlock as d, ref as f, renderList as p, toDisplayString as m, unref as h, vModelText as g, watch as ne, withCtx as _, withDirectives as v, withKeys as y, withModifiers as re } from "vue";
import { Code as ie, FilterBar as ae, Icon as oe, InfoHint as se, Notice as b, Panel as ce, Row as le, RowGroup as ue, Segmented as x, TIME_WINDOWS as de, cmp as S, formatBytes as C, formatTimestamp as w, noticeOf as T, sinceOf as fe, timeAgo as E } from "@intentic/extension-ui";
import { useQuery as D } from "@tanstack/vue-query";
//#region \0rolldown/runtime.js
var O = Object.defineProperty, k = (e, t, n) => () => {
	if (n) throw n[0];
	try {
		return e && (t = e(e = 0)), t;
	} catch (e) {
		throw n = [e], e;
	}
}, A = (e, t) => {
	let n = {};
	for (var r in e) O(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || O(n, Symbol.toStringTag, { value: "Module" }), n;
}, j, M, N = k((() => {
	({bindHost: j, host: M} = e("ext-logs"));
})), P, F, I, L, R = k((() => {
	P = (e) => typeof e == "object" && !!e, F = (e, t, n) => {
		if (!P(e)) throw Error(`${t} is not an object`);
		for (let [r, i] of Object.entries(n)) if (typeof e[r] !== i) throw Error(`${t}.${r} is not a ${i}`);
	}, I = (e) => {
		if (!P(e) || !Array.isArray(e.files)) throw Error("logs: the daemon did not answer with a files array");
		return e.files.forEach((e, t) => F(e, `logs.files[${t}]`, {
			name: "string",
			sizeBytes: "number",
			modifiedAt: "number"
		})), e.files;
	}, L = (e) => (F(e, "logs.file", {
		name: "string",
		sizeBytes: "number",
		text: "string",
		truncated: "boolean"
	}), e);
}));
//#endregion
//#region src/useLogs.ts
function pe() {
	let e = M(), t = D({
		queryKey: e.sandbox.key("logs"),
		queryFn: async () => I(await e.sandbox.json("/logs")),
		enabled: n(() => e.sandbox.reachable()),
		refetchInterval: z
	});
	return {
		files: n(() => t.data.value ?? []),
		error: n(() => t.error.value?.message),
		isLoading: n(() => t.isLoading.value)
	};
}
function me(e, t) {
	let r = M(), i = D({
		queryKey: n(() => r.sandbox.key("logs-file", e.value ?? "", String(t.value))),
		queryFn: async () => L(await r.sandbox.json(`/logs/file?name=${encodeURIComponent(e.value ?? "")}&bytes=${t.value}`)),
		enabled: n(() => r.sandbox.reachable() && e.value !== void 0),
		refetchInterval: z
	});
	return {
		tail: n(() => i.data.value),
		error: n(() => i.error.value?.message),
		isLoading: n(() => i.isLoading.value),
		refetch: i.refetch
	};
}
var z, B = k((() => {
	R(), N(), z = 1e4;
})), V, H, U, he, W, G, K, q = k((() => {
	B(), V = { class: "flex flex-col" }, H = ["title"], U = ["title"], he = { class: "font-mono text-xs" }, W = { key: 0 }, G = ["title"], K = /*@__PURE__*/ l({
		__name: "LogsView",
		setup(e) {
			let { files: l, error: D, isLoading: O } = pe(), k = f(), A = f("65536"), j = n(() => Number(A.value)), { tail: M, error: N, isLoading: P } = me(k, j), F = n(() => l.value.find((e) => e.name === k.value)), I = f("all"), L = f(""), R = f(""), z = (e) => {
				let t = new Date(e).getTime();
				return Number.isNaN(t) ? void 0 : t;
			}, B = n(() => {
				let e = z(L.value);
				return e === void 0 ? {
					since: fe(I.value, Date.now()),
					until: Infinity
				} : {
					since: e,
					until: z(R.value) ?? Infinity
				};
			}), K = n(() => l.value.filter((e) => e.modifiedAt >= B.value.since && e.modifiedAt <= B.value.until)), q = (e) => e.name.includes("/") ? e.name.split("/")[0] : "daemon", J = f(""), Y = f("all"), X = n(() => {
				let e = J.value.trim().toLowerCase();
				return e === "" ? K.value : K.value.filter((t) => t.name.toLowerCase().includes(e));
			}), ge = n(() => [{
				label: "All",
				value: "all",
				badge: X.value.length
			}, ...[...new Set(l.value.map(q))].toSorted().map((e) => ({
				label: e,
				value: e,
				badge: X.value.filter((t) => q(t) === e).length
			}))]), Z = n(() => Y.value === "all" ? X.value : X.value.filter((e) => q(e) === Y.value)), Q = n(() => {
				let e = /* @__PURE__ */ new Map();
				for (let t of Z.value) {
					let n = q(t);
					e.set(n, [...e.get(n) ?? [], t]);
				}
				return [...e.entries()].map(([e, t]) => ({
					title: e,
					entries: t
				}));
			}), _e = (e) => Y.value === "all" ? e : e.slice(e.indexOf("/") + 1), ve = f(), ye = f(), be = f(), xe = (e) => ye.value?.querySelector(`[data-log="${e}"]`) ?? void 0, Se = (e) => {
				e.style.scrollMarginTop = `${ve.value?.offsetHeight ?? 0}px`, e.style.scrollMarginBottom = `${be.value?.offsetHeight ?? 0}px`, e.scrollIntoView({ block: "nearest" });
			}, Ce = (e) => {
				k.value = e, te(() => {
					let t = xe(e);
					t?.focus({ preventScroll: !0 }), t !== void 0 && Se(t);
				});
			}, we = (e) => {
				let t = Q.value.flatMap((e) => e.entries), n = t.findIndex((e) => e.name === k.value), r = t[Math.min(Math.max(n + e, 0), t.length - 1)];
				r !== void 0 && Ce(r.name);
			}, $ = f();
			return ne(M, () => {
				requestAnimationFrame(() => $.value?.scrollTo({ top: $.value.scrollHeight }));
			}), (e, n) => (d(), a("div", V, [
				h(D) ? (d(), r(h(b), {
					key: 0,
					of: h(T)(h(D)),
					class: "mb-3"
				}, null, 8, ["of"])) : i("", !0),
				o("div", {
					ref_key: "instrument",
					ref: ve,
					class: "sticky top-0 z-20 -mt-3 bg-canvas pb-3 pt-3"
				}, [c(h(ae), {
					modelValue: J.value,
					"onUpdate:modelValue": n[4] ||= (e) => J.value = e,
					placeholder: "Filter by name…",
					count: Z.value.length
				}, {
					controls: _(() => [
						c(h(x), {
							modelValue: Y.value,
							"onUpdate:modelValue": n[0] ||= (e) => Y.value = e,
							size: "xs",
							options: ge.value
						}, null, 8, ["modelValue", "options"]),
						n[10] ||= o("span", {
							class: "h-4 w-px bg-line",
							"aria-hidden": "true"
						}, null, -1),
						c(h(x), {
							modelValue: I.value,
							"onUpdate:modelValue": n[1] ||= (e) => I.value = e,
							size: "xs",
							options: h(de)
						}, null, 8, ["modelValue", "options"])
					]),
					actions: _(() => [v(o("input", {
						"onUpdate:modelValue": n[2] ||= (e) => L.value = e,
						type: "datetime-local",
						title: "Modified after",
						class: u(h(S).input("h-8 px-2 py-0 text-2xs"))
					}, null, 2), [[g, L.value]]), v(o("input", {
						"onUpdate:modelValue": n[3] ||= (e) => R.value = e,
						type: "datetime-local",
						title: "Modified before",
						class: u(h(S).input("h-8 px-2 py-0 text-2xs"))
					}, null, 2), [[g, R.value]])]),
					_: 1
				}, 8, ["modelValue", "count"])], 512),
				o("div", {
					ref_key: "list",
					ref: ye,
					class: "flex flex-col gap-4",
					onKeydown: [
						n[5] ||= y(re((e) => we(1), ["prevent"]), ["down"]),
						n[6] ||= y(re((e) => we(-1), ["prevent"]), ["up"]),
						n[7] ||= y((e) => k.value = void 0, ["esc"])
					]
				}, [(d(!0), a(t, null, p(Q.value, (e) => (d(), r(h(ue), {
					key: e.title,
					label: Y.value === "all" ? e.title : void 0,
					count: e.entries.length
				}, ee({
					default: _(() => [(d(!0), a(t, null, p(e.entries, (e) => (d(), r(h(le), {
						key: e.name,
						"data-log": e.name,
						as: "button",
						density: "dense",
						icon: "file",
						selected: k.value === e.name,
						onClick: (t) => Ce(e.name)
					}, {
						title: _(() => [o("span", {
							class: "block truncate font-mono",
							title: e.name
						}, m(_e(e.name)), 9, H)]),
						meta: _(() => [o("span", null, m(h(C)(e.sizeBytes)), 1), o("span", { title: h(w)(e.modifiedAt) }, m(h(E)(e.modifiedAt)), 9, U)]),
						_: 2
					}, 1032, [
						"data-log",
						"selected",
						"onClick"
					]))), 128))]),
					_: 2
				}, [e === Q.value[0] ? {
					name: "info",
					fn: _(() => [c(h(se), { label: "Logs" }, {
						default: _(() => [...n[11] ||= [o("span", { class: "block text-sm font-medium text-content" }, "Sandbox logs", -1), o("span", { class: "mt-1 block text-xs text-muted" }, [
							s(" Everything the sandbox records for debugging: "),
							o("b", null, "terminals"),
							s(" — every tmux session's output (crashed ones included), "),
							o("b", null, "intentic-runs"),
							s(" — infra plan/apply runs, and the "),
							o("b", null, "daemon"),
							s("'s own log. Stored outside the agent's workspace and survives rebuilds. ")
						], -1)]]),
						_: 1
					})]),
					key: "0"
				} : void 0]), 1032, ["label", "count"]))), 128)), h(l).length === 0 && !h(O) ? (d(), a("p", {
					key: 0,
					class: u(h(S).emptyState("py-6"))
				}, " Nothing yet. Logs appear as terminals run, infra commands execute, and the daemon works. ", 2)) : Z.value.length === 0 ? (d(), a("p", {
					key: 1,
					class: u(h(S).emptyState("py-6"))
				}, "No files match the current filters.", 2)) : i("", !0)], 544),
				k.value === void 0 ? i("", !0) : (d(), a("div", {
					key: 1,
					ref_key: "reader",
					ref: be,
					class: "sticky bottom-0 z-10 bg-canvas py-3"
				}, [c(h(ce), {
					scroll: !1,
					class: "max-h-panel-sm border-line-strong shadow-lg md:max-h-panel"
				}, ee({
					title: _(() => [o("span", he, m(k.value), 1)]),
					meta: _(() => [
						h(M) ? (d(), a("span", W, m(h(C)(h(M).sizeBytes)), 1)) : i("", !0),
						F.value ? (d(), a(t, { key: 1 }, [n[12] ||= o("span", { "aria-hidden": "true" }, "·", -1), o("span", { title: h(w)(F.value.modifiedAt) }, "written " + m(h(E)(F.value.modifiedAt)), 9, G)], 64)) : i("", !0),
						h(M)?.truncated ? (d(), a(t, { key: 2 }, [n[13] ||= o("span", { "aria-hidden": "true" }, "·", -1), o("span", null, "last " + m(h(C)(j.value)) + " shown", 1)], 64)) : i("", !0)
					]),
					actions: _(() => [c(h(x), {
						modelValue: A.value,
						"onUpdate:modelValue": n[8] ||= (e) => A.value = e,
						size: "xs",
						options: [
							{
								label: "64 KB",
								value: "65536"
							},
							{
								label: "256 KB",
								value: "262144"
							},
							{
								label: "1 MB",
								value: "1048576"
							}
						]
					}, null, 8, ["modelValue"]), o("button", {
						type: "button",
						class: u(h(S).iconButton()),
						title: "Close (Esc)",
						onClick: n[9] ||= (e) => k.value = void 0
					}, [c(h(oe), { name: "times" })], 2)]),
					default: _(() => [o("div", {
						ref_key: "pane",
						ref: $,
						class: "scrollbar-thin min-h-0 flex-1 overflow-auto p-4"
					}, [c(h(ie), {
						code: h(M)?.text ?? (h(P) ? "Loading…" : ""),
						lang: "log",
						wrap: !0,
						copyable: !1
					}, null, 8, ["code"])], 512)]),
					_: 2
				}, [h(N) ? {
					name: "strips",
					fn: _(() => [c(h(b), {
						of: h(T)(h(N)),
						class: "m-4 mb-0"
					}, null, 8, ["of"])]),
					key: "0"
				} : void 0]), 1024)], 512))
			]));
		}
	});
})), J = /* @__PURE__ */ A({ default: () => Y }), Y, X = k((() => {
	q(), q(), Y = K;
}));
//#endregion
//#region src/extension.ts
N();
var ge = (e, t) => {
	j(e), t.subscriptions.push(e.views.register({
		id: "logs",
		label: "Logs",
		surface: "sandbox",
		detect: () => [{
			key: "logs",
			title: "Logs",
			icon: "file"
		}],
		view: async () => (await Promise.resolve().then(() => (X(), J))).default
	}));
};
//#endregion
export { ge as activate };
