// Smoke test end-to-end de Kilo.
// Uso: npm run build && npm run e2e
// Requiere Playwright (npm i -D playwright) o las rutas de entorno:
//   PLAYWRIGHT_MODULE  ruta al paquete playwright
//   CHROMIUM_PATH      ruta al binario de Chromium
import { spawn } from "node:child_process";

const PW = process.env.PLAYWRIGHT_MODULE || "playwright";
const CHROME = process.env.CHROMIUM_PATH; // opcional
let chromium;
try {
  ({ chromium } = await import(PW));
} catch {
  console.error(`No se encontró Playwright ("${PW}"). Instala con: npm i -D playwright`);
  process.exit(2);
}

// Levanta vite preview
const server = spawn("npx", ["vite", "preview", "--port", "4199"], {
  stdio: "ignore",
  detached: true,
});
const kill = () => {
  try {
    process.kill(-server.pid);
  } catch {}
};
process.on("exit", kill);
await new Promise((r) => setTimeout(r, 3000));

const browser = await chromium.launch(
  CHROME ? { executablePath: CHROME } : {},
);
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

const fail = (msg) => {
  console.error("✗ " + msg);
  process.exitCode = 1;
};
const ok = (msg) => console.log("✓ " + msg);

await page.goto("http://localhost:4199/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// Onboarding con nombre
if (await page.locator(".card.welcome").count()) {
  await page.locator(".card.welcome input").fill("tester");
  await page.locator("button", { hasText: "Empezar" }).first().click();
  await page.waitForTimeout(300);
  const name = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("fitnet-v2"));
    return s.users[s.me].username;
  });
  name === "tester" ? ok("onboarding guarda username") : fail("username no guardado: " + name);
}

// Las 5 pestañas cargan (lazy)
for (const t of ["Rutinas", "Ejercicios", "Progreso", "Comunidad", "Entrenar"]) {
  await page.locator("nav button", { hasText: t }).click();
  await page.waitForTimeout(400);
}
ok("5 pestañas navegables");

// Sesión: registrar serie y timer
await page.locator(".card.day").first().click();
await page.waitForTimeout(500);
const row = page.locator(".setrow").first();
await row.locator("input").nth(0).fill("60");
await row.locator("input").nth(1).fill("8");
await row.locator("button.ok").click();
await page.waitForTimeout(300);
(await page.locator(".timerbar2").count())
  ? ok("serie registrada arranca descanso")
  : fail("timer de descanso no apareció");
await page.locator("button.back", { hasText: "Terminar" }).click();
await page.waitForTimeout(300);
await page.locator("button", { hasText: "Listo" }).click().catch(() => {});
page.once("dialog", (d) => d.dismiss());
await page.waitForTimeout(300);

// Historial expandible
const hist = page.locator(".histrow").first();
if (await hist.count()) {
  await hist.click();
  await page.waitForTimeout(300);
  (await page.locator(".histdetail").count())
    ? ok("historial expandible")
    : fail("no se expandió el historial");
}

if (errors.length) fail("errores de runtime:\n" + errors.join("\n"));
else ok("sin errores de runtime");

await browser.close();
kill();
process.exit(process.exitCode || 0);
