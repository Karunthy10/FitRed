import { Fragment as I, jsx as o, jsxs as l } from "react/jsx-runtime";
import { useState as x, useEffect as aa, useRef as re } from "react";
import { oa, S } from "./ui.jsx";
import { q, H, Z, Ee, C, Q, Be, Ue, We, Ge, O, ze, j, Me } from "../data/store.js";

function da({ goRoutines: e }) {
  let [, a] = x(0),
    r = q();
  H();
  let i = r.activeRoutine && Z(r.activeRoutine),
    [c, t] = x(null),
    [n, s] = x(null),
    [d, u] = x(0),
    [b, y] = x(1),
    f = re(null),
    v = re(null);
  if (
    (aa(
      () => (
        d > 0 &&
          (f.current = setTimeout(() => {
            (d === 1 && ma(v), u((m) => m - 1));
          }, 1e3)),
        () => clearTimeout(f.current)
      ),
      [d],
    ),
    !i)
  )
    return l("div", {
      className: "pad center-col",
      children: [
        o("h2", { children: "Sin rutina activa" }),
        o("p", {
          className: "dim",
          children: "Copia una de la comunidad o crea la tuya",
        }),
        o("button", { className: "btn", onClick: e, children: "Ir a Rutinas" }),
      ],
    });
  let w = r.activeWeek,
    se = (i.easyWeeks || []).includes(w);
  if (n === null)
    return l("div", {
      className: "pad",
      children: [
        l("div", {
          className: "hero",
          children: [
            o("span", { className: "dim", children: "RUTINA ACTIVA" }),
            o("h1", { children: i.name }),
            l("div", {
              className: "row wrap",
              children: [
                o("span", { className: "dim small", children: "Semana" }),
                Array.from({ length: i.weeks }, (m, N) => N + 1).map((m) =>
                  o(
                    S,
                    {
                      on: w === m,
                      onClick: () => {
                        (Me(m), a((N) => N + 1));
                      },
                      children: m,
                    },
                    m,
                  ),
                ),
              ],
            }),
            se &&
              o("div", {
                className: "tag",
                children: "Semana de adaptaci\xF3n \xB7 RIR alto",
              }),
          ],
        }),
        l("h3", {
          children: [
            "Elige tu sesi\xF3n de hoy ",
            o("span", {
              className: "dim small",
              children: "\xB7 el orden es tuyo, c\xE1mbialo libre",
            }),
          ],
        }),
        i.days.map((m, N) => {
          let E = r.workouts.some(
            (z) => z.routineId === i.id && z.week === w && z.dayIdx === N,
          );
          return o(
            "div",
            {
              className: "card day" + (E ? " done" : ""),
              onClick: () => {
                (t(N), s(Ee(i.id, N, w)));
              },
              children: l("div", {
                className: "row spread",
                children: [
                  o("b", { children: m.name }),
                  o("span", {
                    children: E
                      ? "\u2714 hecha"
                      : `${m.exercises.length} ejercicios \u203A`,
                  }),
                ],
              }),
            },
            N,
          );
        }),
        o(pa, {}),
      ],
    });
  let ne = i.days[c];
  return l("div", {
    className: "pad",
    children: [
      o("button", {
        className: "back",
        onClick: () => {
          (s(null), u(0), a((m) => m + 1));
        },
        children: "\u2039 Terminar sesi\xF3n",
      }),
      l("h2", {
        children: [
          ne.name,
          " ",
          l("span", { className: "dim small", children: ["\xB7 semana ", w] }),
        ],
      }),
      ne.exercises.map((m, N) => {
        let E = C(m.exId),
          z = Q(m.exId, n.id),
          ie = Be(m.exId),
          B = Ue(m, m.exId, n.id),
          Qe = (i.techWeeks || []).includes(w) && m.technique;
        return l(
          "div",
          {
            className: "card",
            children: [
              l("div", {
                className: "row spread",
                children: [
                  o("b", { children: E?.name }),
                  l("span", {
                    className: "dim small",
                    children: ["\u25B2", j(m.exId)],
                  }),
                ],
              }),
              l("div", {
                className: "dim small",
                children: [
                  m.workingSets,
                  "\xD7",
                  m.repRange,
                  " \xB7 \u23F1 ",
                  m.tempo || E?.tempo || "2-0-1",
                  " \xB7 descanso ",
                  Math.round(m.restSeconds / 60),
                  "min ",
                  ie ? `\xB7 PR ${ie}${r.unit} e1RM` : "",
                ],
              }),
              Qe &&
                l("div", {
                  className: "techband",
                  children: [
                    "\u{1F525} ",
                    m.technique,
                    ": ",
                    $[m.technique] || "apl\xEDcala en la \xFAltima serie",
                  ],
                }),
              B &&
                o("div", {
                  className: "hintline small",
                  children: B.up
                    ? `\u{1F4C8} Sube a ${B.w} ${r.unit} \u2014 llegaste al tope de reps`
                    : `\u{1F3AF} Supera ${B.w} ${r.unit} \xD7 ${B.r}`,
                }),
              m.note &&
                l("div", {
                  className: "note small",
                  children: ["\u{1F4A1} ", m.note],
                }),
              o(ba, { re: m, unit: r.unit }),
              Array.from({ length: m.workingSets }, (va, R) => {
                let A = n.sets[m.exId]?.[R] || {},
                  le = z?.[R];
                return l(
                  "div",
                  {
                    className: "setrow",
                    children: [
                      l("span", {
                        className: "setn",
                        children: [
                          R + 1,
                          l("em", {
                            className: "rirn",
                            children: ["R", We(m, se, R)],
                          }),
                        ],
                      }),
                      o("input", {
                        type: "number",
                        inputMode: "decimal",
                        placeholder: le?.w ?? "kg",
                        value: A.w ?? "",
                        onChange: (T) => {
                          (O(n.id, m.exId, R, { w: T.target.value }),
                            a((U) => U + 1));
                        },
                      }),
                      o("input", {
                        type: "number",
                        inputMode: "numeric",
                        placeholder: le?.r ?? "reps",
                        value: A.r ?? "",
                        onChange: (T) => {
                          (O(n.id, m.exId, R, { r: T.target.value }),
                            a((U) => U + 1));
                        },
                      }),
                      o("button", {
                        className: "ok" + (A.done ? " on" : ""),
                        onClick: () => {
                          (O(n.id, m.exId, R, { done: !A.done }),
                            A.done ||
                              (ua(v), u(m.restSeconds), y(m.restSeconds)),
                            a((T) => T + 1));
                        },
                        children: "\u2713",
                      }),
                    ],
                  },
                  R,
                );
              }),
            ],
          },
          N,
        );
      }),
      d > 0 &&
        l("div", {
          className: "timerbar2",
          children: [
            o("div", {
              className: "tbar",
              children: o("div", {
                className: "tfill",
                style: { width: `${(100 * d) / b}%` },
              }),
            }),
            l("div", {
              className: "row spread",
              children: [
                o("button", {
                  className: "mini",
                  onClick: () => {
                    (u((m) => m + 30), y((m) => m + 30));
                  },
                  children: "+30s",
                }),
                o("b", { className: "tcount", children: oa(d) }),
                o("button", {
                  className: "mini",
                  onClick: () => u(0),
                  children: "Saltar",
                }),
              ],
            }),
            o("div", { className: "dim small center", children: "DESCANSO" }),
          ],
        }),
    ],
  });
}
function pa() {
  let e = ze().slice(0, 10);
  return e.length
    ? l(I, {
        children: [
          o("h3", { children: "Historial" }),
          e.map((a) =>
            l(
              "div",
              {
                className: "card small",
                children: [
                  o("b", { children: a.dayName }),
                  " ",
                  l("span", {
                    className: "dim",
                    children: [
                      "\xB7 sem ",
                      a.week,
                      " \xB7 ",
                      a.date,
                      " \xB7 ",
                      Object.values(a.sets)
                        .flat()
                        .filter((r) => r?.done).length,
                      " sets",
                    ],
                  }),
                ],
              },
              a.id,
            ),
          ),
        ],
      })
    : null;
}

function ua(e) {
  try {
    if (!e.current) {
      let a = window.AudioContext || window.webkitAudioContext;
      e.current = new a();
    }
    e.current.resume();
  } catch {}
}
function ma(e) {
  try {
    let a = e.current;
    if (!a) return;
    [0, 0.25].forEach((r) => {
      let i = a.createOscillator(),
        c = a.createGain();
      ((i.frequency.value = 880),
        i.connect(c),
        c.connect(a.destination),
        c.gain.setValueAtTime(0.25, a.currentTime + r),
        c.gain.exponentialRampToValueAtTime(0.001, a.currentTime + r + 0.18),
        i.start(a.currentTime + r),
        i.stop(a.currentTime + r + 0.2));
    });
  } catch {}
}
function ba({ re: e, unit: a }) {
  let [r, i] = x(!1),
    [c, t] = x("");
  if (!e.warmupSets) return null;
  let n = c > 0 ? Ge(e.warmupSets, +c) : null;
  return l("div", {
    className: "wu",
    children: [
      l("button", {
        className: "mini",
        onClick: () => i((s) => !s),
        children: ["\u{1F525} Calentamiento (", e.warmupSets, ")"],
      }),
      r &&
        l("div", {
          className: "row gap",
          children: [
            o("input", {
              type: "number",
              inputMode: "decimal",
              placeholder: "peso de trabajo " + a,
              value: c,
              onChange: (s) => t(s.target.value),
              style: { maxWidth: 150 },
            }),
            n &&
              o("span", {
                className: "dim small",
                children: n.map((s) => `${s.w}\xD7${s.r}`).join(" \u2192 "),
              }),
          ],
        }),
    ],
  });
}

export { da };
