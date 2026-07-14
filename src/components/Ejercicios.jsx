import { useState } from "react";
import { oe as BodyMap } from "./BodyMap.jsx";
import { S, W } from "./ui.jsx";
import { F, ye, j, J, _, we, Y } from "../data/store.js";

const MUSCLES = [
  "Pecho",
  "Hombros",
  "Espalda",
  "Bíceps",
  "Tríceps",
  "Cuádriceps",
  "Isquios",
  "Glúteos",
  "Gemelos",
  "Abdomen",
  "Trapecio",
  "Antebrazo",
];

// Normaliza para buscar sin acentos ni mayúsculas ("dominadas" ≈ "Dominádas")
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function _e({ goForum, pickMode, onPick }) {
  const [side, setSide] = useState("front");
  const [muscle, setMuscle] = useState(null);
  const [query, setQuery] = useState("");
  const [, force] = useState(0);
  const bump = () => force((s) => s + 1);

  const searching = query.trim().length > 0;
  const results = searching
    ? F()
        .filter(
          (ex) =>
            norm(ex.name).includes(norm(query)) ||
            norm(ex.primaryMuscle).includes(norm(query)),
        )
        .sort((a, b) => j(b.id) - j(a.id))
        .slice(0, 30)
    : muscle
      ? ye(muscle)
      : [];

  // ----- Vista de exploración (mapa + búsqueda) -----
  if (!muscle && !searching)
    return (
      <div className="pad">
        <h2>¿Qué músculo entrenas hoy?</h2>
        <input
          className="searchbox"
          placeholder="Buscar ejercicio por nombre…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="dim">O toca una zona del cuerpo</p>
        <div className="row center">
          <S on={side === "front"} onClick={() => setSide("front")}>
            Frente
          </S>
          <S on={side === "back"} onClick={() => setSide("back")}>
            Espalda
          </S>
        </div>
        <BodyMap side={side} selected={muscle} onSelect={setMuscle} />
        <div className="row wrap center">
          {F().length
            ? MUSCLES.map((m) => (
                <S key={m} onClick={() => setMuscle(m)}>
                  {m}
                </S>
              ))
            : null}
        </div>
      </div>
    );

  // ----- Resultados (búsqueda o músculo) -----
  return (
    <div className="pad">
      {searching ? (
        <>
          <input
            className="searchbox"
            autoFocus
            placeholder="Buscar ejercicio por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <h2>
            Resultados{" "}
            <span className="dim small">· {results.length} ejercicios</span>
          </h2>
        </>
      ) : (
        <>
          <button className="back" onClick={() => setMuscle(null)}>
            ‹ Cuerpo
          </button>
          <h2>
            {muscle}{" "}
            <span className="dim small">
              · {results.length} ejercicios, mejor rateados primero
            </span>
          </h2>
        </>
      )}

      {results.map((ex, i) => (
        <div key={ex.id} className="card pop" style={{ animationDelay: `${Math.min(i, 8) * 24}ms` }}>
          <div className="row spread">
            <div>
              <b className="rank">#{i + 1}</b> <b>{ex.name}</b>
              <div className="dim small">
                {ex.equipment} · {ex.muscles.join(", ")}
              </div>
            </div>
            <W
              score={j(ex.id)}
              mine={J(ex.id)}
              onVote={(v) => {
                _(ex.id, v);
                bump();
              }}
            />
          </div>
          <div className="row gap">
            <a
              className="btn ghost"
              href={ex.videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              Técnica ›
            </a>
            <button className="btn ghost" onClick={() => goForum(ex.id)}>
              Tips ({Y(ex.id).length})
            </button>
            {pickMode && (
              <button className="btn" onClick={() => onPick(ex.id)}>
                Elegir
              </button>
            )}
          </div>
        </div>
      ))}

      {searching && !results.length && (
        <div className="card dim">
          Sin resultados para "{query}". Prueba con otro nombre o explora por
          músculo.
        </div>
      )}

      {!searching && muscle && (
        <AddExercise muscle={muscle} onAdded={bump} />
      )}
    </div>
  );
}

function AddExercise({ muscle, onAdded }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [equipment, setEquipment] = useState("Barra");
  const [video, setVideo] = useState("");
  if (!open)
    return (
      <button className="btn ghost full" onClick={() => setOpen(true)}>
        + Dar de alta un ejercicio de {muscle}
      </button>
    );
  return (
    <div className="card">
      <input
        placeholder="Nombre del ejercicio"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="row wrap">
        {["Barra", "Mancuernas", "Máquina", "Polea", "Peso corporal"].map(
          (eq) => (
            <S key={eq} on={equipment === eq} onClick={() => setEquipment(eq)}>
              {eq}
            </S>
          ),
        )}
      </div>
      <input
        placeholder="Link de video (YouTube) — opcional"
        value={video}
        onChange={(e) => setVideo(e.target.value)}
      />
      <div className="row gap">
        <button
          className="btn"
          disabled={!name.trim()}
          onClick={() => {
            we({
              name: name.trim(),
              primaryMuscle: muscle,
              muscles: [],
              equipment,
              videoUrl:
                video ||
                "https://www.youtube.com/results?search_query=" +
                  encodeURIComponent(name + " técnica"),
            });
            setOpen(false);
            setName("");
            onAdded();
          }}
        >
          Publicar
        </button>
        <button className="btn ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export { _e };
