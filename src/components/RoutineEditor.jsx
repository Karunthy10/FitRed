import { Fragment as I, jsx as o, jsxs as l } from "react/jsx-runtime";
import { useState as x } from "react";
import { Z, C, j, k } from "../data/store.js";

function ca({ id: e, readOnly: a, goBack: r, goPickExercise: i }) {
  let [, c] = x(0),
    t = Z(e);
  if (!t) return null;
  let n = (s, d, u) => {
    let b = d + u;
    b < 0 || b >= s.length || ([s[d], s[b]] = [s[b], s[d]]);
  };
  return l("div", {
    className: "pad",
    children: [
      o("button", {
        className: "back",
        onClick: r,
        children: "\u2039 Rutinas",
      }),
      a
        ? o("h2", { children: t.name })
        : o("input", {
            className: "titleinput",
            value: t.name,
            onChange: (s) => {
              (k(e, (d) => (d.name = s.target.value)), c((d) => d + 1));
            },
          }),
      o("p", { className: "dim small", children: t.description }),
      t.days.map((s, d) =>
        l(
          "div",
          {
            className: "card",
            children: [
              l("div", {
                className: "row spread",
                children: [
                  a
                    ? o("b", { children: s.name })
                    : o("input", {
                        className: "dayinput",
                        value: s.name,
                        onChange: (u) => {
                          (k(e, (b) => (b.days[d].name = u.target.value)),
                            c((b) => b + 1));
                        },
                      }),
                  !a &&
                    l("div", {
                      className: "row",
                      children: [
                        o("button", {
                          className: "mini",
                          onClick: () => {
                            (k(e, (u) => n(u.days, d, -1)), c((u) => u + 1));
                          },
                          children: "\u2191",
                        }),
                        o("button", {
                          className: "mini",
                          onClick: () => {
                            (k(e, (u) => n(u.days, d, 1)), c((u) => u + 1));
                          },
                          children: "\u2193",
                        }),
                        o("button", {
                          className: "mini danger",
                          onClick: () => {
                            confirm("\xBFBorrar d\xEDa?") &&
                              (k(e, (u) => u.days.splice(d, 1)),
                              c((u) => u + 1));
                          },
                          children: "\u2715",
                        }),
                      ],
                    }),
                ],
              }),
              s.exercises.map((u, b) => {
                let y = C(u.exId);
                return l(
                  "div",
                  {
                    className: "exrow",
                    children: [
                      l("div", {
                        className: "grow",
                        children: [
                          o("b", { children: y?.name || "?" }),
                          " ",
                          l("span", {
                            className: "dim small",
                            children: ["\u25B2", j(u.exId)],
                          }),
                          l("div", {
                            className: "dim small",
                            children: [
                              u.workingSets,
                              "\xD7",
                              u.repRange,
                              " \xB7 \u23F1 ",
                              u.tempo || C(u.exId)?.tempo || "2-0-1",
                              " \xB7 RIR ",
                              String(u.rir?.easy),
                              "\u2192",
                              String(u.rir?.hard),
                              " \xB7 ",
                              Math.round(u.restSeconds / 60),
                              "min",
                            ],
                          }),
                          u.note &&
                            l("div", {
                              className: "note small",
                              children: ["\u{1F4A1} ", u.note],
                            }),
                        ],
                      }),
                      !a &&
                        l("div", {
                          className: "col",
                          children: [
                            o("button", {
                              className: "mini",
                              onClick: () =>
                                i((f) => {
                                  (k(
                                    e,
                                    (v) => (v.days[d].exercises[b].exId = f),
                                  ),
                                    c((v) => v + 1));
                                }),
                              children: "\u21C4",
                            }),
                            o("button", {
                              className: "mini",
                              onClick: () => {
                                let f = prompt(
                                    "Series efectivas",
                                    u.workingSets,
                                  ),
                                  v = prompt(
                                    "Rango reps (ej 8-12)",
                                    u.repRange,
                                  );
                                (f &&
                                  v &&
                                  k(e, (w) => {
                                    ((w.days[d].exercises[b].workingSets = +f),
                                      (w.days[d].exercises[b].repRange = v));
                                  }),
                                  c((w) => w + 1));
                              },
                              children: "\u270E",
                            }),
                            o("button", {
                              className: "mini danger",
                              onClick: () => {
                                (k(e, (f) => f.days[d].exercises.splice(b, 1)),
                                  c((f) => f + 1));
                              },
                              children: "\u2715",
                            }),
                          ],
                        }),
                    ],
                  },
                  b,
                );
              }),
              !a &&
                o("button", {
                  className: "btn ghost full",
                  onClick: () =>
                    i((u) => {
                      (k(e, (b) =>
                        b.days[d].exercises.push({
                          exId: u,
                          warmupSets: 1,
                          workingSets: 3,
                          repRange: "8-12",
                          restSeconds: 120,
                          rir: { easy: 2, hard: 1 },
                          note: "",
                        }),
                      ),
                        c((b) => b + 1));
                    }),
                  children: "+ Agregar ejercicio",
                }),
            ],
          },
          d,
        ),
      ),
      !a &&
        o("button", {
          className: "btn ghost full",
          onClick: () => {
            (k(e, (s) =>
              s.days.push({
                name: "D\xEDa " + (s.days.length + 1),
                exercises: [],
              }),
            ),
              c((s) => s + 1));
          },
          children: "+ Agregar d\xEDa",
        }),
    ],
  });
}

export { ca };
