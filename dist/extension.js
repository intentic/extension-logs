import { computed as i, defineComponent as ye, ref as m, watch as be, openBlock as d, createElementBlock as p, unref as o, createBlock as O, createCommentVNode as x, createElementVNode as s, createVNode as g, withCtx as c, withDirectives as Y, normalizeClass as h, vModelText as Z, withKeys as q, withModifiers as ee, Fragment as C, renderList as te, createSlots as oe, toDisplayString as y, createTextVNode as $, nextTick as xe } from "vue";
import { sinceOf as we, Notice as le, noticeOf as ne, FilterBar as he, cmp as k, Segmented as j, TIME_WINDOWS as ke, RowGroup as Le, Row as Ve, formatBytes as U, formatTimestamp as se, timeAgo as ae, InfoHint as Se, Panel as Ce, Code as $e, Icon as Be } from "@intentic/extension-ui";
import { useQuery as ie } from "@tanstack/vue-query";
let _;
const Me = (n) => {
  _ = n;
}, re = () => {
  if (_ === void 0)
    throw new Error("intentic.logs: host() called before activate()");
  return _;
}, Re = (n, a) => {
  Me(n), a.subscriptions.push(
    n.views.register({
      id: "logs",
      label: "Logs",
      surface: "sandbox",
      detect: () => [{ key: "logs", title: "Logs", icon: "file" }],
      view: async () => (await Promise.resolve().then(() => _e)).default
    })
  );
}, ue = (n) => typeof n == "object" && n !== null, de = (n, a, v) => {
  if (!ue(n))
    throw new Error(`${a} is not an object`);
  for (const [f, r] of Object.entries(v))
    if (typeof n[f] !== r)
      throw new Error(`${a}.${f} is not a ${r}`);
}, Ne = (n) => {
  if (!ue(n) || !Array.isArray(n.files))
    throw new Error("logs: the daemon did not answer with a files array");
  return n.files.forEach((a, v) => de(a, `logs.files[${v}]`, { name: "string", sizeBytes: "number", modifiedAt: "number" })), n.files;
}, Ae = (n) => (de(n, "logs.file", { name: "string", sizeBytes: "number", text: "string", truncated: "boolean" }), n), ce = 1e4;
function Te() {
  const n = re(), a = ie({
    queryKey: n.sandbox.key("logs"),
    queryFn: async () => Ne(await n.sandbox.json("/logs")),
    enabled: i(() => n.sandbox.reachable()),
    refetchInterval: ce
  });
  return {
    files: i(() => a.data.value ?? []),
    error: i(() => a.error.value?.message),
    isLoading: i(() => a.isLoading.value)
  };
}
function ze(n, a) {
  const v = re(), f = ie({
    queryKey: i(() => v.sandbox.key("logs-file", n.value ?? "", String(a.value))),
    queryFn: async () => Ae(await v.sandbox.json(`/logs/file?name=${encodeURIComponent(n.value ?? "")}&bytes=${a.value}`)),
    enabled: i(() => v.sandbox.reachable() && n.value !== void 0),
    refetchInterval: ce
  });
  return {
    tail: i(() => f.data.value),
    error: i(() => f.error.value?.message),
    isLoading: i(() => f.isLoading.value),
    refetch: f.refetch
  };
}
const Ee = { class: "flex flex-col" }, Ie = ["title"], Fe = ["title"], Oe = { class: "font-mono text-xs" }, qe = { key: 0 }, je = ["title"], Ue = /* @__PURE__ */ ye({
  __name: "LogsView",
  setup(n) {
    const { files: a, error: v, isLoading: f } = Te(), r = m(), B = m("65536"), K = i(() => Number(B.value)), { tail: w, error: D, isLoading: me } = ze(r, K), M = i(() => a.value.find((t) => t.name === r.value)), N = m("all"), A = m(""), T = m(""), H = (t) => {
      const e = new Date(t).getTime();
      return Number.isNaN(e) ? void 0 : e;
    }, R = i(() => {
      const t = H(A.value);
      return t !== void 0 ? { since: t, until: H(T.value) ?? 1 / 0 } : { since: we(N.value, Date.now()), until: 1 / 0 };
    }), P = i(() => a.value.filter((t) => t.modifiedAt >= R.value.since && t.modifiedAt <= R.value.until)), L = (t) => t.name.includes("/") ? t.name.split("/")[0] : "daemon", z = m(""), b = m("all"), V = i(() => {
      const t = z.value.trim().toLowerCase();
      return t === "" ? P.value : P.value.filter((e) => e.name.toLowerCase().includes(t));
    }), ve = i(() => [
      { label: "All", value: "all", badge: V.value.length },
      ...[...new Set(a.value.map(L))].toSorted().map((t) => ({
        label: t,
        value: t,
        badge: V.value.filter((e) => L(e) === t).length
      }))
    ]), E = i(
      () => b.value === "all" ? V.value : V.value.filter((t) => L(t) === b.value)
    ), I = i(() => {
      const t = /* @__PURE__ */ new Map();
      for (const e of E.value) {
        const l = L(e);
        t.set(l, [...t.get(l) ?? [], e]);
      }
      return [...t.entries()].map(([e, l]) => ({ title: e, entries: l }));
    }), fe = (t) => b.value === "all" ? t : t.slice(t.indexOf("/") + 1), G = m(), W = m(), Q = m(), pe = (t) => W.value?.querySelector(`[data-log="${t}"]`) ?? void 0, ge = (t) => {
      t.style.scrollMarginTop = `${G.value?.offsetHeight ?? 0}px`, t.style.scrollMarginBottom = `${Q.value?.offsetHeight ?? 0}px`, t.scrollIntoView({ block: "nearest" });
    }, J = (t) => {
      r.value = t, xe(() => {
        const e = pe(t);
        e?.focus({ preventScroll: !0 }), e !== void 0 && ge(e);
      });
    }, X = (t) => {
      const e = I.value.flatMap((S) => S.entries), l = e.findIndex((S) => S.name === r.value), u = e[Math.min(Math.max(l + t, 0), e.length - 1)];
      u !== void 0 && J(u.name);
    }, F = m();
    return be(w, () => {
      requestAnimationFrame(() => F.value?.scrollTo({ top: F.value.scrollHeight }));
    }), (t, e) => (d(), p("div", Ee, [
      o(v) ? (d(), O(o(le), {
        key: 0,
        of: o(ne)(o(v)),
        class: "mb-3"
      }, null, 8, ["of"])) : x("", !0),
      s("div", {
        ref_key: "instrument",
        ref: G,
        class: "sticky top-0 z-20 -mt-3 bg-canvas pb-3 pt-3"
      }, [
        g(o(he), {
          modelValue: z.value,
          "onUpdate:modelValue": e[4] || (e[4] = (l) => z.value = l),
          placeholder: "Filter by name…",
          count: E.value.length
        }, {
          controls: c(() => [
            g(o(j), {
              modelValue: b.value,
              "onUpdate:modelValue": e[0] || (e[0] = (l) => b.value = l),
              size: "xs",
              options: ve.value
            }, null, 8, ["modelValue", "options"]),
            e[10] || (e[10] = s("span", {
              class: "h-4 w-px bg-line",
              "aria-hidden": "true"
            }, null, -1)),
            g(o(j), {
              modelValue: N.value,
              "onUpdate:modelValue": e[1] || (e[1] = (l) => N.value = l),
              size: "xs",
              options: o(ke)
            }, null, 8, ["modelValue", "options"])
          ]),
          actions: c(() => [
            Y(s("input", {
              "onUpdate:modelValue": e[2] || (e[2] = (l) => A.value = l),
              type: "datetime-local",
              title: "Modified after",
              class: h(o(k).input("h-8 px-2 py-0 text-2xs"))
            }, null, 2), [
              [Z, A.value]
            ]),
            Y(s("input", {
              "onUpdate:modelValue": e[3] || (e[3] = (l) => T.value = l),
              type: "datetime-local",
              title: "Modified before",
              class: h(o(k).input("h-8 px-2 py-0 text-2xs"))
            }, null, 2), [
              [Z, T.value]
            ])
          ]),
          _: 1
        }, 8, ["modelValue", "count"])
      ], 512),
      s("div", {
        ref_key: "list",
        ref: W,
        class: "flex flex-col gap-4",
        onKeydown: [
          e[5] || (e[5] = q(ee((l) => X(1), ["prevent"]), ["down"])),
          e[6] || (e[6] = q(ee((l) => X(-1), ["prevent"]), ["up"])),
          e[7] || (e[7] = q((l) => r.value = void 0, ["esc"]))
        ]
      }, [
        (d(!0), p(C, null, te(I.value, (l) => (d(), O(o(Le), {
          key: l.title,
          label: b.value === "all" ? l.title : void 0,
          count: l.entries.length
        }, oe({
          default: c(() => [
            (d(!0), p(C, null, te(l.entries, (u) => (d(), O(o(Ve), {
              key: u.name,
              "data-log": u.name,
              as: "button",
              density: "dense",
              icon: "file",
              selected: r.value === u.name,
              onClick: (S) => J(u.name)
            }, {
              title: c(() => [
                s("span", {
                  class: "block truncate font-mono",
                  title: u.name
                }, y(fe(u.name)), 9, Ie)
              ]),
              meta: c(() => [
                s("span", null, y(o(U)(u.sizeBytes)), 1),
                s("span", {
                  title: o(se)(u.modifiedAt)
                }, y(o(ae)(u.modifiedAt)), 9, Fe)
              ]),
              _: 2
            }, 1032, ["data-log", "selected", "onClick"]))), 128))
          ]),
          _: 2
        }, [
          l === I.value[0] ? {
            name: "info",
            fn: c(() => [
              g(o(Se), { label: "Logs" }, {
                default: c(() => [...e[11] || (e[11] = [
                  s("span", { class: "block text-sm font-medium text-content" }, "Sandbox logs", -1),
                  s("span", { class: "mt-1 block text-xs text-muted" }, [
                    $(" Everything the sandbox records for debugging: "),
                    s("b", null, "terminals"),
                    $(" — every tmux session's output (crashed ones included), "),
                    s("b", null, "intentic-runs"),
                    $(" — infra plan/apply runs, and the "),
                    s("b", null, "daemon"),
                    $("'s own log. Stored outside the agent's workspace and survives rebuilds. ")
                  ], -1)
                ])]),
                _: 1
              })
            ]),
            key: "0"
          } : void 0
        ]), 1032, ["label", "count"]))), 128)),
        o(a).length === 0 && !o(f) ? (d(), p("p", {
          key: 0,
          class: h(o(k).emptyState("py-6"))
        }, " Nothing yet. Logs appear as terminals run, infra commands execute, and the daemon works. ", 2)) : E.value.length === 0 ? (d(), p("p", {
          key: 1,
          class: h(o(k).emptyState("py-6"))
        }, "No files match the current filters.", 2)) : x("", !0)
      ], 544),
      r.value !== void 0 ? (d(), p("div", {
        key: 1,
        ref_key: "reader",
        ref: Q,
        class: "sticky bottom-0 z-10 bg-canvas py-3"
      }, [
        g(o(Ce), {
          scroll: !1,
          class: "max-h-panel-sm border-line-strong shadow-lg md:max-h-panel"
        }, oe({
          title: c(() => [
            s("span", Oe, y(r.value), 1)
          ]),
          meta: c(() => [
            o(w) ? (d(), p("span", qe, y(o(U)(o(w).sizeBytes)), 1)) : x("", !0),
            M.value ? (d(), p(C, { key: 1 }, [
              e[12] || (e[12] = s("span", { "aria-hidden": "true" }, "·", -1)),
              s("span", {
                title: o(se)(M.value.modifiedAt)
              }, "written " + y(o(ae)(M.value.modifiedAt)), 9, je)
            ], 64)) : x("", !0),
            o(w)?.truncated ? (d(), p(C, { key: 2 }, [
              e[13] || (e[13] = s("span", { "aria-hidden": "true" }, "·", -1)),
              s("span", null, "last " + y(o(U)(K.value)) + " shown", 1)
            ], 64)) : x("", !0)
          ]),
          actions: c(() => [
            g(o(j), {
              modelValue: B.value,
              "onUpdate:modelValue": e[8] || (e[8] = (l) => B.value = l),
              size: "xs",
              options: [
                { label: "64 KB", value: "65536" },
                { label: "256 KB", value: "262144" },
                { label: "1 MB", value: "1048576" }
              ]
            }, null, 8, ["modelValue"]),
            s("button", {
              type: "button",
              class: h(o(k).iconButton()),
              title: "Close (Esc)",
              onClick: e[9] || (e[9] = (l) => r.value = void 0)
            }, [
              g(o(Be), { name: "times" })
            ], 2)
          ]),
          default: c(() => [
            s("div", {
              ref_key: "pane",
              ref: F,
              class: "scrollbar-thin min-h-0 flex-1 overflow-auto p-4"
            }, [
              g(o($e), {
                code: o(w)?.text ?? (o(me) ? "Loading…" : ""),
                lang: "log",
                wrap: !0,
                copyable: !1
              }, null, 8, ["code"])
            ], 512)
          ]),
          _: 2
        }, [
          o(D) ? {
            name: "strips",
            fn: c(() => [
              g(o(le), {
                of: o(ne)(o(D)),
                class: "m-4 mb-0"
              }, null, 8, ["of"])
            ]),
            key: "0"
          } : void 0
        ]), 1024)
      ], 512)) : x("", !0)
    ]));
  }
}), _e = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ue
}, Symbol.toStringTag, { value: "Module" }));
export {
  Re as activate
};
