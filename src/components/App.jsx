import { Fragment as I, jsx as o, jsxs as l } from "react/jsx-runtime";
import { useState as x } from "react";
import { ta } from "./ExerciseForum.jsx";
import { ia } from "./PostDetail.jsx";
import { ca } from "./RoutineEditor.jsx";
import { _e } from "./Ejercicios.jsx";
import { da } from "./Entrenar.jsx";
import { la } from "./Rutinas.jsx";
import { ga } from "./Progreso.jsx";
import { sa } from "./Comunidad.jsx";

function te() {
  let [e, a] = x("entrenar"),
    [r, i] = x(null),
    [, c] = x(0),
    t = (s) => {
      (i(s), window.scrollTo(0, 0));
    },
    n;
  return (
    r?.t === "exforum"
      ? (n = o(ta, { exId: r.exId, goBack: () => t(r.from || null) }))
      : r?.t === "post"
        ? (n = o(ia, {
            postId: r.id,
            goBack: () => t(null),
            goRoutine: (s) => t({ t: "editor", id: s, ro: !0 }),
          }))
        : r?.t === "editor"
          ? (n = o(ca, {
              id: r.id,
              readOnly: r.ro,
              goBack: () => t(null),
              goPickExercise: (s) => t({ t: "pick", cb: s, back: r }),
            }))
          : r?.t === "pick"
            ? (n = o(_e, {
                pickMode: !0,
                goForum: (s) => t({ t: "exforum", exId: s, from: r }),
                onPick: (s) => {
                  (r.cb(s), t(r.back));
                },
              }))
            : e === "entrenar"
              ? (n = o(da, { goRoutines: () => a("rutinas") }))
              : e === "rutinas"
                ? (n = o(la, {
                    force9: () => c((s) => s + 1),
                    goEdit: (s, d) => t({ t: "editor", id: s, ro: d }),
                  }))
                : e === "ejercicios"
                  ? (n = o(_e, {
                      goForum: (s) => t({ t: "exforum", exId: s }),
                    }))
                  : e === "progreso"
                    ? (n = o(ga, {}))
                    : (n = o(sa, { openPost: (s) => t({ t: "post", id: s }) })),
    l("div", {
      className: "app",
      children: [
        l("header", {
          children: [
            o("b", { className: "brand", children: "FIT\xB7RED" }),
            o("span", { className: "dim small", children: "@karunthy" }),
          ],
        }),
        o("main", { children: n }),
        o("nav", {
          children: [
            ["entrenar", "\u{1F3CB}\uFE0F", "Entrenar"],
            ["rutinas", "\u{1F4CB}", "Rutinas"],
            ["ejercicios", "\u{1F4AA}", "Ejercicios"],
            ["progreso", "\u{1F4CA}", "Progreso"],
            ["comunidad", "\u{1F465}", "Comunidad"],
          ].map(([s, d, u]) =>
            l(
              "button",
              {
                className: e === s && !r ? "on" : "",
                onClick: () => {
                  (a(s), i(null), window.scrollTo(0, 0));
                },
                children: [o("span", { className: "ic", children: d }), u],
              },
              s,
            ),
          ),
        }),
      ],
    })
  );
}

export { te };
