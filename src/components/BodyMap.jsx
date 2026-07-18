// Mapa corporal anatómico. Cada lado se dibuja una vez y se refleja con una
// transform (matrix -1 … 240) para mantener simetría perfecta. Los músculos
// son paths seleccionables; el seleccionado se rellena con degradado rojo.

const VB = "0 0 240 470";

function oe({ side, selected, onSelect }) {
  const fill = (m) => (selected === m ? "url(#ksel)" : "#232f36");
  const stroke = (m) => (selected === m ? "#ece7da" : "#38454d");
  const M = ({ m, d, key }) => (
    <path
      key={key}
      d={d}
      onClick={() => onSelect(m)}
      style={{
        fill: fill(m),
        stroke: stroke(m),
        strokeWidth: 1.1,
        cursor: "pointer",
        transition: "fill .15s ease",
      }}
    />
  );
  // Líneas de estriación (decorativas, no interactivas)
  const S = ({ d, key }) => (
    <path
      key={key}
      d={d}
      style={{ fill: "none", stroke: "rgba(0,0,0,.28)", strokeWidth: 0.8 }}
    />
  );

  const defs = (
    <defs>
      <linearGradient id="ksel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4efe2" />
        <stop offset="1" stopColor="#cdc6b4" />
      </linearGradient>
    </defs>
  );

  const head = (
    <g>
      <circle cx="120" cy="34" r="21" fill="#1b262c" stroke="#38454d" strokeWidth="1.1" />
      <path d="M112 52 h16 v10 q-8 5 -16 0 Z" fill="#1b262c" stroke="#38454d" strokeWidth="1.1" />
    </g>
  );

  const label = (t) => (
    <text
      x="120"
      y="462"
      textAnchor="middle"
      fill="#5c6270"
      fontFamily="'Barlow Condensed',sans-serif"
      fontSize="14"
      letterSpacing="2"
    >
      {t}
    </text>
  );

  // Silueta base (torso + brazos + piernas) detrás de los músculos
  const silhouette = (d) => (
    <path d={d} fill="#111a1f" stroke="#2d3a42" strokeWidth="1.2" />
  );

  if (side === "front") {
    // Músculos del lado izquierdo (se reflejan al derecho)
    const leftFront = [
      // Deltoides
      { m: "Hombros", d: "M96 70 q-20 0 -26 20 q-3 12 8 15 q13 -2 18 -16 q3 -12 0 -19 Z" },
      // Pectoral (mitad)
      { m: "Pecho", d: "M116 74 q-20 -2 -30 8 q-8 10 -1 22 q16 9 31 2 q2 -16 0 -32 Z" },
      // Bíceps
      { m: "Bíceps", d: "M78 106 q-11 4 -12 26 q0 15 10 15 q9 -3 10 -22 q1 -14 -1 -20 q-3 -1 -7 1 Z" },
      // Antebrazo
      { m: "Antebrazo", d: "M76 150 q-9 12 -8 34 q1 13 10 12 q8 -3 8 -24 q0 -18 -3 -24 q-4 -3 -7 2 Z" },
      // Cuádriceps
      { m: "Cuádriceps", d: "M116 196 q-24 2 -28 40 q-3 34 10 52 q17 4 18 -30 l2 -60 q-1 -3 -2 -2 Z" },
      // Gemelos
      { m: "Gemelos", d: "M112 300 q-16 6 -16 44 q1 26 12 30 q11 -4 10 -40 q-1 -30 -6 -34 Z" },
    ];
    const strias = [
      // pecho
      { d: "M112 80 q-16 0 -24 8" },
      { d: "M113 90 q-18 2 -26 10" },
      // abdomen (verticales + horizontales)
      { d: "M120 118 v58" },
      { d: "M108 132 h24 M108 146 h24 M108 160 h22" },
      // cuádriceps sweep
      { d: "M104 214 q4 40 8 66" },
    ];
    return (
      <svg viewBox={VB} style={svgStyle}>
        {defs}
        {silhouette(
          "M120 54 q16 0 22 14 q26 4 32 30 q4 20 -2 44 q10 16 10 44 q0 22 -6 34 q-8 4 -14 -2 q-2 4 -3 12 q10 20 12 54 q3 34 -6 62 q-8 22 -14 44 q-6 8 -14 4 q-5 -18 -6 -46 q0 -6 -5 -6 q-5 0 -5 6 q-1 28 -6 46 q-8 4 -14 -4 q-6 -22 -14 -44 q-9 -28 -6 -62 q2 -34 12 -54 q-1 -8 -3 -12 q-6 6 -14 2 q-6 -12 -6 -34 q0 -28 10 -44 q-6 -24 -2 -44 q6 -26 32 -30 q6 -14 22 -14 Z",
        )}
        {head}
        {/* Trapecio (yugo central) */}
        <M
          m="Trapecio"
          d="M120 56 q-16 0 -26 12 q10 -4 26 -4 q16 0 26 4 q-10 -12 -26 -12 Z"
        />
        {/* Abdomen central */}
        <M
          m="Abdomen"
          d="M104 112 q16 -4 32 0 q2 30 -2 60 q-14 12 -28 0 q-4 -30 -2 -60 Z"
        />
        {/* Lados izquierdo + reflejado */}
        {leftFront.map((p, i) => (
          <M key={i} m={p.m} d={p.d} />
        ))}
        <g transform="matrix(-1 0 0 1 240 0)">
          {leftFront.map((p, i) => (
            <M key={i} m={p.m} d={p.d} />
          ))}
        </g>
        {strias.map((s, i) => (
          <S key={i} d={s.d} />
        ))}
        <g transform="matrix(-1 0 0 1 240 0)">
          {strias
            .filter((s) => !s.d.includes("v58") && !s.d.includes("h2"))
            .map((s, i) => (
              <S key={i} d={s.d} />
            ))}
        </g>
        {label("FRENTE")}
      </svg>
    );
  }

  // ----- ESPALDA -----
  const leftBack = [
    { m: "Hombros", d: "M96 70 q-20 0 -26 20 q-3 12 8 15 q13 -2 18 -16 q3 -12 0 -19 Z" },
    // Dorsal / espalda (ala)
    { m: "Espalda", d: "M116 92 q-22 2 -30 22 q-6 22 6 44 q16 6 24 -10 q4 -28 2 -54 q-1 -3 -2 -2 Z" },
    { m: "Tríceps", d: "M78 106 q-11 4 -12 26 q0 15 10 15 q9 -3 10 -22 q1 -14 -1 -20 q-3 -1 -7 1 Z" },
    { m: "Antebrazo", d: "M76 150 q-9 12 -8 34 q1 13 10 12 q8 -3 8 -24 q0 -18 -3 -24 q-4 -3 -7 2 Z" },
    // Glúteo (mitad)
    { m: "Glúteos", d: "M118 188 q-20 0 -26 18 q-3 16 8 24 q16 4 20 -12 l0 -28 q-1 -3 -2 -2 Z" },
    // Isquios
    { m: "Isquios", d: "M114 232 q-20 4 -22 40 q-2 26 10 40 q15 2 16 -30 l0 -48 q-1 -3 -4 -2 Z" },
    { m: "Gemelos", d: "M112 314 q-16 6 -16 40 q1 24 12 28 q11 -4 10 -36 q-1 -28 -6 -32 Z" },
  ];
  const striasB = [
    // trapecio diamante
    { d: "M120 62 v40" },
    // dorsal V
    { d: "M116 100 q-14 8 -22 24" },
    { d: "M118 116 q-16 8 -24 22" },
    // isquios
    { d: "M104 246 q3 40 8 62" },
  ];
  return (
    <svg viewBox={VB} style={svgStyle}>
      {defs}
      {silhouette(
        "M120 54 q16 0 22 14 q26 4 32 30 q4 20 -2 44 q10 16 10 44 q0 22 -6 34 q-8 4 -14 -2 q-2 4 -3 12 q10 20 12 54 q3 34 -6 62 q-8 22 -14 44 q-6 8 -14 4 q-5 -18 -6 -46 q0 -6 -5 -6 q-5 0 -5 6 q-1 28 -6 46 q-8 4 -14 -4 q-6 -22 -14 -44 q-9 -28 -6 -62 q2 -34 12 -54 q-1 -8 -3 -12 q-6 6 -14 2 q-6 -12 -6 -34 q0 -28 10 -44 q-6 -24 -2 -44 q6 -26 32 -30 q6 -14 22 -14 Z",
      )}
      {head}
      {/* Trapecio (diamante superior) */}
      <M
        m="Trapecio"
        d="M120 56 q-24 4 -30 20 q14 -8 30 -8 q16 0 30 8 q-6 -16 -30 -20 Z M120 74 q-14 0 -22 14 q10 18 22 20 q12 -2 22 -20 q-8 -14 -22 -14 Z"
      />
      {leftBack.map((p, i) => (
        <M key={i} m={p.m} d={p.d} />
      ))}
      <g transform="matrix(-1 0 0 1 240 0)">
        {leftBack.map((p, i) => (
          <M key={i} m={p.m} d={p.d} />
        ))}
      </g>
      {striasB.map((s, i) => (
        <S key={i} d={s.d} />
      ))}
      <g transform="matrix(-1 0 0 1 240 0)">
        {striasB
          .filter((s) => !s.d.includes("v40"))
          .map((s, i) => (
            <S key={i} d={s.d} />
          ))}
      </g>
      {label("ESPALDA")}
    </svg>
  );
}

const svgStyle = {
  width: "100%",
  maxWidth: 260,
  display: "block",
  margin: "6px auto",
};

export { oe };
