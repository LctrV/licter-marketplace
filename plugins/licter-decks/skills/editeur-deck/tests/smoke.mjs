// Test de fumée d'un deck équipé de l'éditeur Licter.
// Usage : node smoke.mjs <deck_editable.html> [code] [dossier_captures]
// Prérequis : le paquet « playwright » (npm i playwright) ; utilise Chrome installé, sinon le Chromium de Playwright.
// Vérifie : ouverture sans erreur, connexion admin, chaque bloc du menu « Ajouter », chaque outil, aperçu lecteur, débordement mobile.
import fs from 'fs';
import path from 'path';

const [file, code = 'Licter2026@', shots = ''] = process.argv.slice(2);
if (!file) { console.error('Usage : node smoke.mjs <deck.html> [code] [dossier_captures]'); process.exit(2); }
let chromium;
try { ({ chromium } = await import(process.env.PLAYWRIGHT || 'playwright')); }
catch (e) { console.error('✗ Paquet « playwright » introuvable : lancez « npm i playwright » dans ce dossier (ou définissez PLAYWRIGHT).'); process.exit(2); }

const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const b = await chromium.launch({ headless: true, ...(CHROME ? { executablePath: CHROME } : {}) });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const errs = []; let ctx = 'ouverture';
p.on('pageerror', e => errs.push(`${ctx} :: ${e.message}`));
p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|cdnjs|jsdelivr|ERR_FILE_NOT_FOUND|edits\.json/.test(m.text())) errs.push(`${ctx} :: console : ${m.text()}`); });
p.on('dialog', d => d.dismiss());
const w = ms => p.waitForTimeout(ms), shot = async n => { if (shots) { fs.mkdirSync(shots, { recursive: true }); await p.screenshot({ path: path.join(shots, n) }); } };
const R = {};
await p.goto('file://' + path.resolve(file)); await w(1200);
R.sections = await p.evaluate(() => { const c = (window.__DECK_EDITOR__ || {}).root || '#app5', r = document.querySelector(c); return r ? r.querySelectorAll(':scope > section').length : -1; });
R.verrou = !!(await p.$('#ed-lock'));
ctx = 'connexion';
await p.click('#ed-lock'); await p.fill('#ed-code', code); await p.keyboard.press('Enter'); await w(600);
R.admin = await p.evaluate(() => document.body.classList.contains('ed-on'));
if (!R.admin) { console.log(JSON.stringify({ ...R, erreurs: errs, ok: false }, null, 1)); await b.close(); process.exit(1); }
await shot('1_admin.png');
const menu = async (open, sel) => { await p.keyboard.press('Escape'); await p.click(open); const el = await p.$(sel); if (el) await Promise.race([el.click().catch(() => {}), w(1500)]); await w(180); await p.keyboard.press('Escape'); await p.evaluate(() => { const m = document.getElementById('ed-modal'); if (m) m.hidden = true; }); };
await p.click('[data-a="addmenu"]'); const adds = await p.$$eval('[data-add]', l => l.map(x => x.dataset.add)); await p.keyboard.press('Escape');
const blocsKO = [];
for (const k of adds) { ctx = 'bloc ' + k; const n0 = errs.length; await menu('[data-a="addmenu"]', `[data-add="${k}"]`); if (errs.length > n0) blocsKO.push(k); }
await p.click('[data-a="toolsmenu"]'); const tools = await p.$$eval('#ed-toolsmenu [data-a]', l => l.map(x => x.dataset.a)); await p.keyboard.press('Escape');
const outilsKO = [];
for (const k of tools) { if (['present', 'download', 'zip', 'pdf', 'pptx'].includes(k)) continue; ctx = 'outil ' + k; const n0 = errs.length; await menu('[data-a="toolsmenu"]', `#ed-toolsmenu [data-a="${k}"]`); if (errs.length > n0) outilsKO.push(k); }
R.blocs = `${adds.length - blocsKO.length}/${adds.length}`; R.outils = `${tools.length - outilsKO.length}/${tools.length}`; R.blocsKO = blocsKO; R.outilsKO = outilsKO;
await shot('2_blocs.png');
ctx = 'aperçu lecteur'; await p.click('[data-a="preview"]'); await w(500); await shot('3_lecteur.png');
await p.setViewportSize({ width: 390, height: 800 }); await w(500);
R.debordementMobile = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
R.erreurs = [...new Set(errs)].slice(0, 30);
R.ok = !R.erreurs.length && R.debordementMobile <= 0 && R.sections > 0;
console.log(JSON.stringify(R, null, 1));
await b.close(); process.exit(R.ok ? 0 : 1);
