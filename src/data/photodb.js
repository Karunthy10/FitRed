// Almacén de fotos de progreso en IndexedDB (localStorage tiene límite de
// ~5 MB en Safari; IndexedDB aguanta cientos de fotos). Migra automáticamente
// las fotos que estuvieran en localStorage ("kilo-photos").

const DB = "kilo-photos-db";
const STORE = "photos";
const LEGACY_KEY = "kilo-photos";

function open() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "at" });
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

function tx(db, mode, fn) {
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => res(out?.result !== undefined ? out.result : undefined);
    t.onerror = () => rej(t.error);
  });
}

async function migrateLegacy(db) {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const legacy = JSON.parse(raw) || [];
    await tx(db, "readwrite", (s) => {
      for (const p of legacy) s.put(p);
    });
    localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

export async function listPhotos() {
  try {
    const db = await open();
    await migrateLegacy(db);
    const all = await new Promise((res, rej) => {
      const req = db.transaction(STORE).objectStore(STORE).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
    return all.sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}

export async function addPhoto(photo) {
  try {
    const db = await open();
    await tx(db, "readwrite", (s) => s.put(photo));
  } catch {}
}

export async function deletePhoto(at) {
  try {
    const db = await open();
    await tx(db, "readwrite", (s) => s.delete(at));
  } catch {}
}
