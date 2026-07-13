import { jsx as o, jsxs as l } from "react/jsx-runtime";

var oa = (e) => `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`,
  S = ({ children: e, on: a, ...r }) =>
    o("button", { className: "chip" + (a ? " on" : ""), ...r, children: e }),
  W = ({ score: e, mine: a, onVote: r }) =>
    l("div", {
      className: "vote",
      children: [
        o("button", {
          className: a === 1 ? "v on" : "v",
          onClick: () => r(a === 1 ? 0 : 1),
          children: "\u25B2",
        }),
        o("b", { children: e }),
        o("button", {
          className: a === -1 ? "v dn" : "v",
          onClick: () => r(a === -1 ? 0 : -1),
          children: "\u25BC",
        }),
      ],
    }),
  Ye = ({ c: e, onLike: a }) =>
    l("button", {
      className: "heart" + (e.likedByMe ? " on" : ""),
      onClick: a,
      children: ["\u2764 ", e.likes],
    });

export { oa, S, W, Ye };
