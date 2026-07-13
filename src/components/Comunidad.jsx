import { Fragment as I, jsx as o, jsxs as l } from "react/jsx-runtime";
import { useState as x } from "react";
import { S, W } from "./ui.jsx";
import { D, Ae, X, Te, M } from "../data/store.js";

function sa({ openPost: e, goRoutine: a }) {
  let [r, i] = x(null),
    [, c] = x(0),
    [t, n] = x(!1);
  return l("div", {
    className: "pad",
    children: [
      l("div", {
        className: "row spread",
        children: [
          o("h2", { children: "Comunidad" }),
          o("button", {
            className: "btn",
            onClick: () => n(!0),
            children: "+ Publicar",
          }),
        ],
      }),
      l("div", {
        className: "row wrap",
        children: [
          o(S, { on: !r, onClick: () => i(null), children: "Todo" }),
          D.map(([s, d]) =>
            o(S, { on: r === s, onClick: () => i(s), children: d }, s),
          ),
        ],
      }),
      t &&
        o(na, {
          done: () => {
            (n(!1), c((s) => s + 1));
          },
        }),
      Ae(r).map((s) =>
        o(
          "div",
          {
            className: "card post",
            onClick: () => e(s.id),
            children: l("div", {
              className: "row",
              children: [
                o("span", {
                  onClick: (d) => d.stopPropagation(),
                  children: o(W, {
                    score: s.votes,
                    mine: s.myVote,
                    onVote: (d) => {
                      (X(s.id, d), c((u) => u + 1));
                    },
                  }),
                }),
                l("div", {
                  className: "grow",
                  children: [
                    l("div", {
                      className: "dim small",
                      children: [
                        "@",
                        M(s.userId),
                        " \xB7 ",
                        D.find((d) => d[0] === s.category)?.[1],
                      ],
                    }),
                    o("b", { children: s.title }),
                    l("div", {
                      className: "dim small",
                      children: [
                        "\u{1F4AC} ",
                        s.comments.length,
                        " comentarios ",
                        s.routineRef && "\xB7 \u{1F4CB} rutina adjunta",
                      ],
                    }),
                  ],
                }),
              ],
            }),
          },
          s.id,
        ),
      ),
    ],
  });
}
function na({ done: e }) {
  let [a, r] = x("tips"),
    [i, c] = x(""),
    [t, n] = x("");
  return l("div", {
    className: "card",
    children: [
      o("div", {
        className: "row wrap",
        children: D.map(([s, d]) =>
          o(S, { on: a === s, onClick: () => r(s), children: d }, s),
        ),
      }),
      o("input", {
        placeholder: "T\xEDtulo",
        value: i,
        onChange: (s) => c(s.target.value),
      }),
      o("textarea", {
        placeholder: "Cuenta\u2026",
        rows: 4,
        value: t,
        onChange: (s) => n(s.target.value),
      }),
      l("div", {
        className: "row gap",
        children: [
          o("button", {
            className: "btn",
            disabled: !i.trim(),
            onClick: () => {
              (Te({ category: a, title: i.trim(), body: t.trim() }), e());
            },
            children: "Publicar",
          }),
          o("button", {
            className: "btn ghost",
            onClick: e,
            children: "Cancelar",
          }),
        ],
      }),
    ],
  });
}

export { sa };
