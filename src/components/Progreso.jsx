import { useState, useRef, useEffect } from "react";
import { S } from "./ui.jsx";
import {
  q,
  ee,
  ae,
  C,
  Fe,
  $e,
  Ve,
  Oe,
  He,
  ve,
  meId,
  usr,
  setPref,
  pref,
  addBodyLog,
  bodyLog,
} from "../data/store.js";
import { subscribeSyncStatus, pushSubscribe, pushUnsubscribe } from "../data/sync.js";

const TABS = [
  ["musculos", "Músculos"],
  ["prs", "PRs"],
  ["graficas", "Fuerza"],
  ["cuerpo", "Cuerpo"],
  ["datos", "Datos"],
];

function ga({ openProfile }) {
  const [tab, setTab] = useState("musculos");
  const [, force] = useState(0);
  const bump = () => force((s) => s + 1);
  const state = q();

  return (
    <div className="pad">
      <h2>Progreso</h2>
      <div className="row wrap seg">
        {TABS.map(([id, label]) => (
          <S key={id} on={tab === id} onClick={() => setTab(id)}>
            {label}
          </S>
        ))}
      </div>

      {tab === "musculos" && <MusclesTab week={state.activeWeek} />}
      {tab === "prs" && <PrsTab unit={state.unit} />}
      {tab === "graficas" && <StrengthTab />}
      {tab === "cuerpo" && <BodyTab unit={state.unit} bump={bump} />}
      {tab === "datos" && (
        <DataTab state={state} openProfile={openProfile} bump={bump} />
      )}
    </div>
  );
}

function MusclesTab({ week }) {
  const rows = ee();
  if (!rows.length)
    return (
      <div className="card dim">
        Activa una rutina para ver tus objetivos por músculo.
      </div>
    );
  return (
    <>
      <p className="dim small">
        Series completadas esta semana vs las que prescribe tu rutina activa
        (semana {week}).
      </p>
      {rows.map(({ m, t, d }) => (
        <div key={m} className="hmrow">
          <span className="hmname">{m}</span>
          <div className="hmbar2">
            <div
              className={"hmfill" + (d >= t ? " full" : "")}
              style={{ width: Math.min(100, (100 * d) / (t || 1)) + "%" }}
            />
          </div>
          <span className="hmnum">
            {d}/{t}
          </span>
        </div>
      ))}
    </>
  );
}

function PrsTab({ unit }) {
  const prs = ae();
  if (!prs.length)
    return (
      <div className="card dim">
        Registra sets y aquí aparecen tus récords (e1RM estimado).
      </div>
    );
  return (
    <>
      {prs.map((r) => (
        <div key={r.exId} className="card small">
          <div className="row spread">
            <b>{C(r.exId)?.name}</b>
            <b className="rank">
              {r.e1} {unit}
            </b>
          </div>
          <span className="dim small">
            e1RM · mejor set {r.w}
            {unit} × {r.r} · {r.date}
          </span>
        </div>
      ))}
    </>
  );
}

function StrengthTab() {
  const ids = Fe();
  const [sel, setSel] = useState(ids[0] || null);
  if (!ids.length)
    return (
      <div className="card dim">
        Entrena y registra sets para ver tu progreso de fuerza graficado.
      </div>
    );
  const series = sel ? $e(sel) : [];
  return (
    <>
      <div className="row wrap">
        {ids.map((id) => (
          <S key={id} on={sel === id} onClick={() => setSel(id)}>
            {C(id)?.name?.split(" ").slice(0, 2).join(" ")}
          </S>
        ))}
      </div>
      {series.length > 0 && (
        <div className="card">
          <b>{C(sel)?.name}</b>{" "}
          <span className="dim small">· e1RM por sesión</span>
          <LineChart data={series} />
        </div>
      )}
    </>
  );
}

// Gráfica de línea genérica: data = [{ date, v }]
function LineChart({ data, color = "var(--rojo)" }) {
  const W = 320,
    H = 120,
    pad = 10;
  const vals = data.map((d) => d.v);
  const lo = Math.min(...vals),
    hi = Math.max(...vals);
  const x = (i) =>
    pad + (W - 2 * pad) * (data.length > 1 ? i / (data.length - 1) : 0.5);
  const y = (v) => H - pad - (H - 2 * pad) * (hi > lo ? (v - lo) / (hi - lo) : 0.5);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          points={data.map((d, i) => `${x(i)},${y(d.v)}`).join(" ")}
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(d.v)}
            r={i === data.length - 1 ? "4.5" : "3"}
            fill={i === data.length - 1 ? color : "var(--ambar)"}
          />
        ))}
      </svg>
      <div className="row spread dim small">
        <span>{data[0].date}</span>
        <b>{hi} máx</b>
        <span>{data[data.length - 1].date}</span>
      </div>
    </>
  );
}

// ----- Pestaña Cuerpo: peso corporal, medidas y fotos -----
function BodyTab({ unit, bump }) {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [arm, setArm] = useState("");
  const log = bodyLog();
  const weights = log.filter((e) => e.weight).map((e) => ({ date: e.date, v: +e.weight }));
  const first = weights[0]?.v;
  const last = weights[weights.length - 1]?.v;

  return (
    <>
      <div className="card">
        <b>Registrar peso corporal</b>
        <div className="row gap" style={{ marginTop: 6 }}>
          <input
            type="number"
            inputMode="decimal"
            placeholder={`peso (${unit})`}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <button
            className="btn"
            disabled={!weight}
            onClick={() => {
              addBodyLog({
                weight: +weight,
                waist: waist ? +waist : undefined,
                arm: arm ? +arm : undefined,
              });
              setWeight("");
              setWaist("");
              setArm("");
              bump();
            }}
          >
            Guardar
          </button>
        </div>
        <div className="row gap">
          <label className="field grow">
            <span>Cintura (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
          </label>
          <label className="field grow">
            <span>Brazo (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              value={arm}
              onChange={(e) => setArm(e.target.value)}
            />
          </label>
        </div>
      </div>

      {weights.length > 0 && (
        <div className="card">
          <div className="row spread">
            <b>
              Peso corporal <span className="dim small">· {last} {unit}</span>
            </b>
            {weights.length > 1 && (
              <b
                className={
                  "rank " + (last - first <= 0 ? "" : "")
                }
                style={{ color: "var(--ceniza)" }}
              >
                {last - first > 0 ? "+" : ""}
                {Math.round((last - first) * 10) / 10} {unit}
              </b>
            )}
          </div>
          {weights.length > 1 ? (
            <LineChart data={weights} color="var(--blue)" />
          ) : (
            <p className="dim small">Registra otra medición para ver la tendencia.</p>
          )}
        </div>
      )}

      <PhotoGallery />
    </>
  );
}

// ----- Fotos de progreso (IndexedDB, no en el snapshot de la nube) -----
import { listPhotos, addPhoto, deletePhoto } from "../data/photodb.js";

function compress(file) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 520 / img.width);
      const cw = Math.round(img.width * scale),
        ch = Math.round(img.height * scale);
      const cv = document.createElement("canvas");
      cv.width = cw;
      cv.height = ch;
      cv.getContext("2d").drawImage(img, 0, 0, cw, ch);
      res(cv.toDataURL("image/jpeg", 0.7));
    };
    img.src = URL.createObjectURL(file);
  });
}

function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [zoom, setZoom] = useState(null);
  const fileRef = useRef(null);
  useEffect(() => {
    listPhotos().then(setPhotos);
  }, []);

  const add = async (file) => {
    if (!file) return;
    const dataUrl = await compress(file);
    const photo = {
      at: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      dataUrl,
    };
    await addPhoto(photo);
    setPhotos([photo, ...photos]);
  };
  const remove = async (at) => {
    await deletePhoto(at);
    setPhotos(photos.filter((p) => p.at !== at));
  };

  return (
    <div className="card">
      <div className="row spread">
        <b>Fotos de progreso</b>
        <button className="btn ghost" onClick={() => fileRef.current.click()}>
          + Añadir
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => add(e.target.files[0])}
      />
      {!photos.length ? (
        <p className="dim small">
          Súbete una foto cada semana y mira el cambio real, no solo los kilos.
          Se guardan solo en este teléfono.
        </p>
      ) : (
        <>
          {photos.length > 1 && (
            <div className="comparegrid">
              <figure>
                <img src={photos[photos.length - 1].dataUrl} alt="antes" />
                <figcaption className="dim small">
                  {photos[photos.length - 1].date} · antes
                </figcaption>
              </figure>
              <figure>
                <img src={photos[0].dataUrl} alt="ahora" />
                <figcaption className="dim small">
                  {photos[0].date} · ahora
                </figcaption>
              </figure>
            </div>
          )}
          <div className="photogrid">
            {photos.map((p) => (
              <div key={p.at} className="photothumb">
                <img
                  src={p.dataUrl}
                  alt={p.date}
                  onClick={() => setZoom(p)}
                />
                <button className="photodel" onClick={() => remove(p.at)}>
                  ✕
                </button>
                <span className="photodate">{p.date}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {zoom && (
        <div className="photozoom" onClick={() => setZoom(null)}>
          <img src={zoom.dataUrl} alt={zoom.date} />
        </div>
      )}
    </div>
  );
}

// Interruptor tipo switch
function Toggle({ on, onChange, label, hint }) {
  return (
    <button className="togglerow" onClick={() => onChange(!on)}>
      <span className="grow">
        <b>{label}</b>
        {hint && <span className="dim small tplmeta">{hint}</span>}
      </span>
      <span className={"switch" + (on ? " on" : "")}>
        <span className="knob" />
      </span>
    </button>
  );
}

async function ensureNotifyPermission() {
  try {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") return true;
    const r = await Notification.requestPermission();
    return r === "granted";
  } catch {
    return false;
  }
}

// ----- Pestaña Datos: perfil, preferencias, recordatorio, respaldo -----
function DataTab({ state, openProfile, bump }) {
  const [sy, setSy] = useState(null);
  const fileRef = useRef(null);
  useEffect(() => subscribeSyncStatus(setSy), []);
  const me = usr(meId());

  return (
    <>
      <button
        className="card profilecard"
        onClick={() => openProfile && openProfile(meId())}
      >
        <div className="grow">
          <b>@{me.username}</b>
          <div className="dim small">
            {(me.role || "Atleta") + " · toca para ver y editar tu perfil"}
          </div>
        </div>
        <span className="dim">›</span>
      </button>

      <div className="card syncstatus">
        <b>
          {!sy
            ? "Comprobando conexión con la nube…"
            : sy.anonDisabled
              ? "Sincronización con la nube desactivada"
              : sy.authed && sy.online && sy.lastSyncOk !== false
                ? "Sincronizado con la nube ✓"
                : "Sin conexión, guardado local"}
        </b>
      </div>

      <div className="card">
        <b>Entrenamiento</b>
        <Toggle
          on={pref("autoRest", true)}
          onChange={(v) => {
            setPref("autoRest", v);
            bump();
          }}
          label="Iniciar descanso automático"
          hint="al palomear una serie arranca el cronómetro"
        />
        <Toggle
          on={pref("restNotify", true)}
          onChange={(v) => {
            setPref("restNotify", v);
            bump();
            if (v) ensureNotifyPermission();
          }}
          label="Avisarme al terminar el descanso"
          hint="vibración y notificación aunque bloquees la pantalla"
        />
      </div>

      <div className="card">
        <b>Recordatorio de entrenar</b>
        <Toggle
          on={pref("reminderOn", false)}
          onChange={async (v) => {
            setPref("reminderOn", v);
            bump();
            if (v) {
              await ensureNotifyPermission();
              pushSubscribe(pref("reminderTime", "18:00"));
            } else pushUnsubscribe();
          }}
          label="Recordarme entrenar"
          hint="una notificación a la hora que elijas"
        />
        {pref("reminderOn", false) && (
          <label className="field" style={{ marginTop: 6 }}>
            <span>Hora</span>
            <input
              type="time"
              value={pref("reminderTime", "18:00")}
              onChange={(e) => {
                setPref("reminderTime", e.target.value);
                bump();
                pushSubscribe(e.target.value);
              }}
            />
          </label>
        )}
        <p className="dim small" style={{ marginTop: 6 }}>
          En iPhone el recordatorio requiere instalar Kilo en la pantalla de
          inicio (Safari → Compartir → Añadir a inicio).
        </p>
      </div>

      <div className="card">
        <b>Unidad</b>
        <div className="row gap">
          {["kg", "lb"].map((u) => (
            <S
              key={u}
              on={state.unit === u}
              onClick={() => {
                Ve(u);
                bump();
              }}
            >
              {u}
            </S>
          ))}
        </div>
      </div>

      <div className="card">
        <b>Respaldo</b>
        <p className="dim small">
          Además del respaldo automático en la nube, puedes exportar una copia
          manual.
        </p>
        <div className="row gap">
          <button
            className="btn ghost"
            onClick={() => {
              const blob = new Blob([Oe()], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "kilo-respaldo.json";
              a.click();
            }}
          >
            Exportar
          </button>
          <button className="btn ghost" onClick={() => fileRef.current.click()}>
            Importar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files[0];
              if (f)
                try {
                  He(await f.text());
                  alert("Respaldo importado ✓");
                  location.reload();
                } catch {
                  alert("Archivo inválido");
                }
            }}
          />
        </div>
      </div>

      <div className="card">
        <b className="danger">Zona de peligro</b>
        <div className="row gap">
          <button
            className="btn ghost danger"
            onClick={() =>
              confirm("¿Borrar TODOS tus datos y volver al inicio?") &&
              (ve(), location.reload())
            }
          >
            Reiniciar app
          </button>
        </div>
      </div>
    </>
  );
}

export { ga };
