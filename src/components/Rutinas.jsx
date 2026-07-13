import { Fragment as I, jsx as o, jsxs as l } from "react/jsx-runtime";
import { useState as x } from "react";
import { Re, q, H, je, qe, Ne, Ce, Ie, Pe, M } from "../data/store.js";

function la({ goEdit: e, goExplore: a, force9: r }) {
  let [, i] = x(0),
    c = Re(),
    t = q();
  return (
    H(),
    l("div", {
      className: "pad",
      children: [
        l("div", {
          className: "row spread",
          children: [
            o("h2", { children: "Mis rutinas" }),
            o("button", {
              className: "btn",
              onClick: () => {
                let n = je("Mi rutina");
                e(n);
              },
              children: "+ Crear",
            }),
          ],
        }),
        c.length === 0 &&
          o("div", {
            className: "card dim",
            children:
              "A\xFAn no tienes rutinas. Crea una o copia la de otro usuario",
          }),
        c.map((n) =>
          l(
            "div",
            {
              className: "card",
              children: [
                o("div", {
                  className: "row spread",
                  children: l("div", {
                    children: [
                      o("b", { children: n.name }),
                      t.activeRoutine === n.id &&
                        o("span", { className: "tag on", children: " ACTIVA" }),
                      l("div", {
                        className: "dim small",
                        children: [
                          n.days.length,
                          " d\xEDas \xB7 ",
                          n.weeks,
                          " semanas ",
                          n.copiedFrom ? "\xB7 copiada" : "",
                        ],
                      }),
                    ],
                  }),
                }),
                l("div", {
                  className: "row gap",
                  children: [
                    t.activeRoutine !== n.id &&
                      o("button", {
                        className: "btn",
                        onClick: () => {
                          (qe(n.id), i((s) => s + 1), r());
                        },
                        children: "Usar",
                      }),
                    o("button", {
                      className: "btn ghost",
                      onClick: () => e(n.id),
                      children: "Editar",
                    }),
                    !n.isPublic &&
                      o("button", {
                        className: "btn ghost",
                        onClick: () => {
                          (Ie(
                            n.id,
                            n.name + " \u2014 mi rutina",
                            n.description || "La comparto para feedback.",
                          ),
                            i((s) => s + 1));
                        },
                        children: "Publicar",
                      }),
                    o("button", {
                      className: "btn ghost danger",
                      onClick: () => {
                        confirm("\xBFBorrar rutina?") &&
                          (Pe(n.id), i((s) => s + 1));
                      },
                      children: "Borrar",
                    }),
                  ],
                }),
              ],
            },
            n.id,
          ),
        ),
        o("h3", { children: "Rutinas de la comunidad" }),
        Ne().map((n) =>
          l(
            "div",
            {
              className: "card",
              children: [
                o("b", { children: n.name }),
                l("div", {
                  className: "dim small",
                  children: [
                    "por @",
                    M(n.ownerId),
                    " \xB7 ",
                    n.days.length,
                    " d\xEDas",
                  ],
                }),
                o("p", {
                  className: "dim small",
                  children: n.description?.slice(0, 140),
                }),
                l("div", {
                  className: "row gap",
                  children: [
                    o("button", {
                      className: "btn",
                      onClick: () => {
                        let s = Ce(n.id);
                        (i((d) => d + 1),
                          r(),
                          alert(
                            "Copiada a Mis rutinas \u2713 Ya puedes editarla y entrenarla",
                          ));
                      },
                      children: "Copiar",
                    }),
                    o("button", {
                      className: "btn ghost",
                      onClick: () => e(n.id, !0),
                      children: "Ver",
                    }),
                  ],
                }),
              ],
            },
            n.id,
          ),
        ),
      ],
    })
  );
}

export { la };
