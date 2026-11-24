// Cap Quotidien : widget iPhone (appli gratuite « Scriptable »).
// Affiche la prochaine prière avec un compte à rebours, et les 5 prières du jour (taille moyenne).
// Les horaires viennent de horaires.json (mis à jour chaque nuit). Toucher le widget ouvre le site.

const SITE = "https://lyam92383-hue.github.io/cap-quotidien/";
const PRIERES = [["fajr", "Fajr"], ["dhuhr", "Dhuhr"], ["asr", "Asr"], ["maghrib", "Maghrib"], ["isha", "Isha"]];

const pad = (n) => String(n).padStart(2, "0");
const cle = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const jourPlus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
// "17:03" + un jour => une vraie date
const heure = (jour, hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || "");
  if (!m) return null;
  const d = new Date(jour);
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d;
};

// Les horaires : sur le réseau, sinon la dernière copie gardée sur le téléphone.
async function charger() {
  const fm = FileManager.local();
  const copie = fm.joinPath(fm.documentsDirectory(), "cap-horaires.json");
  try {
    const j = await new Request(SITE + "horaires.json").loadJSON();
    if (j && j.jours) { fm.writeString(copie, JSON.stringify(j)); return j; }
  } catch (e) {}
  try { return JSON.parse(fm.readString(copie)); } catch (e) { return null; }
}

// Les prières d'un jour, avec leur date exacte.
function duJour(data, jour) {
  const h = data && data.jours && data.jours[cle(jour)];
  if (!h) return [];
  return PRIERES.map(([id, nom]) => ({ id, nom, date: heure(jour, h[id]) })).filter((p) => p.date);
}

// La prochaine prière : celle d'aujourd'hui, sinon le Fajr de demain.
function prochaine(data, maintenant) {
  const auj = duJour(data, maintenant);
  const reste = auj.find((p) => p.date > maintenant);
  if (reste) return { prochaine: reste, jour: auj, demain: false };
  const dem = duJour(data, jourPlus(maintenant, 1));
  return { prochaine: dem[0] || null, jour: auj, demain: true };
}

// Date hégirienne (ex. « 14 Joumada II 1448 »), ou rien si l'appareil ne sait pas la calculer.
const MOIS_HEGIRE = ["Mouharram", "Safar", "Rabi I", "Rabi II", "Joumada I", "Joumada II", "Rajab", "Chaabane", "Ramadan", "Chawwal", "Dhou al-qida", "Dhou al-hijja"];
function hegire(d) {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(d);
    const v = (t) => Number(parts.find((x) => x.type === t).value);
    return v("day") + " " + MOIS_HEGIRE[v("month") - 1] + " " + v("year");
  } catch (e) { return ""; }
}
const hhmm = (d) => pad(d.getHours()) + ":" + pad(d.getMinutes());

// Écran de verrouillage : iOS les affiche en une seule teinte (celle de ton fond d'écran).
function accessoire(w, taille, p, data, maintenant, demain) {
  w.url = SITE + "#foi";
  if (taille === "accessoryInline") {
    w.addText(p.nom + " " + hhmm(p.date));
  } else if (taille === "accessoryCircular") {
    const a = w.addText(p.nom);
    a.font = Font.semiboldSystemFont(11);
    const b = w.addText(hhmm(p.date));
    b.font = Font.boldSystemFont(14);
  } else {
    const lieu = w.addText((data && data.mosquee) || "Cap Quotidien");
    lieu.font = Font.mediumSystemFont(11);
    lieu.lineLimit = 1;
    const date = hegire(maintenant);
    if (date) { const d = w.addText(date); d.font = Font.systemFont(11); d.lineLimit = 1; }
    const ligne = w.addStack();
    const n = ligne.addText((demain ? "Demain · " : "") + p.nom + " ");
    n.font = Font.boldSystemFont(14);
    const t = ligne.addDate(p.date);
    t.applyTimerStyle(); // compte à rebours en direct
    t.font = Font.boldSystemFont(14);
  }
  w.refreshAfterDate = new Date(Math.min(p.date.getTime() + 60000, maintenant.getTime() + 30 * 60000));
  return w;
}

const BLEU = new Color("#2b62d9");
const BLEU_FONCE = new Color("#16306e");

async function construire() {
  const data = await charger();
  const maintenant = new Date();
  const info = data ? prochaine(data, maintenant) : { prochaine: null, jour: [], demain: false };
  const taille = config.widgetFamily || "medium";

  const w = new ListWidget();
  w.url = SITE + "#foi";
  const fond = new LinearGradient();
  fond.colors = [BLEU, BLEU_FONCE];
  fond.locations = [0, 1];
  w.backgroundGradient = fond;
  w.setPadding(14, 16, 14, 16);

  if (!info.prochaine) {
    const t = w.addText("Horaires indisponibles");
    t.textColor = Color.white();
    t.font = Font.semiboldSystemFont(14);
    const s = w.addText("Ouvre Cap Quotidien une fois avec du réseau.");
    s.textColor = new Color("#ffffff", 0.75);
    s.font = Font.systemFont(11);
    return w;
  }

  const p = info.prochaine;
  if (String(taille).startsWith("accessory")) return accessoire(w, taille, p, data, maintenant, info.demain);
  const colonne = taille === "medium" || taille === "large" ? w.addStack() : w;
  const gauche = colonne === w ? w : colonne.addStack();
  if (colonne !== w) gauche.layoutVertically();

  const titre = gauche.addText(info.demain ? "Demain" : "Prochaine prière");
  titre.textColor = new Color("#ffffff", 0.75);
  titre.font = Font.mediumSystemFont(11);
  gauche.addSpacer(2);
  const nom = gauche.addText(p.nom);
  nom.textColor = Color.white();
  nom.font = Font.boldSystemFont(taille === "small" ? 26 : 30);
  const h = gauche.addText(pad(p.date.getHours()) + ":" + pad(p.date.getMinutes()));
  h.textColor = Color.white();
  h.font = Font.semiboldSystemFont(taille === "small" ? 20 : 22);
  gauche.addSpacer(4);
  const reste = gauche.addDate(p.date);
  reste.applyTimerStyle(); // compte à rebours en direct
  reste.textColor = new Color("#ffffff", 0.85);
  reste.font = Font.mediumSystemFont(13);

  if (colonne !== w) {
    colonne.addSpacer();
    const droite = colonne.addStack();
    droite.layoutVertically();
    droite.centerAlignContent();
    for (const q of info.jour) {
      const ligne = droite.addStack();
      const passee = q.date <= maintenant;
      const suivante = !info.demain && q.id === p.id;
      const a = ligne.addText(q.nom);
      a.font = suivante ? Font.boldSystemFont(13) : Font.systemFont(13);
      ligne.addSpacer();
      const b = ligne.addText(pad(q.date.getHours()) + ":" + pad(q.date.getMinutes()));
      b.font = suivante ? Font.boldSystemFont(13) : Font.systemFont(13);
      for (const t of [a, b]) t.textColor = new Color("#ffffff", passee ? 0.45 : 1);
      droite.addSpacer(3);
    }
    droite.size = new Size(130, 0);
  }

  // iOS décide du vrai moment du rafraîchissement ; on demande juste après la prochaine prière.
  w.refreshAfterDate = new Date(Math.min(p.date.getTime() + 60000, maintenant.getTime() + 30 * 60000));
  return w;
}

const widget = await construire();
if (config.runsInWidget) Script.setWidget(widget);
else await widget.presentMedium();
Script.complete();
