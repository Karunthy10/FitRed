import { jsx as o, jsxs as l } from "react/jsx-runtime";
import { usr } from "../data/store.js";

// rl = relative time: timestamp (ms) -> "ahora", "hace 3 h", "hace 5 d", ...
var rl = (ts) => {
    if (!ts) return "";
    let s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 60) return "ahora";
    if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
    if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
    if (s < 2592000) return `hace ${Math.floor(s / 86400)} d`;
    return `hace ${Math.floor(s / 2592000)} mes`;
  },
  oa = (e) => `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`,
  S = ({ children: e, on: a, ...r }) =>
    o("button", { className: "chip" + (a ? " on" : ""), ...r, children: e }),
  W = ({ score: e, mine: a, onVote: r }) =>
    l("div", {
      className: "vote",
      children: [
        o("button", {
          className: a === 1 ? "v on" : "v",
          "aria-label": "Votar a favor",
          "aria-pressed": a === 1,
          onClick: () => r(a === 1 ? 0 : 1),
          children: "\u25B2",
        }),
        o("b", { children: e }),
        o("button", {
          className: a === -1 ? "v dn" : "v",
          "aria-label": "Votar en contra",
          "aria-pressed": a === -1,
          onClick: () => r(a === -1 ? 0 : -1),
          children: "\u25BC",
        }),
      ],
    }),
  Ye = ({ c: e, onLike: a }) =>
    l("button", {
      className: "heart" + (e.likedByMe ? " on" : ""),
      onClick: a,
      children: ["\u2665\uFE0E ", e.likes],
    }),
  // Vb = insignia de verificado (\u2713 en c\u00EDrculo)
  Vb = () =>
    o("span", { className: "vbadge", title: "Cuenta verificada", children: "\u2713" }),
  // Hn = handle de usuario: "@nombre" + insignia si est\u00E1 verificado, abre
  // el perfil al tocar
  Hn = ({ id: e, onOpen: a }) => {
    let r = usr(e);
    return l("button", {
      className: "handlelink",
      onClick: (i) => {
        i.stopPropagation();
        a && a(e);
      },
      children: ["@", r.username, r.verified && o(Vb, {})],
    });
  };

export { oa, rl, S, W, Ye, Vb, Hn };
