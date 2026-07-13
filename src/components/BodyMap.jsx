import { jsx as g, jsxs as Je } from "react/jsx-runtime";

function oe({ side: e, selected: a, onSelect: r }) {
  let i = (s) => ({
      fill: a === s ? "var(--blue)" : "#262a33",
      stroke: a === s ? "#ff8a80" : "#3a4050",
      strokeWidth: 1.2,
      cursor: "pointer",
    }),
    c = ({ m: s, d }) => g("path", { d, style: i(s), onClick: () => r(s) }),
    t = ({ m: s, cx: d, cy: u, rx: b, ry: y }) =>
      g("ellipse", {
        cx: d,
        cy: u,
        rx: b,
        ry: y,
        style: i(s),
        onClick: () => r(s),
      }),
    n = ({ m: s, x: d, y: u, w: b, h: y, r: f = 8 }) =>
      g("rect", {
        x: d,
        y: u,
        width: b,
        height: y,
        rx: f,
        style: i(s),
        onClick: () => r(s),
      });
  return e === "front"
    ? Je("svg", {
        viewBox: "0 0 200 420",
        style: {
          width: "100%",
          maxWidth: 230,
          display: "block",
          margin: "0 auto",
        },
        children: [
          g("circle", {
            cx: "100",
            cy: "30",
            r: "20",
            fill: "#1c1f26",
            stroke: "#3a4050",
          }),
          g("rect", {
            x: "90",
            y: "50",
            width: "20",
            height: "12",
            fill: "#1c1f26",
          }),
          g(t, { m: "Hombros", cx: "63", cy: "75", rx: "15", ry: "13" }),
          g(t, { m: "Hombros", cx: "137", cy: "75", rx: "15", ry: "13" }),
          g(c, {
            m: "Pecho",
            d: "M75 68 Q100 62 125 68 L125 100 Q100 112 75 100 Z",
          }),
          g(t, { m: "B\xEDceps", cx: "54", cy: "112", rx: "10", ry: "20" }),
          g(t, { m: "B\xEDceps", cx: "146", cy: "112", rx: "10", ry: "20" }),
          g(t, { m: "Antebrazo", cx: "48", cy: "158", rx: "8", ry: "22" }),
          g(t, { m: "Antebrazo", cx: "152", cy: "158", rx: "8", ry: "22" }),
          g(n, { m: "Abdomen", x: "82", y: "105", w: "36", h: "55", r: "10" }),
          g(c, { m: "Abdomen", d: "M70 105 L80 105 L80 155 L72 148 Z" }),
          g(c, { m: "Abdomen", d: "M130 105 L120 105 L120 155 L128 148 Z" }),
          g(t, { m: "Cu\xE1driceps", cx: "82", cy: "215", rx: "16", ry: "42" }),
          g(t, {
            m: "Cu\xE1driceps",
            cx: "118",
            cy: "215",
            rx: "16",
            ry: "42",
          }),
          g(t, { m: "Gemelos", cx: "83", cy: "320", rx: "11", ry: "38" }),
          g(t, { m: "Gemelos", cx: "117", cy: "320", rx: "11", ry: "38" }),
          g("text", {
            x: "100",
            y: "405",
            textAnchor: "middle",
            fill: "#5c6270",
            fontSize: "11",
            children: "FRENTE",
          }),
        ],
      })
    : Je("svg", {
        viewBox: "0 0 200 420",
        style: {
          width: "100%",
          maxWidth: 230,
          display: "block",
          margin: "0 auto",
        },
        children: [
          g("circle", {
            cx: "100",
            cy: "30",
            r: "20",
            fill: "#1c1f26",
            stroke: "#3a4050",
          }),
          g("rect", {
            x: "90",
            y: "50",
            width: "20",
            height: "12",
            fill: "#1c1f26",
          }),
          g(c, {
            m: "Trapecio",
            d: "M78 62 Q100 52 122 62 L112 88 Q100 82 88 88 Z",
          }),
          g(t, { m: "Hombros", cx: "63", cy: "75", rx: "15", ry: "13" }),
          g(t, { m: "Hombros", cx: "137", cy: "75", rx: "15", ry: "13" }),
          g(c, {
            m: "Espalda",
            d: "M75 88 L125 88 L118 150 Q100 160 82 150 Z",
          }),
          g(t, { m: "Tr\xEDceps", cx: "54", cy: "112", rx: "10", ry: "20" }),
          g(t, { m: "Tr\xEDceps", cx: "146", cy: "112", rx: "10", ry: "20" }),
          g(t, { m: "Antebrazo", cx: "48", cy: "158", rx: "8", ry: "22" }),
          g(t, { m: "Antebrazo", cx: "152", cy: "158", rx: "8", ry: "22" }),
          g(n, { m: "Espalda", x: "85", y: "152", w: "30", h: "20", r: "6" }),
          g(t, { m: "Gl\xFAteos", cx: "85", cy: "188", rx: "17", ry: "17" }),
          g(t, { m: "Gl\xFAteos", cx: "115", cy: "188", rx: "17", ry: "17" }),
          g(t, { m: "Isquios", cx: "82", cy: "248", rx: "15", ry: "38" }),
          g(t, { m: "Isquios", cx: "118", cy: "248", rx: "15", ry: "38" }),
          g(t, { m: "Gemelos", cx: "83", cy: "330", rx: "12", ry: "35" }),
          g(t, { m: "Gemelos", cx: "117", cy: "330", rx: "12", ry: "35" }),
          g("text", {
            x: "100",
            y: "405",
            textAnchor: "middle",
            fill: "#5c6270",
            fontSize: "11",
            children: "ESPALDA",
          }),
        ],
      });
}

export { oe };
