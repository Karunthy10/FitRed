import { useState, useSyncExternalStore, lazy, Suspense } from "react";
import { da as Entrenar } from "./Entrenar.jsx";
import { meId, usr, subscribeStore, getStoreVersion } from "../data/store.js";

// Code-splitting: Entrenar (la pantalla principal) carga de inmediato; el
// resto se descarga al primer uso para un arranque más rápido
const ExerciseForum = lazy(() =>
  import("./ExerciseForum.jsx").then((m) => ({ default: m.ta })),
);
const PostDetail = lazy(() =>
  import("./PostDetail.jsx").then((m) => ({ default: m.ia })),
);
const RoutineEditor = lazy(() =>
  import("./RoutineEditor.jsx").then((m) => ({ default: m.ca })),
);
const Ejercicios = lazy(() =>
  import("./Ejercicios.jsx").then((m) => ({ default: m._e })),
);
const Rutinas = lazy(() =>
  import("./Rutinas.jsx").then((m) => ({ default: m.la })),
);
const Progreso = lazy(() =>
  import("./Progreso.jsx").then((m) => ({ default: m.ga })),
);
const Comunidad = lazy(() =>
  import("./Comunidad.jsx").then((m) => ({ default: m.sa })),
);
const Profile = lazy(() =>
  import("./Profile.jsx").then((m) => ({ default: m.pf })),
);

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

// Marca Kilo: la K de la barra de pesas (crema), inspirada en el logo
function KiloMark() {
  return (
    <svg className="kmark" viewBox="0 0 148 40" aria-label="Kilo">
      {/* barra */}
      <rect x="6" y="18.25" width="136" height="3.5" rx="1.75" />
      {/* discos izquierda */}
      <rect x="16" y="8" width="6" height="24" rx="2" />
      <rect x="25" y="12" width="5" height="16" rx="2" />
      <rect x="33" y="15" width="4" height="10" rx="2" />
      {/* discos derecha */}
      <rect x="126" y="8" width="6" height="24" rx="2" />
      <rect x="118" y="12" width="5" height="16" rx="2" />
      <rect x="111" y="15" width="4" height="10" rx="2" />
      {/* K */}
      <rect x="60" y="7" width="9" height="26" rx="1" />
      <polygon points="69,20.5 85,7 93,7 74,21.5" />
      <polygon points="69,19.5 85,33 93,33 74,18.5" />
    </svg>
  );
}

function te() {
  const [tab, setTab] = useState("entrenar");
  const [overlay, setOverlay] = useState(null);
  const [, force] = useState(0);
  // Cualquier escritura al store re-renderiza el árbol: adiós pantallas
  // desactualizadas al cambiar de pestaña
  useSyncExternalStore(subscribeStore, getStoreVersion);
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
        goBack={() => go(overlay.back || null)}
        goRoutine={(s) => go({ t: "editor", id: s, ro: true, back: overlay })}
        openProfile={(uid) => go({ t: "profile", id: uid, back: overlay })}
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
  else if (overlay?.t === "profile")
    screen = (
      <Profile
        userId={overlay.id}
        goBack={() => go(overlay.back || null)}
        openRoutine={(r) => go({ t: "editor", id: r, ro: true, back: overlay })}
        openPost={(pid) => go({ t: "post", id: pid, back: overlay })}
      />
    );
  else if (tab === "entrenar")
    screen = <Entrenar goRoutines={() => setTab("rutinas")} />;
  else if (tab === "rutinas")
    screen = (
      <Rutinas
        force9={() => force((s) => s + 1)}
        goEdit={(s, d) => go({ t: "editor", id: s, ro: d })}
        openProfile={(uid) => go({ t: "profile", id: uid })}
      />
    );
  else if (tab === "ejercicios")
    screen = <Ejercicios goForum={(s) => go({ t: "exforum", exId: s })} />;
  else if (tab === "progreso")
    screen = <Progreso openProfile={(uid) => go({ t: "profile", id: uid })} />;
  else
    screen = (
      <Comunidad
        openPost={(s) => go({ t: "post", id: s })}
        openProfile={(uid) => go({ t: "profile", id: uid })}
      />
    );

  return (
    <div className="app">
      <header>
        <div className="brandlock">
          <KiloMark />
          <b className="brand">KILO</b>
        </div>
        <button
          className="handlelink dim small"
          onClick={() => go({ t: "profile", id: meId() })}
        >
          @{usr(meId()).username || meId()}
        </button>
      </header>
      <main key={tab + ":" + (overlay?.t || "") + ":" + (overlay?.id || "")}>
        <Suspense fallback={null}>{screen}</Suspense>
      </main>
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
