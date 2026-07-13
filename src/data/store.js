import { Ke, Xe, ce, de, pe, ue, L, G, me, be, ge, xe, $, P } from "./seed.js";
import {
  markLocalWrite,
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
    posts: me.map((a) => ({
      ...a,
      myVote: 0,
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

// h = saveState: persiste el estado completo en localStorage y programa
// (con debounce) un snapshot de respaldo en Supabase (state_snapshots)
function h() {
  try {
    localStorage.setItem(fe, JSON.stringify(p));
  } catch {}
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
// en la comunidad que la referencia
function Ie(e, a, r) {
  let i = p.routines[e];
  if (!i) return;
  i.isPublic = !0;
  let post = {
    id: "p" + Date.now().toString(36),
    userId: p.me,
    category: "ejercicios",
    title: a,
    body: r,
    routineRef: e,
    votes: 0,
    myVote: 0,
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

// D = categorías de posts de la comunidad
var D = [
  ["tips", "Tips"],
  ["alimentacion", "Alimentación"],
  ["progreso", "Progreso"],
  ["ejercicios", "Ejercicios"],
];

// Ae = listPosts: posts de comunidad (opcionalmente filtrados por categoría),
// ordenados por votos
function Ae(e) {
  return p.posts
    .filter((a) => !e || a.category === e)
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
    comments: [],
  };
  p.posts.unshift(post);
  h();
  markLocalWrite();
  syncCreatePost(post);
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
  We, Ue, Ge, ee, ae, $e, Fe
};
