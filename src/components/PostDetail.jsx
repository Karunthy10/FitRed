import { useState } from "react";
import { W, Ye, Hn } from "./ui.jsx";
import { V, X, Le, De, D, usr, meId, editPost, deletePost } from "../data/store.js";

const catLabel = (id) => D.find((d) => d[0] === id)?.[1] || id;

function ia({ postId, goBack, goRoutine, openProfile }) {
  const [, force] = useState(0);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [eTitle, setETitle] = useState("");
  const [eBody, setEBody] = useState("");
  const post = V(postId);
  if (!post) return null;
  const author = usr(post.userId);
  const mine = post.userId === meId();
  const comments = [...post.comments].sort((a, b) => b.likes - a.likes);

  return (
    <div className="pad">
      <button className="back" onClick={goBack}>
        ‹ Comunidad
      </button>

      <div className="card">
        <div className="row gap small" style={{ marginBottom: 4 }}>
          <span className={"ptype t-" + post.category}>
            {catLabel(post.category)}
          </span>
          <Hn id={post.userId} onOpen={openProfile} />
          {author.role && <span className="dim small">· {author.role}</span>}
        </div>
        {editing ? (
          <>
            <input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            <textarea
              rows={4}
              value={eBody}
              onChange={(e) => setEBody(e.target.value)}
            />
            <div className="row gap">
              <button
                className="btn"
                disabled={!eTitle.trim()}
                onClick={() => {
                  editPost(post.id, { title: eTitle.trim(), body: eBody.trim() });
                  setEditing(false);
                  force((s) => s + 1);
                }}
              >
                Guardar
              </button>
              <button className="btn ghost" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{post.title}</h2>
            {post.body && <p className="body">{post.body}</p>}
          </>
        )}

        <div className="row gap" style={{ marginTop: 6 }}>
          <W
            score={post.votes}
            mine={post.myVote}
            onVote={(v) => {
              X(post.id, v);
              force((s) => s + 1);
            }}
          />
          {post.routineRef && (
            <button className="btn ghost" onClick={() => goRoutine(post.routineRef)}>
              Ver rutina
            </button>
          )}
          {post.price > 0 && (
            <button
              className="btn"
              onClick={() =>
                alert(
                  "Los pagos dentro de Kilo llegan pronto. Mientras tanto puedes ver la rutina y guardarla.",
                )
              }
            >
              Comprar ${post.price}
            </button>
          )}
        </div>
        {mine && !editing && (
          <div className="row gap" style={{ marginTop: 8 }}>
            <button
              className="mini"
              onClick={() => {
                setETitle(post.title);
                setEBody(post.body || "");
                setEditing(true);
              }}
            >
              Editar
            </button>
            <button
              className="mini danger"
              onClick={() => {
                if (confirm("¿Borrar esta publicación?")) {
                  deletePost(post.id);
                  goBack();
                }
              }}
            >
              Borrar
            </button>
          </div>
        )}
      </div>

      <h3>
        Comentarios <span className="dim small">· más likeados primero</span>
      </h3>

      {comments.map((c) => (
        <div key={c.id} className="card cmt">
          <div className="row spread">
            <Hn id={c.userId} onOpen={openProfile} />
            <Ye
              c={c}
              onLike={() => {
                De(post.id, c.id);
                force((s) => s + 1);
              }}
            />
          </div>
          <p>{c.body}</p>
        </div>
      ))}

      <div className="row gap">
        <input
          placeholder="Únete al debate…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          className="btn"
          disabled={!draft.trim()}
          onClick={() => {
            Le(post.id, draft.trim());
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

export { ia };
