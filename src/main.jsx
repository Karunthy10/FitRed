import "./style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { jsx as Ze } from "react/jsx-runtime";
import { te } from "./components/App.jsx";
import { q, H } from "./data/store.js";

// Inicializa/migra el "storage" local ANTES de que se monte la app
q();
H();

createRoot(document.getElementById("root")).render(
  Ze(StrictMode, { children: Ze(te, {}) }),
);
