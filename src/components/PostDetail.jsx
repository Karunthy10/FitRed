import { Fragment as I, jsx as o, jsxs as l } from "react/jsx-runtime";
import { useState as x } from "react";
import { W, Ye } from "./ui.jsx";
import { V, X, Le, De, M, D } from "../data/store.js";

function ia({ postId: e, goBack: a, goRoutine: r }) {
  let [, i] = x(0),
    [c, t] = x(""),
    n = V(e);
  if (!n) return null;
  let s = [...n.comments].sort((d, u) => u.likes - d.likes);
  return l("div", {
    className: "pad",
    children: [
      o("button", {
        className: "back",
        onClick: a,
        children: "\u2039 Comunidad",
      }),
      l("div", {
        className: "card",
        children: [
          l("div", {
            className: "dim small",
            children: [
              "@",
              M(n.userId),
              " \xB7 ",
              D.find((d) => d[0] === n.category)?.[1],
            ],
          }),
          o("h2", { children: n.title }),
          o("p", { className: "body", children: n.body }),
          l("div", {
            className: "row gap",
            children: [
              o(W, {
                score: n.votes,
                mine: n.myVote,
                onVote: (d) => {
                  (X(n.id, d), i((u) => u + 1));
                },
              }),
              n.routineRef &&
                o("button", {
                  className: "btn",
                  onClick: () => r(n.routineRef),
                  children: "Ver rutina",
                }),
            ],
          }),
        ],
      }),
      l("h3", {
        children: [
          "Comentarios ",
          o("span", {
            className: "dim small",
            children: "\xB7 m\xE1s likeados primero",
          }),
        ],
      }),
      s.map((d) =>
        l(
          "div",
          {
            className: "card cmt",
            children: [
              l("div", {
                className: "row spread",
                children: [
                  l("b", { className: "user", children: ["@", M(d.userId)] }),
                  o(Ye, {
                    c: d,
                    onLike: () => {
                      (De(n.id, d.id), i((u) => u + 1));
                    },
                  }),
                ],
              }),
              o("p", { children: d.body }),
            ],
          },
          d.id,
        ),
      ),
      l("div", {
        className: "row gap",
        children: [
          o("input", {
            placeholder: "\xDAnete al debate\u2026",
            value: c,
            onChange: (d) => t(d.target.value),
          }),
          o("button", {
            className: "btn",
            disabled: !c.trim(),
            onClick: () => {
              (Le(n.id, c.trim()), t(""), i((d) => d + 1));
            },
            children: "\u27A4",
          }),
        ],
      }),
    ],
  });
}

export { ia };
