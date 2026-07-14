import { Fragment as I, jsx as o, jsxs as l } from "react/jsx-runtime";
import { useState as x, useRef as re, useEffect as fx } from "react";
import { S } from "./ui.jsx";
import { q, ee, ae, C, Fe, $e, Ve, Oe, He, ve, meId, usr } from "../data/store.js";
import { subscribeSyncStatus } from "../data/sync.js";

function ga({ openProfile }) {
  let [e, a] = x("musculos"),
    [, r] = x(0),
    i = q(),
    c = re(null),
    [sy, sySet] = x(null);
  fx(() => subscribeSyncStatus(sySet), []);
  return l("div", {
    className: "pad",
    children: [
      o("h2", { children: "Progreso" }),
      o("div", {
        className: "row wrap",
        children: [
          ["musculos", "M\xFAsculos"],
          ["prs", "PRs"],
          ["graficas", "Gr\xE1ficas"],
          ["datos", "Datos"],
        ].map(([t, n]) =>
          o(S, { on: e === t, onClick: () => a(t), children: n }, t),
        ),
      }),
      e === "musculos" &&
        l(I, {
          children: [
            l("p", {
              className: "dim small",
              children: [
                "Series completadas esta semana vs las que prescribe tu rutina activa (semana ",
                i.activeWeek,
                ")",
              ],
            }),
            ee().map(({ m: t, t: n, d: s }) =>
              l(
                "div",
                {
                  className: "hmrow",
                  children: [
                    o("span", { className: "hmname", children: t }),
                    o("div", {
                      className: "hmbar2",
                      children: o("div", {
                        className: "hmfill" + (s >= n ? " full" : ""),
                        style: {
                          width: Math.min(100, (100 * s) / (n || 1)) + "%",
                        },
                      }),
                    }),
                    l("span", { className: "hmnum", children: [s, "/", n] }),
                  ],
                },
                t,
              ),
            ),
            !ee().length &&
              o("div", {
                className: "card dim",
                children:
                  "Activa una rutina para ver tus objetivos por m\xFAsculo",
              }),
          ],
        }),
      e === "prs" &&
        l(I, {
          children: [
            ae().map((t) =>
              l(
                "div",
                {
                  className: "card small",
                  children: [
                    l("div", {
                      className: "row spread",
                      children: [
                        o("b", { children: C(t.exId)?.name }),
                        l("b", {
                          className: "rank",
                          children: [t.e1, " ", i.unit],
                        }),
                      ],
                    }),
                    l("span", {
                      className: "dim small",
                      children: [
                        "e1RM \xB7 mejor set ",
                        t.w,
                        i.unit,
                        " \xD7 ",
                        t.r,
                        " \xB7 ",
                        t.date,
                      ],
                    }),
                  ],
                },
                t.exId,
              ),
            ),
            !ae().length &&
              o("div", {
                className: "card dim",
                children:
                  "Registra sets y aqu\xED aparecen tus r\xE9cords (e1RM estimado)",
              }),
          ],
        }),
      e === "graficas" && o(xa, {}),
      e === "datos" &&
        l(I, {
          children: [
            l("button", {
              className: "card profilecard",
              onClick: () => openProfile && openProfile(meId()),
              children: [
                l("div", {
                  className: "grow",
                  children: [
                    l("b", {
                      children: ["@", usr(meId()).username],
                    }),
                    o("div", {
                      className: "dim small",
                      children:
                        (usr(meId()).role || "Atleta") +
                        " · toca para ver y editar tu perfil",
                    }),
                  ],
                }),
                o("span", { className: "dim", children: "›" }),
              ],
            }),
            o("div", {
              className: "card syncstatus",
              children: o("b", {
                children: !sy
                  ? "Comprobando conexión con la nube…"
                  : sy.anonDisabled
                    ? "Sincronización con la nube desactivada"
                    : sy.authed && sy.online && sy.lastSyncOk !== false
                      ? "Sincronizado con la nube ✓"
                      : "Sin conexión, guardado local",
              }),
            }),
            l("div", {
              className: "card",
              children: [
                o("b", { children: "Unidad" }),
                o("div", {
                  className: "row gap",
                  children: ["kg", "lb"].map((t) =>
                    o(
                      S,
                      {
                        on: i.unit === t,
                        onClick: () => {
                          (Ve(t), r((n) => n + 1));
                        },
                        children: t,
                      },
                      t,
                    ),
                  ),
                }),
              ],
            }),
            l("div", {
              className: "card",
              children: [
                o("b", { children: "Respaldo" }),
                o("p", {
                  className: "dim small",
                  children:
                    "Adem\xE1s del respaldo autom\xE1tico en la nube, puedes exportar una copia manual.",
                }),
                l("div", {
                  className: "row gap",
                  children: [
                    o("button", {
                      className: "btn ghost",
                      onClick: () => {
                        let t = new Blob([Oe()], { type: "application/json" }),
                          n = document.createElement("a");
                        ((n.href = URL.createObjectURL(t)),
                          (n.download = "kilo-respaldo.json"),
                          n.click());
                      },
                      children: "Exportar",
                    }),
                    o("button", {
                      className: "btn ghost",
                      onClick: () => c.current.click(),
                      children: "Importar",
                    }),
                    o("input", {
                      ref: c,
                      type: "file",
                      accept: ".json",
                      style: { display: "none" },
                      onChange: async (t) => {
                        let n = t.target.files[0];
                        if (n)
                          try {
                            (He(await n.text()),
                              alert("Respaldo importado \u2713"),
                              location.reload());
                          } catch {
                            alert("Archivo inv\xE1lido");
                          }
                      },
                    }),
                  ],
                }),
              ],
            }),
            l("div", {
              className: "card",
              children: [
                o("b", { className: "danger", children: "Zona de peligro" }),
                o("div", {
                  className: "row gap",
                  children: o("button", {
                    className: "btn ghost danger",
                    onClick: () => {
                      confirm(
                        "\xBFBorrar TODOS tus datos y volver al inicio?",
                      ) && (ve(), location.reload());
                    },
                    children: "Reiniciar app",
                  }),
                }),
              ],
            }),
          ],
        }),
    ],
  });
}
function xa() {
  let e = Fe(),
    [a, r] = x(e[0] || null);
  if (!e.length)
    return o("div", {
      className: "card dim",
      children: "Entrena y registra sets para ver tu progreso graficado",
    });
  let i = a ? $e(a) : [],
    c = 320,
    t = 120,
    n = 8,
    s = i.map((f) => f.v),
    d = Math.min(...s),
    u = Math.max(...s),
    b = (f) => n + (c - 2 * n) * (i.length > 1 ? f / (i.length - 1) : 0.5),
    y = (f) => t - n - (t - 2 * n) * (u > d ? (f - d) / (u - d) : 0.5);
  return l(I, {
    children: [
      o("div", {
        className: "row wrap",
        children: e.map((f) =>
          o(
            S,
            {
              on: a === f,
              onClick: () => r(f),
              children: C(f)?.name?.split(" ").slice(0, 2).join(" "),
            },
            f,
          ),
        ),
      }),
      i.length > 0 &&
        l("div", {
          className: "card",
          children: [
            o("b", { children: C(a)?.name }),
            " ",
            o("span", {
              className: "dim small",
              children: "\xB7 e1RM por sesi\xF3n",
            }),
            l("svg", {
              viewBox: `0 0 ${c} ${t}`,
              style: { width: "100%" },
              children: [
                o("polyline", {
                  fill: "none",
                  stroke: "var(--blue)",
                  strokeWidth: "2.5",
                  points: i.map((f, v) => `${b(v)},${y(f.v)}`).join(" "),
                }),
                i.map((f, v) =>
                  o(
                    "circle",
                    { cx: b(v), cy: y(f.v), r: "3.5", fill: "var(--amber)" },
                    v,
                  ),
                ),
              ],
            }),
            l("div", {
              className: "row spread dim small",
              children: [
                o("span", { children: i[0].date }),
                l("b", { children: [u, " m\xE1x"] }),
                o("span", { children: i[i.length - 1].date }),
              ],
            }),
          ],
        }),
    ],
  });
}

export { ga };
