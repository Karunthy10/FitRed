import { useState, useEffect, useRef } from "react";
import { oa, S } from "./ui.jsx";
import {
  q,
  H,
  Z,
  C,
  Q,
  Be,
  Ue,
  We,
  Ge,
  O,
  ze,
  j,
  Me,
  K,
  ye,
  pinnedTips,
  usr,
  meId,
  startOrResume,
  finishWorkout,
  resumable,
  pref,
} from "../data/store.js";
import { $ as TECH } from "../data/seed.js";

const WELCOME_KEY = "kilo-welcomed";
const dismissedWelcome = () => {
  try {
    return localStorage.getItem(WELCOME_KEY) === "1";
  } catch {
    return true;
  }
};

function da({ goRoutines }) {
  const [, force] = useState(0);
  const bump = () => force((s) => s + 1);
  const state = q();
  H();
  const routine = state.activeRoutine && Z(state.activeRoutine);

  const [dayIdx, setDayIdx] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [rest, setRest] = useState(0);
  const [restTotal, setRestTotal] = useState(1);
  const [summary, setSummary] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [welcomed, setWelcomed] = useState(dismissedWelcome());
  const [subs, setSubs] = useState({}); // sustituciones de esta sesión: idx -> exId
  const [picking, setPicking] = useState(null); // idx del ejercicio a sustituir
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (rest > 0) {
      timerRef.current = setTimeout(() => {
        if (rest === 1) restDone(audioRef);
        setRest((s) => s - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [rest]);

  // ----- Sin rutina activa -----
  if (!routine)
    return (
      <div className="pad center-col">
        <h2>Aún no tienes una rutina</h2>
        <p className="dim center">
          Copia una rutina probada de la comunidad o crea la tuya en un minuto.
          Luego vuelve aquí para entrenar.
        </p>
        <button className="btn" onClick={goRoutines}>
          Explorar rutinas
        </button>
      </div>
    );

  const week = state.activeWeek;
  const easy = (routine.easyWeeks || []).includes(week);

  const openDay = (N) => {
    setDayIdx(N);
    setSubs({});
    startRef.current = Date.now();
    setWorkout(startOrResume(routine.id, N, week));
  };

  const exitSession = () => {
    if (workout) finishWorkout(workout.id);
    setWorkout(null);
    setDayIdx(null);
    setRest(0);
    setSummary(null);
    setSubs({});
    bump();
  };

  const finishSession = () => {
    const s = buildSummary(state, workout, routine.days[dayIdx], startRef.current);
    if (s.doneSets > 0) setSummary(s);
    else exitSession();
  };

  // ----- Resumen de logro al terminar -----
  if (summary)
    return (
      <div className="pad">
        <div className="card summary pop">
          <div className="sumtitle">¡Sesión completada!</div>
          <div className="sumday">{summary.dayName}</div>
          <div className="sumgrid">
            <Stat n={summary.doneSets} label="series" />
            <Stat n={fmtTon(summary.tonnage, state.unit)} label="movido" />
            <Stat n={summary.prs} label={summary.prs === 1 ? "récord" : "récords"} accent />
            <Stat n={summary.mins ? summary.mins + " min" : "—"} label="duración" />
          </div>
          <p className="dim center" style={{ marginTop: 4 }}>
            {summary.prs > 0
              ? "Rompiste marca. Así se progresa."
              : "Constancia sobre intensidad. Nos vemos la próxima."}
          </p>
          <button className="btn full" onClick={exitSession}>
            Listo
          </button>
        </div>
      </div>
    );

  // ----- Home: selección de día -----
  if (workout === null)
    return (
      <div className="pad">
        {!welcomed && (
          <div className="card welcome pop">
            <b className="welcometitle">Bienvenido a Kilo</b>
            <p className="dim small">
              Elige un día abajo y registra tus series: Kilo te sugiere el peso,
              el calentamiento y el descanso. ¿Sin rutina que te lata? Copia una
              de la comunidad.
            </p>
            <div className="row gap">
              <button className="btn" onClick={goRoutines}>
                Ver rutinas
              </button>
              <button
                className="btn ghost"
                onClick={() => {
                  try {
                    localStorage.setItem(WELCOME_KEY, "1");
                  } catch {}
                  setWelcomed(true);
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        <Greeting state={state} />

        <div className="hero">
          <span className="dim">RUTINA ACTIVA</span>
          <h1>{routine.name}</h1>
          <div className="row wrap">
            <span className="dim small">Semana</span>
            {Array.from({ length: routine.weeks }, (_, i) => i + 1).map((wk) => (
              <S
                key={wk}
                on={week === wk}
                onClick={() => {
                  Me(wk);
                  bump();
                }}
              >
                {wk}
              </S>
            ))}
          </div>
          {easy && (
            <div className="tag">Semana de adaptación · deja más reps en reserva</div>
          )}
        </div>

        {(() => {
          const resume = resumable(routine.id, week);
          if (resume) {
            return (
              <div className="card todaycta pop">
                <div className="grow">
                  <span className="ctalabel">Continuar</span>
                  <b className="ctaname">{resume.dayName}</b>
                  <span className="dim small">tienes una sesión en curso</span>
                </div>
                <button className="btn" onClick={() => openDay(resume.dayIdx)}>
                  Reanudar
                </button>
              </div>
            );
          }
          const doneIdx = new Set(
            state.workouts
              .filter(
                (wo) =>
                  wo.routineId === routine.id &&
                  wo.week === week &&
                  Object.values(wo.sets).flat().some((s) => s?.done),
              )
              .map((wo) => wo.dayIdx),
          );
          const next = routine.days.findIndex((_, N) => !doneIdx.has(N));
          if (next < 0) return null;
          return (
            <div className="card todaycta pop">
              <div className="grow">
                <span className="ctalabel">Hoy toca</span>
                <b className="ctaname">{routine.days[next].name}</b>
                <span className="dim small">
                  {routine.days[next].exercises.length} ejercicios
                </span>
              </div>
              <button className="btn" onClick={() => openDay(next)}>
                Empezar
              </button>
            </div>
          );
        })()}

        <h3>
          O elige otra sesión{" "}
          <span className="dim small">· el orden es tuyo, cámbialo libre</span>
        </h3>

        {routine.days.map((day, N) => {
          const done = state.workouts.some(
            (wo) =>
              wo.routineId === routine.id &&
              wo.week === week &&
              wo.dayIdx === N &&
              Object.values(wo.sets).flat().some((s) => s?.done),
          );
          return (
            <div
              key={N}
              className={"card day pop" + (done ? " done" : "")}
              style={{ animationDelay: `${Math.min(N, 8) * 30}ms` }}
              onClick={() => openDay(N)}
            >
              <div className="row spread">
                <b>{day.name}</b>
                <span>
                  {done ? "✓ hecha" : `${day.exercises.length} ejercicios ›`}
                </span>
              </div>
            </div>
          );
        })}

        <History />
      </div>
    );

  // ----- Sesión activa -----
  const day = routine.days[dayIdx];
  return (
    <div className="pad">
      <button className="back" onClick={finishSession}>
        ‹ Terminar sesión
      </button>
      <div className="row spread">
        <h2>
          {day.name} <span className="dim small">· semana {week}</span>
        </h2>
        <button
          className={"helpbtn" + (showHelp ? " on" : "")}
          aria-label="Ayuda"
          onClick={() => setShowHelp((s) => !s)}
        >
          ?
        </button>
      </div>

      {showHelp && (
        <div className="card glossary">
          <p>
            <b>RIR</b> — repeticiones en reserva: cuántas te sobran antes del
            fallo. RIR 2 = deja 2 en el tanque.
          </p>
          <p>
            <b>Tempo</b> — ritmo de cada repetición en segundos: bajada · pausa ·
            subida (ej. 3-1-1).
          </p>
          <p>
            <b>e1RM</b> — tu 1RM estimado: el máximo teórico a 1 repetición,
            calculado con tus series.
          </p>
        </div>
      )}

      <WarmupCard day={day} workout={workout} unit={state.unit} />

      {day.exercises.map((ex0, N) => {
        // Ejercicio efectivo: el sustituto de esta sesión si lo hay
        const exId = subs[N] || ex0.exId;
        const ex = { ...ex0, exId };
        const def = C(exId);
        const last = Q(exId, workout.id);
        const pr = Be(exId);
        const prog = Ue(ex, exId, workout.id);
        const isTech = (routine.techWeeks || []).includes(week) && ex.technique;
        const tips = pinnedTips(exId);
        const setCount = Math.max(
          ex.workingSets,
          workout.sets[exId]?.length || 0,
        );
        const hasLast = last && last.some((s) => s?.w && s?.r);
        const weightStep = state.unit === "lb" ? 5 : 2.5;
        return (
          <div key={N} className="card">
            <div className="row spread">
              <b>{def?.name}</b>
              <div className="row gap">
                {def?.videoUrl && (
                  <a
                    className="exvid"
                    href={def.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ▶ Técnica
                  </a>
                )}
                <span className="dim small">▲{j(exId)}</span>
              </div>
            </div>
            <div className="dim small">
              {ex.workingSets}×{ex.repRange} · tempo{" "}
              {ex.tempo || def?.tempo || "2-0-1"} · descanso{" "}
              {Math.round(ex.restSeconds / 60)}min{" "}
              {pr ? `· PR ${pr}${state.unit} e1RM` : ""}
            </div>

            <button
              className="mini swapbtn"
              onClick={() => setPicking(picking === N ? null : N)}
            >
              ⇄ Cambiar ejercicio
            </button>
            {picking === N && (
              <div className="swaplist">
                {ye(def?.primaryMuscle)
                  .filter((alt) => alt.id !== exId)
                  .slice(0, 6)
                  .map((alt) => (
                    <button
                      key={alt.id}
                      className="swapopt"
                      onClick={() => {
                        setSubs((s) => ({ ...s, [N]: alt.id }));
                        setPicking(null);
                        bump();
                      }}
                    >
                      <span className="grow">{alt.name}</span>
                      <span className="dim small">▲{j(alt.id)}</span>
                    </button>
                  ))}
                {subs[N] && (
                  <button
                    className="swapopt"
                    onClick={() => {
                      setSubs((s) => {
                        const c = { ...s };
                        delete c[N];
                        return c;
                      });
                      setPicking(null);
                      bump();
                    }}
                  >
                    <span className="grow dim">Volver al original</span>
                  </button>
                )}
              </div>
            )}

            {isTech && (
              <div className="techband">
                {ex.technique}: {TECH[ex.technique] || "aplícala en la última serie"}
              </div>
            )}
            {prog && (
              <div className="hintline small">
                {prog.up
                  ? `Sube a ${prog.w} ${state.unit} — llegaste al tope de reps`
                  : `Supera ${prog.w} ${state.unit} × ${prog.r}`}
              </div>
            )}
            {ex.note && <div className="note small">{ex.note}</div>}
            {tips.length > 0 && (
              <div className="mytips">
                {tips.map((tp) => (
                  <div key={tp.id} className="mytip">
                    {tp.body}
                  </div>
                ))}
              </div>
            )}

            <WarmupCalc ex={ex} unit={state.unit} />

            {hasLast && (
              <button
                className="mini repeatlast"
                onClick={() => {
                  for (let R = 0; R < setCount; R++) {
                    const p = last[R];
                    if (p?.w && p?.r) O(workout.id, ex.exId, R, { w: p.w, r: p.r });
                  }
                  bump();
                }}
              >
                ↺ Repetir última ({last.filter((s) => s?.w).length} series)
              </button>
            )}

            {Array.from({ length: setCount }, (_, R) => {
              const cur = workout.sets[ex.exId]?.[R] || {};
              const prev = last?.[R];
              return (
                <div key={R} className="setrow">
                  <span className="setn">
                    {R + 1}
                    <em className="rirn">R{We(ex, easy, R)}</em>
                  </span>
                  <Stepper
                    field="w"
                    value={cur.w}
                    base={prev?.w}
                    step={weightStep}
                    placeholder={prev?.w ?? "kg"}
                    onSet={(v) => {
                      O(workout.id, exId, R, { w: v });
                      bump();
                    }}
                  />
                  <Stepper
                    field="r"
                    value={cur.r}
                    base={prev?.r}
                    step={1}
                    placeholder={prev?.r ?? "reps"}
                    onSet={(v) => {
                      O(workout.id, exId, R, { r: v });
                      bump();
                    }}
                  />
                  <button
                    className={"ok" + (cur.done ? " on" : "")}
                    onClick={() => {
                      O(workout.id, exId, R, { done: !cur.done });
                      if (!cur.done && pref("autoRest", true)) {
                        resumeAudio(audioRef);
                        setRest(ex.restSeconds);
                        setRestTotal(ex.restSeconds);
                      }
                      bump();
                    }}
                  >
                    ✓
                  </button>
                </div>
              );
            })}

            <button
              className="mini addset"
              onClick={() => {
                O(workout.id, ex.exId, setCount, {});
                bump();
              }}
            >
              + Serie
            </button>
          </div>
        );
      })}

      {rest > 0 && (
        <div className="timerbar2">
          <div className="tbar">
            <div className="tfill" style={{ width: `${(100 * rest) / restTotal}%` }} />
          </div>
          <div className="row spread">
            <button
              className="mini"
              onClick={() => {
                setRest((s) => s + 30);
                setRestTotal((s) => s + 30);
              }}
            >
              +30s
            </button>
            <b className="tcount">{oa(rest)}</b>
            <button className="mini" onClick={() => setRest(0)}>
              Saltar
            </button>
          </div>
          <div className="dim small center">DESCANSO</div>
        </div>
      )}
    </div>
  );
}

// Saludo + racha: sesiones de esta semana (calendario) y semanas seguidas
// entrenando al menos una vez
function Greeting({ state }) {
  const name = usr(meId()).username || "";
  const { thisWeek, streak } = weeklyStats(state.workouts);
  return (
    <div className="greeting">
      <span className="hello">Hola, {name}</span>
      {(thisWeek > 0 || streak > 1) && (
        <span className="dim small">
          {thisWeek} {thisWeek === 1 ? "sesión" : "sesiones"} esta semana
          {streak > 1 ? ` · racha de ${streak} semanas` : ""}
        </span>
      )}
    </div>
  );
}

// Clave de semana calendario (lunes como inicio) para calcular la racha
function weekKey(d) {
  const dt = new Date(d + "T12:00:00");
  const day = (dt.getDay() + 6) % 7; // lunes=0
  dt.setDate(dt.getDate() - day);
  return dt.toISOString().slice(0, 10);
}
function weeklyStats(workouts) {
  const weeks = new Set();
  let thisWeek = 0;
  const nowKey = weekKey(new Date().toISOString().slice(0, 10));
  for (const wo of workouts) {
    if (!Object.values(wo.sets).flat().some((s) => s?.done)) continue;
    const k = weekKey(wo.date);
    weeks.add(k);
    if (k === nowKey) thisWeek++;
  }
  // racha: semanas consecutivas hacia atrás desde esta (o la pasada si esta
  // aún no tiene sesión)
  let streak = 0;
  const cursor = new Date();
  if (!weeks.has(nowKey)) cursor.setDate(cursor.getDate() - 7);
  for (;;) {
    const k = weekKey(cursor.toISOString().slice(0, 10));
    if (!weeks.has(k)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return { thisWeek, streak };
}

// Stepper: input numérico con botones − / + para ajustar sin teclado
function Stepper({ field, value, base, step, placeholder, onSet }) {
  const adjust = (dir) => {
    const cur =
      value !== "" && value != null
        ? parseFloat(value)
        : base != null && base !== ""
          ? parseFloat(base)
          : 0;
    let nv = Math.max(0, Math.round((cur + dir * step) * 100) / 100);
    if (field === "r") nv = Math.max(0, Math.round(nv));
    onSet(String(nv));
  };
  return (
    <div className="stepper">
      <button className="stepbtn" onClick={() => adjust(-1)} aria-label="menos">
        −
      </button>
      <input
        type="number"
        inputMode={field === "r" ? "numeric" : "decimal"}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onSet(e.target.value)}
      />
      <button className="stepbtn" onClick={() => adjust(1)} aria-label="más">
        +
      </button>
    </div>
  );
}

function Stat({ n, label, accent }) {
  return (
    <div className="sumstat">
      <b className={accent ? "accent" : ""}>{n}</b>
      <span>{label}</span>
    </div>
  );
}

// Tonelaje formateado: >1000 -> toneladas
function fmtTon(kg, unit) {
  if (unit === "lb") return kg >= 2000 ? (kg / 2000).toFixed(1) + " t" : kg + " lb";
  return kg >= 1000 ? (kg / 1000).toFixed(1) + " t" : kg + " kg";
}

function buildSummary(state, workout, day, startMs) {
  let doneSets = 0,
    tonnage = 0;
  const exIds = Object.keys(workout.sets);
  for (const ex of exIds)
    for (const s of workout.sets[ex] || [])
      if (s?.done && s.w && s.r) {
        doneSets++;
        tonnage += +s.w * +s.r;
      }
  let prs = 0;
  for (const ex of exIds) {
    let cur = 0;
    for (const s of workout.sets[ex] || [])
      if (s?.done && s.w && s.r) cur = Math.max(cur, K(+s.w, +s.r));
    if (!cur) continue;
    let prev = 0;
    for (const wo of state.workouts) {
      if (wo.id === workout.id) continue;
      for (const s of wo.sets[ex] || [])
        if (s?.done && s.w && s.r) prev = Math.max(prev, K(+s.w, +s.r));
    }
    if (cur > prev) prs++;
  }
  const mins = startMs ? Math.round((Date.now() - startMs) / 60000) : 0;
  return { doneSets, tonnage: Math.round(tonnage), prs, mins, dayName: day.name };
}

function History() {
  const workouts = ze().slice(0, 10);
  if (!workouts.length) return null;
  return (
    <>
      <h3>Historial</h3>
      {workouts.map((w) => (
        <div key={w.id} className="card small">
          <b>{w.dayName}</b>{" "}
          <span className="dim">
            · sem {w.week} · {w.date} ·{" "}
            {Object.values(w.sets).flat().filter((s) => s?.done).length} sets
          </span>
        </div>
      ))}
    </>
  );
}

// restDone = fin del descanso: pitido + vibración + notificación (si hay
// permiso y la app está en segundo plano), respetando la preferencia de aviso
function restDone(ref) {
  beep(ref);
  if (pref("restNotify", true)) {
    try {
      navigator.vibrate?.([200, 80, 200]);
    } catch {}
    try {
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted" &&
        document.hidden
      ) {
        new Notification("Kilo", { body: "Descanso terminado — a por la siguiente serie", silent: false });
      }
    } catch {}
  }
}

function resumeAudio(ref) {
  try {
    if (!ref.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ref.current = new AC();
    }
    ref.current.resume();
  } catch {}
}
function beep(ref) {
  try {
    const ac = ref.current;
    if (!ac) return;
    [0, 0.25].forEach((t) => {
      const osc = ac.createOscillator(),
        gain = ac.createGain();
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ac.destination);
      gain.gain.setValueAtTime(0.25, ac.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.18);
      osc.start(ac.currentTime + t);
      osc.stop(ac.currentTime + t + 0.2);
    });
  } catch {}
}

// Calentamiento general al entrar (ramp-up desde el último peso conocido)
function WarmupCard({ day, workout, unit }) {
  const [open, setOpen] = useState(true);
  const rows = day.exercises
    .map((ex) => {
      const def = C(ex.exId);
      const warm = ex.warmupSets || 0;
      if (!warm) return null;
      const last = Q(ex.exId, workout.id);
      let maxW = 0;
      if (last) for (const s of last) if (s?.done && s.w) maxW = Math.max(maxW, +s.w);
      return { name: def?.name || "?", warm, ramp: maxW ? Ge(warm, maxW) : null };
    })
    .filter(Boolean);
  if (!rows.length) return null;
  return (
    <div className="card warmup">
      <button className="warmhead" onClick={() => setOpen((o) => !o)}>
        <b>Calentamiento</b>
        <span className="dim small">{open ? "ocultar" : "ver"}</span>
      </button>
      {open && (
        <div className="warmbody">
          {rows.map((r, i) => (
            <div key={i} className="warmrow">
              <span className="grow">{r.name}</span>
              <span className="dim small warmramp">
                {r.ramp
                  ? r.ramp.map((s) => `${s.w}×${s.r}`).join(" → ")
                  : `${r.warm} series · registra peso`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Calculadora de calentamiento por ejercicio (peso de trabajo -> ramp)
function WarmupCalc({ ex, unit }) {
  const [open, setOpen] = useState(false);
  const [w, setW] = useState("");
  if (!ex.warmupSets) return null;
  const ramp = w > 0 ? Ge(ex.warmupSets, +w) : null;
  return (
    <div className="wu">
      <button className="mini" onClick={() => setOpen((s) => !s)}>
        Calentamiento ({ex.warmupSets})
      </button>
      {open && (
        <div className="row gap">
          <input
            type="number"
            inputMode="decimal"
            placeholder={"peso de trabajo " + unit}
            value={w}
            onChange={(e) => setW(e.target.value)}
            style={{ maxWidth: 150 }}
          />
          {ramp && (
            <span className="dim small">
              {ramp.map((s) => `${s.w}×${s.r}`).join(" → ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { da };
