// Récupère les horaires de prière de la Mosquée de Courbevoie sur Masjidbox
// et les enregistre dans horaires.json (lu par le site).
import { readFile, writeFile } from "node:fs/promises";

const URL_MOSQUEE = "https://masjidbox.com/horaires-de-priere/mosquee-de-courbevoie";
const FICHIER = new URL("../horaires.json", import.meta.url);
const NOMS = { fajr: "fajr", chourouq: "chourouq", dohr: "dhuhr", asr: "asr", maghrib: "maghrib", icha: "isha", joumoua: "joumoua" };
const GARDER_JOURS = 45;

const rep = await fetch(URL_MOSQUEE, { headers: { "User-Agent": "cap-quotidien/1.0 (+github pages)" } });
if (!rep.ok) throw new Error("Masjidbox a répondu " + rep.status);
const html = await rep.text();

// Les horaires sont dans les blocs JSON-LD de la page (un événement par prière).
const blocs = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const jours = {};
for (const b of blocs) {
  let data;
  try { data = JSON.parse(b); } catch { continue; }
  for (const ev of Array.isArray(data) ? data : [data]) {
    if (ev?.["@type"] !== "Event" || !ev.startDate || !ev.name) continue;
    const nom = ev.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/(fajr|chourouq|dohr|asr|maghrib|icha|joumoua)/);
    const m = ev.startDate.match(/^(\d{4}-\d\d-\d\d)T(\d\d:\d\d)/);
    if (!nom || !m) continue;
    (jours[m[1]] ??= {})[NOMS[nom[1]]] = m[2];
  }
}

const nb = Object.keys(jours).length;
if (nb === 0) throw new Error("Aucun horaire trouvé : la page Masjidbox a peut-être changé.");

let ancien = { jours: {} };
try { ancien = JSON.parse(await readFile(FICHIER, "utf8")); } catch {}
const tous = { ...ancien.jours, ...jours };
const limite = new Date(Date.now() - GARDER_JOURS * 864e5).toISOString().slice(0, 10);
const garde = Object.fromEntries(Object.entries(tous).filter(([d]) => d >= limite).sort());

const sortie = {
  mosquee: "Mosquée de Courbevoie",
  source: URL_MOSQUEE,
  jours: garde,
};
const avant = JSON.stringify(ancien.jours ?? {});
if (avant === JSON.stringify(garde)) {
  console.log("Horaires déjà à jour.");
} else {
  sortie.misAJour = new Date().toISOString();
  await writeFile(FICHIER, JSON.stringify(sortie, null, 1) + "\n");
  console.log(`horaires.json mis à jour (${nb} jours récupérés).`);
}
