import { useState } from "react";
import { Hn } from "./ui.jsx";
import { Re, q, H, je, qe, Ne, Ce, Ie, Pe } from "../data/store.js";

function la({ goEdit, force9, openProfile }) {
  const [, force] = useState(0);
  const [publishing, setPublishing] = useState(null); // routineId
  H();
  const mine = Re();
  const st = q();
  const bump = () => force((s) => s + 1);

  return (
    <div className="pad">
      <div className="row spread">
        <h2>Mis rutinas</h2>
        <button className="btn" onClick={() => goEdit(je("Mi rutina"))}>
          + Crear
        </button>
      </div>

      {mine.length === 0 && (
        <div className="card dim">
          Aún no tienes rutinas. Crea una o copia la de otro usuario.
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
