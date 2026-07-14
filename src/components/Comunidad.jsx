import { useState } from "react";
import { S, W, rl } from "./ui.jsx";
import { D, Ae, X, Te, M } from "../data/store.js";

// Ventanas temporales estilo Reddit ("top de hoy / semana / mes")
const WINDOWS = [
  ["todo", "Top", null],
  ["hoy", "Hoy", 864e5],
  ["semana", "Semana", 7 * 864e5],
  ["mes", "Mes", 30 * 864e5],
];

// Categorías donde escribes texto libre (las rutinas se publican desde la
// pestaña Rutinas, con la rutina adjunta)
const COMPOSE_CATS = D.filter(([id]) => id !== "rutinas");

const catLabel = (id) => D.find((d) => d[0] === id)?.[1] || id;

function sa({ openPost }) {
  const [cat, setCat] = useState(null);
  const [win, setWin] = useState("todo");
  const [, force] = useState(0);
  const [composing, setComposing] = useState(false);

  const since = WINDOWS.find((w) => w[0] === win)?.[2] || null;
  const posts = Ae(cat, since ? Date.now() - since : null);

  return (
    <div className="pad">
      <div className="row spread">
        <h2>Comunidad</h2>
        <button className="btn" onClick={() => setComposing(true)}>
          + Publicar
        </button>
      </div>

      <div className="row wrap seg">
        {WINDOWS.map(([id, label]) => (
          <S key={id} on={win === id} onClick={() => setWin(id)}>
            {label}
          </S>
        ))}
      </div>

      <div className="row wrap">
        <S on={!cat} onClick={() => setCat(null)}>
          Todo
        </S>
        {D.map(([id, label]) => (
          <S key={id} on={cat === id} onClick={() => setCat(id)}>
            {label}
          </S>
        ))}
      </div>

      {composing && (
        <Composer
          done={() => {
            setComposing(false);
            force((s) => s + 1);
          }}
        />
      )}

      {posts.map((post, i) => (
        <div
          key={post.id}
          className="card post pop"
          style={{ animationDelay: `${Math.min(i, 8) * 28}ms` }}
          onClick={() => openPost(post.id)}
        >
          <div className="row">
            <span onClick={(e) => e.stopPropagation()}>
              <W
                score={post.votes}
                mine={post.myVote}
                onVote={(v) => {
                  X(post.id, v);
                  force((s) => s + 1);
                }}
              />
            </span>
            <div className="grow">
              <div className="row gap" style={{ marginBottom: 2 }}>
                <span className={"ptype t-" + post.category}>
                  {catLabel(post.category)}
                </span>
                <span className="dim small">
                  @{M(post.userId)} · {rl(post.at)}
                </span>
              </div>
              <b>{post.title}</b>
              <div className="dim small">
                {post.comments.length} comentarios
                {post.routineRef && " · rutina adjunta"}
              </div>
            </div>
          </div>
        </div>
      ))}

      {!posts.length && (
        <div className="card dim">
          Nada por aquí todavía. Sé el primero en publicar.
        </div>
      )}
    </div>
  );
}

function Composer({ done }) {
  const [cat, setCat] = useState(COMPOSE_CATS[0][0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className="card">
      <div className="row wrap">
        {COMPOSE_CATS.map(([id, label]) => (
          <S key={id} on={cat === id} onClick={() => setCat(id)}>
            {label}
          </S>
        ))}
      </div>
      <input
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Cuenta…"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="row gap">
        <button
          className="btn"
          disabled={!title.trim()}
          onClick={() => {
            Te({ category: cat, title: title.trim(), body: body.trim() });
            done();
          }}
        >
          Publicar
        </button>
        <button className="btn ghost" onClick={done}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

export { sa };
