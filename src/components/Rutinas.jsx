import { useState } from "react";
import { Hn } from "./ui.jsx";
import {
  Re,
  q,
  H,
  je,
  qe,
  Ne,
  Ce,
  Ie,
  Pe,
  C,
  createRoutineFromTemplate,
} from "../data/store.js";

// Plantillas para no empezar de cero: [exId, series, reps, descanso(s)]
const TEMPLATES = [
  {
    id: "fullbody",
    name: "Full Body",
    meta: "3 días · ideal para empezar",
    days: [
      {
        name: "Full Body A",
        exercises: [
          ["squat", 3, "6-8", 180],
          ["bench", 3, "6-8", 180],
          ["bb-row", 3, "8-10", 150],
          ["lat-raise", 3, "12-15", 90],
          ["leg-raise", 3, "10-15", 60],
        ],
      },
      {
        name: "Full Body B",
        exercises: [
          ["deadlift", 3, "5-8", 210],
          ["ohp", 3, "6-8", 180],
          ["lat-pulldown", 3, "8-10", 150],
          ["leg-press", 3, "10-12", 150],
          ["ez-curl", 3, "10-12", 90],
        ],
      },
      {
        name: "Full Body C",
        exercises: [
          ["hack", 3, "8-10", 180],
          ["incline-db", 3, "8-10", 150],
          ["cable-row", 3, "10-12", 120],
          ["pushdown", 3, "10-12", 90],
          ["calf-stand", 3, "12-15", 75],
        ],
      },
    ],
  },
  {
    id: "upperlower",
    name: "Upper / Lower",
    meta: "4 días · el clásico que funciona",
    days: [
      {
        name: "Upper A",
        exercises: [
          ["bench", 4, "6-8", 180],
          ["bb-row", 4, "6-8", 180],
          ["ohp", 3, "8-10", 150],
          ["lat-pulldown", 3, "8-10", 150],
          ["lat-raise", 3, "12-15", 90],
        ],
      },
      {
        name: "Lower A",
        exercises: [
          ["squat", 4, "5-8", 210],
          ["rdl", 3, "8-10", 180],
          ["leg-press", 3, "10-12", 150],
          ["leg-curl", 3, "10-12", 90],
          ["calf-stand", 4, "12-15", 75],
        ],
      },
      {
        name: "Upper B",
        exercises: [
          ["incline-db", 4, "8-10", 150],
          ["cable-row", 4, "8-10", 150],
          ["db-shoulder", 3, "8-10", 150],
          ["preacher", 3, "10-12", 90],
          ["pushdown", 3, "10-12", 90],
        ],
      },
      {
        name: "Lower B",
        exercises: [
          ["hack", 4, "8-10", 180],
          ["hip-thrust", 3, "8-10", 150],
          ["leg-ext", 3, "12-15", 90],
          ["leg-curl", 3, "10-12", 90],
          ["calf-seat", 4, "12-15", 75],
        ],
      },
    ],
  },
  {
    id: "ppl",
    name: "Push / Pull / Legs",
    meta: "3 días · rota y repite",
    days: [
      {
        name: "Push",
        exercises: [
          ["bench", 4, "6-8", 180],
          ["ohp", 3, "8-10", 150],
          ["incline-db", 3, "8-10", 150],
          ["lat-raise", 3, "12-15", 90],
          ["pushdown", 3, "10-12", 90],
        ],
      },
      {
        name: "Pull",
        exercises: [
          ["pullup", 4, "6-10", 180],
          ["bb-row", 3, "8-10", 150],
          ["face-pull", 3, "15-20", 75],
          ["preacher", 3, "10-12", 90],
          ["hammer", 3, "10-12", 90],
        ],
      },
      {
        name: "Legs",
        exercises: [
          ["squat", 4, "5-8", 210],
          ["rdl", 3, "8-10", 180],
          ["leg-press", 3, "10-12", 150],
          ["leg-curl", 3, "10-12", 90],
          ["calf-stand", 4, "12-15", 75],
        ],
      },
    ],
  },
];

function la({ goEdit, force9, openProfile }) {
  const [, force] = useState(0);
  const [publishing, setPublishing] = useState(null); // routineId
  const [choosing, setChoosing] = useState(false);
  H();
  const mine = Re();
  const st = q();
  const bump = () => force((s) => s + 1);

  return (
    <div className="pad">
      <div className="row spread">
        <h2>Mis rutinas</h2>
        <button className="btn" onClick={() => setChoosing((c) => !c)}>
          + Crear
        </button>
      </div>

      {choosing && (
        <div className="card pop">
          <b>¿Cómo quieres empezar?</b>
          <div className="dim small" style={{ margin: "2px 0 8px" }}>
            Elige una plantilla probada y ajústala a tu gusto, o arma la tuya
            desde cero.
          </div>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className="tplrow"
              onClick={() => {
                const id = createRoutineFromTemplate(t.name, t.days);
                setChoosing(false);
                force9();
                goEdit(id);
              }}
            >
              <span className="grow">
                <b>{t.name}</b>
                <span className="dim small tplmeta">{t.meta}</span>
              </span>
              <span className="dim">›</span>
            </button>
          ))}
          <button
            className="tplrow"
            onClick={() => {
              setChoosing(false);
              goEdit(je("Mi rutina"));
            }}
          >
            <span className="grow">
              <b>Empezar de cero</b>
              <span className="dim small tplmeta">
                rutina vacía · tú decides todo
              </span>
            </span>
            <span className="dim">›</span>
          </button>
        </div>
      )}

      {mine.length === 0 && (
        <div className="card dim">
          Aún no tienes rutinas. Crea una con plantilla o copia la de otro
          usuario aquí abajo.
        </div>
      )}

      {mine.map((r) => (
        <div key={r.id} className="card pop">
          <div className="row spread">
            <div>
              <b>{r.name}</b>
              {st.activeRoutine === r.id && (
                <span className="tag on"> ACTIVA</span>
              )}
              <div className="dim small">
                {r.days.length} días · {r.weeks} semanas
                {r.isPublic && (
                  <> · {r.price > 0 ? `en venta $${r.price}` : "pública"}</>
                )}
                {r.copiedFrom ? " · copiada" : ""}
              </div>
            </div>
          </div>

          <div className="row gap wrap">
            {st.activeRoutine !== r.id && (
              <button
                className="btn"
                onClick={() => {
                  qe(r.id);
                  bump();
                  force9();
                }}
              >
                Usar
              </button>
            )}
            <button className="btn ghost" onClick={() => goEdit(r.id)}>
              Editar
            </button>
            {!r.isPublic && (
              <button
                className="btn ghost"
                onClick={() =>
                  setPublishing(publishing === r.id ? null : r.id)
                }
              >
                Publicar / Vender
              </button>
            )}
            <button
              className="btn ghost"
              onClick={() => shareRoutine(r, (id) => C(id)?.name || id)}
            >
              Compartir
            </button>
            <button
              className="btn ghost danger"
              onClick={() =>
                confirm("¿Borrar rutina?") && (Pe(r.id), bump())
              }
            >
              Borrar
            </button>
          </div>

          {publishing === r.id && (
            <PublishPanel
              routine={r}
              done={() => {
                setPublishing(null);
                bump();
              }}
            />
          )}
        </div>
      ))}

      <h3>Rutinas de la comunidad</h3>
      {Ne()
        .filter((r) => r.ownerId !== st.me)
        .map((r) => (
          <div key={r.id} className="card pop">
            <div className="row spread">
              <b>{r.name}</b>
              <span className={r.price > 0 ? "price" : "price free"}>
                {r.price > 0 ? `$${r.price}` : "Gratis"}
              </span>
            </div>
            <div className="row gap small dim" style={{ marginTop: 2 }}>
              por <Hn id={r.ownerId} onOpen={openProfile} />
              <span>· {r.days.length} días</span>
            </div>
            {r.description && (
              <p className="dim small">{r.description.slice(0, 140)}</p>
            )}
            <div className="row gap">
              <button
                className="btn"
                onClick={() => {
                  Ce(r.id);
                  bump();
                  force9();
                  alert("Copiada a Mis rutinas ✓ Ya puedes editarla y entrenarla");
                }}
              >
                Copiar
              </button>
              <button className="btn ghost" onClick={() => goEdit(r.id, true)}>
                Ver
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

// Comparte la rutina como texto (WhatsApp, notas…) con share nativo o
// portapapeles como respaldo
async function shareRoutine(r, exName) {
  const lines = [
    `${r.name} — rutina Kilo`,
    ...r.days.map(
      (d) =>
        `\n${d.name}:\n` +
        d.exercises
          .map((e) => `  • ${exName(e.exId)} ${e.workingSets}×${e.repRange}`)
          .join("\n"),
    ),
    "\nEntrena con Kilo: https://fitred.vercel.app",
  ];
  const text = lines.join("\n");
  try {
    if (navigator.share) {
      await navigator.share({ title: r.name, text });
      return;
    }
  } catch {
    return; // usuario canceló el share
  }
  try {
    await navigator.clipboard.writeText(text);
    alert("Rutina copiada al portapapeles ✓");
  } catch {
    alert(text);
  }
}

// Panel para publicar una rutina en la comunidad, gratis o con precio
function PublishPanel({ routine, done }) {
  const [price, setPrice] = useState("");
  const publish = () => {
    Ie(
      routine.id,
      routine.name + " — mi rutina",
      routine.description || "La comparto con la comunidad.",
      Number(price) || 0,
    );
    done();
  };
  return (
    <div className="publishpanel">
      <span className="flabel">Precio (opcional)</span>
      <div className="row gap">
        <div className="pricewrap">
          <span>$</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            placeholder="0 = gratis"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>
      <div className="dim small" style={{ margin: "6px 0" }}>
        Publicar la hace visible en la comunidad. Con precio &gt; 0 queda
        marcada en venta (el cobro dentro de la app llega pronto).
      </div>
      <div className="row gap">
        <button className="btn" onClick={publish}>
          {Number(price) > 0 ? `Poner en venta $${price}` : "Publicar gratis"}
        </button>
        <button className="btn ghost" onClick={done}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export { la };
