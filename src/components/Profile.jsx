import { useState } from "react";
import { S, Vb } from "./ui.jsx";
import {
  usr,
  meId,
  updateProfile,
  requestVerify,
  Ne,
  Ae,
  toggleFollow,
  isFollowing,
  followerCount,
  followingCount,
} from "../data/store.js";

const ROLES = ["Atleta", "Entrenador", "Influencer", "Nutriólogo", "Médico"];
// Oficios regulados que requieren cédula profesional para verificarse
const CEDULA_ROLES = ["Nutriólogo", "Médico"];
const needsCedula = (role) => CEDULA_ROLES.includes(role);

// Formatea conteos grandes: 8600 -> "8.6k"
const fmtk = (n) =>
  n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(n);

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
          {needsCedula(u.role) && u.cedula && (
            <div className="credline">
              <span className="credbadge">Cédula prof.</span>
              <span className="crednum">{u.cedula}</span>
              {u.verified ? (
                <Vb />
              ) : u.verifyRequested ? (
                <span className="dim small">· en revisión</span>
              ) : null}
            </div>
          )}
          <div className="dim small" style={{ marginTop: 4 }}>
            {u.yearsTraining != null && `${u.yearsTraining} años entrenando`}
            {u.yearsTraining != null && u.age != null && " · "}
            {u.age != null && `${u.age} años`}
          </div>
          <div className="followrow">
            <span>
              <b>{fmtk(followerCount(userId))}</b> Seguidores
            </span>
            <span>
              <b>{fmtk(followingCount(userId))}</b> Siguiendo
            </span>
          </div>
          {u.bio && <p className="pbio">{u.bio}</p>}
          {!mine && (
            <button
              className={"btn" + (isFollowing(userId) ? " ghost" : "")}
              style={{ marginTop: 10 }}
              onClick={() => {
                toggleFollow(userId);
                force((s) => s + 1);
              }}
            >
              {isFollowing(userId) ? "Siguiendo ✓" : "Seguir"}
            </button>
          )}
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
  const [cedula, setCedula] = useState(u.cedula || "");
  const [doc, setDoc] = useState(u.cedulaDoc || "");
  const save = (patch) => {
    updateProfile(patch);
    force((s) => s + 1);
  };
  const requiresCedula = needsCedula(role);
  const canRequest = !requiresCedula || cedula.trim().length > 0;
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

      {requiresCedula && (
        <>
          <span className="flabel">Cédula profesional</span>
          <input
            inputMode="numeric"
            placeholder="Número de cédula profesional"
            value={cedula}
            onChange={(e) => {
              setCedula(e.target.value);
              save({ cedula: e.target.value });
            }}
          />
          <label className="fileattach">
            <input
              type="file"
              accept="image/*,.pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (f) {
                  setDoc(f.name);
                  save({ cedulaDoc: f.name });
                }
              }}
            />
            <span className="btn ghost">
              {doc ? `Documento: ${doc}` : "Subir documento de cédula"}
            </span>
          </label>
        </>
      )}

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
            disabled={!canRequest}
            onClick={() => {
              requestVerify();
              force((s) => s + 1);
            }}
          >
            {requiresCedula ? "Enviar cédula y solicitar verificación" : "Solicitar verificación"}
          </button>
        )}
        <div className="dim small" style={{ marginTop: 6 }}>
          {requiresCedula
            ? "Los oficios de salud (médico, nutriólogo) se verifican validando tu cédula profesional en el registro oficial. El equipo de Kilo la revisa."
            : "Influencers y atletas se verifican sin cédula; el equipo de Kilo revisa la cuenta. Los oficios de salud requieren cédula profesional."}
        </div>
      </div>
    </div>
  );
}

export { pf };
