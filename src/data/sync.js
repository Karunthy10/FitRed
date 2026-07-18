// Capa de sincronización best-effort con Supabase.
// Nunca bloquea la UI: cada escritura remota se intenta en segundo plano;
// si falla (sin internet, error de red, etc.) se encola en localStorage y
// se reintenta más tarde (al recargar o al recuperar conexión).
import { supabase } from "./supabaseClient.js";

const IDMAP_KEY = "fitnet-v2-idmap";
const QUEUE_KEY = "fitnet-v2-syncqueue";
const TOUCHED_KEY = "fitnet-v2-touched";
const QUEUE_MAX = 300;

let status = {
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  authed: false,
  anonDisabled: false,
  lastSyncOk: null, // null = todavía no se intentó nada
};
const listeners = new Set();

function emit() {
  for (const cb of listeners) cb({ ...status });
}

export function subscribeSyncStatus(cb) {
  listeners.add(cb);
  cb({ ...status });
  return () => listeners.delete(cb);
}

export function getSyncStatus() {
  return { ...status };
}

function setStatus(patch) {
  status = { ...status, ...patch };
  emit();
}

// --- Mapeo de ids locales (strings tipo "rt-xxxx") a uuid remotos ---
// Las tablas routines/workouts/posts/exercise_comments/post_comments usan
// uuid como primary key; el store local usa ids cortos. Generamos y
// persistimos un uuid estable la primera vez que un id local necesita
// sincronizarse, para que las siguientes escrituras hagan upsert sobre la
// misma fila en vez de duplicarla.
function loadIdMap() {
  try {
    return JSON.parse(localStorage.getItem(IDMAP_KEY)) || {};
  } catch {
    return {};
  }
}
function saveIdMap(map) {
  try {
    localStorage.setItem(IDMAP_KEY, JSON.stringify(map));
  } catch {}
}
function remoteId(kind, localId) {
  if (!localId) return null;
  const map = loadIdMap();
  map[kind] ||= {};
  if (!map[kind][localId]) {
    map[kind][localId] = crypto.randomUUID();
    saveIdMap(map);
  }
  return map[kind][localId];
}

// Marca que el usuario generó datos propios (no solo el seed inicial).
// Se usa al cargar la app para decidir si tiene sentido ofrecer restaurar
// un snapshot remoto automáticamente.
export function markLocalWrite() {
  try {
    localStorage.setItem(TOUCHED_KEY, "1");
  } catch {}
}
function hasLocalProgress() {
  try {
    return localStorage.getItem(TOUCHED_KEY) === "1";
  } catch {
    return false;
  }
}

// --- Cola de reintentos ---
function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveQueue(q) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-QUEUE_MAX)));
  } catch {}
}
function enqueue(job) {
  const q = loadQueue().filter(
    (j) => !(j.table === job.table && j.key === job.key),
  );
  q.push(job);
  saveQueue(q);
}

async function runJob(job) {
  if (job.op === "delete") {
    const { error } = await supabase.from(job.table).delete().eq("id", job.key);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from(job.table)
    .upsert(job.row, job.conflict ? { onConflict: job.conflict } : undefined);
  if (error) throw error;
}

export async function flushQueue() {
  if (!supabase || !status.authed) return;
  const q = loadQueue();
  if (!q.length) return;
  const remaining = [];
  for (const job of q) {
    try {
      await runJob(job);
    } catch {
      remaining.push(job);
    }
  }
  saveQueue(remaining);
  setStatus({ lastSyncOk: remaining.length === 0 });
}

async function mirror(table, row, { conflict = "id", key } = {}) {
  const job = { table, op: "upsert", row, conflict, key: key ?? row.id };
  if (!supabase || !status.authed || !status.online) {
    enqueue(job);
    setStatus({ lastSyncOk: false });
    return;
  }
  try {
    await runJob(job);
    setStatus({ lastSyncOk: true });
  } catch {
    enqueue(job);
    setStatus({ lastSyncOk: false });
  }
}

async function mirrorDelete(table, id) {
  const job = { table, op: "delete", key: id };
  if (!supabase || !status.authed || !status.online) {
    enqueue(job);
    return;
  }
  try {
    await runJob(job);
  } catch {
    enqueue(job);
  }
}

// --- Espejos por operación de escritura de store.js ---

export function syncCreateRoutine(routine) {
  return mirror("routines", {
    id: remoteId("routines", routine.id),
    name: routine.name,
    description: routine.description || "",
    is_public: !!routine.isPublic,
    weeks: routine.weeks,
    easy_weeks: routine.easyWeeks || [],
    tech_weeks: routine.techWeeks || [],
    days: routine.days,
    copied_from: routine.copiedFrom
      ? remoteId("routines", routine.copiedFrom)
      : null,
  });
}
export const syncUpdateRoutine = syncCreateRoutine;
export const syncCopyRoutine = syncCreateRoutine;

export function syncDeleteRoutine(routineId) {
  return mirrorDelete("routines", remoteId("routines", routineId));
}

export function syncStartWorkout(workout) {
  return mirror("workouts", {
    id: remoteId("workouts", workout.id),
    routine_id: workout.routineId ? remoteId("routines", workout.routineId) : null,
    day_idx: workout.dayIdx,
    day_name: workout.dayName,
    week: workout.week,
    workout_date: workout.date,
  });
}

export function syncUpdateSet(workoutId, exId, setIdx, set) {
  return mirror(
    "workout_sets",
    {
      id: remoteId("workoutSets", `${workoutId}:${exId}:${setIdx}`),
      workout_id: remoteId("workouts", workoutId),
      ex_id: exId,
      set_idx: setIdx,
      weight: set.w ?? null,
      reps: set.r ?? null,
      done: !!set.done,
    },
    { key: `workout_sets:${workoutId}:${exId}:${setIdx}` },
  );
}

export function syncCreateExercise(ex) {
  return mirror("exercises", {
    id: ex.id,
    name: ex.name,
    primary_muscle: ex.primaryMuscle,
    muscles: ex.muscles || [],
    equipment: ex.equipment || null,
    tempo: ex.tempo || null,
    cue: ex.cue || null,
    video_url: ex.videoUrl || null,
  });
}

export function syncVoteExercise(exId, val) {
  return mirror(
    "exercise_votes",
    { ex_id: exId, vote: val },
    { conflict: "ex_id,user_id", key: `exercise_votes:${exId}` },
  );
}

export function syncExerciseComment(comment) {
  return mirror("exercise_comments", {
    id: remoteId("exComments", comment.id),
    ex_id: comment.exId,
    body: comment.body,
    likes: comment.likes,
  });
}

export function syncCreatePost(post) {
  return mirror("posts", {
    id: remoteId("posts", post.id),
    category: post.category,
    title: post.title,
    body: post.body,
    routine_ref: post.routineRef ? remoteId("routines", post.routineRef) : null,
    votes: post.votes,
  });
}
export const syncVotePost = syncCreatePost;

// Borra remotamente un entrenamiento y sus series (sin FK cascade asumida)
export async function syncDeleteWorkout(workoutId) {
  const rid = remoteId("workouts", workoutId);
  if (!supabase || !status.authed || !status.online) {
    enqueue({ table: "workouts", op: "delete", key: rid });
    return;
  }
  try {
    await supabase.from("workout_sets").delete().eq("workout_id", rid);
    await supabase.from("workouts").delete().eq("id", rid);
  } catch {
    enqueue({ table: "workouts", op: "delete", key: rid });
  }
}

export function syncDeletePost(postId) {
  return mirrorDelete("posts", remoteId("posts", postId));
}

export function syncPostComment(postId, comment) {
  return mirror("post_comments", {
    id: remoteId("postComments", comment.id),
    post_id: remoteId("posts", postId),
    body: comment.body,
    likes: comment.likes,
  });
}

// --- Snapshot completo (red de seguridad) ---
// Con debounce: se sube como mucho un snapshot por ráfaga de guardados
// (p. ej. registrar 10 series seguidas genera 1 snapshot, no 10).
let snapshotTimer = null;
export function scheduleSnapshot(getStateJSON) {
  if (!supabase) return;
  clearTimeout(snapshotTimer);
  snapshotTimer = setTimeout(async () => {
    if (!status.authed) return;
    try {
      const { error } = await supabase
        .from("state_snapshots")
        .insert({ payload: JSON.parse(getStateJSON()) });
      if (error) throw error;
      setStatus({ lastSyncOk: true });
      pruneSnapshots();
    } catch {
      setStatus({ lastSyncOk: false });
    }
  }, 3000);
}

// Conserva solo los snapshots más recientes para que la tabla no crezca
// sin límite (best-effort, un fallo aquí no importa).
async function pruneSnapshots(keep = 10) {
  try {
    const { data } = await supabase
      .from("state_snapshots")
      .select("id")
      .order("created_at", { ascending: false })
      .range(keep, keep + 49);
    if (data?.length)
      await supabase
        .from("state_snapshots")
        .delete()
        .in("id", data.map((r) => r.id));
  } catch {}
}

// --- Bootstrap: auth anónima + fusión de datos remotos al cargar ---
export async function initSync({ exportStateJSON, importStateJSON }) {
  if (!supabase) return;
  window.addEventListener("online", () => {
    setStatus({ online: true });
    flushQueue();
  });
  window.addEventListener("offline", () => setStatus({ online: false }));

  try {
    const { data } = await supabase.auth.getSession();
    let session = data?.session;
    if (!session) {
      const { data: signInData, error } = await supabase.auth.signInAnonymously();
      if (error) {
        // Solo tratamos como "provider deshabilitado" el error específico de
        // Supabase para eso; cualquier otro fallo (sin internet, timeout,
        // proxy bloqueando la salida, etc.) se trata como "sin conexión" y
        // se reintentará solo en la próxima carga o al recuperar señal.
        const disabled =
          error.code === "anonymous_provider_disabled" ||
          /anonymous sign-?ins? .*disabled/i.test(error.message || "");
        setStatus({ authed: false, anonDisabled: disabled, online: disabled ? status.online : false });
        return;
      }
      session = signInData?.session;
    }
    if (!session) return;
    setStatus({ authed: true });
  } catch {
    // Fallo de red al hablar con Supabase (sin internet, DNS, proxy, etc.)
    setStatus({ authed: false, online: false });
    return;
  }

  // Fusión: si el dispositivo no tiene progreso propio, y hay un snapshot
  // remoto, se restaura automáticamente. Si ambos existen, se pregunta.
  try {
    const { data: snap } = await supabase
      .from("state_snapshots")
      .select("payload, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (snap?.payload) {
      const remoteJSON = JSON.stringify(snap.payload);
      if (!hasLocalProgress()) {
        importStateJSON(remoteJSON);
      } else if (remoteJSON !== exportStateJSON()) {
        const replace = window.confirm(
          "Se encontraron datos guardados en la nube. ¿Quieres reemplazar los datos de este dispositivo con los de la nube?",
        );
        if (replace) importStateJSON(remoteJSON);
      }
    }
  } catch {
    // sin conexión o sin snapshot todavía: seguimos con los datos locales
  }

  flushQueue();
}
