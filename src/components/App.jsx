import { useState } from "react";
import { ta as ExerciseForum } from "./ExerciseForum.jsx";
import { ia as PostDetail } from "./PostDetail.jsx";
import { ca as RoutineEditor } from "./RoutineEditor.jsx";
import { _e as Ejercicios } from "./Ejercicios.jsx";
import { da as Entrenar } from "./Entrenar.jsx";
import { la as Rutinas } from "./Rutinas.jsx";
import { ga as Progreso } from "./Progreso.jsx";
import { sa as Comunidad } from "./Comunidad.jsx";

// Íconos de línea del tab bar (estilo SF Symbols, stroke por currentColor)
const ICONS = {
  entrenar: (
    <svg viewBox="0 0 24 24">
      <path d="M3.5 12h2m13 0h2M7 12h10" />
      <rect x="5" y="8.5" width="2.6" height="7" rx="1" />
      <rect x="16.4" y="8.5" width="2.6" height="7" rx="1" />
      <rect x="8.2" y="6.5" width="2.6" height="11" rx="1" />
      <rect x="13.2" y="6.5" width="2.6" height="11" rx="1" />
    </svg>
  ),
  rutinas: (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9 4.5V3h6v1.5M8.5 9.5h7M8.5 13h7M8.5 16.5h4.5" />
    </svg>
  ),
  ejercicios: (
    <svg viewBox="0 0 24 24">
      <path d="M6.5 4.5c3 0 5.5 1.5 6.5 4l1.5 3.5c.8 2 .3 4.5-1.5 6-2.2 1.9-5.5 1.6-7.3-.6C4 15.2 3.8 12 5.5 10L8 7.2" />
      <path d="M14.5 5.5 17 3m0 0h3m-3 0v3" />
    </svg>
  ),
  progreso: (
    <svg viewBox="0 0 24 24">
      <path d="M4 20V10m5.3 10V4m5.4 16v-8m5.3 8V7" />
    </svg>
  ),
  comunidad: (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c.5-3 2.8-5 5.5-5s5 2 5.5 5" />
      <circle cx="17" cy="9.5" r="2.4" />
      <path d="M16 14.3c2.4.2 4 2 4.5 4.2" />
    </svg>
  ),
};

const TABS = [
  ["entrenar", "Entrenar"],
  ["rutinas", "Rutinas"],
  ["ejercicios", "Ejercicios"],
  ["progreso", "Progreso"],
  ["comunidad", "Comunidad"],
];

function te() {
  const [tab, setTab] = useState("entrenar");
  const [overlay, setOverlay] = useState(null);
  const [, force] = useState(0);
  const go = (s) => {
    setOverlay(s);
    window.scrollTo(0, 0);
  };

  let screen;
  if (overlay?.t === "exforum")
    screen = (
      <ExerciseForum exId={overlay.exId} goBack={() => go(overlay.from || null)} />
    );
  else if (overlay?.t === "post")
    screen = (
      <PostDetail
        postId={overlay.id}
        goBack={() => go(null)}
        goRoutine={(s) => go({ t: "editor", id: s, ro: true })}
      />
    );
  else if (overlay?.t === "editor")
    screen = (
      <RoutineEditor
        id={overlay.id}
        readOnly={overlay.ro}
        goBack={() => go(null)}
        goPickExercise={(s) => go({ t: "pick", cb: s, back: overlay })}
      />
    );
  else if (overlay?.t === "pick")
    screen = (
      <Ejercicios
        pickMode={true}
        goForum={(s) => go({ t: "exforum", exId: s, from: overlay })}
        onPick={(s) => {
          overlay.cb(s);
          go(overlay.back);
        }}
      />
    );
  else if (tab === "entrenar")
    screen = <Entrenar goRoutines={() => setTab("rutinas")} />;
  else if (tab === "rutinas")
    screen = (
      <Rutinas
        force9={() => force((s) => s + 1)}
        goEdit={(s, d) => go({ t: "editor", id: s, ro: d })}
      />
    );
  else if (tab === "ejercicios")
    screen = <Ejercicios goForum={(s) => go({ t: "exforum", exId: s })} />;
  else if (tab === "progreso") screen = <Progreso />;
  else screen = <Comunidad openPost={(s) => go({ t: "post", id: s })} />;

  return (
    <div className="app">
      <header>
        <b className="brand">
          <span className="k">K</span>ILO
        </b>
        <span className="dim small">@karunthy</span>
      </header>
      <main>{screen}</main>
      <nav>
        {TABS.map(([id, label]) => (
          <button
            key={id}
            className={tab === id && !overlay ? "on" : ""}
            onClick={() => {
              setTab(id);
              setOverlay(null);
              window.scrollTo(0, 0);
            }}
          >
            {ICONS[id]}
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export { te };
