import { Fragment as I, jsx as o, jsxs as l } from "react/jsx-runtime";
import { useState as x } from "react";
import { W, Ye } from "./ui.jsx";
import { C, Y, j, J, _, ke, Se, M } from "../data/store.js";

function ta({ exId: e, goBack: a }) {
  let [, r] = x(0),
    [i, c] = x(""),
    t = C(e),
    n = Y(e);
  return l("div", {
    className: "pad",
    children: [
      o("button", {
        className: "back",
        onClick: a,
        children: "\u2039 Ejercicios",
      }),
      l("div", {
        className: "card hero2",
        children: [
          l("div", {
            className: "row spread",
            children: [
              l("div", {
                children: [
                  o("b", { className: "big", children: t.name }),
                  l("div", {
                    className: "dim small",
                    children: [t.primaryMuscle, " \xB7 ", t.equipment],
                  }),
                ],
              }),
              o(W, {
                score: j(e),
                mine: J(e),
                onVote: (s) => {
                  (_(e, s), r((d) => d + 1));
                },
              }),
            ],
          }),
          o("a", {
            className: "btn ghost",
            href: t.videoUrl,
            target: "_blank",
            rel: "noreferrer",
            children: "\u25B6 Ver t\xE9cnica correcta",
          }),
        ],
      }),
      l("h3", {
        children: [
          "Debate ",
          o("span", {
            className: "dim small",
            children: "\xB7 mejores comentarios primero",
          }),
        ],
      }),
      n.map((s) =>
        l(
          "div",
          {
            className: "card cmt",
            children: [
              l("div", {
                className: "row spread",
                children: [
                  l("b", { className: "user", children: ["@", M(s.userId)] }),
                  o(Ye, {
                    c: s,
                    onLike: () => {
                      (Se(s.id), r((d) => d + 1));
                    },
                  }),
                ],
              }),
              o("p", { children: s.body }),
            ],
          },
          s.id,
        ),
      ),
      l("div", {
        className: "row gap",
        children: [
          o("input", {
            placeholder: "Opina sobre este ejercicio\u2026",
            value: i,
            onChange: (s) => c(s.target.value),
          }),
          o("button", {
            className: "btn",
            disabled: !i.trim(),
            onClick: () => {
              (ke(e, i.trim()), c(""), r((s) => s + 1));
            },
            children: "\u27A4",
          }),
        ],
      }),
    ],
  });
}

export { ta };
