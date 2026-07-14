import { useState } from "react";
import { W, Ye } from "./ui.jsx";
import { C, Y, j, J, _, ke, Se, M, pinTip } from "../data/store.js";

function ta({ exId: e, goBack: a }) {
  const [, force] = useState(0);
  const [draft, setDraft] = useState("");
  const ex = C(e);
  // Tips fijados primero, luego por likes
  const tips = Y(e)
    .slice()
    .sort((x, y) => (y.pinned ? 1 : 0) - (x.pinned ? 1 : 0) || y.likes - x.likes);

  return (
    <div className="pad">
      <button className="back" onClick={a}>
        ‹ Ejercicios
      </button>

      <div className="card hero2">
        <div className="row spread">
          <div>
            <b className="big">{ex.name}</b>
            <div className="dim small">
              {ex.primaryMuscle} · {ex.equipment}
            </div>
          </div>
          <W
            score={j(e)}
            mine={J(e)}
            onVote={(v) => {
              _(e, v);
              force((s) => s + 1);
            }}
          />
        </div>
        <a
          className="btn ghost"
          href={ex.videoUrl}
          target="_blank"
          rel="noreferrer"
        >
          Ver técnica correcta ›
        </a>
      </div>

      {ex.cue && (
        <div className="card coach">
          <div className="coachlabel">Consejo del coach</div>
          <p>{ex.cue}</p>
        </div>
      )}

      <h3>
        Tips de la comunidad{" "}
        <span className="dim small">· fija los que quieras recordar</span>
      </h3>

      {tips.map((t) => (
        <div key={t.id} className={"card cmt" + (t.pinned ? " pinned" : "")}>
          <div className="row spread">
            <b className="user">@{M(t.userId)}</b>
            <div className="row gap">
              <button
                className={"pin" + (t.pinned ? " on" : "")}
                onClick={() => {
                  pinTip(t.id);
                  force((s) => s + 1);
                }}
              >
                {t.pinned ? "★ Fijado" : "☆ Fijar"}
              </button>
              <Ye
                c={t}
                onLike={() => {
                  Se(t.id);
                  force((s) => s + 1);
                }}
              />
            </div>
          </div>
          <p>{t.body}</p>
        </div>
      ))}

      {!tips.length && (
        <div className="card dim">
          Aún no hay tips. Comparte el primero.
        </div>
      )}

      <div className="row gap">
        <input
          placeholder="Comparte un tip sobre este ejercicio…"
          value={draft}
          onChange={(e2) => setDraft(e2.target.value)}
        />
        <button
          className="btn"
          disabled={!draft.trim()}
          onClick={() => {
            ke(e, draft.trim());
            setDraft("");
            force((s) => s + 1);
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export { ta };
