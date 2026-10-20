// Test de la vue présentateur : fenêtre à part, miniatures, notes, chronomètres, navigation dans les deux sens,
// écran noir, surcouche (Maj + P), repli si les fenêtres sont bloquées, touche P ignorée quand l'éditeur Licter est actif.
// Usage : node presentateur.mjs <deck_avec_presentateur.html> [dossier_captures]
import fs from 'fs';
import path from 'path';

const [file, shots = ''] = process.argv.slice(2);
if (!file) { console.error('Usage : node presentateur.mjs <deck.html> [dossier_captures]'); process.exit(2); }
let chromium;
try { ({ chromium } = await import(process.env.PLAYWRIGHT || 'playwright')); }
catch (e) { console.error('✗ Paquet « playwright » introuvable : « npm i playwright » (ou définir PLAYWRIGHT).'); process.exit(2); }
const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '/usr/bin/google-chrome'].find(p => fs.existsSync(p));
const b = await chromium.launch({ headless: true, ...(CHROME ? { executablePath: CHROME } : {}) });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage(); const errs = [];
const watch = pg => { pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_FILE|edits\.json|favicon/.test(m.text())) errs.push('console : ' + m.text()); }); };
watch(p);
const w = ms => p.waitForTimeout(ms), R = {};
const shot = async (pg, n) => { if (shots) { fs.mkdirSync(shots, { recursive: true }); await pg.screenshot({ path: path.join(shots, n) }); } };
const cur = () => p.evaluate(() => window.__PRESENTATEUR__ && (window.__DECK__ ? window.__DECK__.current() : null));

await p.goto('file://' + path.resolve(file)); await w(600);
R.script = await p.evaluate(() => !!window.__PRESENTATEUR__ && !window.__PRESENTATEUR__.apercu);
R.notesMasquees = await p.evaluate(() => [...document.querySelectorAll('section aside.notes')].every(n => getComputedStyle(n).display === 'none'));
const ids = await p.evaluate(() => (window.__DECK__ ? window.__DECK__.ids() : [...document.querySelectorAll('section[id]')].map(s => s.id)));
R.sections = ids.length;

// 1. Fenêtre présentateur
const [pop] = await Promise.all([ctx.waitForEvent('page'), p.keyboard.press('p')]);
watch(pop); await pop.waitForSelector('#pv'); await pop.setViewportSize({ width: 1280, height: 800 }); await pop.waitForTimeout(1500);
R.fenetre = (await p.evaluate(() => window.__PRESENTATEUR__.etat().mode)) === 'fenetre';
const pos = () => pop.$eval('[data-r="pos"]', e => e.textContent);
R.position1 = (await pos()).startsWith('1 / ' + ids.length);
R.notes1 = (await pop.$eval('[data-r="notes"]', e => e.textContent.trim().length)) > 0 || 'vide';
const apercus = () => pop.evaluate(() => [...document.querySelectorAll('iframe')].map(f => { try { return f.contentWindow.__DECK__ ? f.contentWindow.__DECK__.current() : 'sans-api'; } catch (e) { return 'inaccessible'; } }));
let ap = await apercus(); R.miniatures = ap.length === 2 && ap[0] === ids[0] && ap[1] === ids[1] ? true : ap;
R.notesCacheesDansMiniatures = await pop.evaluate(() => [...document.querySelectorAll('iframe')].every(f => [...f.contentDocument.querySelectorAll('aside.notes')].every(n => f.contentWindow.getComputedStyle(n).display === 'none')));
await shot(pop, 'presentateur-1.png');

// 2. Navigation depuis la fenêtre présentateur
await pop.keyboard.press('ArrowRight'); await pop.waitForTimeout(700);
R.suivanteDepuisPresentateur = (await cur()) === ids[1];
R.position2 = (await pos()).startsWith('2 / ');
ap = await apercus(); R.miniaturesSuivent = ap[0] === ids[1] && ap[1] === ids[2] ? true : ap;
R.dureeCible = await pop.$eval('[data-r="tcible"]', e => e.textContent);
R.rythme = await pop.$eval('[data-r="rythme"]', e => e.textContent);

// 3. Navigation depuis le deck (écran projeté)
await p.bringToFront(); await p.keyboard.press('ArrowRight'); await w(900);
R.synchroDepuisDeck = (await pos()).startsWith('3 / ');
R.notesHtml = await pop.$eval('[data-r="notes"]', e => e.innerHTML.includes('<br>'));

// 4. Écran noir, pause, liste
await pop.bringToFront(); await pop.keyboard.press('b'); await pop.waitForTimeout(200);
R.ecranNoir = await p.evaluate(() => !!document.querySelector('.pv-noir'));
await pop.keyboard.press('b'); await pop.waitForTimeout(200);
R.ecranNoirOff = await p.evaluate(() => !document.querySelector('.pv-noir'));
await pop.keyboard.press('t'); await pop.waitForTimeout(150);
R.pause = (await pop.$eval('[data-a="pause"]', e => e.textContent)) === 'Reprendre';
await pop.keyboard.press('t');
await pop.selectOption('[data-r="liste"]', ids[0]); await pop.waitForTimeout(500);
R.listeAllerA = (await cur()) === ids[0];
await shot(pop, 'presentateur-2.png');

// 5. Fermeture
await pop.close(); await w(800);
R.fermeture = (await p.evaluate(() => window.__PRESENTATEUR__.etat().mode)) === null;

// 6. Surcouche (Maj + P)
await p.keyboard.press('Shift+P'); await w(1200);
R.surcouche = await p.evaluate(() => !!document.querySelector('.pv') && window.__PRESENTATEUR__.etat().mode === 'surcouche');
await p.keyboard.press('ArrowRight'); await w(500);
R.surcoucheNavigue = (await cur()) === ids[1];
await shot(p, 'presentateur-surcouche.png');
await p.keyboard.press('Escape'); await w(300);
R.surcoucheFermee = await p.evaluate(() => !document.querySelector('.pv'));

// 7. Fenêtres bloquées : repli sur la surcouche
await p.evaluate(() => { window.__open = window.open; window.open = () => null; });
await p.keyboard.press('p'); await w(800);
R.replisSiBloque = await p.evaluate(() => window.__PRESENTATEUR__.etat().mode === 'surcouche');
await p.keyboard.press('Escape'); await w(200);
await p.evaluate(() => { window.open = window.__open; });

// 8. Éditeur Licter actif : la touche P lui appartient
await p.evaluate(() => document.body.classList.add('admin'));
await p.keyboard.press('p'); await w(400);
R.ignoreSiEditeur = await p.evaluate(() => window.__PRESENTATEUR__.etat().mode === null);
await p.evaluate(() => document.body.classList.remove('admin'));

R.erreurs = errs;
const ok = Object.entries(R).every(([k, v]) => k === 'erreurs' ? v.length === 0 : (k === 'sections' || k === 'dureeCible' || k === 'rythme') ? true : v === true);
console.log(JSON.stringify({ ok, ...R }, null, 1));
await b.close();
process.exit(ok ? 0 : 1);
