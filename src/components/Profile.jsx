import { useState } from "react";
import { S, Vb } from "./ui.jsx";
import {
  usr,
  meId,
  updateProfile,
  requestVerify,
  Ne,
  Ae,
} from "../data/store.js";

const ROLES = ["Atleta", "Entrenador", "Influencer", "Nutriólogo", "Médico"];

// Vista de perfil. Si es el perfil propio, es editable (rol, años
// entrenando, edad, bio) y puede solicitar verificación.
function pf({ userId, goBack, openRoutine, openPost }) {
  const [, force] = useState(0);
  const u = usr(userId);
  const mine = userId === meId();
  const routines = Ne().filter((r) => r.ownerId === userId);
  const posts = Ae().filter((p) => p.userId === userId);

  return (
    <div className="pad">
      <button className="back" onClick={goBack}>
        ‹ Volver
      </button>

      <div className="card profilehead">
        <div className="avatar">{(u.username || "?")[0].toUpperCase()}</div>
        <div className="grow">
          <div className="row gap" style={{ alignItems: "center" }}>
            <b className="pname">@{u.username}</b>
            {u.verified && <Vb />}
          </div>
          {u.role && <span className="rolepill">{u.role}</span>}
          <div className="dim small" style={{ marginTop: 4 }}>
            {u.yearsTraining != null && `${u.yearsTraining} años entrenando`}
            {u.yearsTraining != null && u.age != null && " · "}
            {u.age != null && `${u.age} años`}
          </div>
          {u.bio && <p className="pbio">{u.bio}</p>}
        </div>
      </div>

      {mine && <EditProfile u={u} force={force} />}

      {!!routines.length && (
        <>
          <h3>Rutinas publicadas</h3>
          {routines.map((r) => (
            <div
              key={r.id}
              className="card post"
              onClick={() => openRoutine(r.id)}
            >
              <div className="row spread">
                <b>{r.name}</b>
                <span className={r.price ? "price" : "price free"}>
                  {r.price ? `$${r.price}` : "Gratis"}
                </span>
              </div>
              <div className="dim small">
                {r.days.length} días · {r.weeks} semanas
              </div>
            </div>
          ))}
        </>
      )}

      {!!posts.length && (
        <>
          <h3>Publicaciones</h3>
          {posts.map((p) => (
            <div
              key={p.id}
              className="card post"
              onClick={() => openPost(p.id)}
            >
              <b>{p.title}</b>
              <div className="dim small">
                ▲ {p.votes} · {p.comments.length} comentarios
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function EditProfile({ u, force }) {
  const [role, setRole] = useState(u.role || "Atleta");
  const [years, setYears] = useState(u.yearsTraining ?? "");
  const [age, setAge] = useState(u.age ?? "");
  const [bio, setBio] = useState(u.bio || "");
  const save = (patch) => {
    updateProfile(patch);
    force((s) => s + 1);
  };
  return (
    <div className="card">
      <b>Editar mi perfil</b>
      <div className="dim small" style={{ margin: "2px 0 8px" }}>
        Cuéntale a la comunidad quién eres.
      </div>

      <span className="flabel">Rol</span>
      <div className="row wrap">
        {ROLES.map((r) => (
          <S
            key={r}
            on={role === r}
            onClick={() => {
              setRole(r);
              save({ role: r });
            }}
          >
            {r}
          </S>
        ))}
      </div>

      <div className="row gap">
        <label className="field grow">
          <span>Años entrenando</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={years}
            onChange={(e) => {
              setYears(e.target.value);
              save({ yearsTraining: e.target.value === "" ? null : Number(e.target.value) });
            }}
          />
        </label>
        <label className="field grow">
          <span>Edad</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={age}
            onChange={(e) => {
              setAge(e.target.value);
              save({ age: e.target.value === "" ? null : Number(e.target.value) });
            }}
          />
        </label>
      </div>

      <span className="flabel">Bio</span>
      <textarea
        rows={2}
        value={bio}
        placeholder="Una línea sobre ti…"
        onChange={(e) => {
          setBio(e.target.value);
          save({ bio: e.target.value });
        }}
      />

      <div className="verifybox">
        {u.verified ? (
          <span className="dim small">
            Tu cuenta está verificada <Vb />
          </span>
        ) : u.verifyRequested ? (
          <span className="dim small">Verificación solicitada · en revisión</span>
        ) : (
          <button
            className="btn ghost"
            onClick={() => {
              requestVerify();
              force((s) => s + 1);
            }}
          >
            Solicitar verificación
          </button>
        )}
        <div className="dim small" style={{ marginTop: 6 }}>
          La verificación (influencer, médico, nutriólogo…) la concede el
          equipo de Kilo tras revisar credenciales.
        </div>
      </div>
    </div>
  );
}

export { pf };
