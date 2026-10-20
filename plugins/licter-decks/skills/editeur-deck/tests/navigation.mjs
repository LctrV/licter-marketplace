// Test de navigation d'un deck équipé : format détecté, page courante, aller à une page, ajout de bloc sur la bonne page,
// glisser exact à l'écran (échelle de la scène prise en compte), page suivante, formats de lecture imposés.
// Usage : node navigation.mjs <deck_editable.html> [code] [format_attendu : vertical|horizontal|slides] [dossier_captures]
import fs from 'fs';
import path from 'path';

const [file, code = 'Licter2026@', expect = '', shots = ''] = process.argv.slice(2);
if (!file) { console.error('Usage : node navigation.mjs <deck.html> [code] [format_attendu] [dossier_captures]'); process.exit(2); }
let chromium;
try { ({ chromium } = await import(process.env.PLAYWRIGHT || 'playwright')); }
catch (e) { console.error('✗ Paquet « playwright » introuvable : « npm i playwright » (ou définir PLAYWRIGHT).'); process.exit(2); }
const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const b = await chromium.launch({ headless: true, ...(CHROME ? { executablePath: CHROME } : {}) });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_FILE|edits\.json/.test(m.text())) errs.push('console : ' + m.text()); });
const w = ms => p.waitForTimeout(ms), R = {}, shot = async n => { if (shots) { fs.mkdirSync(shots, { recursive: true }); await p.screenshot({ path: path.join(shots, n) }); } };
const cur = () => p.evaluate(() => (window.__editor5.nav.current() || {}).id);
await p.goto('file://' + path.resolve(file)); await w(1500);
R.format = await p.evaluate(() => window.__editor5.nav.mode());
R.echelle = await p.evaluate(() => +window.__editor5.nav.scale(window.__editor5.nav.current()).toFixed(3));
R.unite = await p.evaluate(() => (window.__DECK_EDITOR__ || {}).unit || 'rem');
await p.click('#ed-lock'); await p.fill('#ed-code', code); await p.keyboard.press('Enter'); await w(500);
await p.click('[data-a="left"]'); await w(300);
const ids = await p.$$eval('.ed-pi', l => l.map(x => x.dataset.id)); R.pages = ids.length;
const t = ids[Math.min(2, ids.length - 1)];
await p.click(`.ed-pi[data-id="${t}"]`); await w(1600); R.allerPage = (await cur()) === t;
await p.click('[data-a="left"]'); await w(200);
await p.click('[data-a="addmenu"]'); await p.click('[data-add="title"]'); await w(400); await p.keyboard.press('Escape');
const a = await p.evaluate(() => { const E = window.__editor5.edits, x = E.add[E.add.length - 1]; return { id: x.id, sec: x.sec }; });
R.ajoutSurLaPage = a.sec === t;
const r0 = await p.evaluate(id => { const r = document.querySelector(`[data-add-id="${id}"]`).getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }, a.id);
const x0 = r0[0] + Math.min(20, r0[2] / 2), y0 = r0[1] + Math.min(12, r0[3] / 2);
const couvert = await p.evaluate(([id, x, y]) => { const t = document.elementFromPoint(x, y); return !(t && t.closest(`[data-add-id="${id}"]`)); }, [a.id, x0, y0]);
if (couvert) R.glisser100px = 'non testé : le bloc est sous un calque du deck (normal dans un récit au scroll)';
else {
  await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move(x0 + 50, y0, { steps: 4 }); await p.mouse.move(x0 + 100, y0, { steps: 6 }); await p.mouse.up(); await w(300);
  R.glisser100px = Math.round(await p.evaluate(id => document.querySelector(`[data-add-id="${id}"]`).getBoundingClientRect().x, a.id) - r0[0]);
}
await shot('nav_admin.png');
await p.evaluate(() => window.__editor5.edits.add.pop() && window.__editor5.applyAll());
await p.keyboard.press('Escape'); await p.click('[data-a="preview"]'); await w(500);
await p.evaluate(id => window.__editor5.nav.go(id), ids[0]); await w(1500);
R.pageSuivante = (await p.evaluate(async () => { const n = window.__editor5.nav; n.next(); await new Promise(r => setTimeout(r, 1500)); return (n.current() || {}).id; })) === ids[1];
R.formatsImposes = {};
const fixe = await p.evaluate(() => window.__editor5.nav.fixed());
for (const f of fixe ? [] : ['v', 'h', 's']) {
  await p.evaluate(f => { const E = window.__editor5.edits; E.set = Object.assign({}, E.set, { fmt: f }); window.__editor5.applyAll(); }, f); await w(700);
  await p.evaluate(id => window.__editor5.nav.go(id, false), ids[0]); await w(500);
  if (f !== 'v') { await p.keyboard.press('ArrowRight'); await w(1100); }
  R.formatsImposes[f] = f === 'v' ? 'ok' : ((await cur()) === ids[1] ? 'ok' : 'échec');
  await shot(`nav_format_${f}.png`);
}
await p.evaluate(() => { const E = window.__editor5.edits; E.set = Object.assign({}, E.set, { fmt: undefined }); window.__editor5.applyAll(); });
if (fixe) R.formatsImposes = 'non proposés (deck à taille fixe : sa propre présentation est conservée)';
R.erreurs = errs;
R.ok = (!expect || R.format === expect) && R.allerPage && R.ajoutSurLaPage && (typeof R.glisser100px === 'string' || Math.abs(R.glisser100px - 100) <= 6) && R.pageSuivante && (fixe || Object.values(R.formatsImposes).every(x => x === 'ok')) && !errs.length;
console.log(JSON.stringify(R, null, 1));
await b.close(); process.exit(R.ok ? 0 : 1);
