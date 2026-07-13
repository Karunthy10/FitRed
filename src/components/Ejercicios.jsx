import { Fragment as I, jsx as o, jsxs as l } from "react/jsx-runtime";
import { useState as x } from "react";
import { oe } from "./BodyMap.jsx";
import { S, W } from "./ui.jsx";
import { F, ye, j, J, _, we, Y } from "../data/store.js";

function _e({ goForum: e, pickMode: a, onPick: r }) {
  let [i, c] = x("front"),
    [t, n] = x(null),
    [, s] = x(0),
    d = t ? ye(t) : [];
  return l("div", {
    className: "pad",
    children: [
      !t &&
        l(I, {
          children: [
            o("h2", { children: "\xBFQu\xE9 m\xFAsculo entrenas hoy?" }),
            o("p", { className: "dim", children: "Toca una zona del cuerpo" }),
            l("div", {
              className: "row center",
              children: [
                o(S, {
                  on: i === "front",
                  onClick: () => c("front"),
                  children: "Frente",
                }),
                o(S, {
                  on: i === "back",
                  onClick: () => c("back"),
                  children: "Espalda",
                }),
              ],
            }),
            o(oe, { side: i, selected: t, onSelect: n }),
            o("div", {
              className: "row wrap center",
              children: F().length
                ? [
                    "Pecho",
                    "Hombros",
                    "Espalda",
                    "B\xEDceps",
                    "Tr\xEDceps",
                    "Cu\xE1driceps",
                    "Isquios",
                    "Gl\xFAteos",
                    "Gemelos",
                    "Abdomen",
                    "Trapecio",
                    "Antebrazo",
                  ].map((u) => o(S, { onClick: () => n(u), children: u }, u))
                : null,
            }),
          ],
        }),
      t &&
        l(I, {
          children: [
            o("button", {
              className: "back",
              onClick: () => n(null),
              children: "\u2039 Cuerpo",
            }),
            l("h2", {
              children: [
                t,
                " ",
                l("span", {
                  className: "dim small",
                  children: [
                    "\xB7 ",
                    d.length,
                    " ejercicios, mejor rateados primero",
                  ],
                }),
              ],
            }),
            d.map((u, b) =>
              l(
                "div",
                {
                  className: "card",
                  children: [
                    l("div", {
                      className: "row spread",
                      children: [
                        l("div", {
                          children: [
                            l("b", {
                              className: "rank",
                              children: ["#", b + 1],
                            }),
                            " ",
                            o("b", { children: u.name }),
                            l("div", {
                              className: "dim small",
                              children: [
                                u.equipment,
                                " \xB7 ",
                                u.muscles.join(", "),
                              ],
                            }),
                          ],
                        }),
                        o(W, {
                          score: j(u.id),
                          mine: J(u.id),
                          onVote: (y) => {
                            (_(u.id, y), s((f) => f + 1));
                          },
                        }),
                      ],
                    }),
                    l("div", {
                      className: "row gap",
                      children: [
                        o("a", {
                          className: "btn ghost",
                          href: u.videoUrl,
                          target: "_blank",
                          rel: "noreferrer",
                          children: "\u25B6 T\xE9cnica",
                        }),
                        l("button", {
                          className: "btn ghost",
                          onClick: () => e(u.id),
                          children: ["\u{1F4AC} Foro (", Y(u.id).length, ")"],
                        }),
                        a &&
                          o("button", {
                            className: "btn",
                            onClick: () => r(u.id),
                            children: "Elegir",
                          }),
                      ],
                    }),
                  ],
                },
                u.id,
              ),
            ),
            o(ra, { muscle: t, onAdded: () => s((u) => u + 1) }),
          ],
        }),
    ],
  });
}
function ra({ muscle: e, onAdded: a }) {
  let [r, i] = x(!1),
    [c, t] = x(""),
    [n, s] = x("Barra"),
    [d, u] = x("");
  return r
    ? l("div", {
        className: "card",
        children: [
          o("input", {
            placeholder: "Nombre del ejercicio",
            value: c,
            onChange: (b) => t(b.target.value),
          }),
          o("div", {
            className: "row wrap",
            children: [
              "Barra",
              "Mancuernas",
              "M\xE1quina",
              "Polea",
              "Peso corporal",
            ].map((b) =>
              o(S, { on: n === b, onClick: () => s(b), children: b }, b),
            ),
          }),
          o("input", {
            placeholder: "Link de video (YouTube) \u2014 opcional",
            value: d,
            onChange: (b) => u(b.target.value),
          }),
          l("div", {
            className: "row gap",
            children: [
              o("button", {
                className: "btn",
                disabled: !c.trim(),
                onClick: () => {
                  (we({
                    name: c.trim(),
                    primaryMuscle: e,
                    muscles: [],
                    equipment: n,
                    videoUrl:
                      d ||
                      "https://www.youtube.com/results?search_query=" +
                        encodeURIComponent(c + " t\xE9cnica"),
                  }),
                    i(!1),
                    t(""),
                    a());
                },
                children: "Publicar",
              }),
              o("button", {
                className: "btn ghost",
                onClick: () => i(!1),
                children: "Cancelar",
              }),
            ],
          }),
        ],
      })
    : l("button", {
        className: "btn ghost full",
        onClick: () => i(!0),
        children: ["+ Dar de alta un ejercicio de ", e],
      });
}

export { _e };
