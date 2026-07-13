import "./style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { jsx as Ze } from "react/jsx-runtime";
import { te } from "./components/App.jsx";
import { q, H, Oe, He } from "./data/store.js";
import { initSync } from "./data/sync.js";

// Inicializa/migra el "storage" local ANTES de que se monte la app
q();
H();

createRoot(document.getElementById("root")).render(
  Ze(StrictMode, { children: Ze(te, {}) }),
);

// Auth anónima + fusión con la nube: corre en paralelo, sin bloquear el
// primer render (la app ya se ve/usa con los datos locales de inmediato).
initSync({ exportStateJSON: Oe, importStateJSON: He });
