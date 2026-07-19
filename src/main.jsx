import "./style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { jsx as Ze } from "react/jsx-runtime";
import { te } from "./components/App.jsx";
import { q, H, Oe, He, pref, usr, meId } from "./data/store.js";
import { initSync } from "./data/sync.js";

// Inicializa/migra el "storage" local ANTES de que se monte la app
q();
H();

createRoot(document.getElementById("root")).render(
  Ze(StrictMode, { children: Ze(te, {}) }),
);

// Auth anónima + fusión con la nube: corre en paralelo, sin bloquear el
// primer render (la app ya se ve/usa con los datos locales de inmediato).
initSync({ exportStateJSON: Oe, importStateJSON: He, getMe: () => usr(meId()) });

// Recordatorio de entrenar: dispara una notificación a la hora elegida
// mientras la app esté abierta o en segundo plano (los recordatorios con la
// app cerrada requieren push del servidor — pendiente de backend).
let lastReminded = null;
setInterval(() => {
  try {
    if (!pref("reminderOn", false)) return;
    const now = new Date();
    const hhmm = now.toTimeString().slice(0, 5);
    const day = now.toISOString().slice(0, 10);
    if (hhmm === pref("reminderTime", "18:00") && lastReminded !== day) {
      lastReminded = day;
      if (typeof Notification !== "undefined" && Notification.permission === "granted")
        new Notification("Kilo", { body: "Hora de entrenar. Tu sesión te espera." });
    }
  } catch {}
}, 30000);
