import { Ke, Xe, ce, de, pe, ue, L, G, me, be, ge, xe, $, P } from "./seed.js";
import {
  markLocalWrite,
  syncDeleteWorkout,
  syncDeletePost,
  syncCreateRoutine,
  syncUpdateRoutine,
  syncCopyRoutine,
  syncDeleteRoutine,
  syncStartWorkout,
  syncUpdateSet,
  syncCreateExercise,
  syncVoteExercise,
  syncExerciseComment,
  syncCreatePost,
  syncVotePost,
  syncPostComment,
  scheduleSnapshot,
} from "./sync.js";

var fe = "fitnet-v2",
  p = null;

// he = buildSeedState: arma el estado inicial (usuarios, ejercicios, rutina
// semilla, posts semilla) a partir de src/data/seed.js
function he() {
  let e = Date.now();
  return {
    me: "karunthy",
    users: Object.fromEntries(de.map((a) => [a.id, a])),
    exercises: Object.fromEntries(ce.map((a) => [a.id, a])),
    exVotes: Object.fromEntries(
      Object.entries(pe).map(([a, r]) => [a, { score: r, mine: 0 }]),
    ),
    exComments: ue.map(([a, r, i, c], t) => ({
      id: "ec" + t,
      exId: a,
      userId: r,
      body: i,
      likes: c,
      likedByMe: !1,
      at: e - (8 - t) * 864e5,
    })),
    routines: { [G.id]: G },
    myRoutines: [],
    activeRoutine: null,
    activeWeek: 1,
    posts: me.map((a, idx) => ({
      ...a,
      // Publicaciones con rutina adjunta son del tipo "rutinas"
      category: a.routineRef ? "rutinas" : a.category,
      myVote: 0,
      // Timestamps escalonados (hoy hacia atrás) para el filtro temporal
      at: a.at || e - idx * 3 * 864e5,
      comments: (a.comments || []).map(([r, i, c], t) => ({
        id: a.id + "c" + t,
        userId: r,
        body: i,
        likes: c,
        likedByMe: !1,
      })),
    })),
    workouts: [],
    unit: "kg",
  };
}

// q = getState: retorna el estado en memoria; si no existe, lo carga de
// localStorage o genera el seed inicial (he())
function q() {
  if (p) return p;
  try {
    p = JSON.parse(localStorage.getItem(fe));
  } catch {}
  return ((!p || !p.exercises) && (p = he()), p);
}

// Suscripción a cambios del store (para useSyncExternalStore): cada h()
// incrementa la versión y notifica en microtask (nunca durante render).
var storeVersion = 0;
var storeListeners = new Set();
function subscribeStore(cb) {
  storeListeners.add(cb);
  return () => storeListeners.delete(cb);
}
var getStoreVersion = () => storeVersion;

// h = saveState: persiste el estado completo en localStorage y programa
// (con debounce) un snapshot de respaldo en Supabase (state_snapshots)
function h() {
  try {
    localStorage.setItem(fe, JSON.stringify(p));
  } catch {}
  storeVersion++;
  queueMicrotask(() => {
    for (const cb of storeListeners) cb();
  });
  scheduleSnapshot(Oe);
}

// ve = resetState: descarta todo y regenera el estado desde el seed
// ("Reiniciar app"). Es una acción local/destructiva, no toca la nube.
function ve() {
  return ((p = he()), h(), p);
}

// F = listExercises, C = getExercise, j = getVoteScore, J = getMyVote
var F = () => Object.values(p.exercises),
  C = (e) => p.exercises[e],
  j = (e) => p.exVotes[e]?.score || 0,
  J = (e) => p.exVotes[e]?.mine || 0;

// ye = exercisesByMuscle: lista ejercicios de un músculo, ordenados por score
function ye(e) {
  return F()
    .filter((a) => a.primaryMuscle === e)
    .sort((a, r) => j(r.id) - j(a.id));
}

// _ = voteExercise: registra el voto (+1/-1) del usuario sobre un ejercicio
function _(e, a) {
  let r = p.exVotes[e] || (p.exVotes[e] = { score: 0, mine: 0 });
  r.score += a - r.mine;
  r.mine = a;
  h();
  markLocalWrite();
  syncVoteExercise(e, a);
}

// we = createExercise: agrega un ejercicio creado por el usuario
function we({
  name: e,
  primaryMuscle: a,
  muscles: r,
  equipment: i,
  videoUrl: c,
  description: t,
}) {
  let n = "ux-" + Date.now().toString(36);
  p.exercises[n] = {
    id: n,
    name: e,
    primaryMuscle: a,
    muscles: [a, ...(r || []).filter((s) => s !== a)],
    equipment: i,
    videoUrl: c,
    description: t,
    createdBy: p.me,
  };
  p.exVotes[n] = { score: 1, mine: 1 };
  h();
  markLocalWrite();
  syncCreateExercise(p.exercises[n]);
  return n;
}

// Y = listExerciseComments: comentarios de un ejercicio, ordenados por likes
var Y = (e) =>
  p.exComments.filter((a) => a.exId === e).sort((a, r) => r.likes - a.likes);

// ke = addExerciseComment: agrega un comentario al hilo de un ejercicio
function ke(e, a) {
  let c = {
    id: "ec" + Date.now().toString(36),
    exId: e,
    userId: p.me,
    body: a,
    likes: 0,
    likedByMe: !1,
    at: Date.now(),
  };
  p.exComments.push(c);
  h();
  markLocalWrite();
  syncExerciseComment(c);
}

// Se = toggleLikeExComment: da/quita like a un comentario de ejercicio
function Se(e) {
  let a = p.exComments.find((r) => r.id === e);
  if (!a) return;
  a.likes += a.likedByMe ? -1 : 1;
  a.likedByMe = !a.likedByMe;
  h();
  markLocalWrite();
  syncExerciseComment(a);
}

// pinTip = fijar/desfijar un tip de un ejercicio para que se te recuerde al
// entrenar. Es una preferencia local (no hay columna remota); igual queda
// respaldada dentro del snapshot de estado.
function pinTip(e) {
  let a = p.exComments.find((r) => r.id === e);
  if (!a) return;
  a.pinned = !a.pinned;
  h();
  markLocalWrite();
}

// pinnedTips = tips fijados por el usuario para un ejercicio (los que
// Entrenar recuerda durante la sesión), ordenados por likes
var pinnedTips = (e) =>
  p.exComments
    .filter((a) => a.exId === e && a.pinned)
    .sort((a, r) => r.likes - a.likes);

// Z = getRoutine, Ne = listPublicRoutines, Re = listMyRoutines
var Z = (e) => p.routines[e],
  Ne = () => Object.values(p.routines).filter((e) => e.isPublic),
  Re = () => p.myRoutines.map((e) => p.routines[e]).filter(Boolean);

// Ce = copyRoutine: clona una rutina pública/de otro usuario a "mis rutinas"
function Ce(e) {
  let a = p.routines[e];
  if (!a) return null;
  let r = "rt-" + Date.now().toString(36);
  p.routines[r] = {
    ...JSON.parse(JSON.stringify(a)),
    id: r,
    ownerId: p.me,
    isPublic: !1,
    copiedFrom: e,
    name: a.name,
  };
  p.myRoutines.push(r);
  p.activeRoutine || (p.activeRoutine = r);
  h();
  markLocalWrite();
  syncCopyRoutine(p.routines[r]);
  return r;
}

// je = createRoutine: crea una rutina propia vacía
function je(e) {
  let a = "rt-" + Date.now().toString(36);
  p.routines[a] = {
    id: a,
    ownerId: p.me,
    name: e,
    description: "",
    isPublic: !1,
    weeks: 8,
    easyWeeks: [1, 2],
    days: [{ name: "Día 1", exercises: [] }],
  };
  p.myRoutines.push(a);
  p.activeRoutine || (p.activeRoutine = a);
  h();
  markLocalWrite();
  syncCreateRoutine(p.routines[a]);
  return a;
}

// createRoutineFromTemplate = crea una rutina completa desde una plantilla:
// days = [{ name, exercises: [[exId, sets, repRange, restSeconds], ...] }]
// El tempo se hereda del ejercicio; todo queda editable en el editor.
function createRoutineFromTemplate(name, days, weeks = 8) {
  let a = "rt-" + Date.now().toString(36);
  p.routines[a] = {
    id: a,
    ownerId: p.me,
    name,
    description: "",
    isPublic: !1,
    weeks,
    easyWeeks: [1, 2],
    days: days.map((d) => ({
      name: d.name,
      exercises: d.exercises.map(([exId, sets, reps, rest]) => ({
        exId,
        warmupSets: sets >= 4 ? 2 : 1,
        workingSets: sets,
        repRange: reps,
        tempo: p.exercises[exId]?.tempo || "2-0-1",
        restSeconds: rest,
        rir: { easy: 2, hard: 1 },
        note: "",
      })),
    })),
  };
  p.myRoutines.push(a);
  p.activeRoutine || (p.activeRoutine = a);
  h();
  markLocalWrite();
  syncCreateRoutine(p.routines[a]);
  return a;
}

// k = updateRoutine: mutador genérico de una rutina propia (lo usa
// RoutineEditor.jsx para renombrar, reordenar y agregar/quitar días o
// ejercicios: recibe una función que muta la rutina in-place)
function k(e, a) {
  let r = p.routines[e];
  if (!r) return;
  a(r);
  h();
  markLocalWrite();
  syncUpdateRoutine(r);
}

// Ie = publishRoutineAsPost: marca la rutina como pública y publica un post
// en la comunidad que la referencia. price opcional (0 = gratis).
function Ie(e, a, r, price = 0) {
  let i = p.routines[e];
  if (!i) return;
  i.isPublic = !0;
  i.price = price > 0 ? price : 0;
  let post = {
    id: "p" + Date.now().toString(36),
    userId: p.me,
    category: "rutinas",
    title: a,
    body: r,
    routineRef: e,
    price: i.price,
    votes: 0,
    myVote: 0,
    at: Date.now(),
    comments: [],
  };
  p.posts.unshift(post);
  h();
  markLocalWrite();
  syncUpdateRoutine(i);
  syncCreatePost(post);
}

// Pe = deleteRoutine: quita la rutina de "mis rutinas" (y la borra del todo
// si no es pública)
function Pe(e) {
  let wasPublic = p.routines[e]?.isPublic;
  p.myRoutines = p.myRoutines.filter((a) => a !== e);
  if (p.routines[e] && !p.routines[e].isPublic) delete p.routines[e];
  if (p.activeRoutine === e) p.activeRoutine = p.myRoutines[0] || null;
  h();
  markLocalWrite();
  if (!wasPublic) syncDeleteRoutine(e);
}

// qe = setActiveRoutine, Me = setActiveWeek: preferencias locales de sesión
var qe = (e) => {
    p.activeRoutine = e;
    h();
  },
  Me = (e) => {
    p.activeWeek = e;
    h();
  };

// Ee = startWorkout: inicia un entrenamiento (día de una rutina, en una semana)
function Ee(e, a, r) {
  let c = p.routines[e].days[a];
  let t = {
    id: "w" + Date.now().toString(36),
    routineId: e,
    dayIdx: a,
    dayName: c.name,
    week: r,
    date: new Date().toISOString().slice(0, 10),
    sets: {},
  };
  p.workouts.push(t);
  h();
  markLocalWrite();
  syncStartWorkout(t);
  return t;
}

// hasSets = ¿el entrenamiento tiene alguna serie con datos?
var hasSets = (w) =>
  Object.values(w.sets || {}).some((arr) =>
    (arr || []).some((s) => s && (s.w || s.r || s.done)),
  );

// startOrResume = si ya hay un entrenamiento sin terminar para ese día/semana,
// lo reanuda (no pierde el avance ni crea duplicados vacíos); si no, crea uno.
function startOrResume(routineId, dayIdx, week) {
  let existing = null;
  for (let i = p.workouts.length - 1; i >= 0; i--) {
    let w = p.workouts[i];
    if (
      w.routineId === routineId &&
      w.dayIdx === dayIdx &&
      w.week === week &&
      !w.finished
    ) {
      existing = w;
      break;
    }
  }
  return existing || Ee(routineId, dayIdx, week);
}

// finishWorkout = marca un entrenamiento como terminado (para no reanudarlo)
function finishWorkout(id) {
  let w = p.workouts.find((x) => x.id === id);
  if (!w) return;
  w.finished = true;
  h();
  markLocalWrite();
  syncStartWorkout(w);
}

// resumable = entrenamiento sin terminar y con series registradas de la rutina
// y semana activas (para el banner "Continuar" del home)
function resumable(routineId, week) {
  for (let i = p.workouts.length - 1; i >= 0; i--) {
    let w = p.workouts[i];
    if (w.routineId === routineId && w.week === week && !w.finished && hasSets(w))
      return w;
  }
  return null;
}

// setPref/pref = preferencias de entrenamiento (auto-descanso, avisos, etc.)
function setPref(key, val) {
  (p.prefs ||= {})[key] = val;
  h();
}
var pref = (key, dflt) => (p.prefs && key in p.prefs ? p.prefs[key] : dflt);

// addBodyLog/bodyLog = registro de peso corporal y medidas (serie temporal)
function addBodyLog(entry) {
  (p.body ||= []).push({
    at: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    ...entry,
  });
  h();
  markLocalWrite();
}
var bodyLog = () => [...(p.body || [])].sort((a, b) => a.at - b.at);

// deleteWorkout = borra un entrenamiento del historial (y sus series remotas)
function deleteWorkout(id) {
  p.workouts = p.workouts.filter((w) => w.id !== id);
  h();
  markLocalWrite();
  syncDeleteWorkout(id);
}

// ze = listWorkouts: historial de entrenamientos, más reciente primero
var ze = () => [...p.workouts].reverse();

// O = updateSet: registra/actualiza una serie (peso, reps, hecho) dentro de
// un entrenamiento en curso — el llamado principal al entrenar
function O(e, a, r, i) {
  let c = p.workouts.find((t) => t.id === e);
  if (!c) return;
  (c.sets[a] ||= [])[r] = { ...(c.sets[a][r] || {}), ...i };
  h();
  markLocalWrite();
  syncUpdateSet(e, a, r, c.sets[a][r]);
}

// Q = getLastCompletedSets: últimas series completadas de un ejercicio
// (para sugerir progresión), excluyendo el entrenamiento actual
function Q(e, a) {
  for (let r = p.workouts.length - 1; r >= 0; r--) {
    let i = p.workouts[r];
    if (i.id !== a && i.sets[e]?.some((c) => c?.done)) return i.sets[e];
  }
  return null;
}

// K = estimate1RM: fórmula simple de 1RM estimado a partir de peso y reps
function K(e, a) {
  return a > 0 ? Math.round(e * (1 + a / 30)) : 0;
}

// Be = getBestE1RM: mejor 1RM estimado histórico de un ejercicio
function Be(e) {
  let a = 0;
  for (let r of p.workouts)
    for (let i of r.sets[e] || [])
      i?.done && i.w && i.r && (a = Math.max(a, K(+i.w, +i.r)));
  return a;
}

// D = categorías/tipos de publicación de la comunidad. Cada publicación es
// como un post de Reddit: sube/baja puntos y comentarios. "rutinas" son las
// rutinas compartidas (llevan routineRef).
var D = [
  ["rutinas", "Rutinas"],
  ["ejercicios", "Ejercicios"],
  ["tips", "Tips"],
  ["progreso", "Progreso"],
  ["alimentacion", "Nutrición"],
];

// Ae = listPosts: publicaciones de comunidad, opcionalmente filtradas por
// categoría y por ventana temporal (since = timestamp mínimo, estilo "top de
// hoy/semana/mes"), ordenadas por puntos (top primero)
function Ae(e, since) {
  return p.posts
    .filter((a) => !e || a.category === e)
    .filter((a) => !since || (a.at || 0) >= since)
    .sort((a, r) => r.votes - a.votes);
}

// V = getPost
var V = (e) => p.posts.find((a) => a.id === e);

// X = votePost: registra el voto (+1/-1) del usuario sobre un post
function X(e, a) {
  let r = V(e);
  if (!r) return;
  r.votes += a - r.myVote;
  r.myVote = a;
  h();
  markLocalWrite();
  syncVotePost(r);
}

// Te = createPost: publica un post nuevo en la comunidad
function Te({ category: e, title: a, body: r }) {
  let post = {
    id: "p" + Date.now().toString(36),
    userId: p.me,
    category: e,
    title: a,
    body: r,
    votes: 1,
    myVote: 1,
    at: Date.now(),
    comments: [],
  };
  p.posts.unshift(post);
  h();
  markLocalWrite();
  syncCreatePost(post);
}

// editPost = edita título/cuerpo de una publicación propia
function editPost(id, patch) {
  let r = V(id);
  if (!r || r.userId !== p.me) return;
  Object.assign(r, patch);
  h();
  markLocalWrite();
  syncCreatePost(r);
}

// deletePost = borra una publicación propia
function deletePost(id) {
  let r = V(id);
  if (!r || r.userId !== p.me) return;
  p.posts = p.posts.filter((x) => x.id !== id);
  h();
  markLocalWrite();
  syncDeletePost(id);
}

// Le = addPostComment: agrega un comentario a un post
function Le(e, a) {
  let r = V(e);
  if (!r) return;
  let c = {
    id: "c" + Date.now().toString(36),
    userId: p.me,
    body: a,
    likes: 0,
    likedByMe: !1,
  };
  r.comments.push(c);
  h();
  markLocalWrite();
  syncPostComment(e, c);
}

// De = toggleLikePostComment: da/quita like a un comentario de un post
function De(e, a) {
  let r = V(e)?.comments.find((i) => i.id === a);
  if (!r) return;
  r.likes += r.likedByMe ? -1 : 1;
  r.likedByMe = !r.likedByMe;
  h();
  markLocalWrite();
  syncPostComment(e, r);
}

// M = getUsername
var M = (e) => p.users[e]?.username || e;

// usr = getUser: perfil completo (username, bio, role, verified,
// yearsTraining, age)
var usr = (e) => p.users[e] || { id: e, username: e };

// meId = id del usuario actual
var meId = () => p.me;

// updateProfile = edita el perfil propio (rol, años entrenando, edad, bio).
// No hay tabla de perfiles en el schema, así que es local + snapshot.
function updateProfile(patch) {
  if (!p.users[p.me]) p.users[p.me] = { id: p.me, username: p.me };
  Object.assign(p.users[p.me], patch);
  h();
  markLocalWrite();
}

// requestVerify = solicita verificación de la cuenta. La verificación real
// la concede el equipo de Kilo (proceso externo); aquí solo se marca la
// solicitud.
function requestVerify() {
  if (!p.users[p.me]) return;
  p.users[p.me].verifyRequested = true;
  h();
  markLocalWrite();
}

// toggleFollow = seguir/dejar de seguir a un usuario. El grafo de follow del
// usuario actual vive en users[me].following (local + snapshot). Los conteos
// globales reales necesitarían una tabla backend; aquí se combinan con los
// conteos semilla de las cuentas demo.
function toggleFollow(id) {
  if (id === p.me) return;
  let me = p.users[p.me] || (p.users[p.me] = { id: p.me, username: p.me });
  me.following ||= [];
  me.following = me.following.includes(id)
    ? me.following.filter((x) => x !== id)
    : [...me.following, id];
  h();
  markLocalWrite();
}

// isFollowing = ¿el usuario actual sigue a id?
var isFollowing = (id) => !!p.users[p.me]?.following?.includes(id);

// followerCount = seguidores de un usuario (semilla + 1 si yo lo sigo)
var followerCount = (id) =>
  (usr(id).followers || 0) + (id !== p.me && isFollowing(id) ? 1 : 0);

// followingCount = a cuántos sigue: para mí es mi lista real; para otros, su
// conteo semilla
var followingCount = (id) =>
  id === p.me
    ? (p.users[p.me]?.following || []).length
    : usr(id).followingCount || 0;

// setRoutinePrice = precio de venta de una rutina propia (0/undefined = gratis)
function setRoutinePrice(routineId, price) {
  let r = p.routines[routineId];
  if (!r) return;
  r.price = price > 0 ? price : 0;
  h();
  markLocalWrite();
  syncUpdateRoutine(r);
}

// H = migrateToV2: migración idempotente que agrega ejercicios extra del
// seed, tempo/cues, e inyecta la rutina privada P. No es una escritura del
// usuario, así que no se espeja a Supabase (solo se persiste local).
function H() {
  let e = q();
  if (e.v2) return e;
  for (let [a, r, i, c, t, n] of be)
    e.exercises[a] ||
      ((e.exercises[a] = {
        id: a,
        name: r,
        primaryMuscle: i,
        muscles: [i, ...c],
        equipment: t,
        tempo: n,
        videoUrl:
          "https://www.youtube.com/results?search_query=" +
          encodeURIComponent(r + " técnica correcta"),
        description: "",
        createdBy: "karunthy",
      }),
      (e.exVotes[a] = { score: 3, mine: 0 }));
  for (let [a, r] of Object.entries(ge))
    e.exercises[a] && (e.exercises[a].tempo = r);
  for (let [a, r] of Object.entries(xe))
    e.exercises[a] && (e.exercises[a].cue = r);
  e.routines[P.id] = P;
  e.myRoutines.includes(P.id) || e.myRoutines.unshift(P.id);
  e.activeRoutine || (e.activeRoutine = P.id);
  e.v2 = !0;
  h();
  return e;
}

// Ve = setUnit: preferencia local de unidad (kg/lb)
var Ve = (e) => {
  p.unit = e;
  h();
};

// Oe = exportStateJSON: serializa todo el estado (usado para backup manual
// y como payload de los snapshots automáticos en Supabase)
function Oe() {
  return JSON.stringify(p);
}

// He = importStateJSON: reemplaza todo el estado a partir de un JSON
// (restaurar backup manual o snapshot remoto de Supabase)
function He(e) {
  let a = JSON.parse(e);
  if (!a.exercises) throw new Error("archivo inválido");
  p = a;
  h();
  return p;
}

// We = getTargetRIR: RIR objetivo de un ejercicio según semana fácil/dura
function We(e, a, r) {
  let i = a ? e.rir?.easy : e.rir?.hard;
  return Array.isArray(i) ? i[Math.min(r, i.length - 1)] : i;
}

// Ue = suggestProgression: sugiere subir peso o repetir según las últimas
// series completadas de un ejercicio
function Ue(e, a, r) {
  let i = Q(a, r);
  if (!i) return null;
  let c = i.filter((d) => d?.done && d.w && d.r);
  if (!c.length) return null;
  let t = parseInt(String(e.repRange).split("-").pop()) || 12,
    n = Math.max(...c.map((d) => +d.w)),
    s = p.unit === "lb" ? 5 : 2.5;
  return c.every((d) => +d.r >= t)
    ? { up: !0, w: n + s }
    : { up: !1, w: n, r: Math.max(...c.map((d) => +d.r)) };
}

// Ge = warmupSuggestion: calcula series de calentamiento a partir del peso
// de trabajo
function Ge(e, a) {
  return [
    [0.4, 10],
    [0.55, 8],
    [0.7, 5],
    [0.85, 3],
  ]
    .slice(0, Math.max(1, Math.min(4, e)))
    .map(([c, t]) => ({
      w: Math.max(0, Math.round((a * c) / 2.5) * 2.5),
      r: t,
    }));
}

// ee = muscleVolumeSummary: volumen objetivo vs. hecho por músculo, para la
// rutina y semana activas
function ee() {
  let e = p.activeRoutine && p.routines[p.activeRoutine];
  if (!e) return [];
  let a = {},
    r = {},
    i = (t, n, s) => {
      if (n) {
        t[n.primaryMuscle] = (t[n.primaryMuscle] || 0) + s;
        for (let d of n.muscles.slice(1)) t[d] = (t[d] || 0) + s * 0.5;
      }
    };
  for (let t of e.days)
    for (let n of t.exercises) i(a, p.exercises[n.exId], n.workingSets);
  let c = p.activeWeek;
  for (let t of p.workouts)
    if (t.routineId === e.id && t.week === c)
      for (let [n, s] of Object.entries(t.sets))
        i(r, p.exercises[n], s.filter((d) => d?.done).length);
  return Object.entries(a)
    .map(([t, n]) => ({
      m: t,
      t: Math.round(n * 10) / 10,
      d: Math.round((r[t] || 0) * 10) / 10,
    }))
    .sort((t, n) => n.t - t.t);
}

// ae = personalRecords: mejor 1RM estimado por ejercicio, con fecha
function ae() {
  let e = {};
  for (let a of p.workouts)
    for (let [r, i] of Object.entries(a.sets))
      for (let c of i || [])
        if (c?.done && c.w && c.r) {
          let t = K(+c.w, +c.r);
          (!e[r] || t > e[r].e1) &&
            (e[r] = { exId: r, e1: t, w: +c.w, r: +c.r, date: a.date });
        }
  return Object.values(e).sort((a, r) => r.e1 - a.e1);
}

// $e = exerciseHistory: serie de tiempo de 1RM estimado de un ejercicio,
// para el gráfico de progreso
function $e(e) {
  let a = [];
  for (let r of p.workouts) {
    let i = 0;
    for (let c of r.sets[e] || [])
      c?.done && c.w && c.r && (i = Math.max(i, K(+c.w, +c.r)));
    i > 0 && a.push({ date: r.date, v: i });
  }
  return a;
}

// Fe = listTrainedExerciseIds: ids de ejercicios con al menos una serie
// completada
var Fe = () => [
  ...new Set(
    p.workouts.flatMap((e) =>
      Object.entries(e.sets)
        .filter(([, a]) => a.some((r) => r?.done && r.w && r.r))
        .map(([a]) => a),
    ),
  ),
];

export {
  q, h, ve, F, C, j, J, ye, _, we, Y, ke, Se, Z, Ne, Re, Ce, je, k, Ie, Pe,
  qe, Me, Ee, ze, O, Q, K, Be, D, Ae, V, X, Te, Le, De, M, H, Ve, Oe, He,
  We, Ue, Ge, ee, ae, $e, Fe, pinTip, pinnedTips,
  usr, meId, updateProfile, requestVerify, setRoutinePrice,
  toggleFollow, isFollowing, followerCount, followingCount,
  createRoutineFromTemplate,
  startOrResume, finishWorkout, resumable, hasSets,
  setPref, pref, addBodyLog, bodyLog,
  subscribeStore, getStoreVersion, deleteWorkout, editPost, deletePost
};

// ─── Alias con nombres descriptivos ──────────────────────────────────
// Los nombres cortos de arriba vienen de la migración original; el código
// nuevo debe importar estos. (Mismo objeto, cero coste.)
export {
  q as getState,
  h as saveState,
  ve as resetState,
  F as listExercises,
  C as getExercise,
  j as getVoteScore,
  J as getMyVote,
  ye as exercisesByMuscle,
  _ as voteExercise,
  we as createExercise,
  Y as listExerciseTips,
  ke as addExerciseTip,
  Se as toggleLikeTip,
  Z as getRoutine,
  Ne as listPublicRoutines,
  Re as listMyRoutines,
  Ce as copyRoutine,
  je as createRoutine,
  k as updateRoutine,
  Ie as publishRoutineAsPost,
  Pe as deleteRoutine,
  qe as setActiveRoutine,
  Me as setActiveWeek,
  Ee as startWorkout,
  ze as listWorkouts,
  O as updateSet,
  Q as getLastCompletedSets,
  K as estimate1RM,
  Be as getBestE1RM,
  D as POST_CATEGORIES,
  Ae as listPosts,
  V as getPost,
  X as votePost,
  Te as createPost,
  Le as addPostComment,
  De as toggleLikePostComment,
  M as getUsername,
  H as migrateToV2,
  Ve as setUnit,
  Oe as exportStateJSON,
  He as importStateJSON,
  We as getTargetRIR,
  Ue as suggestProgression,
  Ge as warmupSuggestion,
  ee as muscleVolumeSummary,
  ae as personalRecords,
  $e as exerciseHistory,
  Fe as listTrainedExerciseIds,
};
