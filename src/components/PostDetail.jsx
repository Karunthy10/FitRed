import { useState } from "react";
import { W, Ye, Hn } from "./ui.jsx";
import { V, X, Le, De, D, usr } from "../data/store.js";

const catLabel = (id) => D.find((d) => d[0] === id)?.[1] || id;

function ia({ postId, goBack, goRoutine, openProfile }) {
  const [, force] = useState(0);
  const [draft, setDraft] = useState("");
  const post = V(postId);
  if (!post) return null;
  const author = usr(post.userId);
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
        <h2>{post.title}</h2>
        {post.body && <p className="body">{post.body}</p>}

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
