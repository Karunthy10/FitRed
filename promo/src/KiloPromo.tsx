import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/fonts";

// Identidad Kilo: marfil sobre azul marino (igual que la app)
const NAVY = "#141e23";
const CREAM = "#ece7da";
const ASH = "#93a0a6";

loadFont({
  family: "Barlow Condensed",
  url: staticFile("fonts/barlow-condensed-700.woff2"),
  weight: "700",
});
loadFont({
  family: "Inter",
  url: staticFile("fonts/inter-500.woff2"),
  weight: "500",
});

const out = Easing.bezier(0.16, 1, 0.3, 1);

// 1) Logo K + wordmark
const Intro = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", gap: 30 }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 720,
          scale: String(
            interpolate(frame, [0, 40], [0.6, 1], {
              extrapolateRight: "clamp",
              easing: out,
            }),
          ),
          opacity: interpolate(frame, [0, 25], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      />
      <div
        style={{
          fontFamily: "Barlow Condensed",
          fontWeight: 700,
          fontSize: 150,
          letterSpacing: "0.22em",
          color: CREAM,
          opacity: interpolate(frame, [20, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `0px ${interpolate(frame, [20, 50], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: out,
          })}px`,
        }}
      >
        KILO
      </div>
    </AbsoluteFill>
  );
};

// 2) Tagline en dos líneas escalonadas
const Tagline = () => {
  const frame = useCurrentFrame();
  const line = (text: string, delay: number) => (
    <div
      style={{
        fontFamily: "Barlow Condensed",
        fontWeight: 700,
        fontSize: 128,
        textTransform: "uppercase",
        color: CREAM,
        lineHeight: 1.05,
        opacity: interpolate(frame, [delay, delay + 22], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: `0px ${interpolate(frame, [delay, delay + 22], [70, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: out,
        })}px`,
      }}
    >
      {text}
    </div>
  );
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        opacity: interpolate(frame, [78, 90], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {line("Tu entrenamiento.", 0)}
      {line("Tu progreso.", 14)}
      <div
        style={{
          marginTop: 30,
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 44,
          color: ASH,
          opacity: interpolate(frame, [30, 52], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Registra series, sube de peso, comparte rutinas.
      </div>
    </AbsoluteFill>
  );
};

// 3) Desfile de pantallas reales de la app
const SHOTS = [
  { file: "shot-hoy.png", label: "Tu sesión de hoy, en un toque" },
  { file: "shot-sesion.png", label: "Registra con una mano" },
  { file: "shot-perfil.png", label: "Perfiles y comunidad reales" },
];
const PER = 55;

const Screens = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {SHOTS.map((s, i) => {
        const start = i * PER;
        const local = frame - start;
        return (
          <Sequence key={s.file} from={start} durationInFrames={PER + 14}>
            <AbsoluteFill
              style={{ justifyContent: "center", alignItems: "center", gap: 36 }}
            >
              <Img
                src={staticFile(s.file)}
                style={{
                  width: 760,
                  borderRadius: 54,
                  border: `3px solid ${CREAM}22`,
                  boxShadow: "0 60px 120px rgba(0,0,0,0.55)",
                  translate: `0px ${interpolate(local, [0, 26], [420, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: out,
                  })}px`,
                  rotate: `${interpolate(local, [0, 26], [4, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: out,
                  })}deg`,
                  opacity: interpolate(
                    local,
                    [0, 14, PER, PER + 12],
                    [0, 1, 1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  ),
                }}
              />
              <div
                style={{
                  fontFamily: "Barlow Condensed",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: 72,
                  color: CREAM,
                  textAlign: "center",
                  padding: "0 60px",
                  opacity: interpolate(
                    local,
                    [10, 24, PER, PER + 12],
                    [0, 1, 1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  ),
                }}
              >
                {s.label}
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// 4) Cierre con CTA
const Outro = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", gap: 26 }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 560,
          opacity: interpolate(frame, [0, 20], [0, 1], {
            extrapolateRight: "clamp",
          }),
          scale: String(
            interpolate(frame, [0, 26], [0.85, 1], {
              extrapolateRight: "clamp",
              easing: out,
            }),
          ),
        }}
      />
      <div
        style={{
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 54,
          color: CREAM,
          background: "#ffffff14",
          border: `2px solid ${CREAM}44`,
          borderRadius: 999,
          padding: "24px 64px",
          opacity: interpolate(frame, [14, 34], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: `0px ${interpolate(frame, [14, 34], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: out,
          })}px`,
        }}
      >
        fitred.vercel.app
      </div>
    </AbsoluteFill>
  );
};

export const KiloPromo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <Sequence durationInFrames={80}>
        <Intro />
      </Sequence>
      <Sequence from={70} durationInFrames={95}>
        <Tagline />
      </Sequence>
      <Sequence from={160} durationInFrames={180}>
        <Screens />
      </Sequence>
      <Sequence from={335}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
