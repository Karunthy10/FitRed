import { useState } from "react";
import { Z, C, j, k } from "../data/store.js";

// Mueve el elemento en la posición `from` una cantidad `delta` (in-place)
const move = (arr, from, delta) => {
  const to = from + delta;
  if (to < 0 || to >= arr.length) return;
  [arr[from], arr[to]] = [arr[to], arr[from]];
};

function ca({ id, readOnly, goBack, goPickExercise }) {
  const [, force] = useState(0);
  const [editing, setEditing] = useState(null); // "dayIdx:exIdx"
  const routine = Z(id);
  if (!routine) return null;
  const bump = () => force((s) => s + 1);
  const edit = (fn) => {
    k(id, fn);
    bump();
  };

  return (
    <div className="pad">
      <button className="back" onClick={goBack}>
        ‹ Rutinas
      </button>

      {readOnly ? (
        <h2>{routine.name}</h2>
      ) : (
        <input
          className="titleinput"
          value={routine.name}
          onChange={(e) => edit((r) => (r.name = e.target.value))}
        />
      )}
      {routine.description && (
        <p className="dim small">{routine.description}</p>
      )}

      {routine.days.map((day, di) => (
        <div key={di} className="card pop">
          <div className="row spread">
            {readOnly ? (
              <b>{day.name}</b>
            ) : (
              <input
                className="dayinput"
                value={day.name}
                onChange={(e) =>
                  edit((r) => (r.days[di].name = e.target.value))
                }
              />
            )}
            {!readOnly && (
              <div className="row">
                <button
                  className="mini"
                  aria-label="Subir día"
                  onClick={() => edit((r) => move(r.days, di, -1))}
                >
                  ↑
                </button>
                <button
                  className="mini"
                  aria-label="Bajar día"
                  onClick={() => edit((r) => move(r.days, di, 1))}
                >
                  ↓
                </button>
                <button
                  className="mini danger"
                  aria-label="Borrar día"
                  onClick={() =>
                    confirm("¿Borrar día?") &&
                    edit((r) => r.days.splice(di, 1))
                  }
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {day.exercises.map((ex, xi) => {
            const def = C(ex.exId);
            const key = di + ":" + xi;
            const isOpen = editing === key;
            const tempo = ex.tempo || def?.tempo || "2-0-1";
            return (
              <div key={xi} className="exrow col">
                <div className="row spread">
                  <div className="grow">
                    <b>{def?.name || "?"}</b>{" "}
                    <span className="dim small">▲{j(ex.exId)}</span>
                    <div className="dim small">
                      {ex.workingSets}×{ex.repRange} · tempo {tempo} · RIR{" "}
                      {ex.rir?.easy}→{ex.rir?.hard} ·{" "}
                      {Math.round(ex.restSeconds / 60)}min · cal.{" "}
                      {ex.warmupSets}
                    </div>
                    {ex.note && <div className="note small">{ex.note}</div>}
                  </div>
                  {!readOnly && (
                    <div className="row">
                      <button
                        className="mini"
                        aria-label="Subir ejercicio"
                        onClick={() =>
                          edit((r) => move(r.days[di].exercises, xi, -1))
                        }
                      >
                        ↑
                      </button>
                      <button
                        className="mini"
                        aria-label="Bajar ejercicio"
                        onClick={() =>
                          edit((r) => move(r.days[di].exercises, xi, 1))
                        }
                      >
                        ↓
                      </button>
                      <button
                        className={"mini" + (isOpen ? " on" : "")}
                        aria-label="Editar ejercicio"
                        onClick={() => setEditing(isOpen ? null : key)}
                      >
                        ✎
                      </button>
                      <button
                        className="mini danger"
                        aria-label="Borrar ejercicio"
                        onClick={() =>
                          edit((r) => r.days[di].exercises.splice(xi, 1))
                        }
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {isOpen && !readOnly && (
                  <div className="editgrid">
                    <NumField
                      label="Series"
                      value={ex.workingSets}
                      onChange={(v) =>
                        edit((r) => (r.days[di].exercises[xi].workingSets = v))
                      }
                    />
                    <NumField
                      label="Calentam."
                      value={ex.warmupSets}
                      min={0}
                      onChange={(v) =>
                        edit((r) => (r.days[di].exercises[xi].warmupSets = v))
                      }
                    />
                    <TxtField
                      label="Reps"
                      value={ex.repRange}
                      onChange={(v) =>
                        edit((r) => (r.days[di].exercises[xi].repRange = v))
                      }
                    />
                    <TxtField
                      label="Tempo"
                      value={tempo}
                      onChange={(v) =>
                        edit((r) => (r.days[di].exercises[xi].tempo = v))
                      }
                    />
                    <NumField
                      label="Descanso (min)"
                      value={Math.round((ex.restSeconds / 60) * 10) / 10}
                      step={0.5}
                      min={0}
                      onChange={(v) =>
                        edit(
                          (r) =>
                            (r.days[di].exercises[xi].restSeconds = Math.round(
                              v * 60,
                            )),
                        )
                      }
                    />
                    <NumField
                      label="RIR fácil"
                      value={ex.rir?.easy ?? 2}
                      min={0}
                      onChange={(v) =>
                        edit((r) => {
                          r.days[di].exercises[xi].rir = {
                            ...(r.days[di].exercises[xi].rir || {}),
                            easy: v,
                          };
                        })
                      }
                    />
                    <NumField
                      label="RIR duro"
                      value={ex.rir?.hard ?? 1}
                      min={0}
                      onChange={(v) =>
                        edit((r) => {
                          r.days[di].exercises[xi].rir = {
                            ...(r.days[di].exercises[xi].rir || {}),
                            hard: v,
                          };
                        })
                      }
                    />
                    <div className="editfull">
                      <TxtField
                        label="Nota"
                        value={ex.note || ""}
                        onChange={(v) =>
                          edit((r) => (r.days[di].exercises[xi].note = v))
                        }
                      />
                    </div>
                    <button
                      className="btn ghost editfull"
                      onClick={() =>
                        goPickExercise((newId) =>
                          edit(
                            (r) =>
                              (r.days[di].exercises[xi].exId = newId),
                          ),
                        )
                      }
                    >
                      Cambiar ejercicio
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {!readOnly && (
            <button
              className="btn ghost full"
              onClick={() =>
                goPickExercise((newId) =>
                  edit((r) =>
                    r.days[di].exercises.push({
                      exId: newId,
                      warmupSets: 1,
                      workingSets: 3,
                      repRange: "8-12",
                      // Tempo cargado por defecto desde el ejercicio
                      tempo: C(newId)?.tempo || "2-0-1",
                      restSeconds: 120,
                      rir: { easy: 2, hard: 1 },
                      note: "",
                    }),
                  ),
                )
              }
            >
              + Agregar ejercicio
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <button
          className="btn ghost full"
          onClick={() =>
            edit((r) =>
              r.days.push({
                name: "Día " + (r.days.length + 1),
                exercises: [],
              }),
            )
          }
        >
          + Agregar día
        </button>
      )}
    </div>
  );
}

function NumField({ label, value, onChange, step = 1, min = 1 }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function TxtField({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export { ca };
