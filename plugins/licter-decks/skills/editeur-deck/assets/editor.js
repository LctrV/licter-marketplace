/* ==========================================================
   Éditeur admin complet de la V5 (accès par code).
   Toutes les modifications forment un « calque » de données (edits) appliqué
   par-dessus la page générée — rien n'est perdu au prochain build :
     el    : retouches des éléments générés (position, taille, rotation, texte, styles, effets, masquage)
     add   : éléments ajoutés (textes, blocs, image, forme, icône, graphique, tableau, jauge, frise, post…)
     pages : pages ajoutées ; order / hide / names / notes : ordre, masquage, noms et notes des pages
     bg    : fonds de page ; theme : couleurs et polices du document
   Les textes ajoutés acceptent des variables {{…}} recalculées avec les données du mois.
   Sources : edits.json publié avec l'artefact, sinon JSON embarqué (#edits5),
   plus un brouillon local proposé à la restauration.
   Enregistrement : artefact claude.ai → publication de edits.json (visible par tous) ;
   fichier local → navigateur + export JSON / HTML.
   Le code n'est vérifié que par son empreinte SHA-256 : verrou d'interface,
   les droits d'enregistrement réels sont ceux de l'artefact.
   ========================================================== */
(function () {
  'use strict';
  /* configuration du deck (window.__DECK_EDITOR__, posée avant ce script) ; valeurs par défaut = deck LVMH v5 */
  const CFG = Object.assign({ root: '#app5', client: 'LVMH', sector: 'luxe', hash: '85eb60620692ed49ebd59af42da637b7e22f7494179cacbb237c204e032c5edc', key: 'lvmh-v5-edits-', file: 'v5' }, window.__DECK_EDITOR__ || {});
  const HASH = CFG.hash, CLIENT = CFG.client, ROOT = CFG.root;
  const app = document.querySelector(ROOT) || document.getElementById('app5');
  const S = CFG.story || window.__STORY__ || {}, D = S.data || {}, LB = S.labels || {};
  const PERIOD = (S.meta && S.meta.period) || CFG.period || 'deck';
  const KEY = CFG.key + PERIOD;
  const SERIF = "'Cormorant Garamond', serif", SANS = 'Jost, system-ui, sans-serif', WM = "Tinos, 'Times New Roman', serif";
  const GFONTS = { 'Playfair Display': 'serif', 'Bodoni Moda': 'serif', 'Libre Baskerville': 'serif', 'DM Serif Display': 'serif', 'Montserrat': 'sans-serif', 'DM Sans': 'sans-serif', 'Space Mono': 'monospace' };
  const FONTS = [['Jost', SANS], ['Cormorant Garamond', SERIF], ['Tinos (' + CLIENT + ')', WM], ...Object.entries(GFONTS).map(([f, g]) => [f, `'${f}', ${g}`])];
  const PAL = ['#d8b47a', '#7f9cff', '#6fcf97', '#ff7a72', '#c9a0ff', '#4fd6e3', '#f2994a', '#f4f1ea'];
  const PALETTES = { maison: PAL, contraste: ['#f4f1ea', '#d8b47a', '#ff7a72', '#4fd6e3', '#6fcf97', '#c9a0ff'], or: ['#f0d6a6', '#d8b47a', '#b08a52', '#8a6a3a', '#5e4826', '#3a2c17'], froid: ['#cfe0ff', '#9fb6ff', '#7f9cff', '#5b78d9', '#3d58b0', '#2a3f85'], sentiment: ['#6fcf97', '#3f4b75', '#ff7a72'] };
  const DEFAULT_COLORS = ['#f4f1ea', '#b7bdd0', '#d8b47a', '#6fcf97', '#ff7a72', '#7f9cff', '#050a1f', '#0b1430'];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } },
  };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const uid = () => 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const r2 = v => Math.round(v * 100) / 100;
  const nfr = (v, d = 0) => (v == null || isNaN(v)) ? '' : Number(v).toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d }).replace(/ | /g, ' ');
  const sgn = (v, d = 1, suf = ' %') => (v == null || isNaN(v)) ? '' : (v > 0 ? '+' : v < 0 ? '−' : '') + nfr(Math.abs(v), d) + suf;

  /* ---------------- SHA-256 (verrou du code admin) ---------------- */
  function sha256(str) {
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const bytes = new TextEncoder().encode(str), l = bytes.length, n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n);
    m.set(bytes); m[l] = 0x80; const dv = new DataView(m.buffer); dv.setUint32(n - 4, l * 8);
    let h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const w = new Uint32Array(64), r = (x, c) => (x >>> c) | (x << (32 - c));
    for (let o = 0; o < n; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) { const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (hh + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h = h.map((x, i) => (x + [a, b, c, d, e, f, g, hh][i]) | 0);
    }
    return h.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }

  /* ---------------- état ---------------- */
  const DEFAULT_STYLES = [
    { id: 'h1', name: 'Titre principal', style: { fontFamily: SERIF, fontSize: '6rem', fontWeight: '500', lineHeight: '1.05', letterSpacing: '0em', color: '#f4f1ea' } },
    { id: 'h2', name: 'Titre de section', style: { fontFamily: SERIF, fontSize: '4.4rem', fontWeight: '500', lineHeight: '1.1', letterSpacing: '0em', color: '#f4f1ea' } },
    { id: 'sub', name: 'Sous-titre', style: { fontFamily: SERIF, fontSize: '3rem', fontStyle: 'italic', fontWeight: '500', lineHeight: '1.2', color: '#d8b47a' } },
    { id: 'kick', name: 'Surtitre', style: { fontFamily: SANS, fontSize: '1.3rem', fontWeight: '400', letterSpacing: '.32em', textTransform: 'uppercase', color: '#d8b47a' } },
    { id: 'body', name: 'Corps de texte', style: { fontFamily: SANS, fontSize: '1.8rem', fontWeight: '400', lineHeight: '1.55', color: '#b7bdd0' } },
    { id: 'cap', name: 'Légende', style: { fontFamily: SANS, fontSize: '1.3rem', fontStyle: 'italic', fontWeight: '300', lineHeight: '1.45', color: '#7480a3' } },
    { id: 'num', name: 'Grand chiffre', style: { fontFamily: SANS, fontSize: '10rem', fontWeight: '200', lineHeight: '1', letterSpacing: '-.03em', color: '#f4f1ea' } },
  ];
  const MOODS = {
    nuit: null,
    encre: { '--bg': '#0b1736', '--bg-2': '#13224a', '--bg-3': '#1b2d5c', '--navy': '#0b1736' },
    ivoire: { '--bg': '#f4f1ea', '--bg-2': '#e8e1d2', '--bg-3': '#ddd3bf', '--ink': '#101a33', '--ink-2': '#47506a', '--ink-3': '#7a8196', '--line': 'rgba(16,26,51,.14)', '--gold': '#9a7438', '--gold-2': '#7d5c2a' },
  };
  const GLOSS0 = [
    { t: 'EMV', d: 'Earned Media Value : valeur publicitaire estimée de la visibilité obtenue gratuitement (publications, reprises, influence).' },
    { t: 'Sentiment net', d: 'Part des publications positives moins part des publications négatives, sur l’ensemble des publications du mois.' },
    { t: 'Reach', d: 'Nombre estimé de personnes exposées aux publications.' },
    { t: 'Engagements', d: 'Total des interactions : mentions J’aime, commentaires, partages, enregistrements.' },
    { t: 'Social listening', d: 'Veille et analyse des conversations publiques sur les réseaux sociaux.' },
    { t: 'Score e-réputation', d: 'Indicateur Licter combinant un score de volume et un score de sentiment, comparable entre marques et dans le temps.' },
    { t: 'Owned', d: 'Contenus publiés par les comptes officiels du groupe (par opposition à l’earned, la conversation spontanée).' },
  ];
  const empty = () => ({ v: 4, el: {}, add: [], bg: {}, pages: [], order: null, hide: {}, names: {}, notes: {}, styles: JSON.parse(JSON.stringify(DEFAULT_STYLES)), lib: [], tr: {}, set: {}, paths: [], status: {}, vars: [], ptpl: [], guides: {}, gloss: null, done: {}, dur: {}, tasks: {}, alerts: [], peaks: {}, curve: {}, theme: { colors: DEFAULT_COLORS.slice(), fonts: [], mood: 'nuit' }, updated: null });
  const norm = j => { const o = Object.assign(empty(), j || {}, { v: 4 }); o.theme = Object.assign({ colors: DEFAULT_COLORS.slice(), fonts: [], mood: 'nuit' }, o.theme || {}); o.notes = o.notes || {}; o.lib = o.lib || []; o.tr = o.tr || {}; o.set = o.set || {}; o.paths = o.paths || []; o.status = o.status || {}; o.vars = o.vars || []; o.ptpl = o.ptpl || []; o.guides = o.guides || {}; o.done = o.done || {}; o.dur = o.dur || {}; o.tasks = o.tasks || {}; o.alerts = o.alerts || []; o.peaks = o.peaks || {}; o.curve = o.curve || {}; if (!Array.isArray(o.gloss)) o.gloss = JSON.parse(JSON.stringify(GLOSS0)); if (!Array.isArray(o.styles) || !o.styles.length) o.styles = JSON.parse(JSON.stringify(DEFAULT_STYLES)); return o; };
  let E = empty();
  try { const t = document.getElementById('edits5'); if (t && t.textContent.trim()) E = norm(JSON.parse(t.textContent)); } catch (e) { }
  const orig = {}, origBg = {};
  let undo = [], redo = [], dirty = false, artifact = null, assets = null, downloads = null, sampleFn = null, commentsNs = null, mode = 'local';
  let on = false, preview = false, presenting = false, sels = [], hovEl = null, editing = null, clip = null, savedRange = null, collapsed = false, gridOn = false, leftTab = 'pages';
  const baseOrder = [...app.children].map(s => s.id).filter(Boolean);
  const baseNames = {};
  document.querySelectorAll('#rail5 a').forEach(a => { baseNames[a.dataset.id] = a.textContent.trim(); baseNames['cls:' + a.dataset.id] = a.className.replace(/\bon\b/g, '').trim(); });
  baseNames.fin = baseNames.fin || 'Merci';

  /* ---------------- chemins stables (section + index des enfants) ---------------- */
  function sectionOf(el) { let n = el; while (n && n.parentElement !== app) n = n.parentElement; return n && n.tagName === 'SECTION' ? n : null; }
  function pathOf(el) {
    const sec = sectionOf(el); if (!sec || !sec.id) return null;
    const idx = []; let n = el;
    while (n !== sec) { const p = n.parentElement; idx.unshift([...p.children].indexOf(n)); n = p; }
    return sec.id + '>' + idx.join('.');
  }
  function byPath(p) {
    const [sid, rest] = String(p).split('>'); let n = document.getElementById(sid);
    if (!n || !rest) return n;
    for (const i of rest.split('.')) { n = n && n.children[+i]; }
    return n || null;
  }
  const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
  const boxOf = el => el.closest && el.closest('.mx5 .box');
  const unitOf = el => boxOf(el) ? 'px' : 'rem';
  const unitPx = el => { const b = boxOf(el); return b ? b.getBoundingClientRect().width / 1600 : remPx(); };
  const isAdd = el => !!(el && el.classList && el.classList.contains('ed-add'));
  const addOf = el => E.add.find(a => a.id === el.dataset.addId);
  const addEl = id => document.querySelector(`.ed-add[data-add-id="${id}"]`);
  const sel = () => sels[sels.length - 1] || null;
  let lang = 'fr', trackOn = false, pathSel = '', room = null;
  try { pathSel = localStorage.getItem('lvmh-path') || ''; } catch (e) { }
  const pathHid = id => { if (on || !pathSel) return false; const P = E.paths.find(x => x.id === pathSel); return !!(P && !P.pages.includes(id)); };
  try { lang = localStorage.getItem('lvmh-lang') || 'fr'; } catch (e) { }
  const hasTr = () => !!(E.tr && E.tr.en && Object.keys(E.tr.en).length);
  const curLang = () => (!on && lang === 'en' && hasTr()) ? 'en' : 'fr';
  const trOf = k => { const t = curLang() === 'en' && E.tr.en[k]; return t ? t.t : null; };
  const pageName0 = id => { const p = E.pages.find(x => x.id === id); return trOf('name:' + id) || E.names[id] || (p && p.name) || baseNames[id] || id; };
  const pageNameFr = id => { const p = E.pages.find(x => x.id === id); return E.names[id] || (p && p.name) || baseNames[id] || id; };
  const pageName = id => on ? pageNameFr(id) : pageName0(id);

  /* ================================================================
     VARIABLES DYNAMIQUES {{…}}
     ================================================================ */
  const TOKENS = (() => {
    const T = D.tot || {}, c = T.cur || {}, m1 = T.m1, y1 = T.y1, e = D.emv || {}, br = (D.baro && D.baro.brands) || {}, L = br[CLIENT] || {};
    const conc = D.conc || {}, rank = Object.keys(conc).sort((a, b) => conc[b] - conc[a]).indexOf(CLIENT) + 1;
    const top = (D.matrix || []).slice().sort((a, b) => b.volume - a.volume)[0];
    const ow = D.owned || {};
    const ev = (a, b) => (a != null && b) ? (a / b - 1) * 100 : null;
    return [
      ['mois', 'Mois du rapport', LB.period || ''],
      ['mois_precedent', 'Mois précédent', LB.m1period || ''],
      ['annee_precedente', 'Même mois N-1', LB.y1period || ''],
      ['publications', 'Publications', nfr(c.total)],
      ['publications_vs_m1', 'Publications vs M-1', sgn(ev(c.total, m1 && m1.total))],
      ['publications_vs_y1', 'Publications vs Y-1', sgn(ev(c.total, y1 && y1.total))],
      ['sentiment_net', 'Sentiment net', c.net != null ? sgn(c.net * 100) : ''],
      ['sentiment_vs_m1', 'Sentiment net vs M-1 (pts)', m1 ? sgn((c.net - m1.net) * 100, 1, ' pts') : ''],
      ['positif', 'Part positive', c.pos_pct != null ? nfr(c.pos_pct * 100, 1) + ' %' : ''],
      ['neutre', 'Part neutre', c.neu_pct != null ? nfr(c.neu_pct * 100, 1) + ' %' : ''],
      ['negatif', 'Part négative', c.neg_pct != null ? nfr(c.neg_pct * 100, 1) + ' %' : ''],
      ['emv', 'EMV', e.current ? nfr(e.current / 1e6, 1) + ' M€' : ''],
      ['emv_vs_m1', 'EMV vs M-1', sgn(ev(e.current, e.m1))],
      ['emv_vs_y1', 'EMV vs Y-1', sgn(ev(e.current, e.y1))],
      ['score', 'Score e-réputation', L.score_total ? nfr(L.score_total) : ''],
      ['score_vs_m1', 'Score vs M-1', sgn(ev(L.score_total, L.m1))],
      ['rang_benchmark', 'Rang dans le benchmark', rank > 0 ? rank + (rank === 1 ? 'er' : 'e') : ''],
      ['top_sujet', 'Sujet le plus discuté', top ? top.label : ''],
      ['top_sujet_volume', 'Volume du sujet n°1', top ? nfr(top.volume) : ''],
      ['nb_sujets', 'Sujets suivis', nfr((D.matrix || []).length)],
      ['impressions_owned', 'Impressions owned', ow.impressions && ow.impressions.current ? nfr(ow.impressions.current / 1e6, 1) + ' M' : ''],
      ...(() => { const H_ = (D.hist || []).filter(h => h.total); if (H_.length < 3) return []; const cur = H_[H_.length - 1], vs = H_.map(h => h.total), rk = vs.slice().sort((x, y) => y - x).indexOf(cur.total) + 1, rec = H_.reduce((x, y) => y.total > x.total ? y : x), nets = H_.filter(h => h.net != null), em = H_.filter(h => h.emv);
        return [['publications_moy', 'Moyenne mensuelle des publications (historique)', nfr(vs.reduce((x, y) => x + y, 0) / vs.length)], ['rang_historique', 'Rang du mois en volume (historique)', `${rk}${rk === 1 ? 'er' : 'e'} sur ${H_.length}`], ['mois_record', 'Mois record en volume', `${rec.label} ${rec.year}`], ['sentiment_moy', 'Sentiment net moyen (historique)', sgn(nets.reduce((x, y) => x + y.net, 0) / (nets.length || 1) * 100)], ['emv_cumul', 'EMV cumulée (historique)', nfr(em.reduce((x, y) => x + y.emv, 0) / 1e6, 1) + ' M€'], ['nb_mois', 'Mois d’historique', String(H_.length)]]; })(),
      ['spark_publications', 'Mini-courbe des publications (historique)', '〰'], ['spark_sentiment', 'Mini-courbe du sentiment (historique)', '〰'], ['spark_emv', 'Mini-courbe de l’EMV (historique)', '〰'],
      ['page', 'Numéro de la page', '·'],
      ['pages', 'Nombre de pages', '·'],
      ['engagements_owned', 'Engagements owned', ow.engagements && ow.engagements.current ? nfr(ow.engagements.current) : ''],
    ];
  })().filter(t => D.tot || (t[2] !== '' && t[2] != null && !/^spark_/.test(t[0])))
    /* variables propres au deck : __DECK_EDITOR__.tokens = { cle: 'valeur' } ou { cle: ['Libellé', 'valeur'] } */
    .concat(Object.entries(CFG.tokens || {}).map(([k, v]) => Array.isArray(v) ? [k, v[0], String(v[1] ?? '')] : [k, k, String(v ?? '')]));
  const TOKMAP = Object.fromEntries(TOKENS.map(t => [t[0], t[2]])), TOK0 = TOKENS.length;
  function varVal(v) {
    const ex = String(v.value || '');
    if (!ex.startsWith('=')) return tok(ex);
    let bad = false; const js = ex.slice(1).replace(/[a-z_][a-z0-9_]*/gi, k => { const n_ = numOf(TOKMAP[k]); if (n_ == null) { bad = true; return '0'; } return '(' + n_ + ')'; });
    if (bad || !/^[\d\s.+\-*/()]+$/.test(js)) return '#ERREUR';
    try { const r = Function('return (' + js + ')')(); return isFinite(r) ? nfr(r, +v.dec || 0) + (v.suf || '') : '#ERREUR'; } catch (e) { return '#ERREUR'; }
  }
  function applyVars() {
    TOKENS.splice(TOK0); Object.keys(TOKMAP).forEach(k => { if (!TOKENS.some(t => t[0] === k)) delete TOKMAP[k]; });
    E.vars.forEach(v => { if (!/^[a-z0-9_]+$/i.test(v.key || '')) return; TOKMAP[v.key] = varVal(v); TOKENS.push([v.key, '★ ' + (v.label || v.key), TOKMAP[v.key]]); });
  }
  const tok = s => String(s ?? '').replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (m, k) => k in TOKMAP ? TOKMAP[k] : m);
  const tokC = s => String(s ?? '').replace(/\{\{\s*spark_(publications|sentiment|emv)\s*\}\}/g, (m, k) => typeof sparkInline === 'function' ? sparkInline(k) : '').replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (m, k) => { if (!(k in TOKMAP)) return m; const v = TOKMAP[k]; return E.set && E.set.vcolor && /_vs_/.test(k) && /^[+−-]/.test(v) ? `<span class="ed-v ${v[0] === '+' ? 'pos' : 'neg'}">${v}</span>` : v; });
  function frTypo(html) {
    const t = document.createElement('template'); t.innerHTML = html; const w = document.createTreeWalker(t.content, NodeFilter.SHOW_TEXT); let n, open = true;
    while ((n = w.nextNode())) {
      n.nodeValue = n.nodeValue.split(/(\{\{[^}]*\}\}|https?:\S+|www\.\S+)/).map((seg, j) => j % 2 ? seg : seg.replace(/"/g, () => { const r = open ? '«\u202f' : '\u202f»'; open = !open; return r; })
        .replace(/'/g, '’').replace(/\.\.\./g, '…').replace(/ +([;:!?»%€])/g, '\u202f$1').replace(/« +/g, '«\u202f').replace(/(\d) (\d{3})\b/g, '$1\u202f$2')).join('');
    }
    return t.innerHTML;
  }

  /* ================================================================
     ICÔNES (traits 24×24)
     ================================================================ */
  const ICONS = {
    'Flèche': 'M5 12h14M12 5l7 7-7 7', 'Flèche diag.': 'M7 17L17 7M7 7h10v10', 'Hausse': 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6', 'Baisse': 'M22 17l-8.5-8.5-5 5L2 7M16 17h6v-6',
    'Validé': 'M20 6L9 17l-5-5', 'Croix': 'M18 6L6 18M6 6l12 12', 'Étoile': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
    'Cœur': 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    'Personnes': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0a4 4 0 1 1 8 0M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    'Message': 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'Vue': 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0',
    'Monde': 'M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    'Barres': 'M12 20V10M18 20V4M6 20v-4', 'Courbe': 'M3 3v18h18M7 14l4-4 4 4 5-5', 'Camembert': 'M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z',
    'Alerte': 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01', 'Info': 'M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0M12 16v-4M12 8h.01',
    'Calendrier': 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18', 'Horloge': 'M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0M12 6v6l4 2',
    'Mégaphone': 'M3 11l18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6', 'Bouclier': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'Éclat': 'M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z',
    'Cible': 'M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0M18 12a6 6 0 1 1-12 0a6 6 0 1 1 12 0M14 12a2 2 0 1 1-4 0a2 2 0 1 1 4 0', 'Feuille': 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6',
    'Mallette': 'M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', 'Trophée': 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
    'Appareil photo': 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM16 13a4 4 0 1 1-8 0a4 4 0 1 1 8 0', 'Citation': 'M3 21c3 0 7-1 7-8V5H3v8h4c0 4-2 5-4 5zM14 21c3 0 7-1 7-8V5h-7v8h4c0 4-2 5-4 5z',
    'Diamant': 'M6 3h12l4 6-10 13L2 9zM2 9h20M12 22L8 9l4-6 4 6z', 'Couronne': 'M2 18h20M3 7l5 5 4-7 4 7 5-5-2 11H5z', 'Lien': 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  };
  const iconSVG = (name, color, sw = 1.6) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="${color || 'currentColor'}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="${ICONS[name] || ICONS['Éclat']}"/></svg>`;

  /* ================================================================
     GRAPHIQUES, TABLEAUX & WIDGETS
     ================================================================ */
  function niceStep(span, n) { const raw = span / n, e = 10 ** Math.floor(Math.log10(raw || 1)); return [1, 2, 2.5, 5, 10].map(k => k * e).find(s => s >= raw) || raw; }
  function smooth(pts) {
    const n = pts.length; if (n < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : '';
    const dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = dx[i] ? (pts[i + 1][1] - pts[i][1]) / dx[i] : 0; }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = (m[i - 1] * m[i] <= 0) ? 0 : (m[i - 1] + m[i]) / 2;
    for (let i = 0; i < n - 1; i++) { if (m[i] === 0) { t[i] = t[i + 1] = 0; continue; } const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; } }
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) { const h = dx[i] / 3; d += `C${(pts[i][0] + h).toFixed(1)},${(pts[i][1] + h * t[i]).toFixed(1)} ${(pts[i + 1][0] - h).toFixed(1)},${(pts[i + 1][1] - h * t[i + 1]).toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)}`; }
    return d;
  }
  function renderChart(c0, W, H) {
    const c = Object.assign({ type: 'bar', labels: [], series: [], unit: '', dec: 0, legend: true, values: false, title: '', fs: 1, grid: true, sort: '', palette: '' }, JSON.parse(JSON.stringify(c0 || {})));
    const pal = c.palette === 'document' ? E.theme.colors.filter(x => !/^#0[0-9a-f]/i.test(x)) : (PALETTES[c.palette] || null);
    if (c.sort && c.series.length) {
      const idx = c.labels.map((_, i) => i).sort((a, b) => ((c.series[0].values[b] ?? -1e18) - (c.series[0].values[a] ?? -1e18)) * (c.sort === 'asc' ? -1 : 1));
      c.labels = idx.map(i => c.labels[i]); c.series.forEach(s => { s.values = idx.map(i => s.values[i]); }); if (c.colors) c.colors = idx.map(i => c.colors[i]);
    }
    const fmt = v => nfr(v, c.dec) + (c.unit || ''), F = 14 * (+c.fs || 1), ink = '#b7bdd0', grid = 'rgba(244,241,234,.12)';
    const ser = c.series.map((s, i) => ({ name: tok(s.name || `Série ${i + 1}`), color: pal ? pal[i % pal.length] : (s.color || PAL[i % PAL.length]), values: (s.values || []).map(v => (v === '' || v == null || isNaN(+v)) ? null : +v) }));
    const colAt = i => pal ? pal[i % pal.length] : ((c.colors && c.colors[i]) || PAL[i % PAL.length]);
    let o = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;overflow:visible;font-family:${SANS}">`;
    let top = 8;
    if (c.title) { o += `<text x="0" y="${F * 1.3}" fill="#f4f1ea" font-size="${F * 1.45}" font-family="Cormorant Garamond, serif">${esc(tok(c.title))}</text>`; top += F * 2.2; }
    const xtra = renderChartX(c, ser, W, H, top, F, ink, grid, fmt, colAt);
    if (xtra != null) return o + xtra + '</svg>';
    const round = c.type === 'donut' || c.type === 'pie';
    if (c.legend && !round && ser.length > 1) {
      let lx = 0; const ly = top + 4;
      ser.forEach((s, i) => { const isLine = c.type === 'combo' && i > 0; o += isLine ? `<line x1="${lx}" x2="${lx + 14}" y1="${ly - 3}" y2="${ly - 3}" stroke="${s.color}" stroke-width="3"/>` : `<rect x="${lx}" y="${ly - 9}" width="12" height="12" rx="3" fill="${s.color}"/>`; o += `<text x="${lx + 18}" y="${ly + 2}" fill="${ink}" font-size="${F}">${esc(s.name)}</text>`; lx += 30 + s.name.length * F * .55; });
      top += F * 2;
    }
    const all = ser.flatMap(s => s.values).filter(v => v != null);
    if (!all.length || !c.labels.length) return o + `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="${ink}" font-size="${F}">Ajoutez des données (double-clic sur le graphique)</text></svg>`;
    if (round) {
      const s = ser[0], tot = s.values.reduce((a, v) => a + (v || 0), 0) || 1, R = Math.min(W * .26, (H - top) / 2 - 6), cx = R + 6, cy = top + (H - top) / 2, th = R * .36;
      let ang = -Math.PI / 2;
      s.values.forEach((v, i) => {
        const a = (v || 0) / tot * Math.PI * 2; if (a <= 0) return;
        const a1 = ang + a - 1e-6, big = a > Math.PI ? 1 : 0;
        const dt = ` data-t="${esc(tok(c.labels[i]))} : ${fmt(v || 0)} (${nfr((v || 0) / tot * 100, 1)} %)"`;
        if (c.type === 'pie') o += `<path${dt} d="M${cx},${cy} L${cx + R * Math.cos(ang)},${cy + R * Math.sin(ang)} A${R},${R} 0 ${big} 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}Z" fill="${colAt(i)}" stroke="#050a1f" stroke-width="1.5"/>`;
        else o += `<path${dt} d="M${cx + R * Math.cos(ang)},${cy + R * Math.sin(ang)} A${R},${R} 0 ${big} 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}" fill="none" stroke="${colAt(i)}" stroke-width="${th}"/>`;
        ang += a;
      });
      if (c.type === 'donut') o += `<text x="${cx}" y="${cy + F * .4}" text-anchor="middle" fill="#f4f1ea" font-size="${F * 1.6}">${esc(tok(c.center || ''))}</text>`;
      const lx = cx + R + (c.type === 'donut' ? th / 2 : 0) + 30, step = Math.min(F * 2.2, (H - top) / Math.max(1, c.labels.length));
      c.labels.forEach((l, i) => { const y = top + step * (i + .5); o += `<rect x="${lx}" y="${y - 8}" width="12" height="12" rx="3" fill="${colAt(i)}"/><text x="${lx + 20}" y="${y + 3}" fill="${ink}" font-size="${F}">${esc(tok(l))} <tspan fill="#f4f1ea">${fmt(s.values[i] || 0)} · ${nfr((s.values[i] || 0) / tot * 100, 1)} %</tspan></text>`; });
      return o + '</svg>';
    }
    if (c.type === 'stacked') {
      const rows = c.labels.length, lw = Math.min(W * .28, 10 + Math.max(...c.labels.map(l => String(l).length)) * F * .55), bh = Math.min(F * 2.6, (H - top) / rows * .7), gap = (H - top - bh * rows) / Math.max(1, rows);
      c.labels.forEach((l, r) => {
        const y = top + gap / 2 + r * (bh + gap), tot = ser.reduce((a, s) => a + (s.values[r] || 0), 0) || 1; let x = lw;
        o += `<text x="${lw - 10}" y="${y + bh / 2 + 5}" text-anchor="end" fill="${ink}" font-size="${F}">${esc(tok(l))}</text>`;
        ser.forEach(s => { const w = (W - lw) * (s.values[r] || 0) / tot; o += `<rect class="gbx" x="${x}" y="${y}" width="${Math.max(0, w)}" height="${bh}" fill="${s.color}"/>`; if (w > 44) o += `<text x="${x + w / 2}" y="${y + bh / 2 + 5}" text-anchor="middle" fill="#050a1f" font-size="${F * .9}" font-weight="600">${nfr((s.values[r] || 0) / tot * 100, 0)} %</text>`; x += w; });
      });
      return o + '</svg>';
    }
    if (c.type === 'hbar') {
      const rows = c.labels.length, lw = Math.min(W * .32, 10 + Math.max(...c.labels.map(l => String(l).length)) * F * .55), vw = 90;
      const mx = Math.max(...all, 0) || 1, gh = (H - top) / rows, bh = Math.min(F * 2, gh * .7 / ser.length);
      c.labels.forEach((l, r) => {
        const y0 = top + r * gh + (gh - bh * ser.length) / 2;
        o += `<text x="${lw - 10}" y="${y0 + bh * ser.length / 2 + 5}" text-anchor="end" fill="${ink}" font-size="${F}">${esc(tok(l))}</text>`;
        ser.forEach((s, k) => { const v = s.values[r] || 0, w = (W - lw - vw) * Math.max(0, v) / mx; o += `<rect class="gbx" data-t="${esc(tok(l))}${ser.length > 1 ? ' · ' + esc(s.name) : ''} : ${fmt(v)}" x="${lw}" y="${y0 + k * bh}" width="${w}" height="${bh * .86}" rx="3" fill="${s.color}"${c.hl && String(l) !== String(c.hl) ? ' opacity=".32"' : ''}/>`; if (c.values || ser.length === 1) o += `<text x="${lw + w + 8}" y="${y0 + k * bh + bh * .6}" fill="#f4f1ea" font-size="${F * .92}">${fmt(v)}</text>`; });
      });
      return o + '</svg>';
    }
    // axes cartésiens : line / area / bar / stackbar / combo
    const stackTot = c.type === 'stackbar' ? c.labels.map((_, i) => ser.reduce((a, s) => a + Math.max(0, s.values[i] || 0), 0)) : null;
    let mn = Math.min(0, ...all), mx = stackTot ? Math.max(...stackTot) : Math.max(...all);
    if (c.ymax !== '' && c.ymax != null && !isNaN(+c.ymax)) mx = +c.ymax;
    if (c.ymin !== '' && c.ymin != null && !isNaN(+c.ymin)) mn = +c.ymin;
    const st = niceStep(mx - mn || 1, 4); mn = Math.floor(mn / st) * st; mx = Math.ceil(mx / st) * st || st;
    const pl = 12 + Math.max(...[mn, mx].map(v => fmt(v).length)) * F * .55, pb = F * 2, pt = top + 6, iw = W - pl - 8, ih = H - pt - pb;
    const Y = v => pt + ih - (Math.max(mn, Math.min(mx, v)) - mn) / (mx - mn) * ih, n = c.labels.length;
    for (let v = mn; v <= mx + 1e-9; v += st) o += `${c.grid !== false ? `<line x1="${pl}" x2="${W - 8}" y1="${Y(v)}" y2="${Y(v)}" stroke="${grid}"/>` : ''}<text x="${pl - 8}" y="${Y(v) + 5}" text-anchor="end" fill="${ink}" font-size="${F * .92}">${fmt(v)}</text>`;
    const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / (F * 5)))));
    const gw = iw / n, barSer = c.type === 'combo' ? ser.slice(0, 1) : ser;
    if (c.type === 'bar' || c.type === 'combo' || c.type === 'stackbar') {
      const bw = c.type === 'stackbar' ? Math.min(gw * .62, F * 6) : Math.min(gw * .72 / barSer.length, F * 4);
      c.labels.forEach((l, i) => {
        if (c.type === 'stackbar') {
          let acc = 0; const gx = pl + gw * i + (gw - bw) / 2;
          ser.forEach(s => { const v = Math.max(0, s.values[i] || 0); if (!v) return; const y1 = Y(acc + v), y0 = Y(acc); o += `<rect class="gb" data-t="${esc(tok(l))} · ${esc(s.name)} : ${fmt(v)}" x="${gx}" y="${y1}" width="${bw}" height="${y0 - y1}" fill="${s.color}"/>`; acc += v; });
          if (c.values) o += `<text x="${gx + bw / 2}" y="${Y(acc) - 6}" text-anchor="middle" fill="#f4f1ea" font-size="${F * .85}">${fmt(acc)}</text>`;
        } else {
          const gx = pl + gw * i + (gw - bw * barSer.length) / 2;
          const dim = c.hl && String(l) !== String(c.hl) ? ' opacity=".32"' : '';
          barSer.forEach((s, k) => { const v = s.values[i]; if (v == null) return; const y = Y(Math.max(0, v)), h = Math.abs(Y(v) - Y(0)); o += `<rect class="gb" data-t="${esc(tok(l))}${barSer.length > 1 ? ' · ' + esc(s.name) : ''} : ${fmt(v)}" x="${gx + k * bw}" y="${y}" width="${bw * .9}" height="${h}" rx="2" fill="${s.color}"${dim}/>`; if (c.values) o += `<text x="${gx + k * bw + bw * .45}" y="${y - 6}" text-anchor="middle" fill="#f4f1ea" font-size="${F * .85}">${fmt(v)}</text>`; });
        }
        if (i % every === 0) o += `<text x="${pl + gw * (i + .5)}" y="${H - 6}" text-anchor="middle" fill="${ink}" font-size="${F * .92}">${esc(tok(l))}</text>`;
      });
    }
    if (c.type === 'line' || c.type === 'area' || c.type === 'combo') {
      const X = c.type === 'combo' ? (i => pl + gw * (i + .5)) : (i => pl + (n === 1 ? iw / 2 : i * iw / (n - 1)));
      (c.type === 'combo' ? ser.slice(1) : ser).forEach((s, k) => {
        const pts = s.values.map((v, i) => v == null ? null : [X(i), Y(v)]).filter(Boolean); if (!pts.length) return;
        const d = smooth(pts);
        if (c.type === 'area') o += `<path d="${d}L${pts[pts.length - 1][0]},${Y(Math.max(mn, 0))}L${pts[0][0]},${Y(Math.max(mn, 0))}Z" fill="${s.color}" opacity=".18"/>`;
        o += `<path class="gl" pathLength="1" d="${d}" fill="none" stroke="${s.color}" stroke-width="${k ? 2.2 : 3}" stroke-linecap="round"/>`;
        if (c.type === 'combo') pts.forEach(p => { o += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${s.color}"/>`; });
        s.values.forEach((v, i) => { if (v != null) o += `<circle class="ed-hit" data-t="${esc(tok(c.labels[i]))}${ser.length > 1 ? ' · ' + esc(s.name) : ''} : ${fmt(v)}" cx="${X(i)}" cy="${Y(v)}" r="${Math.max(5, Math.min(12, iw / n / 2))}" fill="transparent"/>`; });
        if (c.values) s.values.forEach((v, i) => { if (v != null) o += `<text x="${X(i)}" y="${Y(v) - 8}" text-anchor="middle" fill="#f4f1ea" font-size="${F * .82}">${fmt(v)}</text>`; });
      });
      if (c.type !== 'combo') c.labels.forEach((l, i) => { if (i % every === 0 || i === n - 1) o += `<text x="${X(i)}" y="${H - 6}" text-anchor="middle" fill="${ink}" font-size="${F * .92}">${esc(tok(l))}</text>`; });
    }
    const refs = [];
    if (c.ref !== '' && c.ref != null && !isNaN(+c.ref)) refs.push([+c.ref, tok(c.refl || 'Objectif'), '#d8b47a']);
    if (c.avg) { const v0 = ser[0].values.filter(v => v != null); if (v0.length) refs.push([v0.reduce((a, b) => a + b, 0) / v0.length, 'Moyenne', '#7f9cff']); }
    refs.forEach(([v, l, col]) => { const y = Y(v); o += `<line x1="${pl}" x2="${W - 8}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="1.6" stroke-dasharray="6 5"/><text x="${W - 10}" y="${y - 7}" text-anchor="end" fill="${col}" font-size="${F * .85}">${esc(l)} · ${fmt(v)}</text>`; });
    if (c.note) { const i = c.labels.findIndex(l => String(l) === String(c.hl)); const v = i >= 0 ? (ser[0].values[i] ?? null) : null; if (v != null) { const x = (c.type === 'line' || c.type === 'area') ? pl + (n === 1 ? iw / 2 : i * iw / (n - 1)) : pl + gw * (i + .5), y = Y(v); o += `<circle cx="${x}" cy="${y}" r="5" fill="#050a1f" stroke="#d8b47a" stroke-width="2.5"/><text x="${Math.min(x + 10, W - 8)}" y="${y - 14}" text-anchor="${x > W * .7 ? 'end' : 'start'}" fill="#f4f1ea" font-size="${F * .95}" font-weight="500">${esc(tok(c.note))}</text>`; } }
    return o + '</svg>';
  }
  function renderChartX(c, ser, W, H, top, F, ink, grid, fmt, colAt) {
    const t = c.type; if (!['radar', 'treemap', 'heatmap', 'waterfall', 'scatter'].includes(t)) return null;
    let o = '';
    if (!ser.length || !c.labels.length) return `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="${ink}" font-size="${F}">Ajoutez des données</text>`;
    const lgd = () => { let lx = 0; ser.forEach(s_ => { o += `<rect x="${lx}" y="${top - 5}" width="12" height="12" rx="3" fill="${s_.color}"/><text x="${lx + 18}" y="${top + 6}" fill="${ink}" font-size="${F * .9}">${esc(s_.name)}</text>`; lx += 30 + s_.name.length * F * .55; }); };
    if (t === 'radar') {
      const n = c.labels.length, cx = W / 2, cy = top + 20 + (H - top - 20) / 2, R = Math.min(W / 2 - 90, (H - top - 20) / 2 - 24);
      const mxA = c.labels.map((_, i) => Math.max(...ser.map(s_ => s_.values[i] || 0)) || 1), gmx = Math.max(...mxA);
      const P = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n, r = R * v; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
      for (let k = 1; k <= 4; k++) o += `<polygon points="${c.labels.map((_, i) => P(i, k / 4).join(',')).join(' ')}" fill="none" stroke="${grid}"/>`;
      c.labels.forEach((l, i) => { const [x, y] = P(i, 1), [lx, ly] = P(i, 1.13); o += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${grid}"/><text x="${lx}" y="${ly + 4}" text-anchor="${Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end'}" fill="${ink}" font-size="${F * .92}">${esc(tok(l))}</text>`; });
      ser.forEach(s_ => { const pts = c.labels.map((_, i) => P(i, (s_.values[i] || 0) / (c.norm === false ? gmx : mxA[i]))); o += `<polygon class="gb" points="${pts.map(p => p.join(',')).join(' ')}" fill="${s_.color}" fill-opacity=".16" stroke="${s_.color}" stroke-width="2.2"/>`; pts.forEach(p => { o += `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${s_.color}"/>`; }); });
      if (ser.length > 1) lgd();
      return o;
    }
    if (t === 'treemap') {
      const items = c.labels.map((l, i) => ({ l, v: Math.max(0, ser[0].values[i] || 0), c: ser[1] ? ser[1].values[i] : null, i })).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
      const tot = items.reduce((a, x) => a + x.v, 0) || 1, cmn = ser[1] ? Math.min(...items.map(x => x.c ?? 0)) : 0, cmx = ser[1] ? Math.max(...items.map(x => x.c ?? 0)) : 1;
      const colFor = x => { if (x.c == null) return colAt(x.i); const k = cmx === cmn ? .5 : (x.c - cmn) / (cmx - cmn); const a = [255, 122, 114], b = [111, 207, 151]; return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(',')})`; };
      const rects = []; let box = { x: 0, y: top, w: W, h: H - top }, rest = items.slice(), area = W * (H - top) / tot;
      while (rest.length) {
        const vert = box.w >= box.h, side = vert ? box.h : box.w; let row = [], best = Infinity;
        for (const it of rest) { const tr = row.concat(it), s_ = tr.reduce((a, x) => a + x.v * area, 0), th = s_ / side, worst = Math.max(...tr.map(x => Math.max((x.v * area) / (th * th), (th * th) / (x.v * area)))); if (worst > best) break; best = worst; row = tr; }
        const s_ = row.reduce((a, x) => a + x.v * area, 0), th = s_ / side; let off = 0;
        row.forEach(x => { const len = x.v * area / th; rects.push(vert ? { x: box.x, y: box.y + off, w: th, h: len, it: x } : { x: box.x + off, y: box.y, w: len, h: th, it: x }); off += len; });
        box = vert ? { x: box.x + th, y: box.y, w: box.w - th, h: box.h } : { x: box.x, y: box.y + th, w: box.w, h: box.h - th }; rest = rest.slice(row.length);
      }
      rects.forEach(r => { o += `<g class="gb"><rect x="${r.x + 1}" y="${r.y + 1}" width="${Math.max(0, r.w - 2)}" height="${Math.max(0, r.h - 2)}" rx="4" fill="${colFor(r.it)}" fill-opacity="${ser[1] ? .85 : 1}"/>`; if (r.w > F * 5 && r.h > F * 2.4) o += `<text x="${r.x + 9}" y="${r.y + F * 1.4}" fill="#050a1f" font-size="${Math.min(F * 1.05, r.w / 9)}" font-weight="600">${esc(String(tok(r.it.l)).slice(0, Math.floor(r.w / (F * .55))))}</text><text x="${r.x + 9}" y="${r.y + F * 2.6}" fill="#050a1f" font-size="${F * .85}">${fmt(r.it.v)}${r.it.c != null ? ' · ' + sgn(r.it.c, 0, ' %') : ''}</text>`; o += '</g>'; });
      return o;
    }
    if (t === 'heatmap') {
      const vals = ser[0].values, mx = Math.max(...vals.filter(v => v != null)) || 1, dates = c.dates || null, n = vals.length;
      const wd = i => dates ? (new Date(dates[i] + 'T12:00:00').getDay() + 6) % 7 : i % 7, wk = i => dates ? Math.floor((i + wd(0)) / 7) : Math.floor(i / 7);
      const cols = wk(n - 1) + 1, lw = F * 3, cs = Math.min((W - lw) / cols, (H - top - F * 2) / 7) - 4;
      ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((d, r) => { o += `<text x="${lw - 10}" y="${top + r * (cs + 4) + cs / 2 + 5}" text-anchor="end" fill="${ink}" font-size="${F * .85}">${d}</text>`; });
      vals.forEach((v, i) => { const x = lw + wk(i) * (cs + 4), y = top + wd(i) * (cs + 4), k = v == null ? 0 : v / mx; o += `<g class="gb"><rect x="${x}" y="${y}" width="${cs}" height="${cs}" rx="4" fill="${v == null ? 'rgba(244,241,234,.05)' : `rgba(216,180,122,${(.12 + k * .88).toFixed(2)})`}"><title>${esc(tok(c.labels[i]))} : ${fmt(v || 0)}</title></rect>${cs > F * 2.2 ? `<text x="${x + 6}" y="${y + F * 1.1}" fill="${k > .55 ? '#050a1f' : ink}" font-size="${F * .72}">${esc(String(tok(c.labels[i])).slice(0, 5))}</text>` : ''}</g>`; });
      o += `<text x="${lw}" y="${H - 4}" fill="${ink}" font-size="${F * .8}">Moins</text>${[.15, .4, .65, .9].map((k, j) => `<rect x="${lw + F * 3.6 + j * 18}" y="${H - 16}" width="14" height="14" rx="3" fill="rgba(216,180,122,${k})"/>`).join('')}<text x="${lw + F * 3.6 + 80}" y="${H - 4}" fill="${ink}" font-size="${F * .8}">Plus</text>`;
      return o;
    }
    if (t === 'waterfall') {
      const v = ser[0].values.map(x => x || 0), steps = []; let acc = 0;
      v.forEach((d, i) => { if (i === 0) { steps.push({ l: c.labels[i], a: 0, b: d, tot: true }); acc = d; } else { steps.push({ l: c.labels[i], a: acc, b: acc + d, d }); acc += d; } });
      steps.push({ l: c.endLabel || 'Total', a: 0, b: acc, tot: true });
      const mn = Math.min(0, ...steps.map(x => Math.min(x.a, x.b))), mx = Math.max(...steps.map(x => Math.max(x.a, x.b))) * 1.08 || 1, pb = F * 2.2, ih = H - top - pb - 10, Y = y => top + 10 + ih - (y - mn) / (mx - mn) * ih, gw = W / steps.length;
      steps.forEach((s_, i) => { const x = i * gw + gw * .18, w = gw * .64, y1 = Y(Math.max(s_.a, s_.b)), y2 = Y(Math.min(s_.a, s_.b)), col = s_.tot ? '#d8b47a' : s_.d >= 0 ? '#6fcf97' : '#ff7a72';
        o += `<rect class="gb" x="${x}" y="${y1}" width="${w}" height="${Math.max(1, y2 - y1)}" rx="2" fill="${col}"/><text x="${x + w / 2}" y="${y1 - 6}" text-anchor="middle" fill="#f4f1ea" font-size="${F * .85}">${s_.tot ? fmt(s_.b) : (s_.d >= 0 ? '+' : '−') + fmt(Math.abs(s_.d))}</text><text x="${x + w / 2}" y="${H - 6}" text-anchor="middle" fill="${ink}" font-size="${F * .88}">${esc(tok(s_.l))}</text>`;
        if (i < steps.length - 1) o += `<line x1="${x + w}" x2="${x + gw}" y1="${Y(s_.b)}" y2="${Y(s_.b)}" stroke="${grid}" stroke-dasharray="3 3"/>`; });
      return o;
    }
    if (t === 'scatter') {
      const X_ = ser[0].values, Y_ = (ser[1] || ser[0]).values, S_ = ser[2] ? ser[2].values : null, pts = c.labels.map((l, i) => ({ l, x: X_[i], y: Y_[i], s: S_ ? S_[i] : null })).filter(p => p.x != null && p.y != null);
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y), smx = S_ ? Math.max(...pts.map(p => p.s || 0)) || 1 : 1;
      const xmn = Math.min(...xs), xmx = Math.max(...xs), ymn = Math.min(0, ...ys), ymx = Math.max(...ys), pl = F * 4, pb = F * 2.6, iw = W - pl - 20, ih = H - top - pb - 10;
      const PX = x => pl + (x - xmn) / ((xmx - xmn) || 1) * iw, PY = y => top + 10 + ih - (y - ymn) / ((ymx - ymn) || 1) * ih;
      o += `<line x1="${pl}" x2="${pl + iw}" y1="${top + 10 + ih}" y2="${top + 10 + ih}" stroke="${grid}"/><line x1="${pl}" x2="${pl}" y1="${top + 10}" y2="${top + 10 + ih}" stroke="${grid}"/>`;
      if (xmn < 0 && xmx > 0) o += `<line x1="${PX(0)}" x2="${PX(0)}" y1="${top + 10}" y2="${top + 10 + ih}" stroke="${grid}" stroke-dasharray="4 4"/>`;
      o += `<text x="${pl + iw}" y="${H - 6}" text-anchor="end" fill="${ink}" font-size="${F * .85}">${esc(ser[0].name)} →</text><text x="${pl}" y="${top + 4}" fill="${ink}" font-size="${F * .85}">↑ ${esc((ser[1] || ser[0]).name)}</text>`;
      const lab = pts.slice().sort((a, b) => (b.s ?? b.y) - (a.s ?? a.y)).slice(0, c.values ? pts.length : 8).map(p => p.l);
      pts.forEach((p, i) => { const r = S_ ? 5 + Math.sqrt((p.s || 0) / smx) * 26 : 6, x = PX(p.x), y = PY(p.y); o += `<g class="gb"><circle cx="${x}" cy="${y}" r="${r}" fill="${p.x >= 0 ? '#6fcf97' : '#ff7a72'}" fill-opacity=".55" stroke="${p.x >= 0 ? '#6fcf97' : '#ff7a72'}"><title>${esc(tok(p.l))}</title></circle>${lab.includes(p.l) ? `<text x="${x + r + 4}" y="${y + 4}" fill="#f4f1ea" font-size="${F * .8}">${esc(String(tok(p.l)).slice(0, 22))}</text>` : ''}</g>`; });
      return o;
    }
    return null;
  }
  const numOf = c => { const m = String(tok(c)).replace(/[\s  ]/g, '').replace('−', '-').match(/^[+-]?\d+(?:[.,]\d+)?/); return m ? parseFloat(m[0].replace(',', '.')) : null; };
  const renderTable = t => {
    const rows = (t && t.rows) || [], hd = t && t.header !== false, body = hd ? rows.slice(1) : rows;
    const mx = t && t.bars ? (rows[0] || []).map((_, j) => Math.max(0, ...body.map(r => Math.abs(numOf(r[j]) ?? 0)))) : [];
    const cell = (c, j) => { const txt = esc(tok(c)), n = numOf(c); let st = '', cls = '';
      if (t && t.vcol && /^\s*[+−-]\s?\d/.test(tok(c))) cls = /^\s*\+/.test(tok(c)) ? 'pos' : 'neg';
      if (t && t.bars && n != null && mx[j] && j > 0) st = ` style="background:linear-gradient(90deg, rgba(216,180,122,.28) ${Math.abs(n) / mx[j] * 100}%, transparent 0)"`;
      return `<td class="${cls}"${st}>${txt}</td>`; };
    return `<table class="ed-tbl${t && t.zebra ? ' zebra' : ''}${t && t.compact ? ' compact' : ''}${t && t.sortable && hd ? ' sortable' : ''}">${rows.map((r, i) => `<tr>${r.map((c, j) => (i === 0 && hd) ? `<th>${esc(tok(c))}</th>` : cell(c, j)).join('')}</tr>`).join('')}</table>`;
  };
  const renderAccordion = t => `<div class="ed-acc">${((t && t.rows) || []).map((r, i) => `<details ${i === 0 && t.open1 ? 'open' : ''}><summary>${esc(tok(r[0]))}</summary><div>${esc(tok(r[1] || '')).replace(/\n/g, '<br>')}</div></details>`).join('')}</div>`;
  function renderConnector(a) {
    const c = Object.assign({ curve: 0, head: 'end', dash: false, sw: 2.5 }, a.cn), k = (a.u || 'rem') === 'px' ? 1 : 10, W = (a.w || 30) * k, H = (a.h || 8) * k, m = c.sw * 3 + 2, y = H / 2, cy = y - c.curve * H * .9;
    const mk = id => `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="${Math.max(3, 4.5 - c.sw * .3)}" markerHeight="${Math.max(3, 4.5 - c.sw * .3)}" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker>`, id = 'cn' + a.id;
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="none" style="overflow:visible;display:block"><defs>${mk(id)}</defs><path d="M${m},${y} Q${W / 2},${cy} ${W - m},${y}" fill="none" stroke="currentColor" stroke-width="${c.sw}" vector-effect="non-scaling-stroke" stroke-linecap="round" ${c.dash ? 'stroke-dasharray="7 6"' : ''} ${c.head === 'end' || c.head === 'both' ? `marker-end="url(#${id})"` : ''} ${c.head === 'start' || c.head === 'both' ? `marker-start="url(#${id})"` : ''}/></svg>`;
  }
  function renderRace(c) {
    const fr = c.labels || [], S = c.series || []; if (!fr.length || !S.length) return '<div class="ed-ph">Course de barres<br><small>Données : une ligne par période, une série par concurrent</small></div>';
    const last = fr.length - 1, vals = S.map(s_ => (s_.values || [])[last] || 0), mx = Math.max(...S.flatMap(s_ => s_.values || []).filter(v => v != null)) || 1;
    const ord = S.map((s_, i) => i).sort((x, y) => vals[y] - vals[x]);
    return `<div class="ed-race" data-race="${esc(JSON.stringify({ f: fr.map(x => tok(x)), s: S.map((s_, i) => ({ n: tok(s_.name), c: s_.color || PAL[i % PAL.length], v: s_.values })), mx, dec: c.dec || 0, unit: c.unit || '' })).replace(/'/g, '&#39;')}">${c.title ? `<h5>${esc(tok(c.title))}</h5>` : ''}<b class="ed-race-f">${esc(tok(fr[last]))}</b><div class="ed-race-b">${S.map((s_, i) => `<div class="ed-race-r" data-i="${i}" style="--r:${ord.indexOf(i)};--w:${vals[i] / mx * 100}%;--c:${s_.color || PAL[i % PAL.length]}"><span>${esc(tok(s_.name))}</span><i></i><em>${nfr(vals[i], c.dec || 0)}${esc(c.unit || '')}</em></div>`).join('')}</div>${fr.length > 1 ? '<button class="ed-race-p" aria-label="Rejouer">↻ Rejouer</button>' : ''}</div>`;
  }
  function raceFrame(el, k) {
    const d = JSON.parse(el.dataset.race), v = d.s.map(s_ => (s_.v || [])[k] ?? 0), ord = v.map((_, i) => i).sort((x, y) => v[y] - v[x]);
    el.querySelector('.ed-race-f').textContent = d.f[k];
    el.querySelectorAll('.ed-race-r').forEach(r => { const i = +r.dataset.i; r.style.setProperty('--r', ord.indexOf(i)); r.style.setProperty('--w', v[i] / d.mx * 100 + '%'); r.querySelector('em').textContent = nfr(v[i], d.dec) + d.unit; });
  }
  function racePlay(el) { if (el._rt) clearInterval(el._rt); const n = JSON.parse(el.dataset.race).f.length; let k = 0; raceFrame(el, 0); el._rt = setInterval(() => { k++; if (k >= n) { clearInterval(el._rt); el._rt = null; return; } raceFrame(el, k); }, 1100); }
  const raceIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !on && !e.target.dataset.played) { e.target.dataset.played = 1; racePlay(e.target); } }), { threshold: .45 }) : null;
  addEventListener('click', e => { const b = e.target.closest && e.target.closest('.ed-race-p'); if (b && !on) racePlay(b.closest('.ed-race')); });
  const KPI2 = { publications: ['Publications', 'publications_vs_m1', 'publications_vs_y1', 'total'], sentiment_net: ['Sentiment net', 'sentiment_vs_m1', null, 'net'], emv: ['Earned Media Value', 'emv_vs_m1', 'emv_vs_y1', null], score: ['Score e-réputation', 'score_vs_m1', null, null], engagements_owned: ['Engagements owned', null, null, null], impressions_owned: ['Impressions owned', null, null, null] };
  function renderKpi2(a) {
    const k = KPI2[a.metric] ? a.metric : 'publications', [l, m1, y1, dk] = KPI2[k], chip = (key, lab) => { const v = key && TOKMAP[key]; if (!v) return ''; return `<span class="${/^\+/.test(v) ? 'pos' : /^[−-]/.test(v) ? 'neg' : ''}">${esc(v)} <small>${lab}</small></span>`; };
    let sp = ''; const days = D.days || [];
    if (dk && days.length > 2) { const v = days.map(x => dk === 'net' ? (x.net ?? 0) * 100 : x.total), mn = Math.min(...v), mx = Math.max(...v) || 1, pts = v.map((y, i) => `${(i / (v.length - 1) * 100).toFixed(1)},${(30 - (y - mn) / ((mx - mn) || 1) * 28).toFixed(1)}`).join(' '); sp = `<svg viewBox="0 0 100 32" preserveAspectRatio="none" class="ed-k2-sp"><polyline points="${pts}" fill="none" stroke="#d8b47a" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`; }
    return `<div class="ed-k2"><div class="ed-kl">${esc(a.label || l)}</div><div class="ed-kv">${esc(TOKMAP[k] || '–')}</div><div class="ed-k2-c">${chip(m1, 'vs M-1')}${chip(y1, 'vs Y-1')}</div>${sp}</div>`;
  }
  function autoRules() {
    const T = D.tot || {}, c = T.cur || {}, m1 = T.m1 || null, days = D.days || [], M = (D.matrix || []).slice(), R_ = {};
    const ev = (x, y) => (x != null && y) ? (x / y - 1) * 100 : null, up = v => v >= 0 ? 'en hausse' : 'en baisse';
    const vm = ev(c.total, m1 && m1.total); if (vm != null) R_.volume = `Avec ${TOKMAP.publications} publications, la conversation autour de ${CLIENT} est <em>${up(vm)}</em> de ${nfr(Math.abs(vm), 0)} % par rapport à ${TOKMAP.mois_precedent}.`;
    if (m1 && c.net != null) { const d = (c.net - m1.net) * 100; R_.sentiment = `Le sentiment net s’établit à ${TOKMAP.sentiment_net}, ${Math.abs(d) < .5 ? 'stable' : (d > 0 ? '<em>en progression</em>' : '<em>en recul</em>') + ` de ${nfr(Math.abs(d), 1)} pts`} par rapport au mois précédent.`; }
    if (days.length) { const pk = days.reduce((a, x) => x.total > a.total ? x : a, days[0]); R_.pic = `Le pic du mois a lieu le ${new Date(pk.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} avec ${nfr(pk.total)} publications, soit ${nfr(pk.total / (c.total / days.length || 1), 1)} fois la moyenne quotidienne.`; }
    const top = M.slice().sort((a, b) => b.volume - a.volume)[0]; if (top) R_.top = `${esc(top.label)} est le sujet le plus discuté du mois (${nfr(top.volume)} publications, sentiment net ${sgn(top.net * 100, 0)}).`;
    const ups = M.filter(t => t.m1 && t.m1.volume && t.volume >= 40).sort((a, b) => b.volume / b.m1.volume - a.volume / a.m1.volume)[0]; if (ups) R_.hausse = `La plus forte progression concerne ${esc(ups.label)} : ${sgn((ups.volume / ups.m1.volume - 1) * 100, 0)} de volume par rapport au mois précédent.`;
    const neg = M.filter(t => t.volume >= 40).sort((a, b) => a.net - b.net)[0]; if (neg) R_.vigilance = `Point de vigilance : ${esc(neg.label)} présente le sentiment le plus bas (${sgn(neg.net * 100, 0)}, ${nfr(neg.volume)} publications).`;
    if (D.emv && D.emv.current) { const e = ev(D.emv.current, D.emv.m1); R_.emv = `La valeur médiatique atteint ${TOKMAP.emv}${e != null ? `, <em>${up(e)}</em> de ${nfr(Math.abs(e), 0)} % sur un mois` : ''}.`; }
    if (TOKMAP.rang_benchmark) R_.benchmark = `En volume de conversation, ${CLIENT} se classe ${TOKMAP.rang_benchmark} de son benchmark concurrentiel ce mois-ci.`;
    if (c.total) { const nets = [['Instagram · Facebook · X', c.radarly], ['LinkedIn', c.linkedin], ['TikTok', c.tiktok]].filter(x => x[1]).sort((a, b) => b[1] - a[1]); if (nets.length) R_.reseau = `${nets[0][0]} concentre ${nfr(nets[0][1] / c.total * 100, 0)} % des publications ; LinkedIn en représente ${nfr((c.linkedin || 0) / c.total * 100, 0)} %.`; }
    if (HIST.length > 2) {
      const cur = HIST[HIST.length - 1], vs = HIST.map(h => h.total), rk = vs.slice().sort((x, y) => y - x).indexOf(cur.total) + 1, rec = HIST.reduce((x, y) => y.total > x.total ? y : x), avg = vs.reduce((x, y) => x + y, 0) / vs.length;
      R_.histo = `Avec ${nfr(cur.total)} publications, ${cur.label} se classe ${rk === 1 ? '<em>au premier rang</em>' : rk + '<sup>e</sup>'} des ${HIST.length} mois suivis${rk === 1 ? '' : ` (record : ${histFull(rec)}, ${nfr(rec.total)})`}, ${cur.total >= avg ? 'au-dessus' : 'en dessous'} de la moyenne mensuelle de ${nfr(avg)}.`;
      if (cur.net != null) { const prev = HIST.slice(0, -1).reverse().find(h => h.net != null && h.net >= cur.net), nets = HIST.filter(h => h.net != null), an = nets.reduce((x, y) => x + y.net, 0) / nets.length; R_.histsent = prev ? `Le sentiment net (${sgn(cur.net * 100)}) est le plus élevé depuis ${histFull(prev)}${cur.net >= an ? `, au-dessus de la moyenne de la période (${sgn(an * 100)})` : `, en dessous de la moyenne de la période (${sgn(an * 100)})`}.` : `Le sentiment net (${sgn(cur.net * 100)}) atteint son <em>plus haut niveau</em> sur les ${nets.length} mois suivis.`; }
    }
    if (c.pos_pct != null) R_.tonalite = `${nfr(c.pos_pct * 100, 0)} % des publications sont positives, ${nfr(c.neg_pct * 100, 0)} % négatives.`;
    return R_;
  }
  const AUTO_L = { volume: 'Évolution du volume', sentiment: 'Évolution du sentiment', pic: 'Pic du mois', top: 'Sujet le plus discuté', hausse: 'Plus forte progression', vigilance: 'Point de vigilance', emv: 'Valeur médiatique', benchmark: 'Rang dans le benchmark', reseau: 'Réseau dominant', tonalite: 'Répartition de la tonalité', histo: 'Le mois dans l’historique (volume)', histsent: 'Le sentiment dans l’historique' };
  function renderMovers(a) {
    const M = (D.matrix || []).filter(t => t.volume >= (a.min || 40));
    const up = M.filter(t => t.m1 && t.m1.volume).map(t => ({ t, d: t.volume / t.m1.volume - 1 })).sort((x, y) => y.d - x.d).slice(0, 3);
    const dn = M.filter(t => t.m1 && t.m1.net != null).map(t => ({ t, d: (t.net - t.m1.net) * 100 })).sort((x, y) => x.d - y.d).slice(0, 3);
    const nw = M.filter(t => !t.m1 || !t.m1.volume).sort((x, y) => y.volume - x.volume).slice(0, 3);
    const col = (h, cls, rows) => `<div class="ed-mv-c ${cls}"><h6>${h}</h6>${rows.join('') || '<p class="ed-mv-e">Aucun ce mois-ci</p>'}</div>`;
    return `<div class="ed-mv">${col('Plus fortes hausses de volume', 'up', up.map(x => `<div><span>${esc(x.t.label)}</span><b>${sgn(x.d * 100, 0)}</b><small>${nfr(x.t.volume)} pub.</small></div>`))}
      ${col('Sentiment en recul', 'dn', dn.map(x => `<div><span>${esc(x.t.label)}</span><b>${sgn(x.d, 0, ' pts')}</b><small>net ${sgn(x.t.net * 100, 0)}</small></div>`))}
      ${col('Nouveaux sujets', 'nw', nw.map(t => `<div><span>${esc(t.label)}</span><b>${nfr(t.volume)}</b><small>publications</small></div>`))}</div>`;
  }
  function renderCarousel(a) {
    const it = a.items || []; if (!it.length) return '<div class="ed-ph">Carrousel<br><small>Inspecteur → Ajouter des images</small></div>';
    return `<div class="ed-car" data-i="0"><div class="ed-car-t">${it.map(x => `<figure><img src="${esc(x.src)}" alt="${esc(x.cap || '')}" draggable="false">${x.cap ? `<figcaption>${esc(tok(x.cap))}</figcaption>` : ''}</figure>`).join('')}</div>
      ${it.length > 1 ? `<button class="ed-car-p" aria-label="Précédente">‹</button><button class="ed-car-n" aria-label="Suivante">›</button><div class="ed-car-d">${it.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}</div>`;
  }
  addEventListener('click', e => {
    if (on) return; const th = e.target.closest && e.target.closest('.ed-tbl.sortable th'); if (!th) return;
    const tb = th.closest('table'), j = [...th.parentNode.children].indexOf(th), dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
    tb.querySelectorAll('th').forEach(x => delete x.dataset.dir); th.dataset.dir = dir;
    const rows = [...tb.rows].slice(1), val = r => { const c = r.cells[j]; const n_ = c ? numOf(c.textContent) : null; return n_ != null ? n_ : (c ? c.textContent.trim().toLowerCase() : ''); };
    rows.sort((a, b) => { const x = val(a), y = val(b); const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'fr'); return dir === 'asc' ? r : -r; });
    rows.forEach(r => r.parentNode.appendChild(r));
  });
  function csvOf(a) {
    const q = v => { const t = String(v ?? '').replace(/ | /g, ' '); return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
    if (a.kind === 'chart') { const c = linkedChart(a.chart || {}), S_ = c.series || []; return [['', ...S_.map(x => tok(x.name || ''))], ...(c.labels || []).map((l, i) => [tok(l), ...S_.map(x => (x.values || [])[i] ?? '')])].map(r => r.map(q).join(';')).join('\n'); }
    const t = linkedTable(a.table || {}); return (t.rows || []).map(r => r.map(c => q(tok(c))).join(';')).join('\n');
  }
  async function csvDl(a) { await download(fname('csv').replace('.csv', '_' + String((a.chart && a.chart.title) || a.name || a.kind).replace(/[^\wÀ-ÿ-]+/g, '-').slice(0, 40) + '.csv'), '﻿' + csvOf(a), 'text/csv'); }
  addEventListener('click', e => { const b = e.target.closest && e.target.closest('.ed-csv'); if (!b || on) return; e.preventDefault(); e.stopPropagation(); const a = E.add.find(x => x.id === b.dataset.csv); if (a) csvDl(a); });
  function carGo(c, i) { const n = c.querySelectorAll('figure').length; if (!n) return; i = (i + n) % n; c.dataset.i = i; c.querySelector('.ed-car-t').style.transform = `translateX(${-i * 100}%)`; c.querySelectorAll('.ed-car-d i').forEach((d, j) => d.classList.toggle('on', j === i)); }
  addEventListener('click', e => { if (on) return; const b = e.target.closest && e.target.closest('.ed-car-p, .ed-car-n'); if (!b) return; const c = b.closest('.ed-car'); carGo(c, +c.dataset.i + (b.classList.contains('ed-car-n') ? 1 : -1)); c.dataset.hold = Date.now(); });
  setInterval(() => { if (on) return; const t = Date.now(); document.querySelectorAll('.ed-carousel').forEach(n => { const iv = +n.dataset.int; if (!iv) return; const c = n.querySelector('.ed-car'); if (!c) return; const last = +(c.dataset.t || 0), hold = +(c.dataset.hold || 0); if (t - last >= iv * 1000 && t - hold > iv * 2000) { c.dataset.t = t; if (last) carGo(c, +c.dataset.i + 1); } }); }, 500);
  const renderToc = a => { const o = visOrder(); return `<nav class="ed-toc">${o.map((id, i) => `<a href="#${id}"><i>${String(i + 1).padStart(2, '0')}</i><span>${esc(pageName(id))}</span></a>`).join('')}</nav>`; };
  const renderCompare = a => (a.src && a.src2) ? `<div class="ed-cmp" style="--p:50%"><img src="${esc(a.src)}" alt="" draggable="false"><div class="ed-cmp-a"><img src="${esc(a.src2)}" alt="" draggable="false"></div><i class="ed-cmp-h"></i><span class="ed-cmp-l l">${esc(tok(a.l1 || 'Avant'))}</span><span class="ed-cmp-l r">${esc(tok(a.l2 || 'Après'))}</span><input type="range" min="0" max="100" value="50" aria-label="Comparer"></div>` : '<div class="ed-ph">Avant / après<br><small>Inspecteur → choisir les deux images</small></div>';
  const renderTimeline = t => `<div class="ed-tl ${t && t.dir === 'h' ? 'h' : ''}">${((t && t.rows) || []).map(r => `<div class="ed-tli"><i></i><b>${esc(tok(r[0]))}</b><span>${esc(tok(r[1] || ''))}</span></div>`).join('')}</div>`;
  function renderProgress(w) {
    const v = +tok(w.value) || 0, m = +w.max || 100, p = Math.max(0, Math.min(1, v / m));
    return `<div class="ed-pg"><div class="ed-pg-h"><span>${esc(tok(w.label || ''))}</span><b>${esc(w.display ? tok(w.display) : nfr(v, w.dec || 0) + (w.unit || ''))}</b></div><div class="ed-pg-t"><i class="gbx" style="width:${p * 100}%;background:${w.color || '#d8b47a'}"></i></div></div>`;
  }
  function renderGauge(w) {
    const v = +tok(w.value) || 0, m = +w.max || 100, p = Math.max(0, Math.min(1, v / m)), R = 80, cx = 100, cy = 96;
    const P = t => [cx + R * Math.cos(Math.PI * (1 - t)), cy - R * Math.sin(Math.PI * (1 - t))];
    const [x0, y0] = P(0), [x1, y1] = P(1), [xp, yp] = P(Math.max(.001, p));
    return `<svg viewBox="0 0 200 130" width="100%" height="100%" style="display:block;overflow:visible"><path d="M${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1}" fill="none" stroke="rgba(244,241,234,.12)" stroke-width="16" stroke-linecap="round"/>
      <path class="gl" pathLength="1" d="M${x0},${y0} A${R},${R} 0 0 1 ${xp},${yp}" fill="none" stroke="${w.color || '#d8b47a'}" stroke-width="16" stroke-linecap="round"/>
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="#f4f1ea" font-size="34" font-family="Jost, sans-serif" font-weight="300">${esc(w.display ? tok(w.display) : nfr(v, w.dec || 0) + (w.unit || ''))}</text>
      <text x="${cx}" y="${cy + 26}" text-anchor="middle" fill="#b7bdd0" font-size="11" font-family="Jost, sans-serif" letter-spacing="2">${esc(tok(w.label || '').toUpperCase())}</text></svg>`;
  }
  function renderPost(p) {
    return `<div class="ed-post"><div class="ed-post-h"><span class="ed-net">${esc(p.network || 'Instagram')}</span><b>${esc(tok(p.handle || '@compte'))}</b><span>${esc(tok(p.date || ''))}</span></div>
      ${p.src ? `<div class="ed-post-i"><img src="${esc(p.src)}" alt="" draggable="false"></div>` : '<div class="ed-post-i"><div class="ed-ph">Capture du post<br><small>Inspecteur → Image du post</small></div></div>'}
      ${p.text ? `<div class="ed-post-t">${esc(tok(p.text))}</div>` : ''}<div class="ed-post-f"><span>Engagements</span><b>${esc(tok(p.engagements || '—'))}</b>${p.reach ? `<span>Reach</span><b>${esc(tok(p.reach))}</b>` : ''}</div></div>`;
  }

  /* ---------- données du rapport prêtes à l'emploi ---------- */
  const dl = d => `${+d.slice(8)}.${d.slice(5, 7)}`;
  const MSL = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const presetDef = key => { const p = presets().find(x => x[0] === key); return p ? p[1] : null; };
  function tablePresets() {
    const T = D.tot || {}, c = T.cur || {}, m1 = T.m1, y1 = T.y1, e = D.emv || {}, L = (D.baro && D.baro.brands && D.baro.brands[CLIENT]) || {};
    const P = [];
    P.push(['Synthèse des indicateurs (mois, M-1, Y-1)', { rows: [['Indicateur', LB.m || 'Mois', LB.m1 || 'M-1', LB.y1 || 'Y-1'],
      ['Publications', nfr(c.total), m1 ? nfr(m1.total) : '', y1 ? nfr(y1.total) : ''],
      ['Sentiment net', c.net != null ? sgn(c.net * 100) : '', m1 ? sgn(m1.net * 100) : '', y1 ? sgn(y1.net * 100) : ''],
      ['Part positive', c.pos_pct != null ? nfr(c.pos_pct * 100, 1) + ' %' : '', m1 ? nfr(m1.pos_pct * 100, 1) + ' %' : '', y1 ? nfr(y1.pos_pct * 100, 1) + ' %' : ''],
      ['Part négative', c.neg_pct != null ? nfr(c.neg_pct * 100, 1) + ' %' : '', m1 ? nfr(m1.neg_pct * 100, 1) + ' %' : '', y1 ? nfr(y1.neg_pct * 100, 1) + ' %' : ''],
      ['EMV', e.current ? nfr(e.current / 1e6, 1) + ' M€' : '', e.m1 ? nfr(e.m1 / 1e6, 1) + ' M€' : '', e.y1 ? nfr(e.y1 / 1e6, 1) + ' M€' : ''],
      ['Score e-réputation', L.score_total ? nfr(L.score_total) : '', L.m1 ? nfr(L.m1) : '', '']] }]);
    if (D.matrix && D.matrix.length) P.push(['Top 10 sujets (volume, sentiment)', { rows: [['Sujet', 'Publications', 'Sentiment net', 'Engagements']].concat(D.matrix.slice().sort((a, b) => b.volume - a.volume).slice(0, 10).map(t => [t.label, nfr(t.volume), sgn(t.net * 100, 0), nfr(t.engagements)])) }]);
    if (D.conc && Object.keys(D.conc).length) { const ks = Object.keys(D.conc).sort((a, b) => D.conc[b] - D.conc[a]); const br = (D.baro && D.baro.brands) || {}; P.push(['Benchmark concurrents', { rows: [['Marque', 'Publications', 'Évolution vs Y-1', 'Score e-réputation']].concat(ks.map(k => [k, nfr(D.conc[k]), D.conc_y1 && D.conc_y1[k] ? sgn((D.conc[k] / D.conc_y1[k] - 1) * 100, 0) : '', br[k] ? nfr(br[k].score_total) : ''])) }]); }
    return P;
  }
  const tablePresetDef = key => { const p = tablePresets().find(x => x[0] === key); return p ? p[1] : null; };
  function linkedChart(c) { const d = c && c.src && presetDef(c.src); if (!d) return c; return Object.assign({}, c, { labels: d.labels, series: d.series.map((s, i) => Object.assign({}, s, { color: (c.series && c.series[i] && c.series[i].color) || s.color })), colors: d.colors || c.colors, center: c.center || d.center }); }
  function linkedTable(t) { const d = t && t.src && tablePresetDef(t.src); return d ? Object.assign({}, t, { rows: d.rows }) : t; }
  const textStyle = (id, u) => { const ts = E.styles.find(x => x.id === id); if (!ts) return {}; const o = Object.assign({}, ts.style); if (u === 'px') for (const k in o) if (typeof o[k] === 'string' && /rem/.test(o[k])) o[k] = o[k].replace(/([\d.]+)rem/g, (_, n) => (+n * 10) + 'px'); return o; };
  function presets() {
    const P = [], days = D.days || [], T = D.tot || {}, tl = (D.baro && D.baro.timeline) || [];
    if (days.length) {
      P.push(['Volume quotidien (mois, M-1, Y-1)', { type: 'line', labels: days.map(x => dl(x.date)), series: [{ name: LB.m || 'Mois', values: days.map(x => x.total) }, ...(D.m1days && D.m1days.length ? [{ name: LB.m1 || 'M-1', values: D.m1days.slice(0, days.length) }] : []), ...(D.y1days && D.y1days.length ? [{ name: LB.y1 || 'Y-1', values: D.y1days.slice(0, days.length) }] : [])] }]);
      P.push(['Sentiment net quotidien (%)', { type: 'bar', unit: ' %', dec: 0, labels: days.map(x => dl(x.date)), series: [{ name: 'Sentiment net', color: '#6fcf97', values: days.map(x => x.net == null ? null : Math.round(x.net * 1000) / 10) }] }]);
      P.push(['Publications par jour et par tonalité', { type: 'stackbar', labels: days.map(x => dl(x.date)), series: [['Positif', '#6fcf97', 'pos'], ['Neutre', '#3f4b75', 'neu'], ['Négatif', '#ff7a72', 'neg']].map(([n, col, k]) => ({ name: n, color: col, values: days.map(x => x[k]) })) }]);
      P.push(['Volume et sentiment net (combiné)', { type: 'combo', labels: days.map(x => dl(x.date)), series: [{ name: 'Publications', values: days.map(x => x.total) }, { name: 'Sentiment net (×10)', color: '#6fcf97', values: days.map(x => x.net == null ? null : Math.round(x.net * 1000)) }] }]);
    }
    if (T.cur) {
      const rows = [[LB.m || 'Mois', T.cur], [LB.m1 || 'M-1', T.m1], [LB.y1 || 'Y-1', T.y1]].filter(r => r[1]);
      P.push(['Sentiment : mois, M-1, Y-1 (100 %)', { type: 'stacked', labels: rows.map(r => r[0]), series: [['Positif', '#6fcf97', 'pos'], ['Neutre', '#3f4b75', 'neu'], ['Négatif', '#ff7a72', 'neg']].map(([n, col, k]) => ({ name: n, color: col, values: rows.map(r => r[1][k]) })) }]);
      P.push(['Sentiment du mois (anneau)', { type: 'donut', labels: ['Positif', 'Neutre', 'Négatif'], colors: ['#6fcf97', '#3f4b75', '#ff7a72'], center: '{{sentiment_net}}', series: [{ name: 'Publications', values: [T.cur.pos, T.cur.neu, T.cur.neg] }] }]);
      P.push(['Publications par réseau (camembert)', { type: 'pie', labels: ['Instagram · Facebook · X', 'LinkedIn', 'TikTok'], series: [{ name: 'Publications', values: [T.cur.radarly, T.cur.linkedin, T.cur.tiktok] }] }]);
    }
    if (D.conc && Object.keys(D.conc).length) {
      const ks = Object.keys(D.conc).sort((a, b) => D.conc[b] - D.conc[a]);
      P.push(['Volumes concurrents (mois vs Y-1)', { type: 'hbar', labels: ks, values: true, series: [{ name: LB.m || 'Mois', values: ks.map(k => Math.round(D.conc[k])) }, ...(D.conc_y1 && Object.keys(D.conc_y1).length ? [{ name: LB.y1 || 'Y-1', color: '#3f4b75', values: ks.map(k => Math.round(D.conc_y1[k] || 0)) }] : [])] }]);
    }
    if (D.baro && D.baro.brands) {
      const ks = Object.keys(D.baro.brands).sort((a, b) => D.baro.brands[b].score_total - D.baro.brands[a].score_total);
      P.push(['Scores e-réputation du mois', { type: 'bar', values: true, labels: ks, series: [{ name: 'Score', values: ks.map(k => Math.round(D.baro.brands[k].score_total)) }, { name: 'Mois précédent', color: '#3f4b75', values: ks.map(k => Math.round(D.baro.brands[k].m1 || 0)) }] }]);
    }
    if (tl.length) {
      const br = [CLIENT, ...Object.keys(tl[0] || {}).filter(k => k !== 'month' && k !== CLIENT)].filter(k => tl.some(r => r[k]));
      P.push(['Historique du score e-réputation', { type: 'line', labels: tl.map(r => `${MSL[+r.month.slice(5) - 1]} ${r.month.slice(2, 4)}`), series: br.map(k => ({ name: k, values: tl.map(r => r[k] == null ? null : Math.round(r[k])) })) }]);
    }
    if (D.emv && D.emv.current) {
      const r = [[LB.y1 || 'Y-1', D.emv.y1], [LB.m1 || 'M-1', D.emv.m1], [LB.m || 'Mois', D.emv.current]].filter(x => x[1]);
      P.push(['EMV : Y-1, M-1, mois (M€)', { type: 'bar', unit: ' M€', dec: 1, values: true, labels: r.map(x => x[0]), series: [{ name: 'EMV', values: r.map(x => Math.round(x[1] / 1e5) / 10) }] }]);
    }
    if (D.matrix && D.matrix.length) {
      const top = D.matrix.slice().sort((a, b) => b.volume - a.volume).slice(0, 10);
      P.push(['Top 10 sujets par volume', { type: 'hbar', labels: top.map(t => t.label), series: [{ name: 'Publications', values: top.map(t => t.volume) }] }]);
      const sn = D.matrix.filter(t => t.volume >= 40).sort((a, b) => b.net - a.net);
      const pick = sn.slice(0, 5).concat(sn.slice(-5));
      P.push(['Sujets : sentiment net (5 meilleurs, 5 plus bas)', { type: 'hbar', unit: ' %', values: true, labels: pick.map(t => t.label), series: [{ name: 'Sentiment net', color: '#6fcf97', values: pick.map(t => Math.round(t.net * 100)) }] }]);
    }
    if (tl.length > 2) { const br = [CLIENT, ...Object.keys(tl[0] || {}).filter(k => k !== 'month' && k !== CLIENT)].filter(k => tl.some(r => r[k])); P.push(['Course des scores e-réputation (animée)', { type: 'race', title: 'Score e-réputation', labels: tl.map(r => `${MSL[+r.month.slice(5) - 1]} ${r.month.slice(0, 4)}`), series: br.map(k => ({ name: k, values: tl.map(r => r[k] == null ? null : Math.round(r[k])) })) }]); }
    { const H_ = (D.hist || []).filter(h => h.total); if (H_.length > 2) { const lb = H_.map(h => `${(h.months || [1]).length > 1 ? 'juil.-août' : MSL[(h.months || [1])[0] - 1]} ${String(h.year).slice(2)}`), hl = lb[lb.length - 1];
      P.push(['Historique : publications par mois', { type: 'bar', hl, values: false, avg: true, labels: lb, series: [{ name: 'Publications', values: H_.map(h => Math.round(h.total)) }] }]);
      P.push(['Historique : sentiment net par mois (%)', { type: 'line', unit: ' %', dec: 1, labels: lb, avg: true, series: [{ name: 'Sentiment net', color: '#6fcf97', values: H_.map(h => h.net == null ? null : Math.round(h.net * 1000) / 10) }] }]);
      P.push(['Historique : EMV par mois (M€)', { type: 'area', unit: ' M€', dec: 1, labels: lb, series: [{ name: 'EMV', values: H_.map(h => h.emv ? Math.round(h.emv / 1e5) / 10 : null) }] }]);
      P.push(['Historique : volume et sentiment (combiné)', { type: 'combo', labels: lb, series: [{ name: 'Publications', values: H_.map(h => Math.round(h.total)) }, { name: 'Sentiment net (×100)', color: '#6fcf97', values: H_.map(h => h.net == null ? null : Math.round(h.net * 10000)) }] }]);
      P.push(['Historique : part des réseaux par mois', { type: 'stackbar', labels: lb, series: [['Insta · FB · X', '#d8b47a', 'radarly'], ['LinkedIn', '#7f9cff', 'linkedin'], ['TikTok', '#6fcf97', 'tiktok']].map(([n_, c_, k]) => ({ name: n_, color: c_, values: H_.map(h => Math.round(h[k] || 0)) })) }]); } }
    if (days.length) P.push(['Calendrier des publications (heatmap)', { type: 'heatmap', labels: days.map(x => dl(x.date)), dates: days.map(x => x.date), series: [{ name: 'Publications', values: days.map(x => x.total) }] }]);
    if (D.matrix && D.matrix.length) {
      const tp = D.matrix.slice().sort((a, b) => b.volume - a.volume).slice(0, 20);
      P.push(['Sujets : mosaïque (taille = volume, couleur = sentiment)', { type: 'treemap', labels: tp.map(t => t.label), series: [{ name: 'Publications', values: tp.map(t => t.volume) }, { name: 'Sentiment net', values: tp.map(t => Math.round(t.net * 100)) }] }]);
      const sc = D.matrix.filter(t => t.volume > 0);
      P.push(['Sujets : sentiment × volume (nuage)', { type: 'scatter', labels: sc.map(t => t.label), series: [{ name: 'Sentiment net (%)', values: sc.map(t => Math.round(t.net * 100)) }, { name: 'Publications', values: sc.map(t => t.volume) }, { name: 'Engagements', values: sc.map(t => t.engagements || 0) }] }]);
    }
    if (D.baro && D.baro.brands) { const ks = Object.keys(D.baro.brands); P.push(['Profil des marques (radar)', { type: 'radar', labels: ['Score volume', 'Score sentiment', 'Score total', 'Score M-1'], series: ks.slice(0, 5).map(k => ({ name: k, values: [D.baro.brands[k].score_volume, D.baro.brands[k].score_sentiment, D.baro.brands[k].score_total, D.baro.brands[k].m1] })) }]); }
    if (T.cur && T.m1) P.push(['Publications : de M-1 au mois, par réseau (cascade)', { type: 'waterfall', labels: [LB.m1 || 'M-1', 'Insta · FB · X', 'LinkedIn', 'TikTok'], endLabel: LB.m || 'Mois', series: [{ name: 'Publications', values: [T.m1.total, T.cur.radarly - T.m1.radarly, T.cur.linkedin - T.m1.linkedin, T.cur.tiktok - T.m1.tiktok] }] }]);
    (D.focus || []).filter(f => f.kind === 'daily').forEach(f => P.push([`Focus « ${f.sheet} » (quotidien)`, { type: 'area', labels: f.series.map(p => dl(p.date)), series: [{ name: f.sheet, values: f.series.map(p => p.value) }] }]));
    return P;
  }

  /* ================================================================
     EFFETS
     ================================================================ */
  const MASKS = { circle: 'circle(50% at 50% 50%)', arch: 'inset(0 round 50% 50% 0 0)', pill: 'inset(0 round 999px)', hex: 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)', diamond: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)', slant: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
    star: 'polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', triangle: 'polygon(50% 0, 100% 100%, 0 100%)', arrow: 'polygon(0 32%, 62% 32%, 62% 0, 100% 50%, 62% 100%, 62% 68%, 0 68%)', bubble: 'polygon(0 0, 100% 0, 100% 76%, 34% 76%, 16% 100%, 19% 76%, 0 76%)', chevron: 'polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%, 30% 50%)' };
  const curMood = () => (!on && E.set && E.set.moodsw && readerMood) || E.theme.mood || 'nuit';
  const IVM = { '#f4f1ea': '#101a33', '#050a1f': '#f4f1ea', '#e6e2d8': '#1f2840', '#d9d5cb': '#2a3350', '#b7bdd0': '#47506a', '#7480a3': '#6b7390', '#0b1430': '#e8e1d2', '#f0d6a6': '#9a7438', '#d8b47a': '#9a7438' };
  const ivMap = str => String(str).replace(/#f4f1ea|#050a1f|#e6e2d8|#d9d5cb|#b7bdd0|#7480a3|#0b1430|#f0d6a6|#d8b47a|rgba\(244,\s*241,\s*234,|rgba\(11,\s*20,\s*48,/gi, m => IVM[m.toLowerCase()] || (/^rgba\(244/i.test(m) ? 'rgba(16,26,51,' : 'rgba(232,225,210,'));
  function applyMood() {
    const mood_ = (!on && E.set && E.set.moodsw && readerMood) || E.theme.mood, root = document.documentElement, m = MOODS[mood_] || null;
    Object.keys(Object.assign({}, MOODS.encre, MOODS.ivoire)).forEach(k => root.style.removeProperty(k));
    if (m) Object.entries(m).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.mood = mood_ || 'nuit';
  }
  function applyFx(el, fx, kind) {
    if (!fx) return;
    if (fx.grad) el.style.background = `linear-gradient(${fx.grad.a || 135}deg, ${fx.grad.c1}, ${fx.grad.c2})`;
    if (fx.tgrad) { const g = `linear-gradient(${fx.tgrad.a || 90}deg, ${fx.tgrad.c1}, ${fx.tgrad.c2})`; el.style.backgroundImage = g; el.style.webkitBackgroundClip = 'text'; el.style.backgroundClip = 'text'; el.style.color = 'transparent'; el.style.webkitTextFillColor = 'transparent'; }
    if (fx.tshadow === 'glow') el.style.textShadow = `0 0 1.6rem ${fx.tsc || '#d8b47a'}, 0 0 .4rem ${fx.tsc || '#d8b47a'}`;
    if (fx.tshadow === 'drop') el.style.textShadow = '0 .3rem 1.2rem rgba(0,0,0,.65)';
    const f = fx.filter || {}, parts = [];
    if (f.gray) parts.push(`grayscale(${f.gray}%)`); if (f.bright && f.bright !== 100) parts.push(`brightness(${f.bright}%)`); if (f.contrast && f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`); if (f.sat && f.sat !== 100) parts.push(`saturate(${f.sat}%)`); if (f.blur) parts.push(`blur(${f.blur}px)`); if (f.sepia) parts.push(`sepia(${f.sepia}%)`);
    if (fx.duo) parts.push(`url(#ed-duo-${fx.duo})`);
    if (parts.length) { const t = kind === 'image' ? el.querySelector('img') || el : el; t.style.filter = parts.join(' '); }
    if (fx.vig) el.classList.add('ed-vig'); if (fx.grain) el.classList.add('ed-grain');
    if ((fx.vig || fx.grain) && getComputedStyle(el).position === 'static') el.style.position = 'relative';
    if (fx.timg) { el.style.backgroundImage = `url("${fx.timg}")`; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; el.style.webkitBackgroundClip = 'text'; el.style.backgroundClip = 'text'; el.style.color = 'transparent'; el.style.webkitTextFillColor = 'transparent'; }
    if (fx.flipX || fx.flipY) el.style.scale = `${fx.flipX ? -1 : 1} ${fx.flipY ? -1 : 1}`;
    if (fx.mask) el.style.clipPath = MASKS[fx.mask] || '';
    if (fx.stroke) { el.style.webkitTextStroke = `${fx.stroke}px ${fx.strokec || '#d8b47a'}`; if (fx.hollow) { el.style.color = 'transparent'; el.style.webkitTextFillColor = 'transparent'; } }
    if (fx.dropcap) el.classList.add('ed-dropcap');
    if (fx.hover) el.classList.add('ed-hv-' + fx.hover);
    if (fx.loop) el.classList.add('ed-lp-' + fx.loop);
    if (fx.plx) { el.dataset.plx = fx.plx; el.classList.add('ed-plx'); }
    if (fx.blend) el.style.mixBlendMode = fx.blend;
  }

  /* ================================================================
     APPLICATION DU CALQUE
     ================================================================ */
  function remember(el, p) { if (!orig[p]) orig[p] = { style: el.getAttribute('style'), html: el.innerHTML, cls: el.className && el.className.baseVal === undefined ? el.className : null, src: el.tagName === 'IMG' ? el.getAttribute('src') : null }; }
  function restore(p) {
    const el = byPath(p), o = orig[p]; if (!el || !o) return;
    if (o.style == null) el.removeAttribute('style'); else el.setAttribute('style', o.style);
    if (o.cls != null) el.className = o.cls;
    if (o.src != null) el.setAttribute('src', o.src);
    delete el.dataset.plx;
    if (el.dataset.edHtml) { el.innerHTML = o.html; delete el.dataset.edHtml; delete el.dataset.locked; delete el.dataset.edTr; }
    delete el.dataset.edMod;
  }
  const styleOf = st => Object.fromEntries(Object.entries(st || {}).filter(([, v]) => v !== '' && v != null));
  function loadFonts() {
    const used = new Set(E.theme.fonts || []);
    const scan = st => { const f = st && st.fontFamily; if (f) Object.keys(GFONTS).forEach(g => { if (f.includes(g)) used.add(g); }); };
    E.add.forEach(a => scan(a.style)); Object.values(E.el).forEach(p => scan(p.style));
    used.forEach(f => {
      const id = 'ed-gf-' + f.replace(/\W/g, ''); if (document.getElementById(id)) return;
      const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.dataset.edFont = 1;
      l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f).replace(/%20/g, '+')}:ital,wght@0,400;0,500;0,700;1,400&display=swap`;
      document.head.appendChild(l);
    });
  }
  function pagesApply() {
    const pids = new Set(E.pages.map(p => p.id));
    app.querySelectorAll(':scope > section.cp').forEach(s => { if (!pids.has(s.id)) s.remove(); });
    for (const p of E.pages) {
      let s = document.getElementById(p.id);
      if (!s) { s = document.createElement('section'); s.className = 'cp stop'; s.id = p.id; app.appendChild(s); }
      s.style.minHeight = (p.h || 100) + 'vh';
      s.classList.toggle('ed-pinned-page', !!p.pin);
      let pb = s.querySelector(':scope > .ed-pinbox');
      if (p.pin && !pb) { pb = document.createElement('div'); pb.className = 'ed-pinbox'; pb.innerHTML = '<i class="ed-pinbar"></i>'; s.appendChild(pb); }
      if (!p.pin && pb) pb.remove();
    }
    const ids = baseOrder.filter(id => document.getElementById(id)), placed = new Set();
    for (const p of E.pages) {
      let i = ids.indexOf(p.after); if (i < 0) i = ids.length - 1;
      while (ids[i + 1] && placed.has(ids[i + 1])) i++;
      ids.splice(i + 1, 0, p.id); placed.add(p.id);
    }
    const order = E.order ? E.order.filter(id => ids.includes(id)).concat(ids.filter(id => !E.order.includes(id))) : ids;
    const cur = [...app.children].map(s => s.id);
    if (order.join() !== cur.filter(id => order.includes(id)).join()) order.forEach(id => { const s = document.getElementById(id); if (s) app.appendChild(s); });
    [...app.children].forEach(s => s.classList.toggle('ed-sec-hidden', !!E.hide[s.id] || pathHid(s.id)));
    const rail = document.getElementById('rail5');
    if (rail) rail.innerHTML = order.filter(id => (id !== 'fin' || E.names.fin) && !pathHid(id)).map(id => `<a href="#${id}" data-id="${id}" class="${baseNames['cls:' + id] || ''} ${E.hide[id] ? 'ed-sec-hidden' : ''}"><span>${esc(pageName(id))}</span><i></i></a>`).join('');
    return order;
  }
  function applyAll() {
    glossClear();
    peaksApply();
    applyVars();
    pagesApply();
    Object.keys(orig).forEach(restore);
    for (const [p, pt] of Object.entries(E.el)) {
      const el = byPath(p); if (!el) continue;
      remember(el, p);
      if (pt.html != null && !el.closest('svg')) { el.innerHTML = pt.html; el.dataset.edHtml = 1; el.dataset.locked = 1; el.removeAttribute('data-cnt'); }
      const u = pt.u || 'rem';
      if (pt.tx || pt.ty) el.style.translate = `${pt.tx || 0}${u} ${pt.ty || 0}${u}`;
      if (pt.rot) el.style.rotate = pt.rot + 'deg';
      if (pt.w) el.style.width = pt.w + u;
      if (pt.h) el.style.height = pt.h + u;
      if (pt.ts) Object.assign(el.style, textStyle(pt.ts, u));
      Object.assign(el.style, styleOf(pt.style));
      applyFx(el, pt.fx);
      if (pt.dev) el.classList.add('ed-dev-' + pt.dev);
      if (pt.count) el.classList.add('ed-count');
      if (pt.style && pt.style.zIndex && getComputedStyle(el).position === 'static') el.style.position = 'relative';
      if (pt.hidden) el.style.display = 'none';
      if (pt.lock) el.dataset.edLock = 1; else delete el.dataset.edLock;
      if (pt.src && el.tagName === 'IMG') el.setAttribute('src', pt.src);
      el.dataset.edMod = 1;
    }
    if (curLang() === 'en') for (const [k, v] of Object.entries(E.tr.en)) {
      if (k.includes(':')) continue;
      const el = byPath(k); if (!el || el.closest('svg')) continue;
      remember(el, k); el.innerHTML = v.t; el.dataset.edHtml = 1; el.dataset.edTr = 1; el.dataset.locked = 1; el.removeAttribute('data-cnt');
    }
    document.documentElement.lang = curLang();
    document.querySelectorAll('.ed-add').forEach(n => n.remove());
    for (const a of E.add) mountAdd(a);
    E.add.forEach(a => { if (a.hshow) { const t_ = addEl(a.hshow); if (t_) t_.classList.add('ed-hs-t'); } });
    footnotes();
    document.querySelectorAll('.ed-bgv').forEach(v => v.remove());
    Object.keys(origBg).forEach(id => { const s = document.getElementById(id), o = origBg[id]; if (s) { const t = s.querySelector(':scope > .ph') || s; o == null ? t.removeAttribute('style') : t.setAttribute('style', o); } });
    for (const [id, b] of Object.entries(E.bg)) {
      const s = document.getElementById(id); if (!s) continue;
      const t = s.querySelector(':scope > .ph') || s;
      if (!(id in origBg)) origBg[id] = t.getAttribute('style');
      if (b.color) t.style.background = b.color;
      if (b.grad) t.style.background = b.grad;
      if (b.pattern) { t.style.backgroundImage = `${b.grad ? b.grad + ',' : ''}repeating-linear-gradient(60deg, rgba(216,180,122,.06) 0 1px, transparent 1px 4rem), repeating-linear-gradient(-60deg, rgba(216,180,122,.06) 0 1px, transparent 1px 4rem)`; }
      if (b.video) {
        const v = document.createElement('video'); v.className = 'ed-bgv'; v.src = b.video; v.autoplay = v.muted = v.loop = v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        if (b.dim) v.style.filter = `brightness(${1 - b.dim})`;
        if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
        t.style.isolation = 'isolate'; t.prepend(v); v.play && v.play().catch(() => { });
      }
      if (b.image) { t.style.backgroundImage = `${b.dim ? `linear-gradient(rgba(5,10,31,${b.dim}),rgba(5,10,31,${b.dim})),` : ''}url("${b.image}")`; t.style.backgroundSize = 'cover'; t.style.backgroundPosition = 'center'; if (b.fixed) t.style.backgroundAttachment = 'fixed'; }
    }
    E.pages.forEach(p => { const s = document.getElementById(p.id); if (s) s.style.minHeight = (p.h || 100) + 'vh'; });
    if (burstIO) [...app.children].forEach(sc => { if ((E.bg[sc.id] || {}).burst) burstIO.observe(sc); });
    [...app.children].forEach(sc => { [...sc.classList].filter(c => c.startsWith('ed-pe')).forEach(c => sc.classList.remove(c)); const en = (E.bg[sc.id] || {}).enter; if (en) { sc.classList.add('ed-pe', 'ed-pe-' + en); peIO && peIO.observe(sc); } });
    applySettings(); bgAnims(); applyGlobalFx(); readerNav();
    loadFonts(); applyMood();
    sels = sels.map(s => document.contains(s) ? s : (s.dataset && s.dataset.addId ? addEl(s.dataset.addId) : null)).filter(Boolean);
    observeAnims(); parallax(); scrollAnim(); pinUpd(); fillAndCount(); inspect(); leftPanel(); paint(); presenterNotes();
    if (raceIO) document.querySelectorAll('.ed-race:not([data-played])').forEach(r => raceIO.observe(r));
    guidesDraw(); colsDraw();
    document.body.classList.toggle('ed-track', on && trackOn);
    readerUI(); askUI();
    langSw.hidden = on || presenting || !hasTr(); langSw.querySelectorAll('[data-l]').forEach(b => b.classList.toggle('on', b.dataset.l === curLang()));
    pinUpdate();
    glossApply();
  }
  function mountAdd(a) {
    let parent = a.pin ? fixedL : ((a.parent && byPath(a.parent)) || document.getElementById(a.sec)); if (!parent) return;
    if (!a.pin && parent.matches(`${ROOT} > section.ed-pinned-page`)) parent = parent.querySelector(':scope > .ed-pinbox') || parent;
    if (parent.classList.contains('ed-pinbox') && a.at != null) { /* seuil d'apparition géré par pinUpd */ }
    const n = document.createElement(a.link ? 'a' : 'div');
    if (a.link) { const o_ = ['#next', '#prev', '#top'].includes(a.link) ? visOrder() : null, i_ = o_ ? o_.indexOf(a.sec) : -1; n.href = !o_ ? a.link : a.link === '#top' ? '#' + o_[0] : '#' + (o_[Math.max(0, Math.min(o_.length - 1, i_ + (a.link === '#next' ? 1 : -1)))] || o_[0]); if (!a.link.startsWith('#')) { n.target = '_blank'; n.rel = 'noopener'; } }
    n.className = `ed-add ed-${a.kind}${a.memo ? ' ed-memo' : ''}${a.anim && a.anim !== 'none' ? ' ed-anim ed-anim-' + a.anim : ''}${a.hidden ? ' ed-hid' : ''}`; n.dataset.addId = a.id;
    if (a.grp) n.dataset.grp = a.grp;
    const u = a.u || 'rem', k = u === 'px' ? 1 : 10;
    if (a.kind === 'image') n.innerHTML = a.src ? `<img src="${esc(a.src)}" alt="${esc(a.alt || '')}" draggable="false" style="object-fit:${a.fit || 'cover'};object-position:${a.posx ?? 50}% ${a.posy ?? 50}%${a.zoom ? `;transform:scale(${a.zoom});transform-origin:${a.posx ?? 50}% ${a.posy ?? 50}%` : ''}">` : '<div class="ed-ph">Image<br><small>Inspecteur → Remplacer l’image</small></div>';
    else if (a.kind === 'chart' && a.chart && a.chart.type === 'race') { n.innerHTML = renderRace(linkedChart(a.chart)); n.classList.add('ed-racew'); }
    else if (a.kind === 'chart') { n.innerHTML = renderChart(linkedChart(a.chart), (a.w || 60) * k, (a.h || 34) * k); if (!a.chart || a.chart.anim !== false) n.classList.add('ed-canim'); if (a.chart && a.chart.src) n.dataset.linked = 1; }
    else if (a.kind === 'table') { n.innerHTML = renderTable(linkedTable(a.table)); if (a.table && a.table.src) n.dataset.linked = 1; }
    else if (a.kind === 'video') n.innerHTML = a.src ? `<video src="${esc(a.src)}" ${a.controls ? 'controls' : 'autoplay muted loop'} playsinline preload="metadata" style="object-fit:${a.fit || 'cover'}"></video>` : '<div class="ed-ph">Vidéo<br><small>Inspecteur → Choisir une vidéo</small></div>';
    else if (a.kind === 'timeline') n.innerHTML = renderTimeline(a.table);
    else if (a.kind === 'icon') n.innerHTML = iconSVG(a.icon, a.style && a.style.color, a.sw || 1.6);
    else if (a.kind === 'progress') { n.innerHTML = renderProgress(a.w_ || {}); n.classList.add('ed-canim'); }
    else if (a.kind === 'gauge') { n.innerHTML = renderGauge(a.w_ || {}); n.classList.add('ed-canim'); }
    else if (a.kind === 'post') n.innerHTML = renderPost(a.post || {});
    else if (a.kind === 'qr') n.innerHTML = a.svg || '<div class="ed-ph">QR code</div>';
    else if (a.kind === 'accordion') n.innerHTML = renderAccordion(a.table);
    else if (a.kind === 'toc') n.innerHTML = renderToc(a);
    else if (a.kind === 'connector') n.innerHTML = renderConnector(a);
    else if (a.kind === 'movers') n.innerHTML = renderMovers(a);
    else if (a.kind === 'draw') n.innerHTML = `<svg viewBox="0 0 ${a.vb[0]} ${a.vb[1]}" width="100%" height="100%" preserveAspectRatio="none" style="overflow:visible;display:block">${a.d.map(d => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${a.sw || 3}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;
    else if (a.kind === 'kpi2') n.innerHTML = renderKpi2(a);
    else if (a.kind === 'flip') n.innerHTML = renderFlip(a);
    else if (a.kind === 'countdown') n.innerHTML = renderCountdown(a);
    else if (a.kind === 'cloud') { n.innerHTML = renderCloud(a); n.classList.add('ed-canim'); }
    else if (a.kind === 'trend') { n.innerHTML = renderTrend(a); n.classList.add('ed-canim'); }
    else if (a.kind === 'cmp2') n.innerHTML = renderCmp2(a);
    else if (a.kind === 'toptl') { n.innerHTML = renderTopTl(a); n.classList.add('ed-canim'); }
    else if (a.kind === 'alerts') n.innerHTML = renderAlerts(a);
    else if (a.kind === 'rank') { n.innerHTML = renderRank(a); n.classList.add('ed-canim'); }
    else if (a.kind === 'senti') { n.innerHTML = renderSenti(a); n.classList.add('ed-canim'); }
    else if (a.kind === 'versus') { n.innerHTML = renderVersus(a); n.classList.add('ed-canim'); }
    else if (a.kind === 'team') n.innerHTML = renderTeam(a);
    else if (a.kind === 'tabs') n.innerHTML = renderTabs(a);
    else if (a.kind === 'hotspot') n.innerHTML = renderHot(a);
    else if (a.kind === 'reveal') n.innerHTML = renderReveal(a);
    else if (a.kind === 'ticker') n.innerHTML = renderTicker(a);
    else if (a.kind === 'sources') n.innerHTML = `<p><b>Sources</b> · Social listening Licter (Instagram, Facebook, X, LinkedIn, TikTok) · période : ${esc(String(TOKMAP.mois).toLowerCase())} · ${esc(TOKMAP.publications)} publications analysées${TOKMAP.nb_sujets ? ` · ${esc(TOKMAP.nb_sujets)} sujets suivis` : ''}${LB.date ? ` · rapport du ${esc(LB.date)}` : ''}. Sentiment net = part positive − part négative. Volumes concurrents estimés (voir Méthodologie).</p>`;
    else if (a.kind === 'auto') { const R_ = autoRules(); n.innerHTML = (a.rules || ['volume']).map(k => R_[k] ? `<p>${R_[k]}</p>` : '').join('') || '<p>—</p>'; }
    else if (a.kind === 'carousel') { n.innerHTML = renderCarousel(a); n.dataset.int = a.auto === false ? 0 : (a.int || 5); }
    else if (a.kind === 'compare') n.innerHTML = renderCompare(a);
    else if (a.kind !== 'shape') n.innerHTML = tokC(pageToks(trOf('add:' + a.id) || a.html || '', a));
    const iv_ = curMood() === 'ivoire', stl_ = Object.assign({}, a.ts ? textStyle(a.ts, u) : {}, styleOf(a.style));
    if (iv_) { for (const k in stl_) if (typeof stl_[k] === 'string') stl_[k] = ivMap(stl_[k]); if (/#[0-9a-f]{6}|rgba\(/i.test(n.innerHTML) && !/^data:/.test(n.innerHTML)) n.innerHTML = ivMap(n.innerHTML); }
    Object.assign(n.style, { position: 'absolute', left: a.x + u, top: a.y + u, zIndex: 30, width: a.w ? a.w + u : '', height: a.h ? a.h + u : '' }, stl_);
    if (a.dev) n.classList.add('ed-dev-' + a.dev);
    if (a.count) n.classList.add('ed-count');
    n.style.setProperty('--ord', a.mo != null ? a.mo : Math.round((a.y || 0) * 10) * 1000 + Math.round(a.x || 0)); if (a.w) n.style.setProperty('--w', a.w + u);
    if (a.lang && !on && a.lang !== curLang()) n.classList.add('ed-hid');
    if (a.pin) { n.classList.add('ed-pinned'); if (a.pinSkip) n.dataset.pinSkip = 1; }
    if (a.tip) n.dataset.tip = trOf('tip:' + a.id) || a.tip;
    if (a.toggle) { n.dataset.toggle = a.toggle; n.classList.add('ed-clk'); }
    if (a.reveal) n.classList.add('ed-rv-hid');
    if (E.set && E.set.csv && (a.kind === 'chart' || a.kind === 'table')) n.insertAdjacentHTML('beforeend', `<button class="ed-csv" data-csv="${a.id}" title="Télécharger les données (CSV)">⤓ Données</button>`);
    if (a.scr) n.dataset.scr = JSON.stringify(a.scr);
    if (['words', 'type', 'mark', 'letters'].includes(a.anim) && !['chart', 'table', 'image', 'video', 'shape', 'qr', 'compare'].includes(a.kind)) splitText(n, a.anim);
    if (a.rot) n.style.rotate = a.rot + 'deg';
    if (a.delay) n.style.setProperty('--ed-delay', a.delay + 's');
    if (a.ease) n.style.setProperty('--ed-ease', EASEV[a.ease] || '');
    if (a.rep) n.dataset.rep = 1;
    if (a.act && a.act.t) { n.dataset.act = JSON.stringify(a.act); n.classList.add('ed-clk'); }
    if (a.hshow) { n.addEventListener('mouseenter', () => { if (!on) { const t_ = addEl(a.hshow); if (t_) t_.classList.add('ed-hs-on'); } }); n.addEventListener('mouseleave', () => { const t_ = addEl(a.hshow); if (t_) t_.classList.remove('ed-hs-on'); }); }
    if (a.fx && a.fx.hovc) n.style.setProperty('--hovc', a.fx.hovc);
    if (['text', 'html'].includes(a.kind) && /\[\[/.test(n.innerHTML)) n.innerHTML = rotWords(n.innerHTML);
    if (a.fx && a.fx.mouse && !(a.fx && a.fx.plx)) n.dataset.mpx = a.fx.mouse;
    if (a.step) { n.dataset.step = a.step; n.classList.add('ed-step'); }
    if (a.at != null || a.until != null) { n.dataset.at = a.at || 0; if (a.until != null) n.dataset.until = a.until; n.classList.add('ed-at'); }
    if (a.scr && a.scr.mode === 'fill' && ['text', 'html'].includes(a.kind) && !n.querySelector('.ed-w')) splitText(n, 'words');
    if (a.anim === 'draw') n.querySelectorAll('path, line, polyline, polygon, circle, rect').forEach(pa => pa.setAttribute('pathLength', 1));
    if (a.kind === 'video' && a.scrub) { const v_ = n.querySelector('video'); if (v_) { v_.removeAttribute('autoplay'); v_.removeAttribute('loop'); v_.autoplay = false; v_.dataset.scrub = 1; v_.preload = 'auto'; } }
    if (a.kind === 'chart' && a.chart && a.chart.animMode && a.chart.anim !== false) { n.classList.add(a.chart.animMode === 'stagger' ? 'ed-stag' : 'ed-cfade'); if (a.chart.animMode === 'stagger') { let k_ = 0; n.querySelectorAll('.gb, .gbx').forEach(r_ => r_.style.setProperty('--i', k_++)); } }
    if (a.fx && a.fx.loop === 'marquee' && ['text', 'html'].includes(a.kind)) { n.innerHTML = `<div class="ed-mq"><span>${n.innerHTML}</span><span aria-hidden="true">${n.innerHTML}</span></div>`; n.style.overflow = 'hidden'; }
    if (a.dur) n.style.setProperty('--ed-dur', a.dur + 's');
    if (a.lock) n.dataset.edLock = 1;
    applyFx(n, a.fx, a.kind);
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    parent.appendChild(n);
  }
  const visOrder = () => orderNow().filter(id => !E.hide[id] && id !== 'fin' && !pathHid(id));
  function pageToks(h, a) {
    if (!/\{\{\s*pages?\s*\}\}/.test(h)) return h;
    const o = visOrder();
    return h.replace(/\{\{\s*pages\s*\}\}/g, String(o.length)).replace(/\{\{\s*page\s*\}\}/g, a.pin ? '<span data-pgn></span>' : String(Math.max(1, o.indexOf(a.sec) + 1)));
  }
  let pinRaf = 0;
  function pinUpdate() {
    pinRaf = 0;
    const o = visOrder(), cy = innerHeight / 2;
    const cur = o.find(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.top <= cy && r.bottom >= cy; }) || o[0];
    const k = o.indexOf(cur) + 1;
    fixedL.querySelectorAll('[data-pgn]').forEach(n => { n.textContent = k; });
    fixedL.querySelectorAll('[data-pin-skip]').forEach(n => n.classList.toggle('ed-pin-off', !on && k === 1));
  }
  addEventListener('scroll', () => { if (!pinRaf) pinRaf = requestAnimationFrame(pinUpdate); }, { passive: true });
  addEventListener('input', e => { const r = e.target.closest && e.target.closest('.ed-cmp input'); if (r) r.parentElement.style.setProperty('--p', r.value + '%'); });
  /* interactions lecteur : info-bulles et clic pour afficher / masquer */
  addEventListener('mouseover', e => {
    if (on) return; const mk = e.target.closest && e.target.closest('.ed-add [data-t]');
    if (mk) { tipB.textContent = mk.getAttribute('data-t'); tipB.classList.add('on'); mk.classList.add('ed-mk-on'); mk.addEventListener('mouseleave', () => mk.classList.remove('ed-mk-on'), { once: true }); return; }
    const t = e.target.closest && e.target.closest('[data-tip], .ed-gl');
    if (t && t.classList.contains('ed-gl')) { const g = E.gloss[+t.dataset.gl]; if (g) { tipB.innerHTML = `<b>${esc(g.t)}</b><br>${esc(g.d)}`; tipB.classList.add('on'); return; } }
    if (!t || !t.classList.contains('ed-add')) { tipB.classList.remove('on'); return; } tipB.innerHTML = esc(tok(t.dataset.tip)).replace(/\n/g, '<br>'); tipB.classList.add('on'); });
  addEventListener('mousemove', e => { if (!tipB.classList.contains('on')) return; const w = tipB.offsetWidth; tipB.style.left = Math.min(e.clientX + 16, innerWidth - w - 12) + 'px'; tipB.style.top = (e.clientY + 18) + 'px'; }, { passive: true });
  addEventListener('click', e => {
    if (on) return; const t = e.target.closest && e.target.closest('.ed-add[data-toggle]'); if (!t) return;
    const tg = addEl(t.dataset.toggle); if (!tg) return; e.preventDefault();
    if (tg.classList.contains('ed-rv-hid')) tg.classList.toggle('ed-rv-on'); else tg.classList.toggle('ed-tg-off');
    t.classList.toggle('ed-clk-on');
  });
  function splitText(n, mode) {
    if (mode === 'letters') mode = 'type';
    if (mode === 'mark') { n.innerHTML = `<span class="ed-mk">${n.innerHTML}</span>`; return; }
    let k = 0; const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), list = []; let t;
    while ((t = w.nextNode())) list.push(t);
    list.forEach(tn => {
      const f = document.createDocumentFragment();
      (mode === 'words' ? tn.nodeValue.split(/(\s+)/) : [...tn.nodeValue]).forEach(part => {
        if (!part) return; if (/^\s+$/.test(part)) { f.appendChild(document.createTextNode(part)); return; }
        const sp = document.createElement('span'); sp.className = mode === 'words' ? 'ed-w' : 'ed-c'; sp.style.setProperty('--i', k++); sp.textContent = part; f.appendChild(sp);
      });
      tn.parentNode.replaceChild(f, tn);
    });
  }
  function countEl(el) {
    const targets = el.querySelectorAll('.ed-kv').length ? [...el.querySelectorAll('.ed-kv')] : [el];
    targets.forEach(t => {
      if (t.children.length) return;
      const m = t.textContent.match(/^(\D*?)([−-]?[\d\s\u2009\u202f\u00a0]*\d(?:,\d+)?)(.*)$/s); if (!m) return;
      const dec = (m[2].split(',')[1] || '').length, to = parseFloat(m[2].replace(/[\s\u2009\u202f\u00a0]/g, '').replace('−', '-').replace(',', '.'));
      if (isNaN(to)) return;
      const t0 = performance.now(), D_ = 1500, fin = t.textContent;
      const stp = now => { const k = Math.min(1, (now - t0) / D_), v = to * (1 - Math.pow(1 - k, 3)); t.textContent = k >= 1 ? fin : m[1] + (v < 0 ? '−' : '') + nfr(Math.abs(v), dec) + m[3]; if (k < 1) requestAnimationFrame(stp); };
      requestAnimationFrame(stp);
    });
  }
  let animIO = null, countIO = null;
  const peIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('ed-pe-in'); }), { threshold: .12 }) : null;
  function observeAnims() {
    if ('IntersectionObserver' in window) {
      countIO = countIO || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !on && !e.target.dataset.counted) { e.target.dataset.counted = 1; countEl(e.target); } }), { threshold: .4 });
      document.querySelectorAll('.ed-count:not([data-counted])').forEach(n => countIO.observe(n));
    }
    const els = document.querySelectorAll('.ed-anim:not(.ed-in), .ed-canim:not(.ed-in), .ed-anim[data-rep]');
    if (!('IntersectionObserver' in window)) { els.forEach(n => n.classList.add('ed-in')); return; }
    animIO = animIO || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('ed-in'); else if (e.target.dataset.rep && !on && !e.target.classList.contains('ed-prev')) e.target.classList.remove('ed-in'); }), { threshold: .15 });
    els.forEach(n => animIO.observe(n));
  }
  function parallax() {
    const els = document.querySelectorAll('[data-plx]');
    els.forEach(el => { const r = el.getBoundingClientRect(), c = r.top + r.height / 2 - innerHeight / 2, k = +el.dataset.plx || 0; el.style.translate = on ? '' : `0 ${(-c * k * .25).toFixed(1)}px`; });
  }
  addEventListener('scroll', () => requestAnimationFrame(parallax), { passive: true });
  function scrollAnim() {
    document.querySelectorAll('[data-scr]').forEach(el => {
      if (on) { el.style.transform = ''; el.style.opacity = ''; if (el.style.clipPath && /"mode":"(clip|draw)"/.test(el.dataset.scr)) el.style.clipPath = ''; el.querySelectorAll('[pathLength]').forEach(pa => { pa.style.strokeDashoffset = ''; pa.style.strokeDasharray = ''; }); return; }
      let c; try { c = JSON.parse(el.dataset.scr); } catch (e) { return; }
      const r = el.getBoundingClientRect(), mid = r.top + r.height / 2;
      if (c.mode === 'fill' || c.mode === 'countup') return;
      if (c.mode === 'clip' || c.mode === 'draw') {
        const p_ = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight * .7)));
        if (c.mode === 'clip') el.style.clipPath = c.dir === 'bt' ? `inset(${((1 - p_) * 100).toFixed(1)}% 0 0 0)` : c.dir === 'c' ? `circle(${(p_ * 75).toFixed(1)}% at 50% 50%)` : `inset(0 ${((1 - p_) * 100).toFixed(1)}% 0 0)`;
        else el.querySelectorAll('path, polyline, line').forEach(pa => { if (!pa.getAttribute('pathLength')) pa.setAttribute('pathLength', 1); pa.style.strokeDasharray = 1; pa.style.strokeDashoffset = (1 - p_).toFixed(3); });
        return;
      }
      let k = c.mode === 'through' ? Math.max(-1, Math.min(1, (mid - innerHeight / 2) / (innerHeight / 2 + r.height / 2))) : Math.max(0, Math.min(1, (mid - innerHeight * .45) / (innerHeight * .55)));
      const e_ = c.mode === 'through' ? k : k * k * (3 - 2 * k);
      el.style.transform = `translate(${(c.x || 0) * e_}rem, ${(c.y || 0) * e_}rem) rotate(${(c.rot || 0) * e_}deg) scale(${1 + ((c.scale ?? 1) - 1) * Math.abs(e_)})`;
      if (c.op != null && c.mode !== 'through') el.style.opacity = String(1 - (1 - c.op) * e_);
    });
  }
  addEventListener('scroll', () => requestAnimationFrame(scrollAnim), { passive: true });
  // un texte généré réécrit par la page (compteurs, bascules) reprend la version modifiée
  new MutationObserver(ms => {
    for (const m of ms) {
      const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (!t || !t.closest) continue;
      const el = t.closest('[data-ed-html]');
      if (!el || el.isContentEditable) continue;
      const p = pathOf(el), pt = p && E.el[p], tr = el.dataset.edTr && p && E.tr.en && E.tr.en[p];
      if (tr) { if (el.innerHTML !== tr.t) el.innerHTML = tr.t; }
      else if (pt && pt.html != null && el.innerHTML !== pt.html) el.innerHTML = pt.html;
    }
  }).observe(app, { subtree: true, childList: true, characterData: true });

  /* ================================================================
     HISTORIQUE, POINTS DE RESTAURATION & ENREGISTREMENT
     ================================================================ */
  function snapshot() { undo.push(JSON.stringify(E)); if (undo.length > 150) undo.shift(); redo = []; }
  let autoT = null; const autoOn = () => { try { return localStorage.getItem('lvmh-autosave') === '1'; } catch (e) { return false; } };
  function changed(msg) {
    if (mode === 'artifact' && artifact && autoOn()) { clearTimeout(autoT); autoT = setTimeout(() => { if (dirty && on && !editing) save(); }, 120000); }
    E.updated = new Date().toISOString(); dirty = true;
    store.set(KEY, JSON.stringify(E));
    applyAll(); status(msg || (mode === 'artifact' ? 'Modifications non enregistrées' : 'Gardé dans ce navigateur'), 'warn');
  }
  function doUndo() { if (!undo.length) return; redo.push(JSON.stringify(E)); E = norm(JSON.parse(undo.pop())); store.set(KEY, JSON.stringify(E)); dirty = true; applyAll(); }
  function doRedo() { if (!redo.length) return; undo.push(JSON.stringify(E)); E = norm(JSON.parse(redo.pop())); store.set(KEY, JSON.stringify(E)); dirty = true; applyAll(); }
  const HKEY = KEY + '-points';
  const points = () => { try { return JSON.parse(store.get(HKEY) || '[]'); } catch (e) { return []; } };
  function addPoint(label) {
    const list = points(); list.unshift({ at: new Date().toISOString(), label: label || 'Point de restauration', e: JSON.stringify(E) });
    while (list.length > 15) list.pop();
    let ok = store.set(HKEY, JSON.stringify(list));
    while (!ok && list.length > 1) { list.pop(); ok = store.set(HKEY, JSON.stringify(list)); }
    return ok;
  }
  async function save() {
    if (mode !== 'artifact' || !artifact) { exportJSON(); return; }
    status('Enregistrement…');
    try {
      await artifact.publish({ 'edits.json': { content: JSON.stringify(E), contentType: 'application/json' } });
      dirty = false; store.del(KEY); addPoint('Enregistrement publié'); status('Enregistré : visible par toutes les personnes qui ouvrent le lien', 'ok');
    } catch (err) {
      const c = err && err.code;
      status({
        not_writer: "Vous n'avez pas les droits de modification sur cet artefact. Demandez un accès Éditeur.",
        not_granted: "L'enregistrement n'est pas autorisé dans cette vue.",
        capability_disabled: 'Enregistrement indisponible ici (lien public ?). Utilisez « Exporter ».',
        conflict: "Une autre version vient d'être enregistrée : la page se recharge, votre brouillon est conservé dans ce navigateur.",
        rate_limited: "Trop d'enregistrements rapprochés : réessayez dans quelques secondes.",
      }[c] || ("Échec de l'enregistrement" + (c ? ` (${c})` : '') + '. Votre brouillon est conservé dans ce navigateur.'), 'err');
    }
  }
  async function download(name, text, type) {
    if (downloads) {
      try { await downloads.save({ filename: name, data: new Blob([text], { type }) }); } catch (e) { if (!e || e.code !== 'cancelled') status("Le téléchargement n'a pas pu être proposé" + (e && e.code ? ` (${e.code})` : ''), 'err'); }
      return;
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  const fname = ext => `${CLIENT.replace(/[^\w-]+/g, '-')}_${CFG.file}_${PERIOD.replace(/\s+/g, '-')}.${ext}`;
  function exportJSON() { download(fname('edits.json'), JSON.stringify(E, null, 1), 'application/json'); status('Exporté : à placer dans content/<mois>.edits.json pour le prochain build', 'ok'); }
  function buildDoc(previewFlag) {
    const c = document.documentElement.cloneNode(true);
    [CFG.rebuild === false ? null : ROOT, '#rail5', '#brand5', '#tip5'].filter(Boolean).forEach(s => { const n = c.querySelector(s); if (n) { n.innerHTML = ''; n.className = ''; n.removeAttribute('style'); } });
    c.querySelectorAll('[data-ed-ui], [data-ed-font], #ed-fixed').forEach(n => n.remove());
    const b = c.querySelector('body'); b.className = ''; b.removeAttribute('style'); c.removeAttribute('style'); c.removeAttribute('data-mood'); c.removeAttribute('lang');
    const d = c.querySelector('#edits5'); if (d) d.textContent = JSON.stringify(E).replace(/<\//g, '<\\/');
    if (previewFlag) { const f = document.createElement('script'); f.textContent = 'window.__ED_PREVIEW = 1;'; c.querySelector('head').prepend(f); }
    return '<!doctype html>\n' + c.outerHTML;
  }
  function exportHTML() {
    download(fname('html'), buildDoc(false), 'text/html');
    status('Page exportée avec les modifications intégrées', 'ok');
  }

  /* ================================================================
     INTERFACE
     ================================================================ */
  const H = h => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstElementChild; };
  const lock = H(`<button id="ed-lock" data-ed-ui title="Accès administrateur (Ctrl+Maj+E)" aria-label="Accès administrateur">⚿</button>`);
  const login = H(`<div id="ed-login" data-ed-ui hidden><form><h3>Accès administrateur</h3><p>Saisissez le code pour modifier ce rapport.</p>
      <input id="ed-code" type="password" autocomplete="off" placeholder="Code" aria-label="Code administrateur"><div class="ed-err" id="ed-err"></div>
      <div class="ed-row"><button type="button" id="ed-cancel">Annuler</button><button type="submit" class="pri">Entrer</button></div></form></div>`);
  const LICTER = !!(D.tot && D.tot.cur);
  const BLOCKS0 = [
    ['Texte', [['kicker', 'Surtitre'], ['title', 'Titre'], ['subtitle', 'Sous-titre'], ['paragraph', 'Paragraphe'], ['list', 'Liste'], ['quote', 'Citation'], ['bignum', 'Grand chiffre'], ['tag', 'Badge']]],
    ['Données', [['kpi', 'Chiffre clé'], ['kpi2', 'Chiffre comparé (M-1, Y-1, courbe)'], ['auto', 'Insight automatique (sans IA)'], ['sources', 'Sources et méthode (auto)'], ['trend', 'Tendance sur un an (historique)'], ['cmp2', 'Comparer deux mois (historique)'], ['toptl', 'Sujet n°1 mois par mois'], ['alerts', 'Points d’attention (alertes)'], ['cloud', 'Nuage de mots des sujets'], ['rank', 'Classement des sujets (animé)'], ['senti', 'Thermomètre du sentiment'], ['versus', CLIENT + ' face à un concurrent'], ['chart', 'Graphique'], ['table', 'Tableau'], ['progress', 'Barre de progression'], ['gauge', 'Jauge'], ['timeline', 'Frise chronologique'], ['accordion', 'Questions / réponses'], ['toc', 'Sommaire cliquable'], ['movers', 'Mouvements du mois']]],
    ['Contenus', [['callout', 'Encadré insight'], ['post', 'Carte post réseau'], ['postshot', 'Carte post depuis une capture (IA)'], ['button', 'Bouton lien'], ['nav_next', 'Bouton page suivante'], ['nav_prev', 'Bouton page précédente'], ['nav_top', 'Retour au début'], ['image', 'Image'], ['media', 'Médiathèque…'], ['video', 'Vidéo'], ['compare', 'Avant / après'], ['carousel', 'Carrousel d’images'], ['qr', 'QR code'], ['memo', 'Note interne (admin)'], ['lib', 'Mes blocs…'], ['icon', 'Icône'], ['logo_lvmh', 'Logo ' + CLIENT], ['logo_licter', 'Logo Licter']]],
    ['Formes', [['shape', 'Rectangle'], ['circle', 'Cercle'], ['star', 'Étoile'], ['triangle', 'Triangle'], ['arrow', 'Flèche'], ['bubble', 'Bulle'], ['line', 'Ligne'], ['connector', 'Flèche / connecteur'], ['draw', 'Dessin à main levée'], ['ornament', 'Filet doré']]],
    ['Interactifs', [['flip', 'Carte retournable'], ['tabs', 'Onglets'], ['hotspot', 'Image à points'], ['reveal', 'Révélation (question / réponse)'], ['ticker', 'Bandeau défilant'], ['countdown', 'Compte à rebours'], ['team', 'Équipe / contacts']]],
    ['Assistant IA', [['ai_insight', 'Insight rédigé par l’IA'], ['ai_titles', 'Idées de titres'], ['ai_chart', 'Graphique décrit en une phrase'], ['ai_summary', 'Page « Synthèse exécutive »']]],
  ];
  const BLOCKS = LICTER ? BLOCKS0 : BLOCKS0.filter(([g]) => g !== 'Données').map(([g, it]) => [g, it.filter(([k]) => !['ticker'].includes(k))]);
  const TEMPLATES0 = [['focus', 'Focus sujet…'], ['kpiwall', 'Mur de chiffres'], ['vs', 'Face à un concurrent'], ['topics', 'Sujets : nuage et classement'], ['moves', 'Mouvements du mois'], ['closing', 'Clôture et contacts'], ['year', 'L’année en un coup d’œil'], ['blank', 'Page vierge'], ['title', 'Titre + texte'], ['kpis', '3 chiffres clés'], ['chart', 'Graphique commenté'], ['imgtext', 'Image + texte'], ['quote', 'Citation'], ['twocols', 'Deux colonnes'], ['table', 'Tableau'], ['timeline', 'Frise du mois'], ['posts', 'Top posts'], ['dashboard', 'Tableau de bord'], ['chapter', 'Ouverture de chapitre']];
  const TEMPLATES = LICTER ? TEMPLATES0 : TEMPLATES0.filter(([k]) => !['focus', 'kpiwall', 'vs', 'topics', 'moves', 'year'].includes(k));
  const bar = H(`<div id="ed-bar" data-ed-ui hidden>
      <b class="ed-logo">Édition</b>
      <button data-a="left" class="tg" title="Pages et calques (P)">Pages · Calques</button>
      <span class="ed-dd"><button data-a="addmenu" class="tg">+ Ajouter</button>
        <div class="ed-menu" id="ed-addmenu" hidden>${BLOCKS.map(([g, items]) => `<div class="ed-mg"><h6>${g}</h6>${items.map(([k, l]) => `<button data-add="${k}">${l}</button>`).join('')}</div>`).join('')}</div></span>
      <span class="ed-g"><button data-a="undo" title="Ctrl+Z">Annuler</button><button data-a="redo" title="Ctrl+Maj+Z">Rétablir</button></span>
      <span class="ed-g"><button data-a="find" title="Ctrl+F">Rechercher</button><button data-a="grid" id="ed-gridb" title="Grille magnétique (G)">Grille</button><button data-a="theme">Couleurs</button><button data-a="charte" title="Styles de texte et ambiance">Charte</button><button data-a="history">Historique</button></span>
      <span class="ed-dd"><button data-a="toolsmenu" class="tg">Outils ▾</button><div class="ed-menu ed-tools" id="ed-toolsmenu" hidden>
        <button data-a="month"><b>Préparer le rapport du mois</b><small>Liste de contrôle : données, focus, pics, relecture, validation, envoi</small></button>
        <button data-a="qc"><b>Contrôle qualité</b><small>Vérifier le rapport avant de le diffuser</small></button>
        <button data-a="translate"><b>Version anglaise</b><small>Traduire le rapport, bascule FR / EN pour les lecteurs</small></button>
        <button data-a="lib"><b>Mes blocs</b><small>Blocs enregistrés, réutilisables d’un mois à l’autre</small></button>
        <button data-a="import"><b>Importer</b><small>Reprendre les pages et la charte d’un autre mois</small></button>
        <button data-a="paths"><b>Parcours de lecture</b><small>Version courte / complète au choix du lecteur</small></button>
        <button data-a="focuspage"><b>Page « Focus sujet »</b><small>Générée depuis les données d’un sujet de la matrice</small></button>
        <button data-a="deck"><b>Exporter en PowerPoint / PDF</b><small>Tout le rapport, une page par diapositive, notes incluses</small></button>
        <button data-a="mail"><b>E-mail d’envoi</b><small>Texte d’accompagnement prêt à copier (modèle ou IA)</small></button>
        <button data-a="gloss"><b>Glossaire</b><small>Infobulles sur EMV, sentiment net, reach… pour les lecteurs</small></button>
        <button data-a="recolor"><b>Remplacer une couleur partout</b><small>Changer une teinte dans tous les éléments, fonds et styles</small></button>
        <button data-a="slim"><b>Alléger le rapport</b><small>Recompresser les grandes images pour une ouverture plus rapide</small></button>
        <button data-a="docinfo"><b>Informations du document</b><small>Pages, mots, temps de lecture, éléments, poids</small></button>
        <button data-a="curveimg"><b>Image de la courbe</b><small>La courbe annotée en PNG, pour un mail ou une présentation</small></button>
        <button data-a="images"><b>Images des graphiques</b><small>Chaque graphique du rapport en PNG ou SVG, avec titre et source</small></button>
        <button data-a="peaks"><b>Annotations de la courbe</b><small>Nommer ou masquer les pics, ajouter des points, événements et périodes</small></button>
        <button data-a="alertsbox"><b>Alertes et seuils</b><small>Signaux automatiques : sentiment négatif, chute de volume…</small></button>
        <button data-a="histcsv"><b>Exporter l’historique (CSV)</b><small>Tous les mois suivis, pour Excel</small></button>
        <button data-a="overview"><b>Vue d’ensemble</b><small>Toutes les pages en vignettes, glisser pour réordonner (O)</small></button>
        <button data-a="vars"><b>Variables personnalisées</b><small>Textes réutilisables et calculs sur les chiffres du mois</small></button>
        <button data-a="device"><b>Aperçu mobile / tablette</b><small>Voir le rapport tel qu’il s’affiche sur téléphone ou tablette</small></button>
        <button data-a="cols"><b>Grille de colonnes</b><small>12 colonnes magnétiques pour aligner la mise en page (K)</small></button>
        <button data-a="rulers"><b>Règles et repères</b><small>Glisser depuis la règle pour poser un repère magnétique (R)</small></button>
        <button data-a="proof"><b>Relecture IA</b><small>Orthographe, grammaire, typographie de tout le rapport</small></button>
        <button data-a="typo"><b>Typographie française</b><small>Espaces fines, guillemets, apostrophes dans les textes ajoutés</small></button>
        <button data-a="kiosk"><b>Mode kiosque</b><small>Défilement automatique en boucle (écran d’accueil, salon)</small></button>
        <button data-a="texts"><b>Exporter les textes</b><small>Tout le texte en Markdown (e-mail, Word) ou les notes</small></button>
        <button data-a="settings"><b>Réglages du rapport</b><small>Barre de lecture, filigrane, recherche, protection</small></button>
        <button data-a="cmdk"><b>Palette de commandes</b><small>Tout faire au clavier : Ctrl / Cmd + K</small></button>
        <button data-a="track"><b>Suivi des modifications</b><small>Surligner tout ce qui a été modifié ou ajouté</small></button></div></span>
      <span class="ed-sp"></span><span class="ed-st" id="ed-st"></span>
      <button data-a="left" id="ed-valc" class="ed-valc" title="Statut de relecture des pages">Validé 0/0</button>
      <button data-a="preview" title="Voir comme un lecteur">Aperçu</button><button data-a="present" title="Présenter avec notes et chronomètre">Présenter</button><button data-a="help" title="Raccourcis (?)">?</button>
      <button data-a="export-json" class="loc">Exporter</button><button data-a="export-html" class="loc">Télécharger</button>
      <button data-a="save" class="pri art-only" title="Ctrl+S">Enregistrer</button><button data-a="quit">Quitter</button></div>`);
  const pbar = H(`<div id="ed-pbar" data-ed-ui hidden><span>Aperçu lecteur</span><button data-a="unpreview" class="pri">Retour à l'édition</button></div>`);
  const present = H(`<div id="ed-present" data-ed-ui hidden><div class="ed-pr-n"><b id="ed-pr-page"></b><div id="ed-pr-notes"></div></div><div class="ed-pr-r"><span class="ed-pr-tools"><button data-a="laser" title="L">Laser</button><button data-a="spot" title="S">Projecteur</button><button data-a="pen" title="D">Stylo</button><button data-a="penclear" title="C">Effacer</button><button data-a="black" title="B">Écran noir</button><button data-a="live" id="ed-livebtn" hidden>Diffuser en direct</button></span><span id="ed-pr-pt"></span><span id="ed-pr-time">00:00</span><button data-a="unpresent">Terminer</button></div></div>`);
  const left = H(`<aside id="ed-left" data-ed-ui hidden><div class="ed-tabs"><button data-tab="pages" class="on">Pages</button><button data-tab="layers">Calques</button><button data-a="left" class="ed-x" aria-label="Fermer">×</button></div><div id="ed-lbody"></div></aside>`);
  const insp = H(`<aside id="ed-insp" data-ed-ui hidden><div id="ed-ibody"></div></aside>`);
  const hovB = H(`<div id="ed-hov" data-ed-ui></div>`);
  const selB = H(`<div id="ed-sel" data-ed-ui><i class="ed-h" data-h="se"></i><i class="ed-h" data-h="e"></i><i class="ed-h" data-h="s"></i><i class="ed-rot" title="Faire pivoter (Maj : par 15°)"></i><span class="ed-tag" id="ed-tag"></span></div>`);
  const guideX = H(`<div class="ed-guide x" data-ed-ui></div>`), guideY = H(`<div class="ed-guide y" data-ed-ui></div>`), gridOv = H(`<div id="ed-grid" data-ed-ui hidden></div>`);
  const banner = H(`<div id="ed-draft" data-ed-ui hidden><span>Un brouillon non enregistré existe dans ce navigateur.</span><button id="ed-restore">Restaurer</button><button id="ed-discard">Ignorer</button></div>`);
  const modal = H(`<div id="ed-modal" data-ed-ui hidden><div class="ed-mbox" role="dialog" aria-modal="true"><div id="ed-mbody"></div></div></div>`);
  const file = H(`<input type="file" accept="image/*" data-ed-ui hidden>`);
  document.body.append(lock, login, gridOv, bar, pbar, present, left, insp, hovB, selB, guideX, guideY, banner, modal, file);
  const extraBoxes = [];
  const laserD = H(`<div id="ed-laser" data-ed-ui hidden></div>`), spotD = H(`<div id="ed-spot" data-ed-ui hidden></div>`), blackD = H(`<div id="ed-black" data-ed-ui hidden></div>`), penC = H(`<canvas id="ed-pen" data-ed-ui hidden></canvas>`);
  const liveB = H(`<div id="ed-live" data-ed-ui hidden><i></i><span id="ed-live-t">Présentation en direct</span><button id="ed-live-f">Suivre</button></div>`);
  const readerB = H(`<div id="ed-reader" data-ed-ui hidden><select id="ed-path-s" aria-label="Parcours de lecture"></select><button id="ed-listen" hidden>▶ Écouter</button><button id="ed-moodsw" hidden title="Mode jour / nuit">☀</button><button id="ed-helpb" hidden title="Mode d’emploi du rapport">? Mode d’emploi</button></div>`);
  document.body.append(laserD, spotD, blackD, penC, liveB, readerB);
  const progB = H(`<div id="ed-progb" data-ed-ui hidden><i></i></div>`), wmL = H(`<div id="ed-wm" data-ed-ui hidden></div>`);
  const cmdBox = H(`<div id="ed-cmdk" data-ed-ui hidden><div class="ed-cmdk-b"><input id="ed-cmdq" placeholder="Rechercher une page, un mot du rapport${''}…" autocomplete="off"><div id="ed-cmdl"></div><p class="ed-cmdk-f">↑ ↓ pour choisir · Entrée pour valider · Échap pour fermer</p></div></div>`);
  document.body.append(progB, wmL, cmdBox);
  const fxDefs = H(`<svg id="ed-fxdefs" data-ed-ui width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${[['gold', '#050a1f', '#d8b47a'], ['navy', '#040f2b', '#7f9cff'], ['rose', '#2a0b1a', '#f0b8a8'], ['ivoire', '#101a33', '#f4f1ea']].map(([k, a_, b_]) => { const c1 = a_.match(/\w\w/g).map(h => parseInt(h, 16) / 255), c2 = b_.match(/\w\w/g).map(h => parseInt(h, 16) / 255); return `<filter id="ed-duo-${k}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer>${['R', 'G', 'B'].map((ch, i) => `<feFunc${ch} type="table" tableValues="${c1[i].toFixed(3)} ${c2[i].toFixed(3)}"/>`).join('')}</feComponentTransfer></filter>`; }).join('')}</defs></svg>`);
  document.body.append(fxDefs);
  const fixedL = H(`<div id="ed-fixed"></div>`), tipB = H(`<div id="ed-tipb" data-ed-ui></div>`);
  const langSw = H(`<div id="ed-lang" data-ed-ui hidden><button data-l="fr">FR</button><button data-l="en">EN</button></div>`);
  document.body.append(fixedL, tipB, langSw);
  langSw.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (!b) return; lang = b.dataset.l; try { localStorage.setItem('lvmh-lang', lang); } catch (er) { } applyAll(); });
  const st = document.getElementById('ed-st');
  function status(t, k) { st.textContent = t || ''; st.title = t || ''; st.className = 'ed-st ' + (k || ''); }

  /* ---------- sélection & cadres ---------- */
  function selectable(t) {
    if (!t || !t.closest || t.closest('[data-ed-ui]') || !(app.contains(t) || fixedL.contains(t))) return null;
    const add = t.closest('.ed-add'); if (add) return add;
    let s = t.closest('svg'); if (s) { while (s.parentElement && s.parentElement.closest('svg')) s = s.parentElement.closest('svg'); t = (s.parentElement && s.parentElement.children.length === 1) ? s.parentElement : s; }
    if (t.matches('section, .stk, .steps, .step, .track, .rows')) return null;
    return t;
  }
  const groupOf = el => { const a = isAdd(el) && addOf(el); return a && a.grp ? [...document.querySelectorAll(`.ed-add[data-grp="${a.grp}"]`)] : [el]; };
  const pageLocked = sec => !!(sec && E.set && E.set.lockok && E.status[sec.id] === 'ok');
  function select(el, addTo = false) {
    if (el && pageLocked(sectionOf(el))) { status('Page validée et verrouillée : repassez-la « À relire » (Pages) pour la modifier', 'warn'); return; }
    if (editing && editing !== el) stopText();
    if (!el) sels = [];
    else if (addTo) { const i = sels.indexOf(el); i >= 0 ? sels.splice(i, 1) : sels.push(el); }
    else sels = [el];
    const s = sel();
    if (s) document.getElementById('ed-tag').textContent = sels.length > 1 ? `${sels.length} éléments` : kindLabel(s);
    inspect(); paint(); if (leftTab === 'layers') leftPanel();
  }
  function kindLabel(el) {
    if (isAdd(el)) { const a = addOf(el); return a.name || ({ text: 'Texte', html: 'Bloc', image: 'Image', shape: 'Forme', chart: 'Graphique', table: 'Tableau', timeline: 'Frise', icon: 'Icône', progress: 'Progression', gauge: 'Jauge', post: 'Carte post', qr: 'QR code', video: 'Vidéo', connector: 'Flèche', movers: 'Mouvements du mois', carousel: 'Carrousel', draw: 'Dessin', kpi2: 'Chiffre comparé', auto: 'Insight automatique', sources: 'Sources', flip: 'Carte retournable', tabs: 'Onglets', hotspot: 'Image à points', reveal: 'Révélation', ticker: 'Bandeau défilant', countdown: 'Compte à rebours', cloud: 'Nuage des sujets', trend: 'Tendance sur un an', cmp2: 'Comparer deux mois', toptl: 'Sujet n°1 mois par mois', alerts: 'Points d’attention', rank: 'Classement', senti: 'Thermomètre du sentiment', versus: CLIENT + ' face à…', team: 'Équipe', accordion: 'Questions / réponses', toc: 'Sommaire', compare: 'Avant / après' }[a.kind] || 'Élément') + (a.pin ? ' · épinglé' : ''); }
    if (el.tagName === 'svg' || el.querySelector(':scope > svg')) return 'Graphique';
    if (el.tagName === 'IMG') return 'Image';
    return 'Bloc';
  }
  function frame(box, el) {
    if (!el || !document.contains(el)) { box.style.display = 'none'; return; }
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) { box.style.display = 'none'; return; }
    Object.assign(box.style, { display: 'block', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  }
  function paint() {
    const s0 = sel(); if (s0) { const t = sels.length > 1 ? `${sels.length} éléments` : kindLabel(s0); const tg = document.getElementById('ed-tag'); if (tg.textContent !== t) tg.textContent = t; }
    frame(hovB, on && !sels.includes(hovEl) ? hovEl : null);
    frame(selB, on ? sel() : null);
    selB.classList.toggle('multi', sels.length > 1);
    const others = on ? sels.slice(0, -1) : [];
    while (extraBoxes.length < others.length) { const b = H('<div class="ed-sel2" data-ed-ui></div>'); document.body.appendChild(b); extraBoxes.push(b); }
    extraBoxes.forEach((b, i) => frame(b, others[i] || null));
    if (altDown || measL.firstChild) measure();
  }
  (function loop() { if (on) paint(); requestAnimationFrame(loop); })();

  /* ---------- patchs ---------- */
  function patchOf(el, create = true) {
    if (isAdd(el)) return addOf(el);
    const p = pathOf(el); if (!p) return null;
    if (!E.el[p] && create) E.el[p] = { u: unitOf(el) };
    return E.el[p];
  }
  function setStyleAll(k, v) { if (!sels.length) return; snapshot(); sels.forEach(el => { const pt = patchOf(el); if (pt) pt.style = Object.assign({}, pt.style, { [k]: v }); }); changed(); }
  function setFx(k, v) { if (!sels.length) return; snapshot(); sels.forEach(el => { const pt = patchOf(el); if (!pt) return; pt.fx = Object.assign({}, pt.fx); if (v === null || v === '' || v === false) delete pt.fx[k]; else pt.fx[k] = v; }); changed(); }

  /* ---------- texte ---------- */
  function startText(el) {
    if (!el || el.dataset.edLock) { status('Élément verrouillé : déverrouillez-le dans l’inspecteur', 'warn'); return; }
    const a = isAdd(el) && addOf(el);
    if (a && ['chart', 'table', 'timeline', 'accordion', 'tabs', 'team'].includes(a.kind)) return openData(el);
    if (el.tagName === 'IMG' || el.tagName === 'svg' || el.querySelector('svg') || (a && ['image', 'shape', 'icon', 'progress', 'gauge', 'post', 'qr', 'video', 'toc', 'compare', 'connector', 'movers', 'carousel', 'draw', 'kpi2', 'auto', 'sources', 'flip', 'tabs', 'hotspot', 'reveal', 'ticker', 'countdown', 'cloud', 'rank', 'senti', 'versus', 'trend', 'cmp2', 'toptl', 'alerts'].includes(a.kind))) { status('Cet élément se règle dans l’inspecteur', 'warn'); return; }
    select(el); editing = el;
    if (a) el.innerHTML = a.html || '';
    el.contentEditable = 'true'; el.classList.add('ed-editing'); el.focus();
    const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    inspect();
  }
  function stopText() {
    const el = editing; if (!el) return; editing = null; savedRange = null;
    el.contentEditable = 'false'; el.removeAttribute('contenteditable'); el.classList.remove('ed-editing');
    const html = mdInline(el.innerHTML);
    snapshot();
    if (isAdd(el)) addOf(el).html = E.set.typo ? frTypo(html) : html;
    else { const p = pathOf(el); if (!p) return; remember(el, p); if (html === orig[p].html && !(E.el[p] && E.el[p].html != null)) { undo.pop(); inspect(); return; } (E.el[p] = E.el[p] || { u: unitOf(el) }).html = html; }
    changed();
  }
  const keepRange = () => { if (!editing) return; const s = getSelection(); if (s.rangeCount && editing.contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange(); };
  document.addEventListener('selectionchange', keepRange);
  ['keyup', 'mouseup', 'input'].forEach(ev => document.addEventListener(ev, keepRange, true));
  function inline(cmd, val) {
    if (!editing) return;
    editing.focus(); if (savedRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
    document.execCommand('styleWithCSS', false, cmd !== 'insertText'); document.execCommand(cmd, false, val);
  }

  /* ---------- ajout d'éléments ---------- */
  function curSection() {
    if (sel()) return sectionOf(sel());
    const cy = innerHeight / 2;
    return [...app.children].find(s => { const r = s.getBoundingClientRect(); return r.top <= cy && r.bottom >= cy && s.offsetHeight; });
  }
  function container() {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    [hovB, selB].forEach(b => b.style.display = 'none');
    let t = document.elementFromPoint(cx, cy);
    if (t && t.closest('[data-ed-ui]')) t = null;
    const sec = (t && sectionOf(t)) || curSection(); if (!sec) return null;
    if (t && sec.contains(t)) { const c = t.closest('.pan, .mx5 .box'); if (c) return c; }
    return sec.querySelector(':scope > .stk, :scope > .ed-pinbox') || sec;
  }
  function blockDef(kind, u) {
    const d = blockDef0(kind, u);
    if (LICTER || !d) return d;
    return JSON.parse(JSON.stringify(d).replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (m, k) => k in TOKMAP ? m : '[à compléter]'));
  }
  function blockDef0(kind, u) {
    const k = u === 'px' ? 10 : 1, T = D.tot || {}, cur = T.cur || {};
    const tbl = { rows: [['Indicateur', LB.m || 'Mois', LB.m1 || 'M-1'], ['Publications', '{{publications}}', nfr(T.m1 && T.m1.total)], ['Sentiment net', '{{sentiment_net}}', T.m1 ? sgn(T.m1.net * 100) : ''], ['EMV', '{{emv}}', D.emv && D.emv.m1 ? nfr(D.emv.m1 / 1e6, 1) + ' M€' : '']] };
    const pr = presets(), ch = (pr.find(p => /concurrents/.test(p[0])) || pr[0] || ['', { type: 'bar', labels: ['A', 'B', 'C'], series: [{ name: 'Série 1', values: [3, 5, 2] }] }])[1];
    const tl = { rows: (D.focus || []).filter(f => f.kind === 'daily').map(f => { const t = f.series.reduce((a, p) => p.value > a.value ? p : a, f.series[0]); return [dl(t.date), `${f.sheet} : pic à ${nfr(t.value)} publications`]; }).concat([[LB.m || 'Mois', 'Ajoutez les temps forts du mois']]).slice(0, 5), header: false };
    const d = {
      kicker: { kind: 'text', w: 50, html: 'SURTITRE', style: { fontSize: '1.3rem', letterSpacing: '.32em', color: '#d8b47a', fontFamily: SANS } },
      title: { kind: 'text', w: 90, html: 'Titre de la page', style: { fontFamily: SERIF, fontSize: '6rem', fontWeight: '500', lineHeight: '1.05', color: '#f4f1ea' } },
      subtitle: { kind: 'text', w: 70, html: 'Sous-titre', style: { fontFamily: SERIF, fontStyle: 'italic', fontSize: '3.2rem', color: '#d8b47a', lineHeight: '1.15' } },
      paragraph: { kind: 'text', w: 60, html: 'En {{mois}}, ' + CLIENT + ' totalise {{publications}} publications ({{publications_vs_m1}} vs le mois précédent) et un sentiment net de {{sentiment_net}}.', style: { fontSize: '1.8rem', lineHeight: '1.55', color: '#b7bdd0', fontFamily: SANS } },
      list: { kind: 'text', w: 60, html: '<ul><li>Premier point</li><li>Deuxième point</li><li>Troisième point</li></ul>', style: { fontSize: '1.8rem', lineHeight: '1.6', color: '#b7bdd0', fontFamily: SANS } },
      quote: { kind: 'text', w: 100, html: '« Une phrase forte qui résume le mois. »', style: { fontFamily: SERIF, fontSize: '4.4rem', lineHeight: '1.15', color: '#f4f1ea', borderLeft: '.3rem solid #d8b47a', paddingLeft: '3rem' } },
      bignum: { kind: 'text', w: 60, html: '{{publications}}', style: { fontFamily: SANS, fontSize: '14rem', fontWeight: '200', lineHeight: '1', color: '#f4f1ea', letterSpacing: '-.03em' } },
      tag: { kind: 'text', w: 16, html: 'NOUVEAU', style: { fontFamily: SANS, fontSize: '1.2rem', letterSpacing: '.2em', color: '#050a1f', background: '#d8b47a', borderRadius: '3rem', padding: '.6rem 1.4rem', textAlign: 'center', fontWeight: '600' } },
      kpi: { kind: 'html', w: 34, html: '<div class="ed-kl">Publications</div><div class="ed-kv">{{publications}}</div><div class="ed-kd">{{publications_vs_m1}} vs M-1</div>', style: { background: '#0b1430', borderRadius: '2rem', padding: '2.6rem 3rem', fontFamily: SANS } },
      callout: { kind: 'html', w: 50, html: '<b>Insight</b><br>Un enseignement clé à retenir.', style: { background: 'rgba(216,180,122,.12)', border: '1px solid rgba(216,180,122,.5)', borderRadius: '1.4rem', padding: '2rem 2.4rem', fontSize: '1.7rem', color: '#f4f1ea', lineHeight: '1.5', fontFamily: SANS } },
      button: { kind: 'text', w: 24, html: 'En savoir plus →', link: 'https://', style: { background: '#d8b47a', color: '#050a1f', borderRadius: '3rem', padding: '1.2rem 2.4rem', fontSize: '1.6rem', textAlign: 'center', fontWeight: '500', fontFamily: SANS, textDecoration: 'none' } },
      chart: { kind: 'chart', w: 80, h: 42, chart: JSON.parse(JSON.stringify(ch)) },
      table: { kind: 'table', w: 70, table: tbl, style: { fontSize: '1.7rem', color: '#f4f1ea', fontFamily: SANS } },
      timeline: { kind: 'timeline', w: 70, table: tl, style: { fontSize: '1.6rem', color: '#f4f1ea', fontFamily: SANS } },
      progress: { kind: 'progress', w: 50, w_: { label: 'Part de publications positives', value: cur.pos_pct != null ? Math.round(cur.pos_pct * 1000) / 10 : 32, max: 100, unit: ' %', dec: 1, color: '#6fcf97' }, style: { fontFamily: SANS, fontSize: '1.6rem', color: '#f4f1ea' } },
      gauge: { kind: 'gauge', w: 34, h: 22, w_: { label: 'Score e-réputation', value: (D.baro && D.baro.brands && D.baro.brands[CLIENT] && Math.round(D.baro.brands[CLIENT].score_total)) || 50, max: 300, color: '#d8b47a' } },
      post: { kind: 'post', w: 34, post: { network: 'Instagram', handle: '@lvmh', date: '', engagements: '', text: '' }, style: { fontFamily: SANS } },
      image: { kind: 'image', w: 50, h: 32, style: { borderRadius: '1.6rem' } },
      icon: { kind: 'icon', w: 8, h: 8, icon: 'Éclat', style: { color: '#d8b47a' } },
      logo_lvmh: { kind: 'text', w: 30, html: CLIENT, style: { fontFamily: WM, fontSize: '6rem', letterSpacing: '.08em', color: '#f4f1ea', lineHeight: '1' } },
      logo_licter: { kind: 'text', w: 10, html: '<span style="display:block">lic</span><span style="display:block;margin-left:.16em">ter</span>', style: { fontFamily: SANS, fontSize: '4rem', fontWeight: '500', letterSpacing: '-.04em', lineHeight: '.8', color: '#f4f1ea' } },
      shape: { kind: 'shape', w: 26, h: 16, style: { background: '#d8b47a', borderRadius: '1.2rem' } },
      circle: { kind: 'shape', w: 16, h: 16, style: { background: '#d8b47a', borderRadius: '50%' } },
      line: { kind: 'shape', w: 40, h: .3, style: { background: '#d8b47a' } },
      ornament: { kind: 'shape', w: 60, h: .2, style: { background: 'linear-gradient(90deg, transparent, #d8b47a 30%, #f0d6a6 50%, #d8b47a 70%, transparent)' } },
      nav_next: { kind: 'text', w: 26, html: 'Page suivante →', link: '#next', style: { fontFamily: SANS, fontSize: '1.5rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#d8b47a', border: '1px solid rgba(216,180,122,.5)', borderRadius: '3rem', padding: '1rem 2rem', textAlign: 'center' } },
      nav_prev: { kind: 'text', w: 26, html: '← Page précédente', link: '#prev', style: { fontFamily: SANS, fontSize: '1.5rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#b7bdd0', border: '1px solid rgba(244,241,234,.25)', borderRadius: '3rem', padding: '1rem 2rem', textAlign: 'center' } },
      nav_top: { kind: 'text', w: 24, html: '↑ Retour au début', link: '#top', style: { fontFamily: SANS, fontSize: '1.4rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#b7bdd0', padding: '1rem 0' } },
      cmp2: { kind: 'cmp2', w: 80, name: 'Comparer deux mois', style: { fontFamily: SANS } },
      toptl: { kind: 'toptl', w: 150, n: 12, name: 'Sujet n°1 mois par mois', style: { fontFamily: SANS } },
      alerts: { kind: 'alerts', w: 70, name: 'Points d’attention', style: { fontFamily: SANS } },
      trend: { kind: 'trend', w: 46, metric: 'total', name: 'Tendance sur un an', style: { fontFamily: SANS, background: 'rgba(244,241,234,.04)', border: '1px solid rgba(244,241,234,.1)', borderRadius: '1.6rem', padding: '2.2rem' } },
      cloud: { kind: 'cloud', w: 90, n: 28, name: 'Nuage des sujets', style: { fontFamily: SANS, fontSize: '1rem' } },
      rank: { kind: 'rank', w: 60, metric: 'volume', n: 8, name: 'Classement des sujets', style: { fontFamily: SANS } },
      senti: { kind: 'senti', w: 70, name: 'Thermomètre du sentiment', style: { fontFamily: SANS } },
      versus: { kind: 'versus', w: 70, name: CLIENT + ' face à un concurrent', style: { fontFamily: SANS } },
      team: { kind: 'team', w: 90, name: 'Équipe', table: { header: false, rows: [['Prénom Nom', 'Directeur·rice de clientèle', 'prenom.nom@licter.com'], ['Prénom Nom', 'Analyste e-réputation', 'prenom.nom@licter.com'], ['Prénom Nom', 'Data analyst', 'prenom.nom@licter.com']] }, style: { fontFamily: SANS } },
      countdown: { kind: 'countdown', w: 56, label: 'Prochain rendez-vous ' + CLIENT, style: { fontFamily: SANS } },
      flip: { kind: 'flip', w: 34, h: 24, html: '<b>20 788</b><br>publications', back: 'Soit {{publications_vs_m1}} par rapport au mois précédent.', flipOn: 'hover', style: { fontFamily: SANS, fontSize: '2rem', borderRadius: '1.6rem' } },
      tabs: { kind: 'tabs', w: 80, table: { rows: [['Volume', 'En {{mois}}, {{publications}} publications ({{publications_vs_m1}} vs M-1).'], ['Sentiment', 'Sentiment net de {{sentiment_net}} ({{sentiment_vs_m1}}).'], ['Valeur', 'EMV de {{emv}} ({{emv_vs_m1}} vs M-1).']] }, style: { fontFamily: SANS } },
      hotspot: { kind: 'hotspot', w: 70, h: 40, pts: [], style: { borderRadius: '1.2rem', overflow: 'hidden' } },
      reveal: { kind: 'reveal', w: 60, html: 'Combien de publications ce mois-ci ?', ans: '{{publications}}', btn: 'Révéler la réponse', style: { fontFamily: SANS } },
      ticker: { kind: 'ticker', w: 160, items: '{{publications}} publications\nSentiment net {{sentiment_net}}\nEMV {{emv}}\nScore e-réputation {{score}}\nSujet n°1 : {{top_sujet}}', speed: 30, style: { fontFamily: SANS, fontSize: '2.4rem', color: '#f4f1ea', borderTop: '1px solid rgba(244,241,234,.12)', borderBottom: '1px solid rgba(244,241,234,.12)', padding: '1.4rem 0' } },
      sources: { kind: 'sources', w: 110, name: 'Sources', style: { fontFamily: SANS, fontSize: '1.3rem', lineHeight: '1.6', color: '#7480a3' } },
      auto: { kind: 'auto', w: 60, rules: ['volume', 'sentiment'], name: 'Insight automatique', style: { fontFamily: SANS, fontSize: '1.9rem', lineHeight: '1.6', color: '#e6e2d8' } },
      kpi2: { kind: 'kpi2', w: 34, metric: 'publications', name: 'Chiffre comparé', style: { background: 'rgba(244,241,234,.05)', border: '1px solid rgba(244,241,234,.12)', borderRadius: '1.6rem', padding: '2.4rem', fontFamily: SANS } },
      draw: { kind: 'draw' },
      movers: { kind: 'movers', w: 120, name: 'Mouvements du mois', style: { fontFamily: SANS } },
      carousel: { kind: 'carousel', w: 70, h: 40, items: [], int: 5, style: { borderRadius: '1.2rem', overflow: 'hidden' } },
      connector: { kind: 'connector', w: 30, h: 8, cn: { curve: 0, head: 'end', dash: false, sw: 2.5 }, style: { color: '#d8b47a' } },
      toc: { kind: 'toc', w: 56, name: 'Sommaire', style: { fontFamily: SANS, color: '#f4f1ea' } },
      accordion: { kind: 'accordion', w: 70, table: { rows: [['Pourquoi ce pic le 17 ?', 'La réponse de B. Arnault au Monde a été massivement relayée sur X.'], ['Quels réseaux portent la conversation ?', 'Instagram et X concentrent l’essentiel des publications.'], ['Que surveiller le mois prochain ?', 'Les retombées du ' + CLIENT + ' Prize et la Formule 1.']] }, style: { fontFamily: SANS } },
      compare: { kind: 'compare', w: 70, h: 40, l1: 'Avant', l2: 'Après', style: { borderRadius: '1.2rem', overflow: 'hidden' } },
      qr: { kind: 'qr', w: 16, h: 16, style: { background: '#f4f1ea', color: '#050a1f', padding: '1.2rem', borderRadius: '1rem' } },
      memo: { kind: 'html', w: 26, html: '<b>Note interne</b><br>Visible uniquement en mode admin.', name: 'Note interne', memo: true, style: { background: '#fff3a8', color: '#3a3000', fontFamily: SANS, fontSize: '1.5rem', lineHeight: '1.45', padding: '1.4rem 1.6rem', borderRadius: '.4rem', boxShadow: '0 1rem 2.4rem rgba(0,0,0,.35)' }, rot: -2 },
      star: { kind: 'shape', w: 14, h: 14, style: { background: '#d8b47a' }, fx: { mask: 'star' } },
      triangle: { kind: 'shape', w: 14, h: 12, style: { background: '#d8b47a' }, fx: { mask: 'triangle' } },
      arrow: { kind: 'shape', w: 20, h: 10, style: { background: '#d8b47a' }, fx: { mask: 'arrow' } },
      bubble: { kind: 'html', w: 36, h: 14, html: 'Un verbatim marquant', style: { background: '#f4f1ea', color: '#050a1f', fontFamily: SANS, fontSize: '1.7rem', padding: '1.6rem 2rem 4.4rem', lineHeight: '1.4' }, fx: { mask: 'bubble' } },
      video: { kind: 'video', w: 56, h: 32, style: { borderRadius: '1.6rem', overflow: 'hidden' } },
    }[kind];
    const o = JSON.parse(JSON.stringify(d));
    ['w', 'h'].forEach(x => { if (o[x]) o[x] *= k; });
    if (o.style) for (const [sk, sv] of Object.entries(o.style)) if (typeof sv === 'string' && /rem/.test(sv) && u === 'px') o.style[sk] = sv.replace(/([\d.]+)rem/g, (_, n) => (+n * 10) + 'px');
    return o;
  }
  function addBlock(kind, extra = {}) {
    const parent = container(); if (!parent) return null;
    if (pageLocked(sectionOf(parent))) { status('Page validée et verrouillée : repassez-la « À relire » pour y ajouter des éléments', 'warn'); return null; }
    const u = parent.closest('.mx5 .box') ? 'px' : 'rem', up = u === 'px' ? parent.getBoundingClientRect().width / 1600 : remPx();
    const r = parent.getBoundingClientRect(), a = Object.assign({ id: uid(), sec: sectionOf(parent).id, parent: parent.classList.contains('ed-pinbox') ? sectionOf(parent).id : (pathOf(parent) || sectionOf(parent).id), u }, blockDef(kind, u), extra);
    const vy = Math.max(r.top, 0), vh = Math.min(r.bottom, innerHeight) - vy;
    if (extra.x == null) a.x = r2(((innerWidth / 2 - r.left) / up) - (a.w || 20) / 2);
    if (extra.y == null) a.y = r2(((vy + vh / 2 - r.top) / up) - (a.h || 6) / 2);
    E.add.push(a);
    return a;
  }
  async function pickImage() {
    return new Promise(res => {
      file.value = ''; file.onchange = async () => { const f = file.files[0]; if (!f) return res(null); status('Préparation de l’image…'); const src = await prepImage(f); status(''); res(src); };
      file.click();
    });
  }
  async function prepImage(f) {
    const url = URL.createObjectURL(f), img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; }).catch(() => null);
    const k = Math.min(1, 1800 / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(img.naturalWidth * k)); cv.height = Math.max(1, Math.round(img.naturalHeight * k));
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
    const png = /png|gif|webp/.test(f.type);
    const blob = await new Promise(r => cv.toBlob(r, png ? 'image/png' : 'image/jpeg', .86));
    if (assets && blob) { try { const up = await assets.upload(blob); if (up && up.url) return up.url; } catch (e) { status("Envoi de l'image impossible : elle est intégrée directement à la page", 'warn'); } }
    return cv.toDataURL(png ? 'image/png' : 'image/jpeg', .86);
  }

  async function pickVideo() {
    return new Promise(res => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'video/mp4,video/webm,video/quicktime'; inp.dataset.edUi = 1; inp.hidden = true; document.body.appendChild(inp);
      inp.onchange = async () => {
        const f = inp.files[0]; inp.remove(); if (!f) return res(null);
        if (assets) { try { status('Envoi de la vidéo…'); const up = await assets.upload(f); status(''); if (up && up.url) return res(up.url); } catch (e) { status("Envoi impossible : " + ((e && e.code) || 'erreur'), 'err'); return res(null); } }
        if (f.size > 12e6) { status('Vidéo trop lourde pour être intégrée à la page (12 Mo max hors artefact)', 'err'); return res(null); }
        const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f);
      };
      inp.click();
    });
  }
  async function toAssetUrl(src) {
    if (!assets || !/^data:/.test(src)) return src;
    try { const blob = await (await fetch(src)).blob(); const up = await assets.upload(blob); return (up && up.url) || src; } catch (e) { return src; }
  }
  async function mediaBox() {
    const seen = new Set(), report = [];
    app.querySelectorAll('img').forEach(i => { if (i.src && !seen.has(i.src) && i.naturalWidth > 200) { seen.add(i.src); report.push(i.src); } });
    app.querySelectorAll('*').forEach(n => { const b = n.style && n.style.backgroundImage; const m = b && b.match(/url\(["']?(data:image[^"')]+|https?:[^"')]+)/); if (m && !seen.has(m[1])) { seen.add(m[1]); report.push(m[1]); } });
    let uploaded = [];
    if (assets) { try { const l = await assets.list(); uploaded = ((l && l.assets) || []).filter(x => /^image\//.test(x.contentType || '')).map(x => x.url); } catch (e) { } }
    return new Promise(res => {
      const tile = (src, i, g) => `<button class="ed-mt" data-g="${g}" data-i="${i}"><img src="${esc(src)}" alt="" loading="lazy"></button>`;
      openModal(`<h3>Médiathèque</h3><p class="ed-note">Images du rapport et images déjà envoyées dans cet artefact.</p>
        <h6 class="ed-mh">Images du rapport</h6><div class="ed-media">${report.map((s, i) => tile(s, i, 'r')).join('') || '<p class="ed-note">Aucune.</p>'}</div>
        ${assets ? `<h6 class="ed-mh">Images envoyées</h6><div class="ed-media">${uploaded.map((s, i) => tile(s, i, 'u')).join('') || '<p class="ed-note">Aucune pour l’instant.</p>'}</div>` : ''}
        <div class="ed-row"><button id="ed-mup">Importer depuis l’ordinateur</button><button data-m="close" id="ed-mx">Annuler</button></div>`, true);
      let done = false; const fin = v => { if (done) return; done = true; closeModal(); res(v); };
      document.getElementById('ed-mbody').addEventListener('click', async e => {
        const b = e.target.closest('.ed-mt'); if (b) { const src = (b.dataset.g === 'r' ? report : uploaded)[+b.dataset.i]; status('Préparation de l’image…'); const u = await toAssetUrl(src); status(''); fin(u); }
      });
      document.getElementById('ed-mup').onclick = async () => { closeModal(); const src = await pickImage(); done = true; res(src); };
      document.getElementById('ed-mx').onclick = () => fin(null);
    });
  }

  /* ---------- pages ---------- */
  function orderNow() { return [...app.children].map(s => s.id).filter(Boolean); }
  function addPage(tpl, fill, nm, T0) {
    if (tpl === 'focus' && !fill) return focusBox();
    if (String(tpl).startsWith('u:')) { const T = E.ptpl.find(x => 'u:' + x.id === tpl); if (!T) return; return addPage('blank', put => { T.adds.forEach(a0 => { const a = put(null, a0.x, a0.y, JSON.parse(JSON.stringify(a0))); }); }, T.name, T); }
    const after = (curSection() || {}).id || orderNow().slice(-1)[0];
    snapshot();
    const id = 'p' + uid(), name = Object.fromEntries(TEMPLATES0)[tpl] || 'Nouvelle page';
    E.pages.push({ id, name: nm || (tpl === 'blank' || tpl === 'title' ? 'Nouvelle page' : name), after, h: (T0 && T0.h) || 100 });
    if (T0 && T0.bg) E.bg[id] = JSON.parse(JSON.stringify(T0.bg));
    if (E.order) { const i = E.order.indexOf(after); E.order.splice(i < 0 ? E.order.length : i + 1, 0, id); }
    const put = (kind, x, y, extra = {}) => { const a = Object.assign({ id: uid(), sec: id, parent: id, u: 'rem' }, kind ? blockDef(kind, 'rem') : {}, extra, { x, y }, kind ? {} : { id: uid(), sec: id, parent: id, grp: undefined }); if (extra.style && kind) a.style = Object.assign(blockDef(kind, 'rem').style || {}, extra.style); E.add.push(a); return a; };
    if (tpl === 'title') { put('kicker', 6, 16); put('title', 6, 22); put('paragraph', 6, 40, { w: 64 }); }
    if (tpl === 'kpis') {
      put('kicker', 6, 14, { html: 'LE MOIS EN CHIFFRES' }); put('title', 6, 19, { html: 'Les chiffres clés de {{mois}}' });
      put('kpi', 6, 38); put('kpi', 44, 38, { html: '<div class="ed-kl">Sentiment net</div><div class="ed-kv">{{sentiment_net}}</div><div class="ed-kd">{{sentiment_vs_m1}} vs M-1</div>' }); put('kpi', 82, 38, { html: '<div class="ed-kl">Earned Media Value</div><div class="ed-kv">{{emv}}</div><div class="ed-kd">{{emv_vs_m1}} vs M-1</div>' });
    }
    if (tpl === 'chart') { put('kicker', 6, 12); put('title', 6, 17, { w: 50, style: { fontSize: '4.6rem' } }); put('paragraph', 6, 36, { w: 44 }); put('chart', 60, 14, { w: 88, h: 52 }); }
    if (tpl === 'imgtext') { put('image', 6, 14, { w: 66, h: 56 }); put('kicker', 80, 18); put('title', 80, 23, { w: 70, style: { fontSize: '4.6rem' } }); put('paragraph', 80, 40, { w: 64 }); }
    if (tpl === 'quote') { put('icon', 14, 18, { icon: 'Citation', w: 6, h: 6 }); put('quote', 14, 28, { w: 120 }); }
    if (tpl === 'twocols') { put('title', 6, 14); put('paragraph', 6, 34, { w: 66 }); put('paragraph', 80, 34, { w: 66 }); }
    if (tpl === 'table') { put('title', 6, 14, { html: 'Tableau de synthèse' }); put('table', 6, 32, { w: 100 }); }
    if (tpl === 'timeline') { put('kicker', 6, 12, { html: 'LES TEMPS FORTS' }); put('title', 6, 17, { html: 'Le mois de {{mois}}', w: 120 }); put('timeline', 6, 34, { w: 120 }); }
    if (tpl === 'posts') { put('kicker', 6, 10, { html: 'TOP POSTS' }); put('title', 6, 15, { html: 'Les publications du mois', w: 120, style: { fontSize: '4.6rem' } }); put('post', 6, 30); put('post', 46, 30, { post: { network: 'X', handle: '@compte', engagements: '' } }); put('post', 86, 30, { post: { network: 'LinkedIn', handle: '@compte', engagements: '' } }); }
    if (tpl === 'dashboard') {
      put('kicker', 6, 8, { html: 'TABLEAU DE BORD' }); put('title', 6, 13, { html: '{{mois}} en un coup d’œil', w: 120, style: { fontSize: '4.6rem' } });
      put('kpi', 6, 28, { w: 30 }); put('gauge', 40, 27, { w: 30, h: 20 }); put('kpi', 74, 28, { w: 30, html: '<div class="ed-kl">EMV</div><div class="ed-kv">{{emv}}</div><div class="ed-kd">{{emv_vs_m1}} vs M-1</div>' });
      const pr = presets(), donut = (pr.find(p => /anneau/.test(p[0])) || [])[1], conc = (pr.find(p => /concurrents/.test(p[0])) || [])[1];
      if (donut) put('chart', 6, 54, { w: 46, h: 30, chart: donut }); if (conc) put('chart', 58, 54, { w: 70, h: 30, chart: conc });
      put('progress', 108, 30, { w: 40 });
    }
    if (tpl === 'kpiwall') { put('kicker', 6, 8, { html: 'LE MOIS EN CHIFFRES' }); put('title', 6, 13, { html: '{{mois}} en six indicateurs', w: 130, style: { fontSize: '4.6rem' } }); ['publications', 'sentiment_net', 'emv', 'score', 'engagements_owned', 'impressions_owned'].forEach((m, i) => put('kpi2', 6 + (i % 3) * 46, 28 + Math.floor(i / 3) * 30, { metric: m, w: 42, anim: 'up', delay: i * .12 })); }
    if (tpl === 'vs') { const br = Object.keys((D.baro && D.baro.brands) || {}).find(k => k !== CLIENT); put('kicker', 6, 10, { html: 'FACE À LA CONCURRENCE' }); put('title', 6, 15, { html: CLIENT + ' face à ' + esc(br || 'son benchmark'), w: 120 }); put('versus', 6, 32, { w: 80, brand: br, anim: 'up' }); put('auto', 96, 34, { w: 54, rules: ['benchmark', 'volume'], anim: 'fade', delay: .3 }); }
    if (tpl === 'topics') { put('kicker', 6, 8, { html: 'LES SUJETS DU MOIS' }); put('title', 6, 13, { html: 'Ce dont on a parlé en {{mois}}', w: 130, style: { fontSize: '4.6rem' } }); put('cloud', 6, 28, { w: 86, anim: 'zoom' }); put('rank', 100, 28, { w: 50, n: 8, anim: 'up', delay: .2 }); }
    if (tpl === 'moves') { put('kicker', 6, 8, { html: 'MOUVEMENTS DU MOIS' }); put('title', 6, 13, { html: 'Ce qui monte, ce qui baisse', w: 130, style: { fontSize: '4.6rem' } }); put('movers', 6, 28, { w: 140, anim: 'up' }); put('auto', 6, 62, { w: 90, rules: ['hausse', 'vigilance'], anim: 'fade', delay: .3 }); }
    if (tpl === 'year') { put('kicker', 6, 8, { html: 'SUR UN AN' }); put('title', 6, 13, { html: '{{mois}} dans l’historique', w: 130, style: { fontSize: '4.6rem' } }); ['total', 'net', 'emv'].forEach((m, i) => put('trend', 6 + i * 48, 28, { metric: m, w: 44, anim: 'up', delay: i * .15 })); put('auto', 6, 62, { w: 140, rules: ['histo', 'histsent'], anim: 'fade', delay: .5 }); }
    if (tpl === 'closing') { put('bignum', 6, 12, { html: 'Merci', w: 80, style: { fontFamily: SERIF, fontSize: '16rem', fontWeight: '500', color: '#f4f1ea' }, anim: 'letters' }); put('countdown', 6, 40, { w: 56, anim: 'up', delay: .3 }); put('team', 70, 40, { w: 80, anim: 'up', delay: .5 }); put('sources', 6, 80, { w: 140 }); }
    if (tpl === 'chapter') { put('bignum', 6, 18, { html: '0X', w: 40, style: { fontSize: '22rem', color: 'rgba(216,180,122,.25)' } }); put('kicker', 6, 50, { html: 'CHAPITRE' }); put('title', 6, 55, { html: 'Titre du chapitre', w: 120, style: { fontSize: '8rem' } }); put('ornament', 6, 72); }
    if (fill) fill(put);
    changed('Page ajoutée');
    setTimeout(() => { const s = document.getElementById(id); if (s) s.scrollIntoView({ behavior: 'smooth' }); }, 60);
  }
  function movePage(id, dir) { const o = orderNow(), i = o.indexOf(id), j = i + dir; if (i < 0 || j < 0 || j >= o.length) return; snapshot(); [o[i], o[j]] = [o[j], o[i]]; E.order = o; changed(); }
  function dupPage(id) {
    const p = E.pages.find(x => x.id === id); if (!p) return;
    snapshot();
    const nid = 'p' + uid(); E.pages.push(Object.assign({}, p, { id: nid, name: p.name + ' (copie)', after: id }));
    if (E.order) { const i = E.order.indexOf(id); E.order.splice(i + 1, 0, nid); }
    E.add.filter(a => a.sec === id).forEach(a => E.add.push(Object.assign(JSON.parse(JSON.stringify(a)), { id: uid(), sec: nid, parent: String(a.parent).replace(id, nid) })));
    if (E.bg[id]) E.bg[nid] = Object.assign({}, E.bg[id]);
    if (E.notes[id]) E.notes[nid] = E.notes[id];
    changed('Page dupliquée');
  }
  function delPage(id) {
    snapshot();
    if (E.pages.some(p => p.id === id)) { E.pages = E.pages.filter(p => p.id !== id); E.add = E.add.filter(a => a.sec !== id); delete E.bg[id]; delete E.notes[id]; if (E.order) E.order = E.order.filter(x => x !== id); }
    changed('Page supprimée');
  }

  /* ---------- panneau gauche : pages & calques ---------- */
  const readSec = id => { const s_ = document.getElementById(id); if (!s_) return 0; const w_ = (s_.innerText || '').split(/\s+/).filter(x => /[A-Za-zÀ-ÿ]{2}/.test(x)).length; return w_ / 230 * 60 + (s_.querySelectorAll('svg, img, .ed-chart').length * 6); };
  const readMin = id => { const t = readSec(id); return t < 60 ? `${Math.max(5, Math.round(t / 5) * 5)} s` : `${Math.round(t / 60)} min`; };
  function valChip() { const c = document.getElementById('ed-valc'); if (!c) return; const o = orderNow(), n = o.filter(id => E.status[id] === 'ok').length; c.textContent = `Validé ${n}/${o.length}`; c.classList.toggle('done', n === o.length); }
  function leftPanel() {
    valChip();
    const L = document.getElementById('ed-lbody'); if (!L || left.hidden) return;
    left.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === leftTab));
    const o = orderNow(), curId = (curSection() || {}).id;
    if (leftTab === 'pages') {
      const nOk = o.filter(id => E.status[id] === 'ok').length, tm = o.reduce((a_, id) => a_ + readSec(id), 0);
      L.innerHTML = `<div class="ed-vbar"><span>Validation <b>${nOk} / ${o.length}</b> · lecture ≈ ${Math.max(1, Math.round(tm / 60))} min</span><i style="width:${nOk / o.length * 100}%"></i></div>` + o.map((id, i) => {
        const p = E.pages.find(x => x.id === id);
        return `<div class="ed-pi ${id === curId ? 'cur' : ''} ${E.hide[id] ? 'off' : ''}" data-id="${id}">
          <span class="n">${i + 1}</span><input value="${esc(pageName(id))}" aria-label="Nom de la page" data-k="name">
          <span class="b"><button data-p="up" title="Monter" ${i ? '' : 'disabled'}>↑</button><button data-p="down" title="Descendre" ${i < o.length - 1 ? '' : 'disabled'}>↓</button>
          <button data-p="hide">${E.hide[id] ? 'Masquée' : 'Visible'}</button>
          <select data-p="st" class="st-${E.status[id] || 'draft'}" title="Statut de relecture">${[['draft', 'Brouillon'], ['review', 'À relire'], ['ok', 'Validée']].map(([v, l]) => `<option value="${v}" ${(E.status[id] || 'draft') === v ? 'selected' : ''}>${l}</option>`).join('')}</select><small class="rt">${readMin(id)}</small>${(E.tasks[id] || []).some(x => !x.done) ? `<small class="tk">${(E.tasks[id] || []).filter(x => !x.done).length} à faire</small>` : ''}
          ${p ? `<button data-p="dup">Dupliquer</button><button data-p="tpl" title="Réutiliser cette page comme modèle">★ Modèle</button><select data-p="h" title="Hauteur">${[100, 150, 200, 300].map(h => `<option value="${h}" ${(p.h || 100) === h ? 'selected' : ''}>${h === 100 ? '1 écran' : h / 100 + ' écrans'}</option>`).join('')}</select><button data-p="del" class="dng">Supprimer</button>` : '<small>page du rapport</small>'}${E.notes[id] ? '<small class="nt">notes</small>' : ''}</span></div>`;
      }).join('') + `<div class="ed-ph-h"><b>Nouvelle page</b><small>après la page affichée</small></div><div class="ed-tpl">${TEMPLATES.map(([k, l]) => `<button data-tpl="${k}">${l}</button>`).join('')}${E.ptpl.map(T => `<button data-tpl="u:${T.id}" class="mine" title="Modèle enregistré">★ ${esc(T.name)}</button>`).join('')}</div><div class="ed-tpl"><button data-a="import">Importer les pages d’un autre mois…</button></div>`;
    } else {
      const sec = curSection(); if (!sec) { L.innerHTML = '<p class="ed-note">Faites défiler jusqu’à une page.</p>'; return; }
      const adds = E.add.filter(a => a.sec === sec.id).map(a => ({ a, z: +((a.style || {}).zIndex || 30) })).sort((x, y) => y.z - x.z);
      const gens = Object.entries(E.el).filter(([p]) => p.startsWith(sec.id + '>'));
      L.innerHTML = `<div class="ed-ph-h"><b>${esc(pageName(sec.id))}</b><small>${adds.length} élément(s) ajouté(s)</small></div>
        ${adds.map(({ a }) => { const el = addEl(a.id); const txt = a.name || (a.html ? a.html.replace(/<[^>]+>/g, ' ').trim().slice(0, 28) : '') || kindLabel(el || document.body); return `<div class="ed-li ${el && sels.includes(el) ? 'cur' : ''} ${a.hidden ? 'off' : ''}" data-add="${a.id}">
          <span class="k">${esc(({ text: 'T', html: '▤', image: '▣', shape: '■', chart: '▥', table: '▦', timeline: '⋯', icon: '✦', progress: '▬', gauge: '◔', post: '▢' })[a.kind] || '•')}</span>
          <input value="${esc(txt)}" data-ln="${a.id}" aria-label="Nom du calque">
          <span class="b">${a.grp ? '<small class="g">groupe</small>' : ''}<button data-l="up" title="Monter d’un plan">↑</button><button data-l="down" title="Descendre d’un plan">↓</button><button data-l="vis" title="Afficher / masquer">${a.hidden ? 'Masqué' : 'Visible'}</button><button data-l="lock" class="${a.lock ? 'on' : ''}">${a.lock ? 'Verrouillé' : 'Libre'}</button></span></div>`; }).join('') || '<p class="ed-note">Aucun élément ajouté sur cette page.</p>'}
        ${gens.length ? `<div class="ed-ph-h"><b>Éléments du rapport modifiés</b></div>${gens.map(([p, pt]) => `<div class="ed-li gen ${pt.hidden ? 'off' : ''}" data-path="${esc(p)}"><span class="k">◇</span><span class="t">${esc(((byPath(p) || {}).textContent || 'Élément').trim().slice(0, 30) || 'Élément')}</span><span class="b"><button data-l="vis">${pt.hidden ? 'Masqué' : 'Visible'}</button><button data-l="reset">Rétablir</button></span></div>`).join('')}` : ''}`;
    }
  }
  left.addEventListener('click', e => {
    const tab = e.target.closest('[data-tab]'); if (tab) { leftTab = tab.dataset.tab; leftPanel(); return; }
    const tpl = e.target.closest('[data-tpl]'); if (tpl) { addPage(tpl.dataset.tpl); return; }
    const it = e.target.closest('.ed-pi');
    if (it) {
      const id = it.dataset.id, b = e.target.closest('[data-p]');
      if (!b) { if (e.target.tagName !== 'INPUT') document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); return; }
      const k = b.dataset.p;
      if (k === 'tpl') { (async () => { const pg_ = E.pages.find(x => x.id === id), nm_ = await ask('Nom du modèle', pageNameFr(id)); if (!nm_) return; snapshot(); E.ptpl.push({ id: uid(), name: nm_, h: pg_.h, bg: E.bg[id] ? JSON.parse(JSON.stringify(E.bg[id])) : undefined, adds: E.add.filter(a => a.sec === id).map(a => { const o_ = JSON.parse(JSON.stringify(a)); delete o_.id; delete o_.sec; delete o_.parent; return o_; }) }); changed(`Modèle « ${nm_} » enregistré : il apparaît dans « Nouvelle page »`); })(); return; }
      if (k === 'up') movePage(id, -1); else if (k === 'down') movePage(id, 1);
      else if (k === 'hide') { snapshot(); E.hide[id] ? delete E.hide[id] : (E.hide[id] = true); changed(); }
      else if (k === 'dup') dupPage(id);
      else if (k === 'del') confirmBox('Supprimer cette page et tout son contenu ?', () => delPage(id));
      return;
    }
    const li = e.target.closest('.ed-li'); if (!li) return;
    const b = e.target.closest('[data-l]');
    if (li.dataset.path) {
      const p = li.dataset.path; if (!b) { const el = byPath(p); if (el && !E.el[p].hidden) select(el); return; }
      snapshot(); if (b.dataset.l === 'vis') { E.el[p].hidden = !E.el[p].hidden || undefined; } else if (b.dataset.l === 'reset') delete E.el[p]; changed(); return;
    }
    const a = E.add.find(x => x.id === li.dataset.add); if (!a) return;
    if (!b) { if (e.target.tagName !== 'INPUT') { const el = addEl(a.id); if (el) { select(el); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } } return; }
    snapshot();
    const same = E.add.filter(x => x.sec === a.sec).sort((x, y) => +((x.style || {}).zIndex || 30) - +((y.style || {}).zIndex || 30));
    if (b.dataset.l === 'up' || b.dataset.l === 'down') {
      const i = same.indexOf(a), j = i + (b.dataset.l === 'up' ? 1 : -1);
      if (j >= 0 && j < same.length) [same[i], same[j]] = [same[j], same[i]];
      same.forEach((x, k) => { x.style = Object.assign({}, x.style, { zIndex: String(30 + k) }); });
    }
    if (b.dataset.l === 'vis') a.hidden = !a.hidden || undefined;
    if (b.dataset.l === 'lock') a.lock = !a.lock || undefined;
    changed();
  });
  left.addEventListener('change', e => {
    if (e.target.dataset.ln) { snapshot(); const a = E.add.find(x => x.id === e.target.dataset.ln); if (a) a.name = e.target.value; changed(); return; }
    const it = e.target.closest('.ed-pi'); if (!it) return; const id = it.dataset.id;
    if (e.target.dataset.k === 'name') { snapshot(); const p = E.pages.find(x => x.id === id); if (p) p.name = e.target.value; else E.names[id] = e.target.value; changed(); }
    if (e.target.dataset.p === 'h') { snapshot(); E.pages.find(x => x.id === id).h = +e.target.value; changed(); }
    if (e.target.dataset.p === 'st') { snapshot(); if (e.target.value === 'draft') delete E.status[id]; else E.status[id] = e.target.value; changed(); }
  });

  /* ---------- fenêtres ---------- */
  function openModal(html, wide) { document.getElementById('ed-mbody').innerHTML = html; modal.hidden = false; modal.querySelector('.ed-mbox').classList.toggle('wide', !!wide); }
  function closeModal() { modal.hidden = true; document.getElementById('ed-mbody').innerHTML = ''; peaksApply(); }
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-m="close"]')) closeModal(); });
  function confirmBox(msg, ok) {
    openModal(`<h3>${esc(msg)}</h3><div class="ed-row"><button data-m="close">Annuler</button><button class="pri dngb" id="ed-ok">Confirmer</button></div>`);
    document.getElementById('ed-ok').onclick = () => { closeModal(); ok(); };
  }
  function ask(label, val) {
    return new Promise(res => {
      openModal(`<h3>${esc(label)}</h3><input id="ed-ask" value="${esc(val || '')}"><div class="ed-row"><button id="ed-askc">Annuler</button><button class="pri" id="ed-asko">Valider</button></div>`);
      const i = document.getElementById('ed-ask'); i.focus(); i.select();
      const done = v => { closeModal(); res(v); };
      document.getElementById('ed-asko').onclick = () => done(i.value);
      document.getElementById('ed-askc').onclick = () => done(null);
      i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); done(i.value); } };
    });
  }
  function help() {
    openModal(`<h3>Raccourcis</h3><div class="ed-help">${[
      ['Clic', 'Sélectionner (un groupe se sélectionne en entier)'], ['Maj + clic', 'Ajouter / retirer de la sélection'], ['Alt + clic', 'Bloc parent, ou un élément seul dans un groupe'], ['Glisser', 'Déplacer (repères magnétiques ; Ctrl pour les couper)'],
      ['Poignées', 'Redimensionner · rond du haut : pivoter (Maj : 15°)'], ['Double-clic ou Entrée', 'Modifier le texte / les données'], ['Échap', 'Terminer la saisie / désélectionner'],
      ['Flèches', 'Déplacer finement (Maj : pas plus grand)'], ['Ctrl + A', 'Tout sélectionner sur la page'], ['Ctrl + C / V', 'Copier / coller'], ['Ctrl + D', 'Dupliquer'], ['Ctrl + G / Ctrl + Maj + G', 'Grouper / dégrouper'],
      ['[ et ]', 'Reculer / avancer d’un plan'], ['Suppr', 'Supprimer'], ['Ctrl + Z / Ctrl + Maj + Z', 'Annuler / rétablir'], ['Ctrl + F', 'Rechercher et remplacer'], ['Ctrl + S', 'Enregistrer'],
      ['G', 'Grille magnétique'], ['R', 'Règles et repères'], ['K', 'Grille de 12 colonnes'], ['O', 'Vue d’ensemble des pages'], ['Alt (survol)', 'Distances entre l’élément sélectionné et l’élément survolé'], ['P', 'Pages et calques'], ['L · S · D · C · B', 'En présentation : laser, projecteur, stylo, effacer, écran noir'], ['→ / Espace', 'En présentation : fait apparaître l’étape suivante de la page avant de changer de page'], ['[[a|b|c]]', 'Dans un texte : mots qui tournent'], ['Inspecteur', '▶ Prévisualiser une animation · Animations de la page… pour régler la cascade'], ['Ctrl + K', 'Palette de commandes (actions, blocs, pages, recherche)'], ['Outils', 'Contrôle qualité, version anglaise, Mes blocs, import, réglages, suivi'], ['Ctrl + Maj + E', 'Entrer / sortir du mode admin']].map(([k, v]) => `<kbd>${k}</kbd><span>${v}</span>`).join('')}</div>
      <h3 style="margin-top:8px">Variables</h3><p class="ed-note">Dans un texte ajouté, écrivez par exemple <code>{{publications}}</code> : la valeur se met à jour avec les données du mois. Liste dans l’inspecteur pendant la saisie.</p>
      <div class="ed-row"><button class="pri" data-m="close">Fermer</button></div>`);
  }
  function themeBox() {
    openModal(`<h3>Couleurs du document</h3><p class="ed-note">Ces couleurs apparaissent dans tous les sélecteurs de l’inspecteur et dans la palette « Document » des graphiques.</p>
      <div class="ed-swe">${E.theme.colors.map((c, i) => `<label><input type="color" data-ti="${i}" value="${c}"><span>${c}</span></label>`).join('')}</div>
      <h3 style="margin-top:6px">Polices</h3><p class="ed-note">Jost, Cormorant Garamond et Tinos sont intégrées. Les autres (${Object.keys(GFONTS).join(', ')}) se chargent depuis Google Fonts quand vous les utilisez.</p>
      <div class="ed-row"><button id="ed-tpal">Extraire d’une image…</button><button id="ed-treset">Couleurs d’origine</button><button class="pri" id="ed-tok">Appliquer</button></div>`);
    const cols = E.theme.colors.slice();
    document.getElementById('ed-mbody').addEventListener('input', e => { if (e.target.dataset.ti != null) { cols[+e.target.dataset.ti] = e.target.value; e.target.nextElementSibling.textContent = e.target.value; } });
    document.getElementById('ed-treset').onclick = () => { snapshot(); E.theme.colors = DEFAULT_COLORS.slice(); closeModal(); changed(); };
    document.getElementById('ed-tpal').onclick = async () => {
      const src = await pickImage(); if (!src) return; const img = new Image(); img.src = src; await img.decode().catch(() => { });
      const cv = document.createElement('canvas'), W_ = 80, H_ = Math.max(1, Math.round(80 * img.naturalHeight / img.naturalWidth)); cv.width = W_; cv.height = H_; const g = cv.getContext('2d'); g.drawImage(img, 0, 0, W_, H_);
      const d = g.getImageData(0, 0, W_, H_).data, bk = {};
      for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const k = [d[i] >> 4, d[i + 1] >> 4, d[i + 2] >> 4].join(','); (bk[k] = bk[k] || { n: 0, r: 0, g: 0, b: 0 }); bk[k].n++; bk[k].r += d[i]; bk[k].g += d[i + 1]; bk[k].b += d[i + 2]; }
      const hx = v => Math.round(v).toString(16).padStart(2, '0'), picks = [];
      Object.values(bk).sort((x, y) => y.n - x.n).forEach(b_ => { const c = [b_.r / b_.n, b_.g / b_.n, b_.b / b_.n]; if (picks.length < cols.length && picks.every(p_ => Math.hypot(p_[0] - c[0], p_[1] - c[1], p_[2] - c[2]) > 48)) picks.push(c); });
      picks.sort((x, y) => (y[0] + y[1] + y[2]) - (x[0] + x[1] + x[2])).forEach((c, i) => { cols[i] = '#' + c.map(hx).join(''); });
      document.querySelectorAll('[data-ti]').forEach(inp => { inp.value = cols[+inp.dataset.ti]; inp.nextElementSibling.textContent = inp.value; });
      status(`${picks.length} couleurs extraites : cliquez « Appliquer »`, 'ok');
    };
    document.getElementById('ed-tok').onclick = () => { snapshot(); E.theme.colors = cols; closeModal(); changed('Couleurs mises à jour'); };
  }
  function charteBox() {
    const S = JSON.parse(JSON.stringify(E.styles)); let mood = E.theme.mood || 'nuit';
    const prev = x => { const o = Object.assign({}, x.style); o.fontSize = `min(${o.fontSize}, 3.2rem)`; if (mood === 'ivoire' && /^#f/i.test(o.color || '')) o.color = '#101a33'; return Object.entries(o).map(([k, v]) => k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ':' + v).join(';'); };
    const used = id => E.add.filter(a => a.ts === id).length + Object.values(E.el).filter(p => p.ts === id).length;
    const draw = () => `<h3>Charte du rapport</h3>
      <h6 class="ed-mh">Ambiance</h6><div class="ed-moods">${[['nuit', 'Nuit', '#050a1f', '#d8b47a'], ['encre', 'Encre', '#0b1736', '#d8b47a'], ['ivoire', 'Ivoire', '#f4f1ea', '#9a7438']].map(([k, l, b, g]) => `<button data-mood="${k}" class="${mood === k ? 'on' : ''}" style="background:${b};color:${g}"><b>Aa</b><span>${l}</span></button>`).join('')}</div>
      <p class="ed-note">L’ambiance change le fond et les couleurs de texte de tout le rapport (la matrice conversationnelle garde sa DA d’origine).</p>
      <h6 class="ed-mh">Styles de texte</h6><p class="ed-note">Modifier un style met à jour tous les textes qui l’utilisent. Appliquez un style depuis l’inspecteur (Typographie → Style de texte).</p>
      <div class="ed-styles ${mood}">${S.map((x, i) => `<div class="ed-stl"><div class="ed-stp" style="${esc(prev(x))}">${esc(x.name)}</div>
        <div class="ed-stc"><input data-sn="${i}" value="${esc(x.name)}" aria-label="Nom"><select data-sf="${i}">${FONTS.map(([l, v]) => `<option value="${esc(v)}" ${x.style.fontFamily === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <input data-ss="${i}" type="number" step=".1" value="${parseFloat(x.style.fontSize) || 2}" title="Taille (rem)"><input data-sc="${i}" type="color" value="${x.style.color || '#f4f1ea'}"><small>${used(x.id)} usage(s)</small><button data-sd="${i}" title="Supprimer">×</button></div></div>`).join('')}</div>
      <div class="ed-row"><button id="ed-cs-col">Couleurs du document…</button><button data-m="close">Annuler</button><button class="pri" id="ed-cs-ok">Appliquer</button></div>`;
    openModal(draw(), true);
    const body = document.getElementById('ed-mbody');
    body.addEventListener('input', e => { const d = e.target.dataset, v = e.target.value; if (d.sn != null) S[+d.sn].name = v; if (d.ss != null) S[+d.ss].style.fontSize = (+v || 1) + 'rem'; if (d.sc != null) S[+d.sc].style.color = v; if (d.sf != null) S[+d.sf].style.fontFamily = v; const p = d.sn ?? d.ss ?? d.sc ?? d.sf; if (p != null) body.querySelectorAll('.ed-stp')[+p].setAttribute('style', prev(S[+p])); });
    body.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.mood) { mood = b.dataset.mood; body.innerHTML = draw(); bind(); }
      if (b.dataset.sd != null) { if (S.length > 1) { S.splice(+b.dataset.sd, 1); body.innerHTML = draw(); bind(); } }
    });
    const bind = () => {
      document.getElementById('ed-cs-col').onclick = () => themeBox();
      document.getElementById('ed-cs-ok').onclick = () => { snapshot(); E.styles = S; E.theme.mood = mood; const ids = new Set(S.map(x => x.id)); E.add.forEach(a => { if (a.ts && !ids.has(a.ts)) delete a.ts; }); Object.values(E.el).forEach(p => { if (p.ts && !ids.has(p.ts)) delete p.ts; }); closeModal(); changed('Charte appliquée'); };
    };
    bind();
  }

  /* ---------- assistant IA (capacité « sample » de l’artefact) ---------- */
  const AI_MODES = [['short', 'Raccourcir'], ['punch', 'Plus percutant'], ['inst', 'Ton institutionnel'], ['rephrase', 'Reformuler'], ['fix', 'Corriger'], ['en', 'Traduire en anglais'], ['titles', '3 titres']];
  const AI_ASK = {
    short: 'Raccourcis ce texte d’environ 40 % sans perdre les chiffres ni le sens.',
    punch: 'Rends ce texte plus percutant et plus éditorial : phrases courtes, verbe fort, chiffre clé en tête.',
    inst: 'Réécris ce texte dans un ton institutionnel, sobre et factuel, adapté à une direction de la communication d’un grand groupe.',
    rephrase: 'Reformule ce texte autrement, à longueur égale, en gardant tous les chiffres.',
    fix: 'Corrige l’orthographe, la grammaire, la typographie française (espaces insécables, guillemets « ») sans changer le style.',
    en: 'Traduis ce texte en anglais britannique professionnel, en gardant les chiffres et les noms propres.',
    titles: 'Propose exactement 3 titres courts (6 à 10 mots) pour une slide qui contient ce texte, un par ligne, sans numéro ni guillemets.',
  };
  function dataContext() {
    const lines = [];
    TOKENS.forEach(([k, l, v]) => { if (v) lines.push(`${l} : ${v}`); });
    if (D.matrix && D.matrix.length) lines.push('Sujets (volume, sentiment net) : ' + D.matrix.slice().sort((a, b) => b.volume - a.volume).slice(0, 12).map(t => `${t.label} ${nfr(t.volume)} pub., ${sgn(t.net * 100, 0)}`).join(' ; '));
    if (D.conc) lines.push('Concurrents (publications) : ' + Object.entries(D.conc).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${nfr(v)}`).join(' ; '));
    if (D.baro && D.baro.brands) lines.push('Scores e-réputation : ' + Object.entries(D.baro.brands).map(([k, v]) => `${k} ${nfr(v.score_total)}`).join(' ; '));
    return lines.join('\n');
  }
  const SYS = 'Tu es analyste e-réputation chez Licter et rédiges le rapport mensuel e-réputation du groupe ' + CLIENT + ' (' + CFG.sector + '). Style : français soigné, précis, sans jargon, sans emoji, sans markdown. Réponds uniquement avec le texte demandé.';
  function aiModal(title, run, actions) {
    openModal(`<h3>${esc(title)}</h3><div class="ed-ai-out" id="ed-ai-o"><span class="ed-note">Rédaction en cours…</span></div><p class="ed-note" id="ed-ai-n">Texte proposé par l’IA : relisez-le avant de l’utiliser.</p>
      <div class="ed-row"><button id="ed-ai-x">Annuler</button><button id="ed-ai-r">Recommencer</button>${actions.map(([id, l], i) => `<button class="${i === actions.length - 1 ? 'pri' : ''}" id="ed-ai-${id}" disabled>${l}</button>`).join('')}</div>`, true);
    let ctl = null, out = '';
    const o = document.getElementById('ed-ai-o');
    const go = async () => {
      if (ctl) ctl.abort(); ctl = new AbortController(); out = ''; o.innerHTML = '<span class="ed-note">Rédaction en cours…</span>';
      actions.forEach(([id]) => { const b = document.getElementById('ed-ai-' + id); if (b) b.disabled = true; });
      try {
        const r = await run(ctl.signal, t => { out = t; o.textContent = t; });
        out = (r && r.text || out).trim(); o.textContent = out;
        actions.forEach(([id]) => { const b = document.getElementById('ed-ai-' + id); if (b) b.disabled = !out; });
      } catch (e) {
        if (e && e.name === 'AbortError') return;
        const c = e && e.code; o.innerHTML = `<span class="ed-note err">${c === 'not_granted' ? 'Assistant IA refusé pour cette page.' : c === 'rate_limited' ? 'Trop de demandes : réessayez dans un moment.' : 'L’assistant n’a pas pu répondre' + (c ? ' (' + esc(c) + ')' : '') + '.'}</span>`;
        if (e && e.text) { out = e.text; o.textContent = out; }
      }
    };
    document.getElementById('ed-ai-x').onclick = () => { if (ctl) ctl.abort(); closeModal(); };
    document.getElementById('ed-ai-r').onclick = go;
    actions.forEach(([id, , fn]) => { document.getElementById('ed-ai-' + id).onclick = () => { if (ctl) ctl.abort(); const t = out; closeModal(); fn(t); }; });
    go();
  }
  const toHtml = t => esc(t).replace(/\n/g, '<br>');
  function insertBlock(kind, extra) { snapshot(); const a = addBlock(kind, extra); if (!a) { undo.pop(); return; } changed('Ajouté'); select(addEl(a.id)); }
  function setText(el, html) {
    snapshot();
    if (isAdd(el)) addOf(el).html = html;
    else { const p = pathOf(el); if (!p) return; remember(el, p); (E.el[p] = E.el[p] || { u: unitOf(el) }).html = html; }
    changed('Texte remplacé');
  }
  function aiRewrite(el, k) {
    if (!sampleFn || !el) return;
    const src = (el.innerText || '').trim(); if (!src) return status('Aucun texte à réécrire', 'warn');
    const ask_ = `${SYS}\n\nConsigne : ${AI_ASK[k]}\n\nDonnées du mois (pour vérifier les chiffres) :\n${dataContext()}\n\nTexte :\n${src}`;
    const run = (signal, onT) => sampleFn(ask_, { signal, onText: ({ text }) => onT(text), modelTier: k === 'fix' || k === 'short' ? 'quick' : 'default' });
    if (k === 'titles') return aiModal('Idées de titres', run, [['pick', 'Choisir un titre', t => pickLine(t, l => setText(el, toHtml(l)))]]);
    aiModal((AI_MODES.find(m => m[0] === k) || [, 'Réécriture'])[1], run, [['ins', 'Ajouter en dessous', t => { const r = el.getBoundingClientRect(), sec = sectionOf(el); if (!sec) return; const sr = sec.getBoundingClientRect(), rp = remPx(); insertBlock('paragraph', { html: toHtml(t), x: r2((r.left - sr.left) / rp), y: r2((r.bottom - sr.top) / rp + 2) }); }], ['rep', 'Remplacer', t => setText(el, toHtml(t))]]);
  }
  function pickLine(t, cb) {
    const ls = t.split(/\n+/).map(x => x.replace(/^[\s\-–•\d.)]+/, '').replace(/^["«]\s*|\s*["»]$/g, '').trim()).filter(Boolean).slice(0, 5);
    openModal(`<h3>Choisir un titre</h3><div class="ed-picks">${ls.map((l, i) => `<button data-pk="${i}">${esc(l)}</button>`).join('')}</div><div class="ed-row"><button data-m="close">Annuler</button></div>`);
    document.getElementById('ed-mbody').addEventListener('click', e => { const b = e.target.closest('[data-pk]'); if (b) { closeModal(); cb(ls[+b.dataset.pk]); } });
  }
  function aiCompose(kind) {
    if (!sampleFn) return status('L’assistant IA est disponible dans l’artefact claude.ai', 'warn');
    const topics = [['global', 'Vue d’ensemble du mois'], ['sentiment', 'Sentiment et perception'], ['conc', CLIENT + ' face aux concurrents'], ['emv', 'Valeur médiatique (EMV)'], ['sujets', 'Sujets marquants'], ['baro', 'Baromètre e-réputation']];
    openModal(`<h3>${kind === 'titles' ? 'Idées de titres' : 'Rédiger un insight'}</h3><p class="ed-note">L’IA s’appuie sur les chiffres du mois intégrés au rapport.</p>
      <label class="ed-f">Thème <select id="ed-ai-t">${topics.map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>
      <label class="ed-f">Angle ou consigne (facultatif) <textarea id="ed-ai-c" rows="3" placeholder="Ex. : insister sur la montée de TikTok, 2 phrases maximum"></textarea></label>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-ai-go">Rédiger</button></div>`);
    document.getElementById('ed-ai-go').onclick = () => {
      const th = topics.find(x => x[0] === document.getElementById('ed-ai-t').value)[1], c = document.getElementById('ed-ai-c').value.trim();
      const ask_ = `${SYS}\n\n${kind === 'titles' ? `Propose exactement 3 titres de slide (6 à 10 mots), un par ligne, sans numéro ni guillemets, sur le thème « ${th} ».` : `Rédige un insight de 2 à 3 phrases (60 mots maximum) sur le thème « ${th} » : un constat chiffré, puis ce qu’il signifie pour la réputation de ${CLIENT}. N’invente aucun chiffre.`}${c ? '\nConsigne : ' + c : ''}\n\nDonnées du mois :\n${dataContext()}`;
      const run = (signal, onT) => sampleFn(ask_, { signal, onText: ({ text }) => onT(text) });
      if (kind === 'titles') aiModal('Idées de titres', run, [['pick', 'Choisir un titre', t => pickLine(t, l => insertBlock('title', { html: toHtml(l) }))]]);
      else aiModal('Insight proposé', run, [['ins', 'Insérer comme paragraphe', t => insertBlock('paragraph', { html: toHtml(t) })], ['box', 'Insérer en encadré', t => insertBlock('callout', { html: toHtml(t) })]]);
    };
  }

  /* ---------- QR code (bibliothèque chargée à la demande depuis cdnjs) ---------- */
  let qrLib = null;
  function makeQR(url) {
    if (!url) return Promise.resolve(null);
    qrLib = qrLib || new Promise((res, rej) => { if (window.qrcode) return res(window.qrcode); const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'; sc.onload = () => res(window.qrcode); sc.onerror = () => { qrLib = null; rej(); }; document.head.appendChild(sc); });
    return qrLib.then(Q => { const q = Q(0, 'M'); q.addData(url); q.make(); const n = q.getModuleCount(); let d = ''; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`; return `<svg viewBox="0 0 ${n} ${n}" width="100%" height="100%" shape-rendering="crispEdges" aria-label="QR code"><path d="${d}" fill="currentColor"/></svg>`; })
      .catch(() => { status('QR code indisponible : connexion à cdnjs impossible', 'err'); return null; });
  }

  /* ---------- Mes blocs ---------- */
  async function toLib() {
    const items = sels.filter(isAdd).map(el => JSON.parse(JSON.stringify(addOf(el)))); if (!items.length) return;
    const nm = await ask('Nom du bloc', items.length > 1 ? `Groupe de ${items.length} éléments` : (items[0].name || kindLabel(addEl(items[0].id)))); if (!nm) return;
    const x0 = Math.min(...items.map(a => a.x)), y0 = Math.min(...items.map(a => a.y));
    snapshot();
    E.lib.push({ id: uid(), name: nm, at: new Date().toISOString(), items: items.map(a => { const o = Object.assign({}, a, { x: r2(a.x - x0), y: r2(a.y - y0) }); ['id', 'sec', 'parent', 'grp', 'pin', 'pinSkip', 'toggle'].forEach(k => delete o[k]); return o; }) });
    changed(`« ${nm} » ajouté à Mes blocs`);
  }
  function libBox() {
    document.getElementById('ed-addmenu').hidden = true;
    const draw = () => `<h3>Mes blocs</h3><p class="ed-note">Enregistrez un élément ou un groupe depuis l’inspecteur (Calque → Enregistrer dans Mes blocs). Les blocs suivent le rapport et se reprennent d’un mois à l’autre avec Outils → Importer.</p>
      <div class="ed-lib">${E.lib.map((b, i) => `<div><span><b>${esc(b.name)}</b><small>${b.items.length} élément(s) · ${[...new Set(b.items.map(x => ({ text: 'texte', html: 'bloc', image: 'image', chart: 'graphique', table: 'tableau', shape: 'forme', icon: 'icône', qr: 'QR' }[x.kind] || x.kind)))].join(', ')}</small></span>
        <button data-li="${i}" class="pri">Insérer</button><button data-lr="${i}">Renommer</button><button data-ld="${i}" class="dng">×</button></div>`).join('') || '<p class="ed-note">Aucun bloc enregistré pour l’instant.</p>'}</div>
      <div class="ed-row"><button data-m="close">Fermer</button></div>`;
    openModal(draw());
    document.getElementById('ed-mbody').onclick = async e => {
      const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
      if (d.li != null) {
        const B = E.lib[+d.li]; closeModal(); snapshot();
        const first = addBlock('shape', {}); if (!first) { undo.pop(); return; } E.add.pop();
        const grp = B.items.length > 1 ? uid() : undefined, w = Math.max(...B.items.map(a => a.x + (a.w || 20))), h = Math.max(...B.items.map(a => a.y + (a.h || 6)));
        const bx = first.x + (first.w || 20) / 2 - w / 2, by = first.y + (first.h || 6) / 2 - h / 2;
        const ids = B.items.map(it => { const a = Object.assign(JSON.parse(JSON.stringify(it)), { id: uid(), sec: first.sec, parent: first.parent, u: first.u, x: r2(bx + it.x), y: r2(by + it.y), grp }); E.add.push(a); return a.id; });
        changed(`« ${B.name} » inséré`); sels = ids.map(addEl).filter(Boolean); paint(); inspect();
      }
      if (d.lr != null) { const nm = await ask('Nouveau nom', E.lib[+d.lr].name); if (nm) { snapshot(); E.lib[+d.lr].name = nm; changed(); } libBox(); }
      if (d.ld != null) { if (await confirmBox(`Supprimer « ${E.lib[+d.ld].name} » de Mes blocs ?`)) { snapshot(); E.lib.splice(+d.ld, 1); changed(); } libBox(); }
    };
  }

  /* ---------- import d’un autre mois ---------- */
  function importBox() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json'; inp.hidden = true; inp.dataset.edUi = 1; document.body.appendChild(inp);
    inp.onchange = async () => {
      const f = inp.files[0]; inp.remove(); if (!f) return;
      let J; try { J = norm(JSON.parse(await f.text())); } catch (er) { return status('Fichier illisible : choisissez un fichier edits.json exporté par l’éditeur', 'err'); }
      openModal(`<h3>Importer « ${esc(f.name)} »</h3><p class="ed-note">${J.pages.length} page(s) personnalisée(s), ${J.add.length} élément(s), ${J.lib.length} bloc(s), ${J.styles.length} style(s).</p>
        <label class="ed-f ck"><input type="radio" name="ed-im" value="keep" checked> <span><b>Reprendre pour ce mois</b> : pages personnalisées et leur contenu, éléments épinglés, charte (styles, couleurs, ambiance), Mes blocs. Les retouches des pages générées ne sont pas reprises (elles dépendent des données du mois).</span></label>
        <label class="ed-f ck"><input type="radio" name="ed-im" value="all"> <span><b>Tout remplacer</b> par le contenu du fichier (même mois uniquement).</span></label>
        <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-im-ok">Importer</button></div>`);
      document.getElementById('ed-im-ok').onclick = () => {
        const all = document.querySelector('[name="ed-im"]:checked').value === 'all'; snapshot();
        if (all) E = J;
        else {
          const ids = new Set(J.pages.map(x => x.id));
          E.pages = E.pages.filter(x => !ids.has(x.id)).concat(J.pages);
          E.add = E.add.filter(a => !ids.has(a.sec)).concat(J.add.filter(a => ids.has(a.sec) || a.pin).filter(a => !E.add.some(b => b.id === a.id)));
          ['names', 'notes', 'bg', 'hide'].forEach(k => ids.forEach(id => { if (J[k][id] != null) E[k][id] = J[k][id]; }));
          E.styles = J.styles; E.theme = J.theme; E.lib = E.lib.concat(J.lib.filter(b => !E.lib.some(x => x.id === b.id)));
        }
        closeModal(); changed('Import terminé : pensez à enregistrer');
      };
    };
    inp.click();
  }

  /* ---------- contrôle qualité ---------- */
  function qcList() {
    const out = [], push = (lv, msg, el, sec) => out.push({ lv, msg, el, sec });
    const defs = {}; BLOCKS.forEach(([, it]) => it.forEach(([k]) => { try { const d = blockDef(k, 'rem'); if (d && d.html) defs[d.html] = 1; } catch (er) { } }));
    E.add.forEach(a => {
      const el = addEl(a.id), pg = a.pin ? 'Épinglé' : pageName(a.sec);
      if (a.html && !a.memo && defs[a.html] && !/\{\{/.test(a.html)) push(2, `Texte d’exemple non modifié (« ${a.html.replace(/<[^>]+>/g, ' ').trim().slice(0, 40)} »)`, el, pg);
      if ((a.kind === 'image' || a.kind === 'video') && !a.src) push(2, `${a.kind === 'image' ? 'Image' : 'Vidéo'} vide`, el, pg);
      if (a.kind === 'image' && a.src && !a.alt) push(0, 'Image sans texte alternatif', el, pg);
      if (a.link === 'https://' ) push(2, 'Lien vide sur un bouton', el, pg);
      if (a.toggle && !E.add.some(x => x.id === a.toggle)) push(1, 'Interaction vers un élément supprimé', el, pg);
      if (a.memo) push(0, 'Note interne (invisible pour les lecteurs)', el, pg);
      if (a.chart && !a.chart.src && a.chart.labels && a.chart.labels.length) push(0, 'Graphique aux valeurs figées (non lié aux données du mois)', el, pg);
      if (el && ['text', 'html'].includes(a.kind) && !a.memo) { const rd = readability(el.innerText); if (rd && rd.score < 30) push(0, `Texte difficile à lire (${rd.wps | 0} mots par phrase)`, el, pg); }
      if (el && ['text', 'html'].includes(a.kind) && !a.memo) {
        const cs_ = getComputedStyle(el), fs = parseFloat(cs_.fontSize), fg = cs_.color.match(/[\d.]+/g).map(Number);
        let bgc = null, nd = el; while (nd && nd !== document.documentElement) { const b_ = getComputedStyle(nd).backgroundColor.match(/[\d.]+/g); if (b_ && (b_[3] === undefined || +b_[3] > .5)) { bgc = b_.map(Number); break; } nd = nd.parentElement; }
        const lum = c_ => { const v = c_.slice(0, 3).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
        if (bgc && !(cs_.backgroundImage && cs_.backgroundImage !== 'none') && cs_.webkitTextFillColor !== 'rgba(0, 0, 0, 0)') { const L1 = lum(fg), L2 = lum(bgc), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05); if (cr < (fs >= 24 ? 3 : 4.5)) push(1, `Contraste faible (${nfr(cr, 1)}:1) : texte difficile à lire`, el, pg); }
        if (fs < 11 && el.textContent.trim()) push(1, `Texte très petit (${Math.round(fs)} px à cet écran)`, el, pg);
      }
      if (a.src && /^data:/.test(a.src) && a.src.length > 2.2e6) push(1, `Fichier lourd intégré (${nfr(a.src.length / 1.37e6, 1)} Mo) : ralentit l’ouverture`, el, pg);
      if (el && !a.pin) {
        const sec = document.getElementById(a.sec), r = el.getBoundingClientRect(), sr = sec && sec.getBoundingClientRect();
        if (sr && (r.right > sr.right + 2 || r.left < sr.left - 2 || r.bottom > sr.bottom + 2)) push(1, 'Dépasse du bord de la page', el, pg);
        if (el.scrollHeight > el.clientHeight + 4 && a.h && a.kind !== 'chart') push(1, 'Texte trop long pour son cadre : agrandir le bloc', el, pg);
      }
    });
    const w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const m = n.nodeValue.match(/\{\{\s*([a-z0-9_]+)\s*\}\}/i); if (m && !n.parentElement.closest('.ed-editing')) push(2, `Variable inconnue {{${m[1]}}}`, selectable(n.parentElement), (sectionOf(n.parentElement) || {}).id && pageName(sectionOf(n.parentElement).id)); }
    orderNow().forEach(id => {
      const sec = document.getElementById(id);
      if (E.hide[id]) push(0, 'Page masquée pour les lecteurs', null, pageName(id));
      if (sec.classList.contains('stale') || sec.querySelector('.stale-note')) push(1, 'Données non à jour (onglet de l’Excel d’un autre mois) : page masquée', null, pageName(id));
      if (E.pages.some(p => p.id === id) && !E.add.some(a => a.sec === id)) push(1, 'Page personnalisée vide', null, pageName(id));
    });
    if (hasTr()) { const stale = Object.entries(E.tr.en).filter(([k, v]) => { if (k.startsWith('add:')) { const a = E.add.find(x => 'add:' + x.id === k); return a && a.html !== v.s; } if (k.includes(':')) return false; const el = byPath(k); return el && !el.dataset.edTr && el.innerHTML !== v.s; }).length; if (stale) push(1, `${stale} texte(s) modifié(s) depuis la traduction anglaise : Outils → Version anglaise → Mettre à jour`, null, ''); }
    if (dirty && mode === 'artifact') push(2, 'Modifications non enregistrées', null, '');
    alertsNow().forEach(x => push(1, `Alerte : ${x.msg} (${x.val})`, null, ''));
    Object.entries(E.tasks).forEach(([id, L_]) => { const n_ = L_.filter(x => !x.done).length; if (n_) push(1, `${n_} tâche(s) à faire : ${L_.filter(x => !x.done).map(x => x.t).slice(0, 2).join(' · ')}`, null, pageNameFr(id)); });
    const nv = orderNow().filter(id => !E.hide[id] && E.status[id] !== 'ok'); if (nv.length) push(0, `${nv.length} page(s) pas encore validée(s) (Pages → statut)`, null, '');
    out.sort((x, y) => y.lv - x.lv);
    return out;
  }
  function qcBox() {
    const out = qcList();
    const L = ['Info', 'À vérifier', 'À corriger'];
    openModal(`<h3>Contrôle qualité</h3><p class="ed-note">${out.filter(x => x.lv === 2).length} à corriger · ${out.filter(x => x.lv === 1).length} à vérifier · ${out.filter(x => !x.lv).length} info(s)</p>
      <div class="ed-qc">${out.map((x, i) => `<div class="lv${x.lv}"><i>${L[x.lv]}</i><span>${esc(x.msg)}<small>${esc(x.sec || '')}</small></span>${x.el || x.sec ? `<button data-qi="${i}">Voir</button>` : ''}</div>`).join('') || '<p class="ed-note">Rien à signaler : le rapport est prêt.</p>'}</div>
      <div class="ed-row"><button class="pri" data-m="close">Fermer</button></div>`, true);
    document.getElementById('ed-mbody').onclick = e => {
      const b = e.target.closest('[data-qi]'); if (!b) return; const x = out[+b.dataset.qi]; closeModal();
      if (x.el) { x.el.scrollIntoView({ block: 'center' }); setTimeout(() => select(x.el), 300); }
      else { const id = orderNow().find(i => pageName(i) === x.sec); if (id) document.getElementById(id).scrollIntoView(); }
    };
  }

  /* ---------- version anglaise ---------- */
  const TR_SKIP = '.mxcap .txt, #concurrents .cap h2, #concurrents .cap p, .ed-add, svg, script, style, [data-ed-ui]';
  function trUnits() {
    const units = new Map(), w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      if (!/[A-Za-zÀ-ÿ]{2,}/.test(n.nodeValue)) continue;
      let el = n.parentElement; if (!el || el.closest(TR_SKIP)) continue;
      while (el.parentElement && !el.parentElement.matches('section') && getComputedStyle(el).display.startsWith('inline')) el = el.parentElement;
      if ([...el.querySelectorAll('*')].some(c => !getComputedStyle(c).display.startsWith('inline') && c.tagName !== 'BR')) continue;
      const p = pathOf(el); if (!p || units.has(p)) continue;
      const pt = E.el[p], src = pt && pt.html != null ? pt.html : (orig[p] ? orig[p].html : el.innerHTML);
      units.set(p, src);
    }
    E.add.forEach(a => { if (a.html && /[A-Za-zÀ-ÿ]{2,}/.test(a.html.replace(/<[^>]+>|\{\{[^}]+\}\}/g, ''))) units.set('add:' + a.id, a.html); if (a.tip) units.set('tip:' + a.id, a.tip); });
    orderNow().forEach(id => units.set('name:' + id, pageNameFr(id)));
    return units;
  }
  function trBox() {
    const U = trUnits(), T = E.tr.en || {}, todo = [...U].filter(([k, v]) => !T[k] || T[k].s !== v);
    openModal(`<h3>Version anglaise</h3>
      <p class="ed-note">L’IA traduit tous les textes du rapport (${U.size} blocs). Les lecteurs voient un bouton <b>FR / EN</b> en bas de page ; le mode admin reste en français. ${hasTr() ? `<br>Déjà traduits : ${U.size - todo.length} · à traduire ou mettre à jour : ${todo.length}.` : ''}</p>
      ${sampleFn ? '' : '<p class="ed-note err">L’assistant IA n’est disponible que dans l’artefact claude.ai. Vous pouvez tout de même relire / saisir les traductions existantes.</p>'}
      <div class="ed-prog" id="ed-trp" hidden><i></i></div><p class="ed-note" id="ed-trn"></p>
      <div class="ed-row"><button data-m="close">Fermer</button>${hasTr() ? '<button id="ed-tr-rev">Relire et corriger</button><button id="ed-tr-prev">Voir en anglais</button><button id="ed-tr-del" class="dng">Supprimer la version anglaise</button>' : ''}${sampleFn ? `<button class="pri" id="ed-tr-go" ${todo.length ? '' : 'disabled'}>${hasTr() ? 'Mettre à jour' : 'Traduire le rapport'}</button>` : ''}</div>`, true);
    const g = id => document.getElementById(id);
    if (g('ed-tr-prev')) g('ed-tr-prev').onclick = () => { closeModal(); lang = 'en'; try { localStorage.setItem('lvmh-lang', 'en'); } catch (e) { } setPreview(true); };
    if (g('ed-tr-del')) g('ed-tr-del').onclick = async () => { if (await confirmBox('Supprimer toutes les traductions anglaises ?')) { snapshot(); E.tr = {}; changed('Version anglaise supprimée'); } };
    if (g('ed-tr-rev')) g('ed-tr-rev').onclick = () => trReview(U);
    if (g('ed-tr-go')) g('ed-tr-go').onclick = async () => {
      const btn = g('ed-tr-go'); btn.disabled = true; g('ed-trp').hidden = false;
      const chunks = []; let cur = [], size = 0;
      todo.forEach(([k, v]) => { if (cur.length >= 30 || size + v.length > 7000) { chunks.push(cur); cur = []; size = 0; } cur.push([k, v]); size += v.length; });
      if (cur.length) chunks.push(cur);
      const res = Object.assign({}, E.tr.en); let done = 0, fails = 0;
      const one = async ch => {
        const prompt = `Translate these French texts from ${CLIENT}'s monthly e-reputation report (by Licter) into polished British English for a luxury-group communications team.
Rules: each item is an HTML fragment — keep every tag and attribute exactly as is and translate only the visible text; keep {{placeholders}} unchanged; keep brand and proper names; convert number formatting to English (20 788 → 20,788 ; 17,0 % → 17.0% ; 20,5 M€ → €20.5M ; « » → “ ”).
Reply with only a JSON array of ${ch.length} strings, in the same order. Example: ["First translation", "<em>Second</em> translation"]

${JSON.stringify(ch.map(x => x[1]))}`;
        try {
          const r = await sampleFn.json(prompt, { modelTier: 'default' });
          if (Array.isArray(r) && r.length === ch.length) ch.forEach(([k, v], i) => { if (typeof r[i] === 'string' && r[i].trim()) res[k] = { s: v, t: r[i] }; });
          else fails++;
        } catch (er) { fails++; if (er && er.code === 'not_granted') throw er; }
        done++; g('ed-trp').firstChild.style.width = (done / chunks.length * 100) + '%'; g('ed-trn').textContent = `${done} / ${chunks.length} lots traduits`;
      };
      try { for (let i = 0; i < chunks.length; i += 3) await Promise.all(chunks.slice(i, i + 3).map(one)); }
      catch (er) { g('ed-trn').textContent = 'Assistant IA refusé pour cette page.'; return; }
      snapshot(); E.tr = { en: res, at: new Date().toISOString() };
      changed(fails ? `Traduction terminée avec ${fails} lot(s) en échec : relancez « Mettre à jour »` : 'Version anglaise prête : pensez à enregistrer');
      trBox();
    };
  }
  function trReview(U) {
    const rows = [...U].filter(([k]) => E.tr.en[k]);
    openModal(`<h3>Relire la traduction</h3><p class="ed-note">Les balises (&lt;em&gt;, &lt;b&gt;…) gardent la mise en forme : ne les supprimez pas.</p>
      <input id="ed-trq" placeholder="Filtrer…" style="width:100%;margin-bottom:8px">
      <div class="ed-trr">${rows.map(([k, v], i) => `<div data-k="${esc(k)}"><p>${esc(v.replace(/<[^>]+>/g, ''))}</p><textarea data-ti="${i}" rows="2">${esc(E.tr.en[k].t)}</textarea></div>`).join('')}</div>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-trok">Enregistrer les corrections</button></div>`, true);
    const ed = {};
    document.getElementById('ed-mbody').addEventListener('input', e => { if (e.target.dataset.ti != null) ed[rows[+e.target.dataset.ti][0]] = e.target.value; if (e.target.id === 'ed-trq') { const q = e.target.value.toLowerCase(); document.querySelectorAll('.ed-trr > div').forEach(d => { d.hidden = q && !d.textContent.toLowerCase().includes(q) && !d.querySelector('textarea').value.toLowerCase().includes(q); }); } });
    document.getElementById('ed-trok').onclick = () => { snapshot(); for (const k in ed) E.tr.en[k].t = ed[k]; closeModal(); changed(`${Object.keys(ed).length} traduction(s) corrigée(s)`); };
  }

  /* ---------- glossaire ---------- */
  function glossClear() { document.querySelectorAll('abbr.ed-gl').forEach(a => { const p_ = a.parentNode; p_.replaceChild(document.createTextNode(a.textContent), a); p_.normalize(); }); }
  function glossApply() {
    if (on || !E.set || !E.set.gloss || !E.gloss.length) return;
    const terms = E.gloss.map((g, i) => ({ i, re: new RegExp(`(^|[^\\p{L}])(${g.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![\\p{L}])`, 'u') })).filter(x => x.re);
    [...app.children].forEach(sec => {
      const used = new Set(), w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT), list = []; let n;
      while ((n = w.nextNode())) { const pe = n.parentElement; if (!pe || pe.closest('svg, script, style, abbr, a, button, [data-ed-html], .ed-editing, .num, [data-cnt]')) continue; list.push(n); }
      list.forEach(tn => { for (const x of terms) { if (used.has(x.i)) continue; const m = tn.nodeValue.match(x.re); if (!m) continue; used.add(x.i); const st_ = m.index + m[1].length, ab = document.createElement('abbr'); ab.className = 'ed-gl'; ab.dataset.gl = x.i; const mid = tn.splitText(st_); const rest = mid.splitText(m[2].length); ab.textContent = mid.nodeValue; mid.parentNode.replaceChild(ab, mid); tn = rest; } });
    });
  }
  function glossBox() {
    const G = JSON.parse(JSON.stringify(E.gloss || []));
    const draw = () => `<h3>Glossaire</h3><p class="ed-note">La première occurrence de chaque terme, sur chaque page, devient une infobulle pour les lecteurs (pointillés dorés).</p>
      <label class="ed-f ck"><input type="checkbox" id="ed-gl-on" ${E.set.gloss ? 'checked' : ''}> <span><b>Activer le glossaire</b> pour les lecteurs</span></label>
      <table class="ed-grid ed-vars"><tr><th style="width:24%">Terme</th><th>Définition</th><th></th></tr>${G.map((g, i) => `<tr><td><input data-gt="${i}" value="${esc(g.t)}"></td><td><input data-gd="${i}" value="${esc(g.d)}"></td><td><button data-gx="${i}">×</button></td></tr>`).join('')}</table>
      <div class="ed-row left"><button id="ed-gl-add">+ Terme</button><button id="ed-gl-rst">Termes par défaut</button></div>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-gl-ok">Appliquer</button></div>`;
    openModal(draw(), true);
    const body = document.getElementById('ed-mbody'), redraw = () => { const on_ = document.getElementById('ed-gl-on').checked; body.innerHTML = draw(); document.getElementById('ed-gl-on').checked = on_; bind(); };
    body.oninput = e => { const d = e.target.dataset; if (d.gt != null) G[+d.gt].t = e.target.value; if (d.gd != null) G[+d.gd].d = e.target.value; };
    const bind = () => {
      document.getElementById('ed-gl-add').onclick = () => { G.push({ t: '', d: '' }); redraw(); };
      document.getElementById('ed-gl-rst').onclick = () => { G.splice(0, G.length, ...JSON.parse(JSON.stringify(GLOSS0))); redraw(); };
      body.querySelectorAll('[data-gx]').forEach(b => b.onclick = () => { G.splice(+b.dataset.gx, 1); redraw(); });
      document.getElementById('ed-gl-ok').onclick = () => { snapshot(); E.gloss = G.filter(g => g.t.trim() && g.d.trim()); E.set = Object.assign({}, E.set, { gloss: document.getElementById('ed-gl-on').checked || undefined }); closeModal(); changed(E.set.gloss ? 'Glossaire actif : visible en aperçu' : 'Glossaire désactivé'); };
    };
    bind();
  }

  /* ---------- assistant du mois ---------- */
  function monthBox() {
    const W_ = ((S.meta || {}).warnings || []).filter(Boolean), q = qcList(), o = orderNow(), nOk = o.filter(id => E.status[id] === 'ok').length;
    const stale = hasTr() ? Object.entries(E.tr.en).filter(([k, v]) => { if (k.startsWith('add:')) { const a = E.add.find(x => 'add:' + x.id === k); return a && a.html !== v.s; } return false; }).length : 0;
    const items = [
      [true, `Données du mois chargées : ${esc(TOKMAP.mois)}`, `${esc(TOKMAP.publications)} publications · ${esc(TOKMAP.nb_sujets)} sujets · EMV ${esc(TOKMAP.emv)}`],
      [!W_.some(w => /rdv LVMH/.test(w)), 'Sujets du rendez-vous ' + CLIENT + ' saisis', W_.some(w => /rdv LVMH/.test(w)) ? 'Ajoutez la liste dans <code>content/&lt;mois&gt;.focus.txt</code> puis relancez le build.' : `${(D.focus || []).length} sujet(s) focus avec données.`],
      [!peakOpen(W_).length, 'Pics de la courbe expliqués', peakOpen(W_).map(w => esc(w.replace(/ : ajouter content.*$/, ''))).join('<br>') || `Tous les pics ont un libellé${Object.keys(E.peaks || {}).length ? ` (${Object.keys(E.peaks).length} nommé(s) dans l’éditeur)` : ''}.`, 'peaks'],
      [!W_.some(w => /non mis à jour|introuvable|absent/i.test(w)), 'Excel complet et à jour', W_.filter(w => /non mis à jour|introuvable|absent/i.test(w)).map(esc).join('<br>') || 'Aucun onglet manquant ni périmé.', null],
      [!alertsNow().length, 'Alertes du mois', (L_ => L_.length ? L_.map(x => `${esc(x.msg)} (${esc(x.val)})`).join('<br>') : ((E.alerts || []).length ? 'Aucune alerte déclenchée.' : 'Aucune alerte définie (Outils → Alertes et seuils).'))(alertsNow()), 'alertsbox', !(E.alerts || []).length],
      [!q.some(x => x.lv === 2), 'Contrôle qualité', `${q.filter(x => x.lv === 2).length} à corriger · ${q.filter(x => x.lv === 1).length} à vérifier`, 'qc'],
      [!!E.done.proof, 'Relecture IA', E.done.proof ? 'Faite le ' + new Date(E.done.proof).toLocaleDateString('fr-FR') : 'Pas encore faite ce mois-ci.', 'proof'],
      [hasTr() && !stale, 'Version anglaise (facultatif)', hasTr() ? (stale ? `${stale} texte(s) à retraduire` : 'À jour') : 'Pas de version anglaise.', 'translate', true],
      [!Object.values(E.tasks).some(L_ => L_.some(x => !x.done)), 'Tâches de l’équipe', (n_ => n_ ? `${n_} tâche(s) encore ouverte(s)` : 'Aucune tâche ouverte.')(Object.values(E.tasks).reduce((a_, L_) => a_ + L_.filter(x => !x.done).length, 0)), 'qc'],
      [nOk === o.length, 'Pages validées', `${nOk} / ${o.length}`, 'left'],
      [!dirty || mode !== 'artifact', 'Modifications enregistrées', dirty && mode === 'artifact' ? 'Des modifications ne sont pas encore enregistrées.' : 'Tout est enregistré.', mode === 'artifact' ? 'save' : null],
      [!!E.done.mail, 'E-mail d’envoi', E.done.mail ? 'Rédigé.' : 'Rédigez l’e-mail qui accompagne le rapport.', 'mail'],
    ];
    const done = items.filter(x => x[0] && !x[4]).length, req = items.filter(x => !x[4]).length;
    openModal(`<h3>Préparer le rapport du mois</h3><div class="ed-prog"><i style="width:${done / req * 100}%"></i></div><p class="ed-note">${done} / ${req} étapes terminées</p>
      <div class="ed-month">${items.map(([ok, t, d, a, opt]) => `<div class="${ok ? 'ok' : opt ? 'opt' : 'todo'}"><i>${ok ? '✓' : opt ? '○' : '!'}</i><span><b>${t}</b><small>${d}</small></span>${a && !ok ? `<button data-ma="${a}">${{ qc: 'Ouvrir', proof: 'Lancer', translate: 'Ouvrir', left: 'Pages', save: 'Enregistrer', mail: 'Rédiger', alertsbox: 'Régler', peaks: 'Nommer' }[a]}</button>` : ''}</div>`).join('')}</div>
      <div class="ed-row"><button class="pri" data-m="close">Fermer</button></div>`, true);
    document.getElementById('ed-mbody').onclick = e => { const b = e.target.closest('[data-ma]'); if (!b) return; closeModal(); act(b.dataset.ma); };
  }

  /* ---------- e-mail d’envoi ---------- */
  function mailBox() {
    const tpl = () => `Bonjour,\n\nVous trouverez ci-joint le rapport e-réputation ${CLIENT} de ${String(TOKMAP.mois).toLowerCase()}.\n\nEn bref :\n• ${TOKMAP.publications} publications (${TOKMAP.publications_vs_m1} vs ${TOKMAP.mois_precedent})\n• Sentiment net de ${TOKMAP.sentiment_net} (${TOKMAP.sentiment_vs_m1} vs le mois précédent)\n• EMV de ${TOKMAP.emv} (${TOKMAP.emv_vs_m1})\n• Score e-réputation : ${TOKMAP.score}, ${TOKMAP.rang_benchmark} du benchmark\n• Sujet le plus discuté : ${TOKMAP.top_sujet} (${TOKMAP.top_sujet_volume} publications)\n\nNous restons à votre disposition pour en échanger lors de notre prochain rendez-vous.\n\nBien cordialement,`;
    openModal(`<h3>E-mail d’envoi</h3><div class="ed-opts"><label>Destinataire <select id="ed-ml-to"><option value="client">Équipe ${CLIENT} (client)</option><option value="comex">Direction (très synthétique)</option><option value="interne">Équipe Licter (interne)</option></select></label>
      <label>Langue <select id="ed-ml-lg"><option value="fr">Français</option><option value="en">Anglais</option></select></label>${sampleFn ? '<button id="ed-ml-ai" class="pri">Rédiger avec l’IA</button>' : ''}</div>
      <label class="ed-f">Objet <input id="ed-ml-s" value="${esc(`Rapport e-réputation ${CLIENT} · ${String(TOKMAP.mois).toLowerCase()}`)}"></label>
      <textarea id="ed-ml-b" rows="16" style="width:100%">${esc(tpl())}</textarea>
      <p class="ed-note">Rien n’est envoyé : copiez le texte dans votre messagerie.</p>
      <div class="ed-row"><button data-m="close">Fermer</button><button class="pri" id="ed-ml-cp">Copier l’objet et le texte</button></div>`, true);
    const g = id => document.getElementById(id);
    g('ed-ml-cp').onclick = async () => { const t = `Objet : ${g('ed-ml-s').value}\n\n${g('ed-ml-b').value}`; try { await navigator.clipboard.writeText(t); status('E-mail copié dans le presse-papiers', 'ok'); } catch (e) { g('ed-ml-b').select(); status('Sélectionné : faites Ctrl/Cmd + C', 'warn'); } if (!E.done.mail) { E.done.mail = new Date().toISOString(); E.updated = E.done.mail; dirty = true; store.set(KEY, JSON.stringify(E)); } };
    if (g('ed-ml-ai')) g('ed-ml-ai').onclick = async () => {
      const b = g('ed-ml-ai'); b.disabled = true; b.textContent = 'Rédaction…'; const to = g('ed-ml-to').value, lg = g('ed-ml-lg').value;
      try {
        const r = await sampleFn(`${SYS}\nRédige l’e-mail d’envoi du rapport e-réputation ${CLIENT} de ${TOKMAP.mois}, ${{ client: 'à l’équipe communication de ' + CLIENT + ' (client), ton cordial et professionnel, 5 points clés chiffrés', comex: 'à un membre de la direction de ' + CLIENT + ', très synthétique : 3 phrases maximum, le chiffre le plus important d’abord', interne: 'à l’équipe interne Licter, ton direct, avec les points de vigilance et ce qu’il faut préparer pour le rendez-vous' }[to]}. ${lg === 'en' ? 'Write it in British English.' : 'En français.'} Commence par « Objet : … » sur la première ligne, puis le corps de l’e-mail. Pas de markdown, pas de signature nominative (termine par « Bien cordialement, » ou l’équivalent).\n\nDonnées du mois :\n${dataContext()}`, { onText: ({ text }) => { g('ed-ml-b').value = text; } });
        const t = (r.text || '').trim(), m = t.match(/^(?:Objet|Subject)\s*:\s*(.+)\n+/i);
        if (m) { g('ed-ml-s').value = m[1].trim(); g('ed-ml-b').value = t.slice(m[0].length); } else g('ed-ml-b').value = t;
      } catch (e) { status(e && e.code === 'not_granted' ? 'Assistant IA refusé' : 'L’e-mail n’a pas pu être rédigé', 'err'); }
      b.disabled = false; b.textContent = 'Rédiger avec l’IA';
    };
  }

  /* ---------- « Demander au rapport » (lecteurs) ---------- */
  const askB = H(`<div id="ed-ask" data-ed-ui hidden><button id="ed-ask-o">Une question sur le rapport ?</button><div id="ed-ask-p" hidden><div class="ed-ask-h"><b>Demander au rapport</b><button id="ed-ask-x" aria-label="Fermer">×</button></div><div id="ed-ask-l"><p class="ed-note">Posez une question sur les chiffres du mois. Ex. : « Pourquoi le sentiment progresse ? », « Quels sujets portent la hausse ? »</p></div><form id="ed-ask-f"><input id="ed-ask-i" placeholder="Votre question…" autocomplete="off"><button class="pri">Envoyer</button></form><small>Réponses générées par l’IA à partir du rapport : vérifiez les chiffres.</small></div></div>`);
  document.body.append(askB);
  let askHist = [], askCtl = null;
  const reportText = () => { const parts = []; visOrder().forEach(id => { const sec = document.getElementById(id); parts.push(`## ${pageName(id)}\n${(sec.innerText || '').replace(/\s+/g, ' ').slice(0, 1500)}`); }); return parts.join('\n').slice(0, 14000); };
  document.getElementById('ed-ask-o').onclick = () => { document.getElementById('ed-ask-p').hidden = false; document.getElementById('ed-ask-o').hidden = true; document.getElementById('ed-ask-i').focus(); };
  document.getElementById('ed-ask-x').onclick = () => { if (askCtl) askCtl.abort(); document.getElementById('ed-ask-p').hidden = true; document.getElementById('ed-ask-o').hidden = false; };
  document.getElementById('ed-ask-f').addEventListener('submit', async e => {
    e.preventDefault(); const i = document.getElementById('ed-ask-i'), q = i.value.trim(); if (!q || !sampleFn) return; i.value = '';
    const L = document.getElementById('ed-ask-l'); L.insertAdjacentHTML('beforeend', `<p class="q">${esc(q)}</p><p class="a">…</p>`); const out = L.lastElementChild; L.scrollTop = L.scrollHeight;
    if (!askHist.length) askHist.push({ role: 'user', content: `Tu réponds aux questions des lecteurs du rapport e-réputation ${CLIENT} de ${TOKMAP.mois} (réalisé par Licter). Réponds en ${curLang() === 'en' ? 'anglais' : 'français'}, en 3 à 5 phrases, uniquement à partir des données ci-dessous ; si l’information n’y est pas, dis-le simplement. Pas de markdown.\n\nDonnées chiffrées :\n${dataContext()}\n\nTextes du rapport :\n${reportText()}\n\nRéponds « Compris. » à ce message.` }, { role: 'assistant', content: 'Compris.' });
    askHist.push({ role: 'user', content: q });
    askCtl = new AbortController();
    try { const r = await sampleFn(askHist, { signal: askCtl.signal, cache: false, onText: ({ text }) => { out.textContent = text; L.scrollTop = L.scrollHeight; } }); out.textContent = (r.text || '').trim(); askHist.push({ role: 'assistant', content: out.textContent }); }
    catch (er) { if (er && er.name === 'AbortError') return; askHist.pop(); out.textContent = er && er.code === 'not_granted' ? 'L’assistant n’est pas autorisé dans cette vue.' : er && er.code === 'rate_limited' ? 'Trop de questions : réessayez dans un instant.' : 'Pas de réponse pour le moment.'; out.classList.add('err'); }
  });
  function askUI() { askB.hidden = on || presenting || !sampleFn || !(E.set && E.set.ask); }

  /* ---------- dessin à main levée ---------- */
  const drawC = H(`<canvas id="ed-draw" data-ed-ui hidden></canvas>`), drawBar = H(`<div id="ed-drawbar" data-ed-ui hidden><span>Dessinez sur la page · Entrée pour terminer · Échap pour annuler</span><button id="ed-draw-ok" class="pri">Terminer</button><button id="ed-draw-x">Annuler</button></div>`);
  document.body.append(drawC, drawBar);
  let strokes = [], cur = null;
  function drawStart() { strokes = []; drawC.width = innerWidth * devicePixelRatio; drawC.height = innerHeight * devicePixelRatio; drawC.hidden = drawBar.hidden = false; select(null); }
  function drawEnd(keep) {
    drawC.hidden = drawBar.hidden = true; const g = drawC.getContext('2d'); g.clearRect(0, 0, drawC.width, drawC.height);
    if (!keep || !strokes.length) { strokes = []; return; }
    const sec = curSection(); if (!sec) return; const pts = strokes.flat(), pad = 6;
    const x0 = Math.min(...pts.map(p_ => p_[0])) - pad, y0 = Math.min(...pts.map(p_ => p_[1])) - pad, x1 = Math.max(...pts.map(p_ => p_[0])) + pad, y1 = Math.max(...pts.map(p_ => p_[1])) + pad;
    const sr = sec.getBoundingClientRect(), rp = remPx();
    const d = strokes.map(st_ => { const q = st_.map(p_ => [r2(p_[0] - x0), r2(p_[1] - y0)]); if (q.length < 3) return `M${q[0][0]} ${q[0][1]}L${(q[1] || q[0]).join(' ')}`; let o_ = `M${q[0][0]} ${q[0][1]}`; for (let i = 1; i < q.length - 1; i++) { const mx = (q[i][0] + q[i + 1][0]) / 2, my = (q[i][1] + q[i + 1][1]) / 2; o_ += `Q${q[i][0]} ${q[i][1]} ${r2(mx)} ${r2(my)}`; } return o_; });
    snapshot(); const a = { id: uid(), kind: 'draw', sec: sec.id, parent: sec.id, u: 'rem', x: r2((x0 - sr.left) / rp), y: r2((y0 - sr.top) / rp), w: r2((x1 - x0) / rp), h: r2((y1 - y0) / rp), vb: [r2(x1 - x0), r2(y1 - y0)], d, sw: 3, style: { color: '#d8b47a' }, name: 'Dessin' };
    E.add.push(a); strokes = []; changed('Dessin ajouté'); select(addEl(a.id));
  }
  drawC.addEventListener('pointerdown', e => { cur = [[e.clientX, e.clientY]]; strokes.push(cur); drawC.setPointerCapture(e.pointerId); });
  drawC.addEventListener('pointermove', e => { if (!cur) return; const l_ = cur[cur.length - 1]; if (Math.hypot(e.clientX - l_[0], e.clientY - l_[1]) < 3) return; cur.push([e.clientX, e.clientY]); const g = drawC.getContext('2d'), dp = devicePixelRatio; g.strokeStyle = '#d8b47a'; g.lineWidth = 3 * dp; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(l_[0] * dp, l_[1] * dp); g.lineTo(e.clientX * dp, e.clientY * dp); g.stroke(); });
  drawC.addEventListener('pointerup', () => { cur = null; });
  document.getElementById('ed-draw-ok').onclick = () => drawEnd(true);
  document.getElementById('ed-draw-x').onclick = () => drawEnd(false);
  addEventListener('keydown', e => { if (drawC.hidden) return; if (e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); drawEnd(true); } else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); drawEnd(false); } }, true);

  /* ---------- aperçu mobile / tablette ---------- */
  const devL = H(`<div id="ed-dev" data-ed-ui hidden><div class="ed-dev-h"><b>Aperçu appareil</b><span class="ed-btns" id="ed-dev-s">${[['390x844', 'Téléphone'], ['820x1180', 'Tablette'], ['1180x820', 'Tablette paysage'], ['1366x768', 'Portable']].map(([v, l], i) => `<button data-dv="${v}" class="${i ? '' : 'on'}">${l}</button>`).join('')}</span><button id="ed-dev-r">Recharger</button><button id="ed-dev-x">Fermer</button></div><div class="ed-dev-w"><div class="ed-dev-f" id="ed-dev-f"></div></div></div>`);
  document.body.append(devL);
  let devSize = '390x844';
  function deviceBox() { devL.hidden = false; devLoad(); }
  function devLoad() {
    const [w_, h_] = devSize.split('x').map(Number), f = document.getElementById('ed-dev-f'), W_ = innerWidth - 80, H_ = innerHeight - 120, k = Math.min(1, W_ / w_, H_ / h_);
    f.innerHTML = ''; f.style.width = w_ * k + 'px'; f.style.height = h_ * k + 'px';
    const fr = document.createElement('iframe'); fr.title = 'Aperçu ' + devSize; fr.style.width = w_ + 'px'; fr.style.height = h_ + 'px'; fr.style.transform = `scale(${k})`; fr.srcdoc = buildDoc(true); f.appendChild(fr);
  }
  document.getElementById('ed-dev-s').addEventListener('click', e => { const b = e.target.closest('[data-dv]'); if (!b) return; devSize = b.dataset.dv; document.querySelectorAll('#ed-dev-s button').forEach(x => x.classList.toggle('on', x === b)); devLoad(); });
  document.getElementById('ed-dev-r').onclick = devLoad;
  document.getElementById('ed-dev-x').onclick = () => { devL.hidden = true; document.getElementById('ed-dev-f').innerHTML = ''; };
  addEventListener('keydown', e => { if (!devL.hidden && e.key === 'Escape') { e.stopImmediatePropagation(); document.getElementById('ed-dev-x').click(); } }, true);

  /* ---------- vue d’ensemble ---------- */
  const ovL = H(`<div id="ed-ov" data-ed-ui hidden><div class="ed-ov-h"><b>Vue d’ensemble</b><span>Cliquez une page pour y aller · glissez pour réordonner · Échap pour fermer</span><button id="ed-ov-x">Fermer</button></div><div class="ed-ov-g" id="ed-ov-g"></div></div>`);
  document.body.append(ovL);
  function overview() {
    const G = document.getElementById('ed-ov-g'), o = orderNow(), tw = 260, sc = tw / innerWidth;
    G.innerHTML = '';
    o.forEach((id, i) => {
      const sec = document.getElementById(id), t = document.createElement('div'); t.className = 'ed-ovt' + (E.hide[id] ? ' off' : '') + ' st-' + (E.status[id] || 'draft'); t.draggable = true; t.dataset.id = id;
      const box = document.createElement('div'); box.className = 'ed-ovb'; box.style.height = Math.round(innerHeight * sc) + 'px';
      const sh = document.createElement('div'); sh.className = 'ed-ovs'; sh.style.width = innerWidth + 'px'; sh.style.height = innerHeight + 'px'; sh.style.transform = `scale(${sc})`;
      const cl = sec.cloneNode(true); cl.removeAttribute('id'); cl.querySelectorAll('[id]').forEach(n => n.removeAttribute('id')); cl.querySelectorAll('[data-add-id]').forEach(n => n.removeAttribute('data-add-id'));
      cl.classList.remove('ed-sec-hidden'); cl.style.minHeight = innerHeight + 'px'; sh.appendChild(cl); box.appendChild(sh);
      t.appendChild(box); t.insertAdjacentHTML('beforeend', `<p><i>${String(i + 1).padStart(2, '0')}</i>${esc(pageNameFr(id))}${E.hide[id] ? ' <small>masquée</small>' : ''}<small class="rt">${readMin(id)}</small></p>`);
      G.appendChild(t);
    });
    ovL.hidden = false;
  }
  const ovClose = () => { ovL.hidden = true; document.getElementById('ed-ov-g').innerHTML = ''; };
  document.getElementById('ed-ov-x').onclick = ovClose;
  let ovDrag = null;
  ovL.addEventListener('dragstart', e => { const t = e.target.closest('.ed-ovt'); if (!t) return; ovDrag = t; t.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; });
  ovL.addEventListener('dragover', e => { const t = e.target.closest('.ed-ovt'); if (!ovDrag || !t || t === ovDrag) return; e.preventDefault(); const r = t.getBoundingClientRect(); t.parentNode.insertBefore(ovDrag, e.clientX > r.left + r.width / 2 ? t.nextSibling : t); });
  ovL.addEventListener('dragend', () => { if (!ovDrag) return; ovDrag.classList.remove('drag'); ovDrag = null; const no = [...document.querySelectorAll('#ed-ov-g .ed-ovt')].map(t => t.dataset.id); if (no.join() !== orderNow().join()) { snapshot(); E.order = no; changed('Pages réordonnées'); document.querySelectorAll('#ed-ov-g .ed-ovt p i').forEach((x, i) => { x.textContent = String(i + 1).padStart(2, '0'); }); } });
  ovL.addEventListener('click', e => { const t = e.target.closest('.ed-ovt'); if (!t) return; const id = t.dataset.id; ovClose(); document.getElementById(id).scrollIntoView(); });
  addEventListener('keydown', e => { if (!ovL.hidden && e.key === 'Escape') { e.stopImmediatePropagation(); ovClose(); } }, true);

  /* ---------- variables personnalisées ---------- */
  function varsBox() {
    const V = JSON.parse(JSON.stringify(E.vars));
    const nums = TOKENS.slice(0, TOK0).filter(t => numOf(t[2]) != null).map(t => t[0]);
    const prev = v => { const keep = TOKMAP[v.key]; const r = varVal(v); return r; };
    const draw = () => `<h3>Variables personnalisées</h3><p class="ed-note">Utilisables partout comme les variables du mois : <code>{{nom}}</code>. Une valeur qui commence par <b>=</b> est un calcul sur les chiffres du mois, ex. <code>= publications / 30</code> ou <code>= emv * 1000000 / publications</code>.</p>
      <table class="ed-grid ed-vars"><tr><th>Nom (sans espace)</th><th>Libellé</th><th>Valeur ou calcul</th><th>Déc.</th><th>Suffixe</th><th>Résultat</th><th></th></tr>
      ${V.map((v, i) => `<tr><td><input data-vk="${i}" value="${esc(v.key || '')}" placeholder="moyenne_jour"></td><td><input data-vl="${i}" value="${esc(v.label || '')}"></td><td><input data-vv="${i}" value="${esc(v.value || '')}" placeholder="= publications / 30"></td><td><input data-vd="${i}" type="number" min="0" max="3" value="${v.dec || 0}" style="width:50px"></td><td><input data-vs="${i}" value="${esc(v.suf || '')}" style="width:70px" placeholder=" pub./jour"></td><td class="res">${esc(prev(v))}</td><td><button data-vx="${i}">×</button></td></tr>`).join('')}</table>
      <div class="ed-row left"><button id="ed-v-add">+ Variable</button></div>
      <details class="ed-paste"><summary>Chiffres utilisables dans un calcul</summary><p class="ed-note">${nums.map(k => `<code>${k}</code> = ${esc(TOKMAP[k])}`).join(' · ')}</p></details>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-v-ok">Appliquer</button></div>`;
    openModal(draw(), true);
    const body = document.getElementById('ed-mbody'), redraw = () => { body.innerHTML = draw(); bind(); };
    body.oninput = e => { const d = e.target.dataset, i = +(d.vk ?? d.vl ?? d.vv ?? d.vd ?? d.vs); if (isNaN(i)) return; const v = V[i]; if (d.vk != null) v.key = e.target.value.trim().replace(/\s+/g, '_').toLowerCase(); if (d.vl != null) v.label = e.target.value; if (d.vv != null) v.value = e.target.value; if (d.vd != null) v.dec = +e.target.value; if (d.vs != null) v.suf = e.target.value; e.target.closest('tr').querySelector('.res').textContent = prev(v); };
    const bind = () => {
      document.getElementById('ed-v-add').onclick = () => { V.push({ key: 'variable_' + (V.length + 1), label: '', value: '' }); redraw(); };
      body.querySelectorAll('[data-vx]').forEach(b => b.onclick = () => { V.splice(+b.dataset.vx, 1); redraw(); });
      document.getElementById('ed-v-ok').onclick = () => { const clash = V.find(v => TOKENS.slice(0, TOK0).some(t => t[0] === v.key)); if (clash) return status(`« ${clash.key} » est déjà une variable du mois : choisissez un autre nom`, 'err'); snapshot(); E.vars = V.filter(v => v.key); closeModal(); changed(`${E.vars.length} variable(s) personnalisée(s)`); };
    };
    bind();
  }

  /* ---------- règles, repères, distances ---------- */
  let rulersOn = false, altDown = false, colsOn = false;
  const colsL = H(`<div id="ed-cols" data-ed-ui hidden></div>`); document.body.append(colsL);
  function colsDraw() { colsL.hidden = !(on && colsOn); if (colsL.hidden) return; const sec = curSection(); if (!sec) return; const r = sec.getBoundingClientRect(), rp = remPx(), mg = 6 * rp, gw = (r.width - 2 * mg - 22 * rp) / 12; colsL.style.left = r.left + mg + 'px'; colsL.style.width = r.width - 2 * mg + 'px'; colsL.style.backgroundImage = `repeating-linear-gradient(90deg, rgba(255,90,200,.07) 0 ${gw}px, transparent ${gw}px ${gw + 2 * rp}px)`; }
  addEventListener('scroll', () => { if (colsOn) requestAnimationFrame(colsDraw); }, { passive: true });
  const rulT = H(`<div class="ed-rul t" data-ed-ui hidden></div>`), rulL = H(`<div class="ed-rul l" data-ed-ui hidden></div>`), guideL = H(`<div id="ed-guides" data-ed-ui></div>`), measL = H(`<div id="ed-meas" data-ed-ui></div>`);
  document.body.append(rulT, rulL, guideL, measL);
  function guidesDraw() {
    const showR = on && rulersOn; rulT.hidden = rulL.hidden = !showR;
    const sec = on ? curSection() : null, G = sec && E.guides[sec.id]; guideL.innerHTML = '';
    if (showR && sec) {
      const r = sec.getBoundingClientRect(), rp = remPx(), stp = 10 * rp;
      rulT.style.backgroundImage = `repeating-linear-gradient(90deg, rgba(244,241,234,.45) 0 1px, transparent 1px ${stp}px)`; rulT.style.backgroundPosition = `${r.left}px 100%`;
      rulL.style.backgroundImage = `repeating-linear-gradient(180deg, rgba(244,241,234,.45) 0 1px, transparent 1px ${stp}px)`; rulL.style.backgroundPosition = `100% ${r.top}px`;
    }
    if (!sec || !G || !on) return;
    const r = sec.getBoundingClientRect(), rp = remPx();
    (G.x || []).forEach((x, i) => guideL.insertAdjacentHTML('beforeend', `<i class="gx" data-gx="${i}" style="left:${r.left + x * rp}px"><b>${r2(x)}</b></i>`));
    (G.y || []).forEach((y, i) => guideL.insertAdjacentHTML('beforeend', `<i class="gy" data-gy="${i}" style="top:${r.top + y * rp}px"><b>${r2(y)}</b></i>`));
  }
  addEventListener('scroll', () => { if (on && (rulersOn || Object.keys(E.guides).length)) requestAnimationFrame(guidesDraw); }, { passive: true });
  let gDrag = null;
  [rulT, rulL, guideL].forEach(z => z.addEventListener('pointerdown', e => {
    const sec = curSection(); if (!sec) return; e.preventDefault(); e.stopPropagation();
    const gi = e.target.closest('[data-gx], [data-gy]');
    if (gi) gDrag = { sec: sec.id, ax: gi.dataset.gx != null ? 'x' : 'y', i: +(gi.dataset.gx ?? gi.dataset.gy) };
    else if (z === rulT || z === rulL) { const ax = z === rulT ? 'y' : 'x'; const G = E.guides[sec.id] = E.guides[sec.id] || { x: [], y: [] }; G[ax] = G[ax] || []; G[ax].push(0); gDrag = { sec: sec.id, ax, i: G[ax].length - 1, nw: true }; }
    else return;
    rulersOn = true; z.setPointerCapture && z.setPointerCapture(e.pointerId);
  }, true));
  addEventListener('pointermove', e => {
    if (!gDrag) return; const sec = document.getElementById(gDrag.sec), r = sec.getBoundingClientRect(), rp = remPx();
    const v = gDrag.ax === 'x' ? (e.clientX - r.left) / rp : (e.clientY - r.top) / rp; E.guides[gDrag.sec][gDrag.ax][gDrag.i] = Math.round(v * 2) / 2; gDrag.out = gDrag.ax === 'x' ? e.clientX < 22 : e.clientY < 70; guidesDraw();
  }, true);
  addEventListener('pointerup', () => {
    if (!gDrag) return; const G = E.guides[gDrag.sec];
    if (gDrag.out) G[gDrag.ax].splice(gDrag.i, 1);
    gDrag = null; E.updated = new Date().toISOString(); dirty = true; store.set(KEY, JSON.stringify(E)); guidesDraw(); status('Repères gardés avec la page : glissez un repère sur la règle pour le retirer', 'ok');
  }, true);
  addEventListener('keyup', e => { if (e.key === 'Alt') { altDown = false; measure(); } }, true);
  addEventListener('blur', () => { altDown = false; measure(); });
  function measure() {
    measL.innerHTML = ''; const s0 = sel(); if (!on || !altDown || !s0 || !hovEl || hovEl === s0 || s0.contains(hovEl)) return;
    const a = s0.getBoundingClientRect(), b = hovEl.getBoundingClientRect(), up = unitPx(s0), u = unitOf(s0), f = v => `${r2(v / up)}${u}`, L = [];
    if (b.left >= a.right) L.push(['h', a.right, b.left, (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2 || a.top + a.height / 2]);
    else if (a.left >= b.right) L.push(['h', b.right, a.left, (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2 || a.top + a.height / 2]);
    if (b.top >= a.bottom) L.push(['v', a.bottom, b.top, (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2 || a.left + a.width / 2]);
    else if (a.top >= b.bottom) L.push(['v', b.bottom, a.top, (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2 || a.left + a.width / 2]);
    if (!L.length) { L.push(['h', Math.min(a.left, b.left), Math.max(a.left, b.left), a.top - 8]); L.push(['v', Math.min(a.top, b.top), Math.max(a.top, b.top), a.left - 8]); }
    L.forEach(([k, p1, p2, q]) => { const len = p2 - p1; if (len <= 0) return; measL.insertAdjacentHTML('beforeend', k === 'h' ? `<i class="mh" style="left:${p1}px;top:${q}px;width:${len}px"><b>${f(len)}</b></i>` : `<i class="mv" style="top:${p1}px;left:${q}px;height:${len}px"><b>${f(len)}</b></i>`); });
  }

  /* ---------- IA et images ---------- */
  let imgLim = null;
  async function canSeeImages() { if (!sampleFn || !sampleFn.limits) return false; if (imgLim === null) { try { imgLim = (await sampleFn.limits()).images || false; } catch (e) { imgLim = false; } } return !!imgLim; }
  const toBlob = async src => (await fetch(src)).blob();
  async function postFromShot() {
    if (!(await canSeeImages())) return status('La lecture d’images par l’IA est disponible dans l’artefact claude.ai', 'warn');
    const src = await pickImage(); if (!src) return;
    status('Lecture de la capture…');
    try {
      const r = await sampleFn.json(`Cette image est une capture d’écran d’une publication sur un réseau social. Extrais ses informations. Réponds uniquement avec un objet JSON : {"network": "Instagram|X|LinkedIn|TikTok|Facebook|YouTube|autre", "handle": "@compte", "date": "date telle qu’affichée ou vide", "engagements": "total des interactions visibles, ex. 12,4 k likes · 320 commentaires, ou vide", "text": "texte de la publication, 280 caractères max"}`, { images: [await toBlob(src)], modelTier: 'quick' });
      snapshot(); const a = addBlock('post', { post: { network: String(r.network || 'Instagram'), handle: String(r.handle || ''), date: String(r.date || ''), engagements: String(r.engagements || ''), text: String(r.text || ''), src } });
      if (!a) { undo.pop(); return; } changed('Carte post créée depuis la capture : vérifiez les informations'); select(addEl(a.id));
    } catch (e) { status(e && e.code === 'not_granted' ? 'Assistant IA refusé' : 'La capture n’a pas pu être lue', 'err'); }
  }
  async function altIA(el) {
    const a = addOf(el); if (!a || !a.src) return; if (!(await canSeeImages())) return status('Disponible dans l’artefact claude.ai', 'warn');
    status('Description de l’image…');
    try { const r = await sampleFn(`Rédige un texte alternatif en français pour cette image d’un rapport e-réputation (une phrase, 15 mots maximum, sans « image de »). Réponds uniquement avec le texte.`, { images: [await toBlob(a.src)], modelTier: 'quick' }); snapshot(); a.alt = (r.text || '').trim().replace(/^["«]\s*|\s*["»]$/g, ''); changed('Texte alternatif rédigé'); }
    catch (e) { status('Description impossible', 'err'); }
  }

  /* ---------- comparer avec une version ---------- */
  function diffEdits(A, B) {
    const out = [], ids = x => new Map(x.add.map(a => [a.id, a])), ma = ids(A), mb = ids(B), lab = a => a.name || ((a.html || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 40)) || a.kind;
    B.pages.forEach(p_ => { if (!A.pages.some(x => x.id === p_.id)) out.push(['+', 'Page ajoutée', p_.name]); });
    A.pages.forEach(p_ => { if (!B.pages.some(x => x.id === p_.id)) out.push(['−', 'Page supprimée', p_.name]); });
    mb.forEach((a, id) => { const o_ = ma.get(id); if (!o_) out.push(['+', 'Élément ajouté', lab(a), id]); else if (JSON.stringify(o_) !== JSON.stringify(a)) out.push(['~', (o_.html !== a.html ? 'Texte modifié' : 'Élément modifié'), lab(a), id]); });
    ma.forEach((a, id) => { if (!mb.has(id)) out.push(['−', 'Élément supprimé', lab(a)]); });
    const pk = new Set([...Object.keys(A.el), ...Object.keys(B.el)]);
    pk.forEach(k => { if (JSON.stringify(A.el[k]) !== JSON.stringify(B.el[k])) out.push(['~', (A.el[k] || {}).html !== (B.el[k] || {}).html ? 'Texte du rapport modifié' : 'Mise en forme du rapport modifiée', pageNameFr(k.split('>')[0]), null, k]); });
    ['bg', 'hide', 'names', 'notes', 'status', 'set', 'theme', 'styles', 'vars', 'paths', 'tr', 'lib'].forEach(k => { if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) out.push(['~', { bg: 'Fonds de page', hide: 'Pages masquées', names: 'Noms de pages', notes: 'Notes de présentation', status: 'Statuts de validation', set: 'Réglages', theme: 'Couleurs / ambiance', styles: 'Styles de texte', vars: 'Variables', paths: 'Parcours', tr: 'Version anglaise', lib: 'Mes blocs' }[k], '']); });
    return out;
  }
  function diffBox(p_) {
    const A = norm(JSON.parse(p_.e)), D_ = diffEdits(A, E);
    openModal(`<h3>Comparer avec « ${esc(p_.label)} »</h3><p class="ed-note">${new Date(p_.at).toLocaleString('fr-FR')} → maintenant · ${D_.length} différence(s)</p>
      <div class="ed-qc ed-diff">${D_.map((d, i) => `<div><i class="d${d[0] === '+' ? 'a' : d[0] === '−' ? 'r' : 'm'}">${d[0]}</i><span>${esc(d[1])}<small>${esc(d[2] || '')}</small></span>${d[3] || d[4] ? `<button data-dv="${i}">Voir</button>` : ''}</div>`).join('') || '<p class="ed-note">Aucune différence.</p>'}</div>
      <div class="ed-row"><button data-m="close">Fermer</button><button id="ed-df-r">Restaurer cette version</button></div>`, true);
    document.getElementById('ed-mbody').onclick = e => { const b = e.target.closest('[data-dv]'); if (!b) return; const d = D_[+b.dataset.dv], el = d[3] ? addEl(d[3]) : byPath(d[4]); closeModal(); if (el) { el.scrollIntoView({ block: 'center' }); setTimeout(() => select(el), 300); } };
    document.getElementById('ed-df-r').onclick = () => { snapshot(); E = norm(JSON.parse(p_.e)); closeModal(); changed('Version restaurée : pensez à enregistrer'); };
  }

  /* ---------- fonds animés ---------- */
  let dustRaf = 0;
  function dustLoop() {
    const cs_ = [...document.querySelectorAll('canvas.ed-bga-dust')]; if (!cs_.length) { dustRaf = 0; return; }
    const t = performance.now() / 1000;
    cs_.forEach(c => {
      const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const d = devicePixelRatio, W_ = Math.round(r.width * d), H_ = Math.round(r.height * d); if (c.width !== W_ || c.height !== H_) { c.width = W_; c.height = H_; }
      const g = c.getContext('2d'); g.clearRect(0, 0, W_, H_);
      const N = Math.min(160, Math.round(r.width * r.height / 9000));
      for (let i = 0; i < N; i++) { const sx = (Math.sin(i * 12.9898) * 43758.5453) % 1, sy = (Math.sin(i * 78.233) * 12345.6789) % 1, sp = .2 + ((i * 7) % 10) / 25; const x = ((Math.abs(sx) + Math.sin(t * .1 + i) * .02) % 1) * W_, y = ((Math.abs(sy) - t * sp * .02 % 1 + 1) % 1) * H_, a = .25 + .55 * Math.abs(Math.sin(t * .8 + i)); g.fillStyle = `rgba(240,214,166,${a.toFixed(2)})`; g.beginPath(); g.arc(x, y, (.6 + (i % 3) * .5) * d, 0, 6.283); g.fill(); }
    });
    dustRaf = requestAnimationFrame(dustLoop);
  }
  function bgAnims() {
    document.querySelectorAll('.ed-bga').forEach(n => n.remove());
    for (const [id, b] of Object.entries(E.bg)) {
      if (!b.anim) continue; const s_ = document.getElementById(id); if (!s_) continue; const t = s_.querySelector(':scope > .ph') || s_;
      const n = document.createElement(b.anim === 'dust' ? 'canvas' : 'div'); n.className = `ed-bga ed-bga-${b.anim}`; n.setAttribute('aria-hidden', 'true');
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative'; t.style.isolation = 'isolate'; t.prepend(n);
    }
    if (!dustRaf && document.querySelector('canvas.ed-bga-dust') && !matchMedia('(prefers-reduced-motion: reduce)').matches) dustRaf = requestAnimationFrame(dustLoop);
  }

  /* ---------- remplacer une couleur ---------- */
  const PARTS = ['add', 'el', 'bg', 'styles', 'theme', 'set'];
  function usedColors() { const m = {}; const js = JSON.stringify(PARTS.map(k => E[k])); (js.match(/#[0-9a-f]{6}\b/gi) || []).forEach(c => { c = c.toLowerCase(); m[c] = (m[c] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }
  function recolorBox() {
    const U = usedColors();
    openModal(`<h3>Remplacer une couleur partout</h3><p class="ed-note">Couleurs utilisées dans vos éléments, fonds, styles et réglages (le rapport généré n’est pas modifié).</p>
      <div class="ed-swe">${U.slice(0, 24).map(([c, n]) => `<label><button data-rc="${c}" style="width:34px;height:30px;border-radius:6px;background:${c};border:1px solid rgba(244,241,234,.25)"></button><span>${c} · ${n}</span></label>`).join('') || '<p class="ed-note">Aucune couleur personnalisée.</p>'}</div>
      <div class="ed-g2"><label class="ed-f">Remplacer <input type="color" id="ed-rc-a" value="${U[0] ? U[0][0] : '#d8b47a'}"></label><label class="ed-f">par <input type="color" id="ed-rc-b" value="#c9a46a"></label></div>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-rc-ok">Remplacer</button></div>`);
    document.getElementById('ed-mbody').addEventListener('click', e => { const b = e.target.closest('[data-rc]'); if (b) document.getElementById('ed-rc-a').value = b.dataset.rc; });
    document.getElementById('ed-rc-ok').onclick = () => {
      const a_ = document.getElementById('ed-rc-a').value.toLowerCase(), b_ = document.getElementById('ed-rc-b').value.toLowerCase(); if (a_ === b_) return;
      snapshot(); let c = 0; const re = new RegExp(a_, 'gi');
      PARTS.forEach(k => { const js = JSON.stringify(E[k]); const nx = js.replace(re, () => { c++; return b_; }); if (nx !== js) E[k] = JSON.parse(nx); });
      closeModal(); if (!c) { undo.pop(); return status('Couleur introuvable', 'warn'); } changed(`${c} occurrence(s) de ${a_} remplacée(s) par ${b_}`);
    };
  }

  /* ---------- alléger les images ---------- */
  async function recompress(src) {
    const img = new Image(); img.src = src; await img.decode();
    const k = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight)), cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
    const g = cv.getContext('2d'); g.drawImage(img, 0, 0, cv.width, cv.height);
    if (/^data:image\/(png|webp|gif)/.test(src)) { const d = g.getImageData(0, 0, cv.width, cv.height).data; for (let i = 3; i < d.length; i += 4 * 97) if (d[i] < 250) return cv.toDataURL('image/png'); }
    return cv.toDataURL('image/jpeg', .82);
  }
  function imgRefs() {
    const R_ = [], push = (o, k, where) => { if (o && typeof o[k] === 'string' && /^data:image\/(png|jpe?g|webp|gif)/.test(o[k])) R_.push({ o, k, where }); };
    E.add.forEach(a => { push(a, 'src', a.name || a.kind); push(a, 'src2', a.name || a.kind); if (a.post) push(a.post, 'src', 'Carte post'); (Array.isArray(a.items) ? a.items : []).forEach(x => push(x, 'src', 'Carrousel')); if (a.fx) push(a.fx, 'timg', 'Texte image'); });
    Object.entries(E.bg).forEach(([id, b]) => push(b, 'image', 'Fond · ' + pageNameFr(id)));
    Object.values(E.el).forEach(p_ => push(p_, 'src', 'Image du rapport'));
    return R_;
  }
  function slimBox() {
    const R_ = imgRefs(), big = R_.filter(r => r.o[r.k].length > 350000), tot = JSON.stringify(E).length;
    openModal(`<h3>Alléger le rapport</h3><p class="ed-note">Modifications du rapport : <b>${nfr(tot / 1e6, 2)} Mo</b> · ${R_.length} image(s) intégrée(s) · ${big.length} au-dessus de 350 Ko.</p>
      <div class="ed-qc">${big.map(r => `<div><i class="lv1">${nfr(r.o[r.k].length / 1.37e6, 1)} Mo</i><span>${esc(r.where)}</span></div>`).join('') || '<p class="ed-note">Rien à alléger.</p>'}</div>
      <p class="ed-note">Les images sont redimensionnées à 1 800 px maximum et recompressées (JPEG 82 %, PNG conservé s’il a de la transparence). Les vidéos ne sont pas touchées.</p>
      <div class="ed-row"><button data-m="close">Fermer</button>${big.length ? '<button class="pri" id="ed-sl-go">Alléger</button>' : ''}</div>`);
    const go = document.getElementById('ed-sl-go'); if (!go) return;
    go.onclick = async () => {
      go.disabled = true; go.textContent = 'Compression…'; snapshot(); let saved = 0;
      for (const r of big) { try { const nx = await recompress(r.o[r.k]); if (nx.length < r.o[r.k].length) { saved += r.o[r.k].length - nx.length; r.o[r.k] = nx; } } catch (e) { } }
      closeModal(); if (!saved) { undo.pop(); return status('Les images sont déjà optimisées', 'ok'); } changed(`${nfr(saved / 1.37e6, 1)} Mo gagnés : pensez à enregistrer`);
    };
  }

  /* ---------- informations du document ---------- */
  function docInfo() {
    const o = orderNow(), vis = visOrder(), words = vis.reduce((a_, id) => a_ + ((document.getElementById(id).innerText || '').split(/\s+/).filter(w => /[A-Za-zÀ-ÿ]{2}/.test(w)).length), 0);
    const kinds = {}; E.add.forEach(a => { const k = kindLabel(addEl(a.id) || document.body); kinds[k] = (kinds[k] || 0) + 1; });
    const sz = JSON.stringify(E).length, page = document.documentElement.outerHTML.length, tasks = Object.values(E.tasks).reduce((a_, L_) => a_ + L_.filter(x => !x.done).length, 0);
    const rows = [['Période', TOKMAP.mois], ['Pages', `${o.length} (${vis.length} visibles, ${E.pages.length} ajoutées)`], ['Mots', nfr(words)], ['Temps de lecture', `≈ ${Math.max(1, Math.round(vis.reduce((a_, id) => a_ + readSec(id), 0) / 60))} min`],
      ['Éléments ajoutés', `${E.add.length}${E.add.length ? ' : ' + Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k.toLowerCase()}`).join(', ') : ''}`], ['Retouches du rapport généré', Object.keys(E.el).length],
      ['Pages validées', `${o.filter(id => E.status[id] === 'ok').length} / ${o.length}`], ['Tâches ouvertes', tasks], ['Version anglaise', hasTr() ? `${Object.keys(E.tr.en).length} textes traduits` : 'non'],
      ['Poids des modifications', `${nfr(sz / 1e6, 2)} Mo`], ['Poids de la page affichée', `${nfr(page / 1e6, 1)} Mo`], ['Dernière modification', E.updated ? new Date(E.updated).toLocaleString('fr-FR') : '—']];
    openModal(`<h3>Informations du document</h3><table class="ed-info">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(String(v))}</td></tr>`).join('')}</table><div class="ed-row"><button class="pri" data-m="close">Fermer</button></div>`);
  }

  /* ================================================================
     ANIMATIONS, INTERACTIONS, TRANSITIONS
     ================================================================ */
  const ANIMS = [['none', 'Aucune'], ['fade', 'Fondu'], ['up', 'Montée'], ['down', 'Descente'], ['left', 'Glissement depuis la gauche'], ['right', 'Glissement depuis la droite'], ['zoom', 'Zoom'], ['pop', 'Apparition rebondie'], ['drop', 'Chute'], ['flip', 'Bascule 3D'], ['rotate', 'Rotation'], ['skew', 'Inclinaison'], ['blur', 'Mise au point'], ['wipe', 'Balayage (gauche → droite)'], ['rise', 'Dévoilement (bas → haut)'], ['iris', 'Ouverture en cercle'], ['draw', 'Tracé (icônes, flèches, dessins)'], ['words', 'Mot à mot'], ['letters', 'Lettre par lettre'], ['type', 'Machine à écrire'], ['mark', 'Surlignage']];
  const EASES = { '': 'Douce', spring: 'Rebond', elastic: 'Élastique', linear: 'Linéaire', drama: 'Dramatique', snap: 'Sèche' };
  const EASEV = { spring: 'cubic-bezier(.34,1.56,.64,1)', elastic: 'cubic-bezier(.68,-.6,.32,1.6)', linear: 'linear', drama: 'cubic-bezier(.7,0,.2,1)', snap: 'cubic-bezier(.9,0,.1,1)' };
  const HOVERS = [['magnet', 'Aimanté (suit la souris)'], ['spot', 'Lueur qui suit la souris'], ['tilt3d', 'Inclinaison 3D qui suit la souris'], ['lift', 'Soulever'], ['zoom', 'Agrandir'], ['shrink', 'Réduire'], ['glow', 'Halo'], ['shadow', 'Ombre dorée'], ['tilt', 'Incliner'], ['shine', 'Reflet qui passe'], ['underline', 'Soulignement qui se trace'], ['color', 'Changer de couleur'], ['gray', 'Noir et blanc → couleur'], ['zoomin', 'Zoom dans l’image']];
  const LOOPS = [['pulse', 'Pulsation'], ['breathe', 'Respiration'], ['float', 'Flottement'], ['bounce', 'Rebond'], ['wiggle', 'Frétillement'], ['spin', 'Rotation lente'], ['shine', 'Reflet'], ['glowp', 'Halo pulsé'], ['gradient', 'Dégradé animé'], ['shimmer', 'Brillance sur le texte'], ['gradtext', 'Texte en dégradé animé'], ['marquee', 'Texte défilant']];
  const ACTS = [['', 'Rien'], ['replay', 'Rejouer l’animation d’un élément'], ['goto', 'Aller à une page'], ['next', 'Aller à la page suivante'], ['lightbox', 'Agrandir en plein écran (image, graphique, bloc)'], ['sparkle', 'Pluie d’étoiles dorées'], ['flipself', 'Retourner (carte retournable)']];
  /* prévisualisation en mode édition */
  function animPreview(el, a) {
    if (!el || !a) return; const d = ((a.delay || 0) + (a.dur || .9)) * 1000 + 900;
    el.classList.add('ed-prev'); el.classList.remove('ed-in'); void el.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('ed-in')));
    if (el.classList.contains('ed-count')) { delete el.dataset.counted; setTimeout(() => countEl(el), (a.delay || 0) * 1000); }
    clearTimeout(el._pv); el._pv = setTimeout(() => el.classList.remove('ed-prev'), d);
  }
  function replayEl(el) {
    if (!el) return; el.classList.remove('ed-in', 'ed-rv-on'); void el.offsetWidth; requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('ed-in')));
    el.querySelectorAll('.ed-race').forEach(r => racePlay(r)); if (el.classList.contains('ed-count')) countEl(el);
  }
  /* actions des lecteurs */
  const lbL = H(`<div id="ed-lb" data-ed-ui hidden><img alt=""><div class="ed-lbc"></div><button aria-label="Fermer">×</button></div>`); document.body.append(lbL);
  lbL.addEventListener('click', () => { lbL.hidden = true; });
  function sparkle(x, y) {
    for (let i = 0; i < 26; i++) { const s_ = document.createElement('i'); s_.className = 'ed-spk'; s_.setAttribute('data-ed-ui', ''); const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 140; s_.style.left = x + 'px'; s_.style.top = y + 'px'; s_.style.setProperty('--dx', Math.cos(ang) * dist + 'px'); s_.style.setProperty('--dy', Math.sin(ang) * dist - 40 + 'px'); s_.style.setProperty('--r', (Math.random() * 360 | 0) + 'deg'); s_.style.animationDelay = (Math.random() * .12) + 's'; document.body.appendChild(s_); setTimeout(() => s_.remove(), 1500); }
  }
  addEventListener('click', e => {
    if (on) return;
    const fl = e.target.closest && e.target.closest('.ed-flip.clk'); if (fl) fl.classList.toggle('fl');
    const tb = e.target.closest && e.target.closest('[data-tb]'); if (tb) { const w_ = tb.closest('.ed-tabs5'); w_.querySelectorAll('[data-tb]').forEach(b => b.classList.toggle('on', b === tb)); w_.querySelectorAll('.ed-tbp').forEach((p_, i) => p_.classList.toggle('on', i === +tb.dataset.tb)); return; }
    const rb = e.target.closest && e.target.closest('.ed-rvl-b'); if (rb) { const w_ = rb.closest('.ed-rvl'); w_.classList.add('open'); const an = w_.querySelector('.ed-rvl-a'); if (an && /\d/.test(an.textContent)) countEl(an); return; }
    const t = e.target.closest && e.target.closest('.ed-add[data-act]'); if (!t) return;
    let A; try { A = JSON.parse(t.dataset.act); } catch (er) { return; }
    if (A.t === 'replay') replayEl(addEl(A.target));
    else if (A.t === 'goto' && A.target) { const s_ = document.getElementById(A.target); if (s_) s_.scrollIntoView({ behavior: 'smooth' }); }
    else if (A.t === 'next') { const o = visOrder(), i = o.indexOf((sectionOf(t) || {}).id); const s_ = document.getElementById(o[Math.min(o.length - 1, i + 1)]); if (s_) s_.scrollIntoView({ behavior: 'smooth' }); }
    else if (A.t === 'lightbox') { const im = t.querySelector('img'), bg = getComputedStyle(t).backgroundImage.match(/url\("?(.*?)"?\)/); const src = im ? im.src : bg && bg[1]; const box_ = lbL.querySelector('.ed-lbc'); box_.innerHTML = ''; if (src && t.classList.contains('ed-image')) { lbL.querySelector('img').src = src; lbL.querySelector('img').hidden = false; } else { lbL.querySelector('img').hidden = true; const r = t.getBoundingClientRect(), k = Math.min(innerWidth * .9 / r.width, innerHeight * .86 / r.height, 3), c = t.cloneNode(true); ['data-act', 'data-add-id', 'data-scr', 'data-mpx'].forEach(x => c.removeAttribute(x)); Object.assign(c.style, { position: 'relative', left: 'auto', top: 'auto', translate: 'none', rotate: '0deg', width: r.width + 'px', height: r.height + 'px', transform: `scale(${k})`, transformOrigin: '50% 50%', margin: `${r.height * (k - 1) / 2}px ${r.width * (k - 1) / 2}px` }); c.classList.add('ed-in'); box_.appendChild(c); } lbL.hidden = false; }
    else if (A.t === 'sparkle') sparkle(e.clientX, e.clientY);
    else if (A.t === 'flipself') { const f_ = t.querySelector('.ed-flip'); if (f_) f_.classList.toggle('fl'); }
    if (A.t) e.preventDefault();
  });
  /* blocs interactifs */
  const renderFlip = a => `<div class="ed-flip${a.flipOn === 'click' ? ' clk' : ''}" style="--f1:${a.c1 || '#0b1430'};--f2:${a.c2 || '#d8b47a'}"><div class="ed-fi"><div class="ed-ff">${tokC(a.html || '')}</div><div class="ed-fb">${tokC(a.back || '')}</div></div></div>`;
  const renderTabs = a => { const R_ = ((a.table || {}).rows || []); return `<div class="ed-tabs5"><div class="ed-tbh">${R_.map((r, i) => `<button class="${i ? '' : 'on'}" data-tb="${i}">${esc(tok(r[0]))}</button>`).join('')}</div>${R_.map((r, i) => `<div class="ed-tbp${i ? '' : ' on'}">${esc(tok(r[1] || '')).replace(/\n/g, '<br>')}</div>`).join('')}</div>`; };
  const renderHot = a => a.src ? `<div class="ed-hsw"><img src="${esc(a.src)}" alt="${esc(a.alt || '')}" draggable="false">${(a.pts || []).map((p_, i) => `<button class="ed-hs" style="left:${p_.x}%;top:${p_.y}%" data-t="${esc(tok(p_.t || ''))}"><span>${i + 1}</span></button>`).join('')}</div>` : '<div class="ed-ph">Image à points<br><small>Inspecteur → Choisir l’image</small></div>';
  const renderReveal = a => `<div class="ed-rvl"><div class="ed-rvl-q">${tokC(a.html || '')}</div><button class="ed-rvl-b">${esc(a.btn || 'Révéler la réponse')}</button><div class="ed-rvl-a">${tokC(a.ans || '')}</div></div>`;
  const renderTicker = a => { const it = String(a.items || '').split('\n').map(x => x.trim()).filter(Boolean).map(x => `<span>${tokC(x)}</span><i>◆</i>`).join(''); return `<div class="ed-tk"><div class="ed-tk-t" style="animation-duration:${a.speed || 30}s">${it}${it}</div></div>`; };
  let hsPlace = null;
  /* chronologie des animations de la page */
  function pageAnims() {
    const sec = curSection(); if (!sec) return;
    const L_ = E.add.filter(a => a.sec === sec.id).slice().sort((x, y) => (x.y - y.y) || (x.x - y.x)), M = L_.map(a => ({ id: a.id, anim: a.anim || 'none', delay: a.delay || 0, dur: a.dur || .9, ease: a.ease || '' }));
    const lab = a => a.name || (a.html || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 34) || kindLabel(addEl(a.id) || document.body);
    const draw = () => `<h3>Animations de la page « ${esc(pageNameFr(sec.id))} »</h3><p class="ed-note">Dans l’ordre de lecture. « Cascade » enchaîne les éléments les uns après les autres ; « Lire » montre le résultat ici.</p>
      <table class="ed-grid ed-anims"><tr><th>Élément</th><th>Entrée</th><th>Courbe</th><th>Délai (s)</th><th>Durée (s)</th></tr>${M.map((m, i) => `<tr><td>${esc(lab(L_[i]))}</td><td><select data-am="${i}">${ANIMS.map(([v, l]) => `<option value="${v}" ${m.anim === v ? 'selected' : ''}>${l}</option>`).join('')}</select></td><td><select data-ae="${i}">${Object.entries(EASES).map(([v, l]) => `<option value="${v}" ${m.ease === v ? 'selected' : ''}>${l}</option>`).join('')}</select></td><td><input data-ad="${i}" type="number" step=".05" min="0" value="${m.delay}"></td><td><input data-au="${i}" type="number" step=".1" min=".2" value="${m.dur}"></td></tr>`).join('') || '<tr><td colspan="5" class="ed-note">Aucun élément ajouté sur cette page.</td></tr>'}</table>
      <div class="ed-row left"><button id="ed-pa-c">Cascade</button><label class="ed-f in">pas <input id="ed-pa-s" type="number" step=".05" value=".15" style="width:60px"> s</label><select id="ed-pa-t">${ANIMS.filter(x => x[0] !== 'none').map(([v, l]) => `<option value="${v}" ${v === 'up' ? 'selected' : ''}>${l}</option>`).join('')}</select><button id="ed-pa-x">Tout retirer</button><button id="ed-pa-p">▶ Lire</button></div>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-pa-ok">Appliquer</button></div>`;
    openModal(draw(), true);
    const body = document.getElementById('ed-mbody'), redraw = () => { body.innerHTML = draw(); bind(); };
    body.oninput = body.onchange = e => { const d = e.target.dataset, v = e.target.value; if (d.am != null) M[+d.am].anim = v; if (d.ae != null) M[+d.ae].ease = v; if (d.ad != null) M[+d.ad].delay = +v || 0; if (d.au != null) M[+d.au].dur = +v || .9; };
    const bind = () => {
      document.getElementById('ed-pa-c').onclick = () => { const st_ = +document.getElementById('ed-pa-s').value || .15, ty = document.getElementById('ed-pa-t').value; M.forEach((m, i) => { m.anim = m.anim === 'none' ? ty : m.anim; m.delay = Math.round(i * st_ * 100) / 100; }); redraw(); };
      document.getElementById('ed-pa-x').onclick = () => { M.forEach(m => { m.anim = 'none'; m.delay = 0; }); redraw(); };
      document.getElementById('ed-pa-p').onclick = () => { const mb = modal.querySelector('.ed-mbox'); mb.style.opacity = '.12'; M.forEach(m => { const a = E.add.find(x => x.id === m.id), el = addEl(m.id); if (!a || !el || m.anim === 'none') return; const keep = { anim: a.anim, delay: a.delay, dur: a.dur, ease: a.ease }; el.className = el.className.replace(/ed-anim-\w+/g, '') + ` ed-anim ed-anim-${m.anim}`; el.style.setProperty('--ed-delay', m.delay + 's'); el.style.setProperty('--ed-dur', m.dur + 's'); el.style.setProperty('--ed-ease', EASEV[m.ease] || ''); animPreview(el, m); }); setTimeout(() => { mb.style.opacity = ''; }, Math.max(...M.map(m => m.delay + m.dur), 1) * 1000 + 900); };
      document.getElementById('ed-pa-ok').onclick = () => { snapshot(); M.forEach(m => { const a = E.add.find(x => x.id === m.id); if (!a) return; a.anim = m.anim; a.delay = m.delay || undefined; a.dur = m.dur !== .9 ? m.dur : undefined; a.ease = m.ease || undefined; }); closeModal(); changed('Animations de la page mises à jour'); };
    };
    bind();
  }
  /* effets globaux : défilement aimanté, fluide, curseur, intro */
  const curR = H(`<div id="ed-cur" data-ed-ui hidden><i></i><b></b></div>`); document.body.append(curR);
  let cx_ = 0, cy_ = 0, rx_ = 0, ry_ = 0, curRaf = 0;
  const fine = matchMedia('(pointer: fine)').matches;
  function curLoop() { rx_ += (cx_ - rx_) * .18; ry_ += (cy_ - ry_) * .18; curR.firstChild.style.transform = `translate(${rx_}px,${ry_}px)`; curR.lastChild.style.transform = `translate(${cx_}px,${cy_}px)`; curRaf = curR.hidden ? 0 : requestAnimationFrame(curLoop); }
  addEventListener('pointermove', e => { if (curR.hidden) return; cx_ = e.clientX; cy_ = e.clientY; const h = e.target.closest && e.target.closest('a, button, [data-go], .ed-clk, [data-act], [data-t], .ed-flip, summary, [data-tb], .tile'); curR.classList.toggle('big', !!h); if (!curRaf) curRaf = requestAnimationFrame(curLoop); }, { passive: true });
  let smT = null, smCur = 0, smRaf = 0;
  addEventListener('wheel', e => {
    if (on || presenting || !E.set || !E.set.smooth || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || (e.target.closest && e.target.closest('[data-ed-ui], .ed-acc, .ed-tbp, textarea'))) return;
    e.preventDefault(); if (smT === null) { smT = scrollY; smCur = scrollY; }
    smT = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, smT + e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1)));
    if (!smRaf) { const st_ = () => { smCur += (smT - smCur) * .11; if (Math.abs(smT - smCur) < .5) { smCur = smT; scrollTo(0, smCur); smRaf = 0; smT = null; return; } scrollTo(0, smCur); smRaf = requestAnimationFrame(st_); }; smRaf = requestAnimationFrame(st_); }
  }, { passive: false });
  function introShow() {
    if (on || !E.set || !E.set.intro || window.__ED_PREVIEW) return; try { if (sessionStorage.getItem('lvmh-intro')) return; sessionStorage.setItem('lvmh-intro', '1'); } catch (e) { }
    const n = H(`<div id="ed-intro" data-ed-ui><div><span class="l1">Licter <i>×</i> <b>${CLIENT}</b></span><span class="l2">${esc(E.set.introT || 'Rapport e-réputation')}</span><span class="l3">${esc(TOKMAP.mois)}</span></div></div>`);
    document.body.append(n); const close = () => { n.classList.add('out'); setTimeout(() => n.remove(), 900); };
    n.onclick = close; setTimeout(close, 2600);
  }
  function applyGlobalFx() {
    const S_ = E.set || {}, root = document.documentElement;
    root.classList.toggle('ed-snap', !!S_.snap && !on); root.classList.toggle('ed-noanim', !!S_.noanim && !on);
    curR.hidden = !(S_.cursor && fine && !on && !presenting); document.body.classList.toggle('ed-curon', !curR.hidden);
  }

  /* ---------- v16 : mots en rotation, souris, vidéo pilotée, arrivée de page, navigation, étapes ---------- */
  const rotWords = h => String(h).replace(/\[\[([^\]]+?)\]\]/g, (m, s_) => { const ws = s_.split('|').map(x => x.trim()).filter(Boolean); return ws.length ? `<span class="ed-rw" data-w="${esc(JSON.stringify(ws))}" data-i="0"><span>${ws[0]}</span></span>` : m; });
  setInterval(() => { if (on || document.hidden) return; document.querySelectorAll('.ed-rw').forEach(r => { let ws; try { ws = JSON.parse(r.dataset.w); } catch (e) { return; } const i = (+r.dataset.i + 1) % ws.length; r.dataset.i = i; r.innerHTML = `<span>${ws[i]}</span>`; }); }, 2400);
  let mxN = .5, myN = .5, mRaf = 0;
  addEventListener('pointermove', e => {
    if (on || presenting) return; mxN = e.clientX / innerWidth; myN = e.clientY / innerHeight;
    if (!mRaf) mRaf = requestAnimationFrame(() => { mRaf = 0; document.querySelectorAll('[data-mpx]').forEach(el => { const k = +el.dataset.mpx || 0; el.style.translate = `${((mxN - .5) * -k * 60).toFixed(1)}px ${((myN - .5) * -k * 40).toFixed(1)}px`; }); });
    const h = e.target.closest && e.target.closest('.ed-hv-magnet, .ed-hv-spot, .ed-hv-tilt3d'); if (!h) return;
    const r = h.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    if (h.classList.contains('ed-hv-magnet')) { if (h.dataset.tr0 === undefined) h.dataset.tr0 = h.style.translate || ''; h.style.translate = `${(dx * .22).toFixed(1)}px ${(dy * .22).toFixed(1)}px`; }
    if (h.classList.contains('ed-hv-spot')) { h.style.setProperty('--mx', (e.clientX - r.left) + 'px'); h.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    if (h.classList.contains('ed-hv-tilt3d')) h.style.transform = `perspective(70rem) rotateX(${(-dy / r.height * 12).toFixed(2)}deg) rotateY(${(dx / r.width * 14).toFixed(2)}deg) scale(1.02)`;
  }, { passive: true });
  addEventListener('pointerout', e => { const h = e.target.closest && e.target.closest('.ed-hv-magnet, .ed-hv-tilt3d'); if (!h || h.contains(e.relatedTarget)) return; if (h.classList.contains('ed-hv-magnet')) { h.style.translate = h.dataset.tr0 || ''; delete h.dataset.tr0; } if (h.classList.contains('ed-hv-tilt3d')) h.style.transform = ''; }, true);
  function scrubVideos() { if (on) return; document.querySelectorAll('video[data-scrub]').forEach(v => { if (!v.duration) return; const r = v.getBoundingClientRect(), p_ = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height))); v.currentTime = p_ * v.duration; }); }
  addEventListener('scroll', () => requestAnimationFrame(scrubVideos), { passive: true });
  function confetti(x, y, n = 70) {
    const cols = ['#d8b47a', '#f0d6a6', '#f4f1ea', '#7f9cff', '#6fcf97'];
    for (let i = 0; i < n; i++) { const c = document.createElement('i'); c.className = 'ed-cft'; c.setAttribute('data-ed-ui', ''); c.style.left = x + (Math.random() - .5) * 160 + 'px'; c.style.top = y + 'px'; c.style.background = cols[i % cols.length]; c.style.setProperty('--dx', (Math.random() - .5) * 700 + 'px'); c.style.setProperty('--dy', 300 + Math.random() * 500 + 'px'); c.style.setProperty('--r', (Math.random() * 900 - 450 | 0) + 'deg'); c.style.animationDuration = 1.6 + Math.random() * 1.4 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 3200); }
  }
  const burstIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting || on || e.target.dataset.burst) return; const b_ = (E.bg[e.target.id] || {}).burst; if (!b_) return; e.target.dataset.burst = 1; const r = e.target.getBoundingClientRect(); if (b_ === 'stars') { sparkle(innerWidth * .3, Math.max(80, r.top + 120)); setTimeout(() => sparkle(innerWidth * .7, Math.max(80, r.top + 160)), 250); setTimeout(() => sparkle(innerWidth * .5, Math.max(80, r.top + 90)), 500); } else confetti(innerWidth / 2, Math.max(-20, r.top - 20)); }), { threshold: .5 }) : null;
  const navL = H(`<div id="ed-nav" data-ed-ui hidden><button data-nv="-1" aria-label="Page précédente">‹</button><button data-nv="1" aria-label="Page suivante">›</button></div>`), crumbL = H(`<div id="ed-crumb" data-ed-ui hidden></div>`);
  document.body.append(navL, crumbL);
  navL.addEventListener('click', e => { const b_ = e.target.closest('[data-nv]'); if (!b_) return; const o = visOrder(), cur_ = (curSection() || {}).id, i = Math.max(0, o.indexOf(cur_)); const s_ = document.getElementById(o[Math.max(0, Math.min(o.length - 1, i + +b_.dataset.nv))]); if (s_) s_.scrollIntoView({ behavior: 'smooth' }); });
  function crumbUpd() { if (crumbL.hidden) return; const o = visOrder(), s_ = curSection(); if (!s_) return; crumbL.innerHTML = `<b>${o.indexOf(s_.id) + 1}</b> / ${o.length} · ${esc(pageName(s_.id))}`; }
  addEventListener('scroll', () => { if (!crumbL.hidden) requestAnimationFrame(crumbUpd); }, { passive: true });
  function readerNav() { const S_ = E.set || {}; navL.hidden = on || presenting || !S_.navbtn; crumbL.hidden = on || presenting || !S_.crumb; crumbUpd(); }
  function stepKey(e) {
    const sec = curSection(); if (!sec) return false;
    const back = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key);
    if (!back && ![' ', 'ArrowRight', 'ArrowDown', 'PageDown', 'Enter'].includes(e.key)) return false;
    if (!back) { const hid = [...sec.querySelectorAll('.ed-step:not(.ed-step-on)')]; if (!hid.length) return false; const m = Math.min(...hid.map(x => +x.dataset.step)); hid.filter(x => +x.dataset.step === m).forEach(x => x.classList.add('ed-step-on')); return true; }
    const shown = [...sec.querySelectorAll('.ed-step.ed-step-on')]; if (!shown.length) return false; const m = Math.max(...shown.map(x => +x.dataset.step)); shown.filter(x => +x.dataset.step === m).forEach(x => x.classList.remove('ed-step-on')); return true;
  }

  /* ---------- v17 : pages épinglées, défilement, citation, jour / nuit, compte à rebours ---------- */
  function pinUpd() {
    if (on) { document.querySelectorAll('.ed-at').forEach(n => n.classList.add('ed-at-on')); return; }
    document.querySelectorAll(`${ROOT} > section.ed-pinned-page`).forEach(sec => {
      const r = sec.getBoundingClientRect(), p_ = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight))), pc = p_ * 100;
      const bar = sec.querySelector('.ed-pinbar'); if (bar) bar.style.width = pc.toFixed(1) + '%';
      sec.querySelectorAll('.ed-at').forEach(n => { const at = +n.dataset.at || 0, un = n.dataset.until ? +n.dataset.until : 101; n.classList.toggle('ed-at-on', pc >= at && pc < un); });
    });
  }
  addEventListener('scroll', () => requestAnimationFrame(pinUpd), { passive: true });
  function fillAndCount() {
    document.querySelectorAll('[data-scr]').forEach(el => {
      let c; try { c = JSON.parse(el.dataset.scr); } catch (e) { return; }
      if (c.mode !== 'fill' && c.mode !== 'countup') return;
      if (on) { el.querySelectorAll('.ed-w').forEach(w_ => { w_.style.opacity = ''; }); el.querySelectorAll('[data-orig]').forEach(n => { n.textContent = n.dataset.orig; }); return; }
      const r = el.getBoundingClientRect(), p_ = Math.max(0, Math.min(1, (innerHeight * .9 - r.top) / (innerHeight * .55 + r.height * .5)));
      if (c.mode === 'fill') { const ws = el.querySelectorAll('.ed-w'), N = ws.length || 1; ws.forEach((w_, i) => { w_.style.opacity = i / N < p_ ? 1 : .16; }); return; }
      const tg = el.querySelectorAll('.ed-kv').length ? [...el.querySelectorAll('.ed-kv')] : [el];
      tg.forEach(t => {
        if (t.children.length && !t.dataset.orig) return;
        if (!t.dataset.orig) t.dataset.orig = t.textContent;
        const m = t.dataset.orig.match(/^(\D*?)([−-]?[\d\s   ]*\d(?:,\d+)?)(.*)$/s); if (!m) return;
        const dec = (m[2].split(',')[1] || '').length, to = parseFloat(m[2].replace(/[\s   ]/g, '').replace('−', '-').replace(',', '.')); if (isNaN(to)) return;
        const v = to * p_; t.textContent = p_ >= 1 ? t.dataset.orig : m[1] + (v < 0 ? '−' : '') + nfr(Math.abs(v), dec) + m[3];
      });
    });
  }
  addEventListener('scroll', () => requestAnimationFrame(fillAndCount), { passive: true });
  /* jour / nuit choisi par le lecteur */
  let readerMood = ''; try { readerMood = localStorage.getItem('lvmh-mood') || ''; } catch (e) { }
  /* citation d'un passage */
  const citeB = H(`<button id="ed-cite" data-ed-ui hidden>❝ Copier la citation</button>`); document.body.append(citeB);
  let citeTxt = '';
  document.addEventListener('mouseup', () => setTimeout(() => {
    if (on || !E.set || !E.set.cite || E.set.nocopy) { citeB.hidden = true; return; }
    const sl = getSelection(), t = sl ? sl.toString().replace(/\s+/g, ' ').trim() : '';
    if (!t || t.length < 12 || t.length > 700 || !sl.rangeCount || !app.contains(sl.anchorNode)) { citeB.hidden = true; return; }
    const r = sl.getRangeAt(0).getBoundingClientRect(); citeTxt = t;
    citeB.style.left = Math.max(10, Math.min(innerWidth - 190, r.left + r.width / 2 - 85)) + 'px'; citeB.style.top = Math.max(10, r.top - 44) + 'px'; citeB.hidden = false;
  }, 10));
  citeB.addEventListener('mousedown', e => e.preventDefault());
  citeB.addEventListener('click', async () => { const sec = curSection(), txt = `« ${citeTxt} »\n— Rapport e-réputation ${CLIENT}, ${String(TOKMAP.mois).toLowerCase()}${sec ? ', ' + pageName(sec.id) : ''} (Licter)`; try { await navigator.clipboard.writeText(txt); citeB.textContent = '✓ Citation copiée'; } catch (e) { citeB.textContent = 'Copie impossible'; } setTimeout(() => { citeB.hidden = true; citeB.textContent = '❝ Copier la citation'; }, 1400); });
  addEventListener('scroll', () => { citeB.hidden = true; }, { passive: true });
  /* compte à rebours */
  function renderCountdown(a) {
    const d = a.date ? new Date(a.date) : null; if (!d || isNaN(d)) return '<div class="ed-ph">Compte à rebours<br><small>Inspecteur → choisir la date</small></div>';
    const ms = d - Date.now(), day = 864e5, D_ = Math.floor(Math.abs(ms) / day), Hh = Math.floor(Math.abs(ms) % day / 36e5), M_ = Math.floor(Math.abs(ms) % 36e5 / 6e4);
    const when = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) + (d.getHours() || d.getMinutes() ? ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '');
    const body = ms < 0 ? `<div class="ed-cd-past">${Math.abs(ms) < day ? 'C’est aujourd’hui' : 'Date passée'}</div>` : `<div class="ed-cd-b"><div><b>${D_}</b><span>jour${D_ > 1 ? 's' : ''}</span></div><div><b>${String(Hh).padStart(2, '0')}</b><span>heures</span></div><div><b>${String(M_).padStart(2, '0')}</b><span>minutes</span></div></div>`;
    return `<div class="ed-cd"><div class="ed-cd-l">${esc(tok(a.label || 'Prochain rendez-vous'))}</div>${body}<div class="ed-cd-w">${esc(when)}</div></div>`;
  }
  setInterval(() => { document.querySelectorAll('.ed-countdown').forEach(n => { const a = E.add.find(x => x.id === n.dataset.addId); if (a) n.innerHTML = renderCountdown(a); }); }, 30000);

  /* ---------- v18 : raccourcis de saisie ---------- */
  const normK = x => String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
  function mdInline(html) {
    let h = String(html);
    h = h.replace(/\*\*([^*<>\n]+?)\*\*/g, '<b>$1</b>');
    h = h.replace(/(^|[\s>(«])_([^_<>\n]+?)_(?=[\s<.,;:!?)»]|$)/g, '$1<em class="ed-em">$2</em>');
    h = h.replace(/\{\+([^{}<>]+?)\}/g, '<span class="ed-up">$1</span>').replace(/\{-([^{}<>]+?)\}/g, '<span class="ed-down">$1</span>');
    h = h.replace(/\(\(([^()<>]+?)\)\)/g, (m, t) => `<sup class="ed-fn" data-t="${esc(t.trim())}">*</sup>`);
    h = h.replace(/:([a-zà-ÿ ]{3,20}):/gi, (m, k) => { const key = Object.keys(ICONS).find(x => normK(x) === normK(k)); return key ? `<span class="ed-ic" data-icon="${esc(key)}">${iconSVG(key, null, 1.8)}</span>` : m; });
    return h;
  }
  function footnotes() { [...app.children].forEach(sec => { let i = 0; sec.querySelectorAll('.ed-fn').forEach(f => { f.textContent = ++i; }); }); }
  /* ---------- v18 : blocs liés aux données ---------- */
  const METRICS = { volume: ['Publications', t => t.volume, v => nfr(v)], engagements: ['Engagements', t => t.engagements || 0, v => v >= 1e6 ? nfr(v / 1e6, 1) + ' M' : nfr(v)], reach: ['Reach', t => t.reach || 0, v => v >= 1e6 ? nfr(v / 1e6, 1) + ' M' : nfr(v)], net: ['Sentiment net', t => (t.net || 0) * 100, v => sgn(v, 0, ' %')], evol: ['Évolution du volume vs M-1', t => t.m1 && t.m1.volume ? (t.volume / t.m1.volume - 1) * 100 : null, v => sgn(v, 0, ' %')] };
  const netCol = n => n >= .45 ? '#6fcf97' : n >= .1 ? '#b9e4c9' : n > -.1 ? '#b7bdd0' : n > -.4 ? '#ffb3ad' : '#ff7a72';
  function renderCloud(a) {
    const M = (D.matrix || []).slice().sort((x, y) => y.volume - x.volume).slice(0, a.n || 28); if (!M.length) return '<div class="ed-ph">Pas de matrice ce mois-ci</div>';
    const mx = M[0].volume, mn = M[M.length - 1].volume, ord = []; M.forEach((t, i) => i % 2 ? ord.push(t) : ord.unshift(t));
    return `<div class="ed-cloud">${ord.map((t, i) => { const k = Math.sqrt((t.volume - mn) / ((mx - mn) || 1)); return `<span style="font-size:${(1.4 + k * 3.6).toFixed(2)}em;color:${a.color === 'gold' ? `rgba(216,180,122,${(.45 + k * .55).toFixed(2)})` : netCol(t.net)};--i:${i}" data-t="${esc(t.label)} : ${nfr(t.volume)} publications · sentiment ${sgn(t.net * 100, 0, ' %')}">${esc(t.label)}</span>`; }).join(' ')}</div>`;
  }
  function renderRank(a) {
    const [lab, fv, ff] = METRICS[a.metric] || METRICS.volume, M = (D.matrix || []).filter(t => t.volume >= (a.min || 0)).map(t => ({ t, v: fv(t) })).filter(x => x.v != null).sort((x, y) => a.asc ? x.v - y.v : y.v - x.v).slice(0, a.n || 8);
    const mx = Math.max(...M.map(x => Math.abs(x.v)), 1);
    return `<div class="ed-rk"><div class="ed-rk-h">${esc(a.title || (a.asc ? 'Les plus bas · ' : 'Top · ') + lab)}</div>${M.map((x, i) => `<div class="ed-rk-r" style="--i:${i}"><b>${i + 1}</b><span>${esc(x.t.label)}</span><em>${ff(x.v)}</em><i style="--w:${(Math.abs(x.v) / mx * 100).toFixed(1)}%;background:${a.metric === 'net' || a.metric === 'evol' ? (x.v >= 0 ? '#6fcf97' : '#ff7a72') : '#d8b47a'}"></i></div>`).join('')}</div>`;
  }
  function renderSenti(a) {
    const T = D.tot || {}, t = a.topic && (D.matrix || []).find(x => x.label === a.topic);
    const cur = t ? t.net : (T.cur || {}).net, m1 = t ? (t.m1 || {}).net : (T.m1 || {}).net, y1 = t ? null : (T.y1 || {}).net;
    if (cur == null) return '<div class="ed-ph">Pas de sentiment disponible</div>';
    const pos = v => ((v * 100 + 100) / 2).toFixed(1) + '%';
    return `<div class="ed-st5"><div class="ed-st5-h"><span>${esc(a.title || (t ? 'Sentiment · ' + t.label : 'Sentiment net du mois'))}</span><b>${sgn(cur * 100, 1, ' %')}</b></div><div class="ed-st5-bar"><i class="cur" style="left:${pos(cur)}"></i>${m1 != null ? `<i class="m1" style="left:${pos(m1)}" data-t="Mois précédent : ${sgn(m1 * 100, 1, ' %')}"></i>` : ''}${y1 != null ? `<i class="y1" style="left:${pos(y1)}" data-t="Il y a un an : ${sgn(y1 * 100, 1, ' %')}"></i>` : ''}</div><div class="ed-st5-s"><span>−100 %</span><span>0</span><span>+100 %</span></div><div class="ed-st5-l">${m1 != null ? `<span><i class="m1"></i>M-1 ${sgn(m1 * 100, 1, ' %')}</span>` : ''}${y1 != null ? `<span><i class="y1"></i>Y-1 ${sgn(y1 * 100, 1, ' %')}</span>` : ''}</div></div>`;
  }
  function renderVersus(a) {
    const B = (D.baro && D.baro.brands) || {}, C = D.conc || {}, C1 = D.conc_y1 || {}, other = a.brand && B[a.brand] ? a.brand : Object.keys(B).find(k => k !== CLIENT);
    if (!B[CLIENT] || !other) return '<div class="ed-ph">Pas de benchmark ce mois-ci</div>';
    const rows = [['Publications', C[CLIENT], C[other], v => nfr(v)], ['Évolution vs Y-1', C1[CLIENT] ? (C[CLIENT] / C1[CLIENT] - 1) * 100 : null, C1[other] ? (C[other] / C1[other] - 1) * 100 : null, v => sgn(v, 0, ' %')], ['Score e-réputation', B[CLIENT].score_total, B[other].score_total, v => nfr(v)], ['Score volume', B[CLIENT].score_volume, B[other].score_volume, v => nfr(v)], ['Score sentiment', B[CLIENT].score_sentiment, B[other].score_sentiment, v => nfr(v)]].filter(r => r[1] != null && r[2] != null);
    return `<div class="ed-vs"><div class="ed-vs-h"><b>${CLIENT}</b><i>vs</i><b>${esc(other)}</b></div>${rows.map(([l, x, y, f]) => { const mx = Math.max(Math.abs(x), Math.abs(y), 1); return `<div class="ed-vs-r"><em class="${x >= y ? 'win' : ''}">${f(x)}</em><span><i class="l" style="--w:${(Math.abs(x) / mx * 100).toFixed(1)}%"></i><small>${l}</small><i class="r" style="--w:${(Math.abs(y) / mx * 100).toFixed(1)}%"></i></span><em class="${y > x ? 'win' : ''}">${f(y)}</em></div>`; }).join('')}</div>`;
  }
  const renderTeam = a => `<div class="ed-tm">${(((a.table || {}).rows) || []).map(r => `<div><b>${esc(tok(r[0] || ''))}</b><span>${esc(tok(r[1] || ''))}</span>${r[2] ? `<small>${esc(r[2])}</small>` : ''}</div>`).join('')}</div>`;

  /* ---------- v19 : historique multi-mois ---------- */
  const HIST = (D.hist || []).filter(h => h.total);
  const histLab = h => `${(h.months || [1]).length > 1 ? 'juil.-août' : MSL[(h.months || [1])[0] - 1]} ${String(h.year).slice(2)}`;
  const histFull = h => `${h.label} ${h.year}${h.n > 1 ? ' (moyenne mensuelle)' : ''}`;
  const HMET = { total: ['Publications', h => h.total, v => nfr(v)], net: ['Sentiment net', h => h.net == null ? null : h.net * 100, v => sgn(v, 1, ' %')], emv: ['EMV', h => h.emv ? h.emv / 1e6 : null, v => nfr(v, 1) + ' M€'] };
  function renderTrend(a) {
    const [lab, fv, ff] = HMET[a.metric] || HMET.total, H_ = HIST.map(h => ({ h, v: fv(h) })).filter(x => x.v != null);
    if (H_.length < 3) return '<div class="ed-ph">Historique insuffisant</div>';
    const cur = H_[H_.length - 1], vs = H_.map(x => x.v), mn = Math.min(...vs), mx = Math.max(...vs), avg = vs.reduce((s_, v) => s_ + v, 0) / vs.length;
    const W = 300, Hh = 70, X = i => 4 + i * (W - 8) / (H_.length - 1), Y = v => Hh - 6 - (v - mn) / ((mx - mn) || 1) * (Hh - 14);
    const pts = H_.map((x, i) => [X(i), Y(x.v)]), rank = vs.slice().sort((x, y) => y - x).indexOf(cur.v) + 1, best = H_.find(x => x.v === mx);
    return `<div class="ed-tr"><div class="ed-tr-h"><span>${esc(a.title || lab + ' · ' + H_.length + ' mois')}</span><b>${ff(cur.v)}</b></div>
      <svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" class="ed-tr-s"><line x1="0" x2="${W}" y1="${Y(avg)}" y2="${Y(avg)}" class="avg"/><path class="gl" pathLength="1" d="${smooth(pts)}" fill="none" stroke="#d8b47a" stroke-width="2" vector-effect="non-scaling-stroke"/>${H_.map((x, i) => `<circle class="ed-hit" cx="${X(i)}" cy="${Y(x.v)}" r="${x === cur ? 4 : 2.2}" fill="${x === cur ? '#f4f1ea' : '#d8b47a'}" data-t="${esc(histFull(x.h))} : ${ff(x.v)}"/>`).join('')}</svg>
      <div class="ed-tr-f"><span>${esc(histLab(H_[0].h))}</span><span>${rank === 1 ? 'Record sur la période' : `${rank}<sup>e</sup> sur ${H_.length} · record ${esc(histFull(best.h))} (${ff(mx)})`}</span><span>${esc(histLab(cur.h))}</span></div>
      <div class="ed-tr-k"><span>Moyenne ${ff(avg)}</span><span>Min ${ff(mn)}</span><span>Max ${ff(mx)}</span></div></div>`;
  }

  /* ---------- v21 : comparer deux mois, sujet n°1, alertes, mini-courbes ---------- */
  function renderCmp2(a) {
    if (HIST.length < 2) return '<div class="ed-ph">Historique insuffisant</div>';
    const cur = HIST[HIST.length - 1], ya = HIST.find(h => h.year === cur.year - 1 && String(h.months) === String(cur.months)), A = HIST.find(h => h.key === a.ka) || ya || HIST[HIST.length - 2], B = HIST.find(h => h.key === a.kb) || cur;
    const rows = [['Publications / mois', A.total, B.total, v => nfr(v), 'pct'], ['Sentiment net', A.net * 100, B.net * 100, v => sgn(v, 1, ' %'), 'pts'], ['Part négative', (A.neg_pct || 0) * 100, (B.neg_pct || 0) * 100, v => nfr(v, 1) + ' %', 'pts', true], ['EMV / mois', (A.emv || 0) / 1e6, (B.emv || 0) / 1e6, v => nfr(v, 1) + ' M€', 'pct']];
    const dlt = (x, y, k, inv) => { if (x == null || y == null) return ''; const d = k === 'pct' ? (x ? (y / x - 1) * 100 : null) : y - x; if (d == null) return ''; const good = inv ? d <= 0 : d >= 0; return `<i class="${good ? 'up' : 'dn'}">${k === 'pct' ? sgn(d, 0, ' %') : sgn(d, 1, ' pts')}</i>`; };
    return `<div class="ed-c2"><div class="ed-c2-h"><b>${esc(histFull(A))}</b><span></span><b>${esc(histFull(B))}</b></div>${rows.map(([l, x, y, f, k, inv]) => `<div class="ed-c2-r"><em>${x == null ? '–' : f(x)}</em><span><small>${l}</small>${dlt(x, y, k, inv)}</span><em>${y == null ? '–' : f(y)}</em></div>`).join('')}
      <div class="ed-c2-r t"><em>${esc(A.top || '–')}</em><span><small>Sujet n°1</small></span><em>${esc(B.top || '–')}</em></div></div>`;
  }
  const renderTopTl = a => HIST.length ? `<div class="ed-ttl">${HIST.slice(-(a.n || 12)).map((h, i, L_) => `<div class="${i === L_.length - 1 ? 'cur' : ''}" style="--i:${i}" data-t="${esc(histFull(h))} : ${esc(h.top || '')} (${nfr(h.top_volume || 0)} publications)"><span>${esc(histLab(h))}</span><b>${esc(h.top || '–')}</b><small>${h.top_volume ? nfr(h.top_volume) : ''}</small></div>`).join('')}</div>` : '<div class="ed-ph">Historique indisponible</div>';
  /* alertes */
  const ALM = { publications: ['Publications', 'publications'], publications_vs_m1: ['Publications vs M-1 (%)', 'publications_vs_m1'], sentiment_net: ['Sentiment net (%)', 'sentiment_net'], sentiment_vs_m1: ['Sentiment net vs M-1 (pts)', 'sentiment_vs_m1'], negatif: ['Part négative (%)', 'negatif'], emv: ['EMV (M€)', 'emv'], emv_vs_m1: ['EMV vs M-1 (%)', 'emv_vs_m1'], score: ['Score e-réputation', 'score'], score_vs_m1: ['Score vs M-1 (%)', 'score_vs_m1'] };
  const ALDEF = [{ m: 'sentiment_net', op: '<', v: 0, msg: 'Sentiment net négatif' }, { m: 'negatif', op: '>', v: 20, msg: 'Part de publications négatives élevée' }, { m: 'publications_vs_m1', op: '<', v: -20, msg: 'Forte baisse de la conversation' }, { m: 'publications_vs_m1', op: '>', v: 50, msg: 'Pic de conversation inhabituel' }, { m: 'emv_vs_m1', op: '<', v: -25, msg: 'Recul marqué de la valeur médiatique' }, { m: 'score_vs_m1', op: '<', v: -10, msg: 'Baisse du score e-réputation' }];
  function alertsNow() { return (E.alerts || []).map(r => { const val = numOf(TOKMAP[(ALM[r.m] || [])[1]]); if (val == null) return null; const hit = r.op === '<' ? val < r.v : r.op === '>' ? val > r.v : r.op === '<=' ? val <= r.v : val >= r.v; return hit ? Object.assign({ val: TOKMAP[ALM[r.m][1]] }, r) : null; }).filter(Boolean); }
  const renderAlerts = a => { const L_ = alertsNow(); return `<div class="ed-al">${a.title !== '' ? `<div class="ed-al-h">${esc(a.title || 'Points d’attention')}</div>` : ''}${L_.map(x => `<div><i>!</i><span><b>${esc(x.msg)}</b><small>${esc((ALM[x.m] || [''])[0])} : ${esc(x.val)} (seuil ${x.op} ${nfr(x.v)})</small></span></div>`).join('') || '<p class="ed-al-0">✓ Aucun signal d’alerte ce mois-ci.</p>'}</div>`; };
  function alertsBox() {
    const A_ = JSON.parse(JSON.stringify(E.alerts || []));
    const draw = () => `<h3>Alertes</h3><p class="ed-note">Des seuils évalués automatiquement sur les chiffres de chaque mois. Les alertes déclenchées apparaissent dans « Préparer le rapport du mois » et dans le bloc « Points d’attention ».</p>
      <table class="ed-grid ed-vars"><tr><th>Indicateur</th><th></th><th>Seuil</th><th>Message</th><th>Ce mois-ci</th><th></th></tr>${A_.map((r, i) => { const v_ = TOKMAP[(ALM[r.m] || [])[1]], n_ = numOf(v_), hit = n_ != null && (r.op === '<' ? n_ < r.v : r.op === '>' ? n_ > r.v : r.op === '<=' ? n_ <= r.v : n_ >= r.v); return `<tr><td><select data-am="${i}">${Object.entries(ALM).map(([k, l]) => `<option value="${k}" ${r.m === k ? 'selected' : ''}>${l[0]}</option>`).join('')}</select></td><td><select data-ao="${i}">${['<', '<=', '>', '>='].map(o => `<option ${r.op === o ? 'selected' : ''}>${o}</option>`).join('')}</select></td><td><input data-av="${i}" type="number" step="any" value="${r.v}" style="width:80px"></td><td><input data-ag="${i}" value="${esc(r.msg || '')}"></td><td class="res ${hit ? 'hit' : ''}">${esc(v_ || '–')}${hit ? ' · déclenchée' : ''}</td><td><button data-ax="${i}">×</button></td></tr>`; }).join('')}</table>
      <div class="ed-row left"><button id="ed-al-add">+ Alerte</button><button id="ed-al-def">Alertes recommandées</button></div>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-al-ok">Appliquer</button></div>`;
    openModal(draw(), true);
    const body = document.getElementById('ed-mbody'), redraw = () => { body.innerHTML = draw(); bind(); };
    body.onchange = e => { const d = e.target.dataset, v = e.target.value; if (d.am != null) A_[+d.am].m = v; if (d.ao != null) A_[+d.ao].op = v; if (d.av != null) A_[+d.av].v = +v; if (d.ag != null) A_[+d.ag].msg = v; redraw(); };
    const bind = () => {
      document.getElementById('ed-al-add').onclick = () => { A_.push({ m: 'sentiment_net', op: '<', v: 0, msg: 'Nouvelle alerte' }); redraw(); };
      document.getElementById('ed-al-def').onclick = () => { ALDEF.forEach(r => { if (!A_.some(x => x.m === r.m && x.op === r.op)) A_.push(Object.assign({}, r)); }); redraw(); };
      body.querySelectorAll('[data-ax]').forEach(b => b.onclick = () => { A_.splice(+b.dataset.ax, 1); redraw(); });
      document.getElementById('ed-al-ok').onclick = () => { snapshot(); E.alerts = A_; closeModal(); const n_ = alertsNow().length; changed(n_ ? `${n_} alerte(s) déclenchée(s) ce mois-ci` : 'Aucune alerte déclenchée ce mois-ci'); };
    };
    bind();
  }
  function histCsv() {
    const q = v => v == null ? '' : /^-?\d+(\.\d+)?$/.test(String(v)) ? String(v).replace('.', ',') : String(v);
    const head = ['Période', 'Mois couverts', 'Publications (moy./mois)', 'Publications (période)', 'Sentiment net %', 'Part positive %', 'Part négative %', 'EMV (moy./mois, €)', 'Sujet n°1', 'Volume du sujet n°1'];
    const rows = HIST.map(h => [histFull(h), h.n || 1, Math.round(h.total), Math.round(h.total_period || h.total), h.net != null ? (h.net * 100).toFixed(1) : '', h.pos_pct != null ? (h.pos_pct * 100).toFixed(1) : '', h.neg_pct != null ? (h.neg_pct * 100).toFixed(1) : '', h.emv ? Math.round(h.emv) : '', h.top || '', h.top_volume || '']);
    download(fname('csv').replace('.csv', '_historique.csv'), '﻿' + [head, ...rows].map(r => r.map(c => /[;"\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : q(c)).join(';')).join('\n'), 'text/csv');
    status(`Historique exporté (${HIST.length} périodes)`, 'ok');
  }
  /* mini-courbes dans le texte : {{spark_publications}}, {{spark_sentiment}}, {{spark_emv}} */
  function sparkInline(k) {
    const f = { publications: h => h.total, sentiment: h => h.net, emv: h => h.emv }[k]; if (!f || HIST.length < 3) return '';
    const v = HIST.map(f).map(x => x == null ? null : x), vv = v.filter(x => x != null), mn = Math.min(...vv), mx = Math.max(...vv), W = 60, Hh = 16;
    const pts = v.map((x, i) => x == null ? null : [(i / (v.length - 1) * W).toFixed(1), (Hh - 2 - (x - mn) / ((mx - mn) || 1) * (Hh - 4)).toFixed(1)]).filter(Boolean), l = pts[pts.length - 1];
    return `<svg class="ed-spk-i" viewBox="0 0 ${W} ${Hh}" width="${W / 10}em" height="${Hh / 10}em"><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="1.4" vector-effect="non-scaling-stroke" stroke-linejoin="round"/><circle cx="${l[0]}" cy="${l[1]}" r="2" fill="#d8b47a"/></svg>`;
  }

  /* ---------- annotations de la courbe ----------
     E.peaks = { 'AAAA-MM-JJ': 'Sujet\nDétail' } (libellés des pics du build)
     E.curve = { hide: [dates], add: [{ date, text }], ev: [{ d1, d2, text }], always } */
  function peakList() {
    const days = D.days || [];
    return (((S.nodes || {}).curve || {}).annotations || []).filter(a => a.s === 2).map(a => ({ i: a.i, date: (days[a.i] || {}).date, v: (days[a.i] || {}).total, base: String(a.text || '') })).filter(p => p.date);
  }
  function peakSugg(date) {
    return (D.focus || []).filter(f => f.kind === 'daily').map(f => [f.sheet, (f.series.find(p => p.date === date) || {}).value || 0]).filter(x => x[1] > 0)
      .sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${k}\n(${nfr(n)} posts le ${dl(date)})`);
  }
  const dayIdx = date => (D.days || []).findIndex(d => d.date === date);
  function annNow(M, C) {
    M = M || E.peaks || {}; C = C || E.curve || {}; const hide = C.hide || [];
    const sty = C.sty || {};
    return peakList().filter(p => !hide.includes(p.date)).map(p => ({ i: p.i, text: String(M[p.date] ?? p.base), c: (sty[p.date] || {}).c, note: (sty[p.date] || {}).note }))
      .concat((C.add || []).map(a => ({ i: dayIdx(a.date), text: a.text || '', c: a.c, note: a.note })).filter(a => a.i >= 0));
  }
  const evNow = C => ((C || E.curve || {}).ev || []).map(e => { const i = dayIdx(e.d1), j = e.d2 ? dayIdx(e.d2) : -1; return { i, j: j > i ? j : null, text: e.text || '', c: e.c, note: e.note }; }).filter(e => e.i >= 0);
  function peaksApply(M, C) {
    const h = window.__v5conv; C = C || E.curve || {};
    if (h) { h.setAnn(annNow(M, C)); h.setEvents(evNow(C)); h.setAlways(!!C.always); if (h.setCtrl) h.setCtrl(!!C.ctrl); return; }
    const gs = document.querySelectorAll('#conversation .ann > g'); M = M || E.peaks || {};
    peakList().forEach((p, j) => { const g = gs[j]; if (!g) return; const [a, b] = String(M[p.date] ?? p.base).split('\n'), tx = g.querySelectorAll('text'); if (tx[0]) tx[0].textContent = a || ''; if (tx[1]) tx[1].textContent = b || ''; });
  }
  /* image d'un graphique SVG du rapport (PNG 2x ou SVG), polices du rapport intégrées */
  function fontFaces() {
    const ff = []; for (const sh of document.styleSheets) { let r; try { r = sh.cssRules; } catch (e) { continue; } for (const x of r) if (x.type === 5 && /Jost|Cormorant/i.test(x.style.getPropertyValue('font-family')) && !/italic/.test(x.style.getPropertyValue('font-style'))) ff.push(x.cssText); }
    return ff.join('\n');
  }
  async function svgImage(s0, o, fmt) {
    const vb = (s0.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number), r = s0.getBoundingClientRect();
    const W = vb.length === 4 && vb[2] ? vb[2] : Math.round(r.width), H = vb.length === 4 && vb[3] ? vb[3] : Math.round(r.height);
    const px = Math.max(40, W * .06), maxC = Math.max(30, Math.floor((W + px * 2 - px * 2) / 12.5)), words = String(o.title || '').split(' '), tl = [];
    words.forEach(w_ => { const l = tl[tl.length - 1]; if (l != null && (l + ' ' + w_).length <= maxC) tl[tl.length - 1] = l + ' ' + w_; else tl.push(w_); });
    if (tl.length > 2) { tl.length = 2; tl[1] = tl[1].replace(/\s*\S*$/, '') + ' …'; }
    const top = o.title ? 72 + tl.length * 34 : 56, bot = 54, TW = Math.round(W + px * 2), TH = Math.round(H + top + bot), cs = getComputedStyle(document.documentElement), cv = n => cs.getPropertyValue(n).trim();
    const cl = s0.cloneNode(true), src = [...s0.querySelectorAll('*')], dst = [...cl.querySelectorAll('*')];
    src.forEach((n, k) => { const c = getComputedStyle(n), d = dst[k]; if (!d) return;
      const st = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'opacity', 'font-family', 'font-size', 'font-weight', 'font-style', 'paint-order', 'letter-spacing', 'text-anchor', 'dominant-baseline'].map(p => `${p}:${c.getPropertyValue(p)}`).join(';');
      const tf = c.getPropertyValue('transform'); d.setAttribute('style', st + (tf && tf !== 'none' && !n.getAttribute('transform') ? `;transform:${tf};transform-box:${c.getPropertyValue('transform-box')};transform-origin:${c.getPropertyValue('transform-origin')}` : '')); d.removeAttribute('class'); });
    if (o.prep) o.prep(cl);
    cl.setAttribute('x', px); cl.setAttribute('y', top); cl.setAttribute('width', W); cl.setAttribute('height', H); cl.removeAttribute('style'); cl.setAttribute('overflow', 'visible');
    if (!cl.getAttribute('viewBox')) cl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const ink = cv('--ink') || '#f4f1ea', ink2 = cv('--ink-2') || '#b7bdd0', gold = cv('--gold') || '#c9a96e', bgc = cv('--bg') || '#050a1f';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TH}" viewBox="0 0 ${TW} ${TH}"><style>${fontFaces()}</style>
      <rect width="${TW}" height="${TH}" fill="${bgc}"/>
      <text x="${px}" y="40" fill="${gold}" style="font:500 13px Jost,sans-serif;letter-spacing:.18em">${esc(String(o.kicker || '').toUpperCase())} · ${esc(String(LB.period || PERIOD).toUpperCase())}</text>
      ${tl.filter(Boolean).map((l, k) => `<text x="${px}" y="${76 + k * 34}" fill="${ink}" style="font:400 28px 'Cormorant Garamond',Cormorant,Georgia,serif">${esc(l)}</text>`).join('')}
      ${new XMLSerializer().serializeToString(cl)}
      <text x="${px}" y="${TH - 20}" fill="${ink2}" style="font:400 12px Jost,sans-serif">${o.foot ? esc(o.foot) + ' · ' : ''}Source : Licter, e-réputation ${CLIENT}</text></svg>`;
    const name = fname(fmt).replace('.' + fmt, `_${o.slug || 'graphique'}.${fmt}`);
    if (fmt === 'svg') { await download(name, svg, 'image/svg+xml'); return status(`Image exportée en SVG : ${name}`, 'ok'); }
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    try { await img.decode(); } catch (e) { return status('Image impossible à produire pour ce graphique', 'err'); }
    await new Promise(r_ => setTimeout(r_, 120));
    const c = document.createElement('canvas'); c.width = TW * 2; c.height = TH * 2; const g = c.getContext('2d'); g.scale(2, 2); g.drawImage(img, 0, 0, TW, TH);
    const blob = await new Promise(r_ => c.toBlob(r_, 'image/png'));
    await download(name, blob, 'image/png'); status(`Image exportée en PNG (${TW * 2} × ${TH * 2})`, 'ok');
  }
  const clean = t => String(t || '').replace(/\[|\]|_|\*\*/g, '').replace(/\s*…\s*$/, '').replace(/\s+/g, ' ').trim();
  async function curveImage(fmt) {
    const s0 = document.querySelector('#conversation .conv-ch svg'); if (!s0) return status('Courbe de la conversation introuvable', 'err');
    const bars = document.querySelector('#conversation .conv-ch').classList.contains('bars'), leg = document.querySelector('#conversation .lgd');
    const legTxt = leg ? [...leg.querySelectorAll('text')].map(t => t.textContent).join(' · ') : '';
    return svgImage(s0, { kicker: 'La conversation', title: clean(((S.nodes || {}).curve || {}).title || 'La conversation'), slug: 'courbe', foot: (bars ? 'Sentiment net quotidien' : 'Publications quotidiennes') + (legTxt && !bars ? ' · ' + legTxt : ''),
      prep: cl => {
        const ov = cl.querySelector('rect[fill="transparent"]'); if (ov) ov.remove();
        cl.querySelectorAll('line[stroke-dasharray="3 4"]').forEach(l => { if (l.getAttribute('y1') == '30') l.remove(); });
        if (!bars) { const g = cl.querySelector('g:has(> rect[data-i])'); if (g) g.remove(); }
        [...cl.children].forEach(g => { if (g.querySelector && g.querySelector(':scope > g > circle') && !bars) g.style.opacity = 1; });
      } }, fmt);
  }
  /* tous les graphiques SVG visibles du rapport (sections + blocs ajoutés) */
  function chartList() {
    const out = [];
    document.querySelectorAll(`${ROOT} > section svg`).forEach(s0 => {
      if (s0.closest('[data-ed-ui]') || s0.parentElement.closest('svg') || s0.classList.contains('ed-spk-i')) return;
      const r = s0.getBoundingClientRect(), sec = s0.closest(`${ROOT} > section`); if (r.width < 220 || r.height < 110 || !sec || getComputedStyle(sec).display === 'none' || sec.classList.contains('stale') || sec.id === 'matrice') return;
      const blk = s0.closest('[data-add-id]'), a = blk && E.add.find(x => x.id === blk.dataset.addId);
      const rl = document.querySelector(`#rail5 a[href="#${sec.id}"] span`), secName = (E.names || {})[sec.id] || (rl ? rl.textContent : '') || sec.id;
      let hn = s0.parentElement, head = null; while (hn && hn !== sec.parentElement && !(head = hn.querySelector('h2, h3'))) hn = hn.parentElement;
      const conv = s0.closest('#conversation .conv-ch');
      out.push({ el: s0, sec, kicker: secName, title: conv ? clean(((S.nodes || {}).curve || {}).title) : a ? clean(a.name || (a.chart && a.chart.title) || '') : clean(head ? head.textContent : ''), slug: conv ? 'courbe' : (a ? 'bloc' : sec.id) + '-' + (out.filter(x => x.sec === sec).length + 1), curve: !!conv });
    });
    return out;
  }
  const chartExport = (c, fmt) => c.curve ? curveImage(fmt) : svgImage(c.el, c, fmt);
  function imagesBox() {
    const L = chartList();
    if (!L.length) return status('Aucun graphique exportable dans le rapport', 'warn');
    openModal(`<h3>Images des graphiques</h3><p class="ed-note">Chaque graphique du rapport en image, avec titre, période et source, pour un mail ou une présentation. Le graphique est exporté dans l’état affiché : faites défiler jusqu’à lui pour qu’il soit animé.</p>
      <table class="ed-grid ed-imgs"><tr><th>Page</th><th>Graphique</th><th></th></tr>${L.map((c, i) => `<tr><td>${esc(c.kicker)}</td><td>${esc(c.title || '—')}</td><td class="ed-btns"><button data-ig="${i}">Aller</button><button data-ip="${i}">PNG</button><button data-is="${i}">SVG</button></td></tr>`).join('')}</table>
      <div class="ed-row"><button class="pri" data-m="close">Fermer</button></div>`, true);
    document.getElementById('ed-mbody').onclick = e => {
      const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
      if (d.ig != null) { closeModal(); L[+d.ig].el.scrollIntoView({ block: 'center' }); }
      if (d.ip != null) chartExport(L[+d.ip], 'png');
      if (d.is != null) chartExport(L[+d.is], 'svg');
    };
  }
  /* bouton « ⤓ Image » au survol des graphiques, pour les lecteurs (Réglages) */
  function imgButtons() {
    document.querySelectorAll('.ed-imgb').forEach(b => b.remove());
    if (on || !(E.set && E.set.img)) return;
    chartList().forEach((c, i) => {
      const host = c.el.parentElement; if (!host) return;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      const b = document.createElement('button'); b.className = 'ed-imgb'; b.setAttribute('data-ed-ui', ''); b.textContent = '⤓ Image'; b.title = 'Télécharger ce graphique en image (PNG)';
      b.onclick = e => { e.preventDefault(); e.stopPropagation(); const L = chartList(), c2 = L.find(x => x.el === c.el); if (c2) chartExport(c2, 'png'); };
      host.appendChild(b);
    });
  }
  /* avertissements du build « Pic du … sans libellé » encore ouverts (pics nommés ou masqués dans l’éditeur = réglés) */
  const peakOpen = W_ => W_.filter(w => { const m = /Pic du (\d{4}-\d\d-\d\d)/.exec(w); return m && !String((E.peaks || {})[m[1]] || '').trim() && !((E.curve || {}).hide || []).includes(m[1]); });
  function peaksBox() {
    const P_ = peakList(), M_ = Object.assign({}, E.peaks || {}), C_ = JSON.parse(JSON.stringify(Object.assign({ hide: [], add: [], ev: [], sty: {}, always: false, ctrl: false }, E.curve || {})));
    const days = D.days || [];
    if (!days.length || !window.__v5conv && !P_.length) return status('Pas de courbe de la conversation dans ce rapport', 'warn');
    const txt = p => String(M_[p.date] ?? p.base);
    const dOpt = (sel, empty) => (empty ? `<option value="">${empty}</option>` : '') + days.map(d => `<option value="${d.date}"${d.date === sel ? ' selected' : ''}>${dl(d.date)} · ${nfr(d.total)}</option>`).join('');
    const COLS = [['', 'Or'], ['pos', 'Vert'], ['neg', 'Rouge'], ['ink', 'Blanc'], ['blue', 'Bleu']];
    const extra = (c, note, kc, kn, j) => `<div class="ed-pk-x"><select data-${kc}="${j}" title="Couleur">${COLS.map(([v, l]) => `<option value="${v}"${(c || '') === v ? ' selected' : ''}>● ${l}</option>`).join('')}</select><input data-${kn}="${j}" value="${esc(note || '')}" placeholder="Note affichée au survol (facultatif)" maxlength="140"></div>`;
    const two = (t, a, b, j) => { const [x, y] = String(t || '').split('\n'); return `<input data-${a}="${j}" value="${esc(x || '')}" placeholder="Sujet" maxlength="60"><input data-${b}="${j}" value="${esc(y || '')}" placeholder="Détail (facultatif)" maxlength="60">`; };
    const draw = () => `<h3>Annotations de la courbe</h3><p class="ed-note">Pics du build, points ajoutés sur n’importe quel jour, événements et périodes. La courbe se met à jour pendant la saisie ; les annotations apparaissent à l’étape « Le pic du mois », ou en permanence si la case est cochée.</p>
      <div class="ed-pk">
      <h6>Pics détectés</h6>${P_.map((p, j) => { const off = C_.hide.includes(p.date), sg = peakSugg(p.date); return `<div class="ed-pk-r${off ? ' off' : ''}">
        <div class="ed-pk-h"><b>${dl(p.date)}</b><small>${nfr(p.v)} publications${j === 0 ? ' · pic principal' : ''}${M_[p.date] != null ? ' · modifié' : ''}${off ? ' · masqué' : ''}</small><span class="ed-pk-b">${M_[p.date] != null ? `<button data-pr="${j}" title="Revenir au libellé du build">↺ Libellé du build</button>` : ''}<button data-ph="${j}">${off ? 'Afficher' : 'Masquer'}</button></span></div>
        ${two(txt(p), 'p1', 'p2', j)}${extra((C_.sty[p.date] || {}).c, (C_.sty[p.date] || {}).note, 'pc', 'pn', j)}
        ${sg.length ? `<div class="ed-pk-s"><small>Suggestions :</small>${sg.map((x, k) => `<button data-ps="${j}:${k}">${esc(x.replace('\n', ' '))}</button>`).join('')}</div>` : '<small class="ed-note">Aucun onglet focus quotidien ne couvre ce jour.</small>'}</div>`; }).join('') || '<p class="ed-note">Aucun pic annoté par le build.</p>'}
      <h6>Points ajoutés</h6>${C_.add.map((a, j) => `<div class="ed-pk-r"><div class="ed-pk-h"><select data-ad="${j}">${dOpt(a.date)}</select><span class="ed-pk-b">${peakSugg(a.date).slice(0, 2).map((x, k) => `<button data-as="${j}:${k}">${esc(x.split('\n')[0])}</button>`).join('')}<button data-ax="${j}" title="Supprimer">✕</button></span></div>${two(a.text, 'a1', 'a2', j)}${extra(a.c, a.note, 'ac', 'an', j)}</div>`).join('') || '<p class="ed-note">Aucun.</p>'}
      <div class="ed-row left"><button id="ed-pk-add">+ Point</button><button id="ed-pk-neg">+ Jour au sentiment le plus bas</button></div>
      <h6>Événements et périodes</h6>${C_.ev.map((e, j) => `<div class="ed-pk-r ed-pk-e"><select data-e1="${j}">${dOpt(e.d1)}</select><select data-e2="${j}">${dOpt(e.d2, 'un seul jour')}</select><input data-et="${j}" value="${esc(e.text || '')}" placeholder="Ex. Fashion Week de Paris" maxlength="40"><button data-ex="${j}" title="Supprimer">✕</button>${extra(e.c, e.note, 'ec', 'en', j)}</div>`).join('') || '<p class="ed-note">Aucun. Un événement trace une ligne verticale ; une période (date de fin) ajoute une bande.</p>'}
      <div class="ed-row left"><button id="ed-pk-ev">+ Événement</button></div>
      </div>
      <label class="ed-chk"><input type="checkbox" id="ed-pk-alw"${C_.always ? ' checked' : ''}> Afficher les annotations à toutes les étapes de la courbe</label>
      <label class="ed-chk"><input type="checkbox" id="ed-pk-ctl"${C_.ctrl ? ' checked' : ''}> Commandes de lecture sous la courbe (le lecteur affiche mois précédent, année précédente, sentiment)</label>
      <div class="ed-row left"><button id="ed-pk-png">Exporter l’image (PNG)</button><button id="ed-pk-svg">SVG</button><button id="ed-pk-auto">Suggérer les libellés des pics</button><button id="ed-pk-json">Copier pour content/&lt;mois&gt;.json</button></div>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-pk-ok">Appliquer</button></div>`;
    openModal(draw(), true);
    const body = document.getElementById('ed-mbody'), live = () => peaksApply(M_, C_), redraw = () => { const sc = (body.querySelector('.ed-pk') || {}).scrollTop || 0; body.innerHTML = draw(); const pk = body.querySelector('.ed-pk'); if (pk) pk.scrollTop = sc; bind(); live(); };
    const pair = (a, b, j) => { const x = body.querySelector(`[data-${a}="${j}"]`).value.trim(), y = body.querySelector(`[data-${b}="${j}"]`).value.trim(); return y ? x + '\n' + y : x; };
    body.oninput = e => {
      const d = e.target.dataset;
      if (d.p1 != null || d.p2 != null) { const j = +(d.p1 ?? d.p2); M_[P_[j].date] = pair('p1', 'p2', j); }
      else if (d.a1 != null || d.a2 != null) { const j = +(d.a1 ?? d.a2); C_.add[j].text = pair('a1', 'a2', j); }
      else if (d.et != null) C_.ev[+d.et].text = e.target.value;
      else if (d.pn != null) { const dt = P_[+d.pn].date; C_.sty[dt] = Object.assign({}, C_.sty[dt], { note: e.target.value }); }
      else if (d.an != null) C_.add[+d.an].note = e.target.value;
      else if (d.en != null) C_.ev[+d.en].note = e.target.value;
      else return;
      live();
    };
    body.onchange = e => {
      const d = e.target.dataset, v = e.target.value;
      if (d.ad != null) C_.add[+d.ad].date = v; else if (d.e1 != null) C_.ev[+d.e1].d1 = v; else if (d.e2 != null) C_.ev[+d.e2].d2 = v;
      else if (e.target.id === 'ed-pk-alw') C_.always = e.target.checked; else if (e.target.id === 'ed-pk-ctl') C_.ctrl = e.target.checked;
      else if (d.pc != null) { const dt = P_[+d.pc].date; C_.sty[dt] = Object.assign({}, C_.sty[dt], { c: v }); }
      else if (d.ac != null) C_.add[+d.ac].c = v; else if (d.ec != null) C_.ev[+d.ec].c = v;
      else return;
      live();
    };
    const used = () => new Set(annNow(M_, C_).map(a => a.i).concat(P_.map(p => p.i)));
    const bind = () => {
      body.querySelectorAll('[data-ps]').forEach(b => b.onclick = () => { const [j, k] = b.dataset.ps.split(':').map(Number), p = P_[j]; M_[p.date] = peakSugg(p.date)[k]; redraw(); });
      body.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => { delete M_[P_[+b.dataset.pr].date]; redraw(); });
      body.querySelectorAll('[data-ph]').forEach(b => b.onclick = () => { const dt = P_[+b.dataset.ph].date, k = C_.hide.indexOf(dt); if (k >= 0) C_.hide.splice(k, 1); else C_.hide.push(dt); redraw(); });
      body.querySelectorAll('[data-as]').forEach(b => b.onclick = () => { const [j, k] = b.dataset.as.split(':').map(Number); C_.add[j].text = peakSugg(C_.add[j].date)[k]; redraw(); });
      body.querySelectorAll('[data-ax]').forEach(b => b.onclick = () => { C_.add.splice(+b.dataset.ax, 1); redraw(); });
      body.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => { C_.ev.splice(+b.dataset.ex, 1); redraw(); });
      document.getElementById('ed-pk-add').onclick = () => {
        const u = used(), c = days.map((d, i) => [i, d.total]).filter(([i]) => !u.has(i)).sort((a, b) => b[1] - a[1])[0];
        const dt = days[c ? c[0] : 0].date; C_.add.push({ date: dt, text: peakSugg(dt)[0] || `${dl(dt)}\n${nfr(days[c ? c[0] : 0].total)} publications` }); redraw();
      };
      document.getElementById('ed-pk-neg').onclick = () => {
        const c = days.map((d, i) => [i, d.net]).filter(x => x[1] != null).sort((a, b) => a[1] - b[1])[0]; if (!c) return;
        const d = days[c[0]]; C_.add.push({ date: d.date, text: `${d.net < 0 ? 'Tonalité la plus négative' : 'Sentiment le plus bas du mois'}\n${d.net >= 0 ? '+' : '−'}${Math.abs(d.net * 100).toFixed(1).replace('.', ',')} % de sentiment net` }); redraw();
      };
      document.getElementById('ed-pk-png').onclick = () => curveImage('png');
      document.getElementById('ed-pk-svg').onclick = () => curveImage('svg');
      document.getElementById('ed-pk-ev').onclick = () => { C_.ev.push({ d1: days[0].date, d2: '', text: 'Événement' }); redraw(); };
      document.getElementById('ed-pk-auto').onclick = () => { let n = 0; P_.forEach(p => { const s = peakSugg(p.date)[0]; if (s) { M_[p.date] = s; n++; } }); redraw(); status(`${n} suggestion(s) appliquée(s) sur ${P_.length} pic(s)`, n ? 'ok' : 'warn'); };
      document.getElementById('ed-pk-json').onclick = () => {
        const o = {}; P_.forEach(p => { o[p.date] = txt(p); });
        const j = JSON.stringify({ peaks: o }, null, 1);
        (navigator.clipboard ? navigator.clipboard.writeText(j) : Promise.reject()).then(() => status('Copié : à fusionner dans content/<mois>.json pour le magazine et les autres versions', 'ok'), () => status('Copie refusée par le navigateur', 'warn'));
      };
      document.getElementById('ed-pk-ok').onclick = () => {
        snapshot(); const o = {}; P_.forEach(p => { const t = M_[p.date]; if (t != null && t !== p.base && String(t).trim()) o[p.date] = t; });
        E.peaks = o; const sty = {}; Object.entries(C_.sty).forEach(([k, o]) => { if (o && (o.c || String(o.note || '').trim())) sty[k] = o; });
        E.curve = { hide: C_.hide, add: C_.add.filter(a => String(a.text || '').trim()), ev: C_.ev.filter(e => String(e.text || '').trim()), sty, always: C_.always, ctrl: C_.ctrl };
        const n = Object.keys(o).length + E.curve.add.length + E.curve.ev.length + E.curve.hide.length;
        closeModal(); changed(n ? `Courbe : ${Object.keys(o).length} libellé(s), ${E.curve.add.length} point(s), ${E.curve.ev.length} événement(s), ${E.curve.hide.length} pic(s) masqué(s)` : 'Annotations de la courbe réinitialisées');
      };
    };
    bind(); live();
  }

  /* ---------- relecture IA ---------- */
  function proofUnits() {
    const U = []; const seen = new Set(), w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      if (!/[A-Za-zÀ-ÿ]{3,}/.test(n.nodeValue)) continue; let el = n.parentElement; if (!el || el.closest(TR_SKIP)) continue;
      while (el.parentElement && !el.parentElement.matches('section') && getComputedStyle(el).display.startsWith('inline')) el = el.parentElement;
      if ([...el.querySelectorAll('*')].some(c => !getComputedStyle(c).display.startsWith('inline') && c.tagName !== 'BR')) continue;
      const p = pathOf(el); if (!p || seen.has(p)) continue; seen.add(p); U.push({ k: p, h: el.innerHTML, page: (sectionOf(el) || {}).id });
    }
    E.add.forEach(a => { if (a.html && !a.memo && /[A-Za-zÀ-ÿ]{3,}/.test(a.html.replace(/<[^>]+>|\{\{[^}]+\}\}/g, ''))) U.push({ k: 'add:' + a.id, h: a.html, page: a.sec }); });
    return U;
  }
  function wdiff(a, b) {
    const A = a.split(/(\s+)/), B = b.split(/(\s+)/); if (A.length * B.length > 90000) return `<del>${esc(a)}</del> <ins>${esc(b)}</ins>`;
    const L = Array.from({ length: A.length + 1 }, () => new Uint16Array(B.length + 1));
    for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    let i = 0, j = 0, o = ''; while (i < A.length && j < B.length) { if (A[i] === B[j]) { o += esc(A[i]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) o += `<del>${esc(A[i++])}</del>`; else o += `<ins>${esc(B[j++])}</ins>`; }
    while (i < A.length) o += `<del>${esc(A[i++])}</del>`; while (j < B.length) o += `<ins>${esc(B[j++])}</ins>`; return o;
  }
  const strip = h => { const t = document.createElement('template'); t.innerHTML = String(h).replace(/<br\s*\/?>/gi, ' '); return t.content.textContent.replace(/\s+/g, ' ').trim(); };
  function proofBox() {
    if (!sampleFn) return status('La relecture IA est disponible dans l’artefact claude.ai', 'warn');
    const U = proofUnits();
    openModal(`<h3>Relecture IA</h3><p class="ed-note">${U.length} blocs de texte. L’IA corrige l’orthographe, la grammaire, les accords et la typographie française sans changer le style. Vous validez chaque correction.</p>
      <div class="ed-prog" id="ed-pfp"><i></i></div><p class="ed-note" id="ed-pfn">Relecture en cours…</p><div class="ed-proof" id="ed-pfl"></div>
      <div class="ed-row"><button data-m="close">Fermer</button><button class="pri" id="ed-pfok" disabled>Appliquer les corrections cochées</button></div>`, true);
    const g = id => document.getElementById(id), fixes = [];
    const chunks = []; for (let i = 0; i < U.length; i += 25) chunks.push(U.slice(i, i + 25));
    let done = 0;
    const one = async ch => {
      try {
        const r = await sampleFn.json(`Tu es correcteur professionnel pour un rapport e-réputation du groupe ${CLIENT} (français soigné).
Pour chaque fragment HTML ci-dessous, corrige UNIQUEMENT les fautes : orthographe, grammaire, accords, ponctuation, typographie française (espace fine insécable avant ; : ! ? %, guillemets « », apostrophe ’). Ne reformule pas, ne change ni le sens, ni les chiffres, ni les noms propres, ni les {{variables}}, garde toutes les balises HTML.
Réponds uniquement avec un tableau JSON des fragments à corriger : [{"i": <index>, "fixed": "<fragment corrigé>", "why": "<raison en 5 mots>"}]. Tableau vide [] si tout est correct.

${JSON.stringify(ch.map((u, i) => ({ i, h: u.h })))}`, { modelTier: 'default' });
        (Array.isArray(r) ? r : []).forEach(x => { const u = ch[+x.i]; if (u && typeof x.fixed === 'string' && x.fixed.trim() && strip(x.fixed) !== strip(u.h)) fixes.push(Object.assign({}, u, { fixed: x.fixed, why: String(x.why || '') })); });
      } catch (e) { if (e && e.code === 'not_granted') throw e; }
      done++; if (g('ed-pfp')) { g('ed-pfp').firstChild.style.width = done / chunks.length * 100 + '%'; g('ed-pfn').textContent = `${done} / ${chunks.length} lots relus · ${fixes.length} correction(s) proposée(s)`; }
    };
    (async () => {
      try { for (let i = 0; i < chunks.length; i += 3) await Promise.all(chunks.slice(i, i + 3).map(one)); } catch (e) { if (g('ed-pfn')) g('ed-pfn').textContent = 'Assistant IA refusé pour cette page.'; return; }
      if (!g('ed-pfl')) return;
      g('ed-pfl').innerHTML = fixes.map((f, i) => `<label><input type="checkbox" data-fx="${i}" checked><span><small>${esc(pageNameFr(f.page))}${f.why ? ' · ' + esc(f.why) : ''}</small>${wdiff(strip(f.h), strip(f.fixed))}</span></label>`).join('') || '<p class="ed-note">Aucune faute trouvée.</p>';
      g('ed-pfok').disabled = !fixes.length; if (!fixes.length) { E.done.proof = new Date().toISOString(); dirty = true; store.set(KEY, JSON.stringify(E)); }
      g('ed-pfok').onclick = () => {
        snapshot(); let c = 0;
        document.querySelectorAll('[data-fx]:checked').forEach(cb => { const f = fixes[+cb.dataset.fx]; if (f.k.startsWith('add:')) { const a = E.add.find(x => 'add:' + x.id === f.k); if (a) { a.html = f.fixed; c++; } } else { const el = byPath(f.k); if (el) { remember(el, f.k); (E.el[f.k] = E.el[f.k] || { u: unitOf(el) }).html = f.fixed; c++; } } });
        E.done.proof = new Date().toISOString(); closeModal(); changed(`${c} correction(s) appliquée(s)`);
      };
    })();
  }
  function typoAll() {
    snapshot(); let c = 0;
    E.add.forEach(a => { if (a.html) { const h = frTypo(a.html); if (h !== a.html) { a.html = h; c++; } } });
    Object.values(E.el).forEach(pt => { if (pt.html != null) { const h = frTypo(pt.html); if (h !== pt.html) { pt.html = h; c++; } } });
    if (!c) { undo.pop(); return status('Typographie déjà correcte dans les textes ajoutés et modifiés', 'ok'); }
    changed(`Typographie française appliquée à ${c} texte(s)`);
  }

  /* ---------- mode kiosque ---------- */
  let kioskT = null;
  function kioskBox() {
    openModal(`<h3>Mode kiosque</h3><p class="ed-note">Le rapport défile seul, écran par écran, puis recommence. Idéal sur un écran d’accueil. Un clic ou une touche arrête le défilement.</p>
      <label class="ed-f">Secondes par écran <input type="number" id="ed-kis" min="3" value="8"></label>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-kgo">Lancer</button></div>`);
    document.getElementById('ed-kgo').onclick = () => { const sec_ = Math.max(3, +document.getElementById('ed-kis').value || 8); closeModal(); setPreview(true); scrollTo(0, 0); document.body.classList.add('ed-kiosk'); pbar.querySelector('span').textContent = 'Mode kiosque'; document.documentElement.requestFullscreen?.().catch(() => { });
      kioskT = setInterval(() => { const max = document.documentElement.scrollHeight - innerHeight; if (scrollY >= max - 4) scrollTo({ top: 0, behavior: 'auto' }); else scrollTo({ top: Math.min(max, scrollY + innerHeight), behavior: 'smooth' }); }, sec_ * 1000);
      setTimeout(() => { addEventListener('keydown', kioskStop, { once: true, capture: true }); addEventListener('pointerdown', kioskStop, { once: true, capture: true }); }, 400); };
  }
  function kioskStop() { if (!kioskT) return; clearInterval(kioskT); kioskT = null; document.body.classList.remove('ed-kiosk'); pbar.querySelector('span').textContent = 'Aperçu lecteur'; if (document.fullscreenElement) document.exitFullscreen?.(); status('Mode kiosque arrêté', 'ok'); }

  /* ---------- exports texte ---------- */
  function textsBox() {
    openModal(`<h3>Exporter les textes</h3><p class="ed-note">Fichiers texte à coller dans un e-mail, Word ou Notion.</p>
      <div class="ed-btns"><button class="pri" id="ed-tx-md">Tout le texte du rapport (.md)</button><button id="ed-tx-sum">L’essentiel (titres + insights, .md)</button><button id="ed-tx-notes">Notes de présentation (.md)</button></div>
      <div class="ed-row"><button data-m="close">Fermer</button></div>`);
    const md = full => visOrder().map(id => {
      const sec = document.getElementById(id), lines = [], seen = new Set(), w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { const el = n.parentElement; if (!n.nodeValue.trim() || el.closest('svg, script, style, .ed-memo, [data-ed-ui], .ed-hid, .ed-toc')) continue; let b = el; while (b.parentElement && b.parentElement !== sec && getComputedStyle(b).display.startsWith('inline')) b = b.parentElement; if (seen.has(b)) continue; seen.add(b); const t = (b.innerText || '').replace(/\s+/g, ' ').trim(); if (!t || (!full && !/^H[1-3]$/.test(b.tagName) && t.length < 60)) continue; lines.push(/^H[1-3]$/.test(b.tagName) ? `### ${t}` : t); }
      return `## ${pageName(id)}\n\n${[...new Set(lines)].join('\n\n')}`;
    }).join('\n\n---\n\n');
    const head = `# Rapport e-réputation ${CLIENT} · ${TOKMAP.mois}\n\n`;
    document.getElementById('ed-tx-md').onclick = () => { download(fname('md').replace('.md', '_textes.md'), head + md(true), 'text/markdown'); };
    document.getElementById('ed-tx-sum').onclick = () => { download(fname('md').replace('.md', '_essentiel.md'), head + md(false), 'text/markdown'); };
    document.getElementById('ed-tx-notes').onclick = () => { download(fname('md').replace('.md', '_notes.md'), head + orderNow().map(id => `## ${pageNameFr(id)}\n\n${E.notes[id] || '_(pas de note)_'}`).join('\n\n'), 'text/markdown'); };
  }

  /* ---------- lecteur : parcours, écoute ---------- */
  function readerUI() {
    const ps = document.getElementById('ed-path-s'), li = document.getElementById('ed-listen');
    const showP = E.paths.length > 0, showL = !!(E.set && E.set.listen) && 'speechSynthesis' in window, showM = !!(E.set && E.set.moodsw), showH = !!(E.set && E.set.help);
    readerB.hidden = on || presenting || !(showP || showL || showM || showH);
    document.getElementById('ed-helpb').hidden = !showH;
    ps.hidden = !showP; li.hidden = !showL; const ms_ = document.getElementById('ed-moodsw'); ms_.hidden = !showM; ms_.textContent = document.documentElement.dataset.mood === 'ivoire' ? '☾ Nuit' : '☀ Jour';
    if (showP) ps.innerHTML = `<option value="">Version complète</option>${E.paths.map(x => `<option value="${esc(x.id)}" ${pathSel === x.id ? 'selected' : ''}>${esc(trOf('path:' + x.id) || x.name)}</option>`).join('')}`;
    readerB.classList.toggle('with-lang', hasTr());
  }
  /* mode d'emploi : seulement les interactions réellement disponibles dans ce rapport */
  function helpItems() {
    const S_ = E.set || {}, C = E.curve || {}, it = [];
    const has = id => { const n = document.getElementById(id); return n && getComputedStyle(n).display !== 'none'; };
    it.push(['Défiler', 'La molette ou les flèches font avancer le récit ; les graphiques s’animent à leur arrivée.']);
    if (!S_.norail) it.push(['Sommaire', 'Les points à droite mènent directement à chaque section (leur nom apparaît au survol).']);
    if (S_.search !== false) it.push(['Rechercher', 'Ctrl / Cmd + K pour aller à une page ou trouver un mot.']);
    it.push(['Survoler', 'Courbes, bandes de tonalité, concurrents et sujets de la matrice affichent le détail des chiffres au survol.']);
    if (has('chiffres')) it.push(['Le mois en chiffres', 'Chaque tuile mène à la section qui la détaille.']);
    if (has('conversation') && C.ctrl) it.push(['La conversation', 'Sous la courbe, affichez le mois précédent, l’année précédente ou le sentiment quotidien.']);
    if (has('conversation') && ((C.add || []).length || (C.ev || []).length || Object.keys(C.sty || {}).length)) it.push(['Annotations', 'Les points et événements de la courbe portent une note au survol.']);
    if (has('perception') && S_.phist) it.push(['La perception', 'Passez de 3 périodes à la tonalité des 6 ou 12 derniers mois.']);
    if (has('concurrents')) it.push(['Les concurrents', S_.concx ? 'Six vues : volume, il y a un an, score, sentiment, part de voix, évolution du score.' : 'Trois vues : volume, il y a un an, score e-réputation.']);
    if (has('sujets')) it.push(['Les sujets du mois', 'Les traits en haut à gauche mènent à chaque sujet' + (S_.tshare ? ' ; sous la courbe, basculez vers la part de la conversation.' : '.')]);
    if (has('matrice') && S_.mxf) it.push(['La matrice', 'Isolez un pilier ou cherchez un sujet dans la colonne de gauche.']);
    if (has('valeur') && S_.ehist) it.push(['La valeur médiatique', 'Les barres donnent l’EMV de chacun des 12 derniers mois.']);
    if (has('barometre') && S_.bcmp) it.push(['Le baromètre', 'Superposez un concurrent à l’historique du score, en valeurs ou en base 100.']);
    if (has('retenir') && S_.rfil) it.push(['À retenir', 'Filtrez leviers, signaux et pistes ; un clic sur un sujet le montre dans la matrice.']);
    if (S_.img) it.push(['Images', 'Le bouton « ⤓ Image » au survol d’un graphique l’enregistre en PNG.']);
    if (S_.csv) it.push(['Données', 'Le bouton « ⤓ Données » au survol d’un tableau ou graphique ajouté fournit un CSV.']);
    if (S_.cite) it.push(['Citer', 'Sélectionnez un passage pour copier la citation avec sa source.']);
    if (S_.moodsw) it.push(['Jour / nuit', 'Le bouton ☀ / ☾ en bas à gauche passe le rapport en version claire.']);
    if (E.paths.length) it.push(['Parcours', 'Le menu en bas à gauche propose une version courte du rapport.']);
    if (S_.listen) it.push(['Écouter', 'Lecture à voix haute de la page affichée.']);
    if (S_.ask) it.push(['Une question ?', 'Interrogez l’IA sur les chiffres du rapport (bouton en bas à droite).']);
    return it;
  }
  const helpP = H(`<div id="ed-help" data-ed-ui hidden><div class="ed-help-b" role="dialog" aria-modal="true" aria-labelledby="ed-help-t"><button class="x" aria-label="Fermer">✕</button><div id="ed-help-c"></div></div></div>`);
  document.body.append(helpP);
  function helpOpen() { document.getElementById('ed-help-c').innerHTML = `<h3 id="ed-help-t">Mode d’emploi</h3><p>Ce que vous pouvez faire dans ce rapport :</p><dl>${helpItems().map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>`; helpP.hidden = false; helpP.querySelector('.x').focus(); }
  helpP.addEventListener('click', e => { if (e.target === helpP || e.target.closest('.x')) helpP.hidden = true; });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !helpP.hidden) { helpP.hidden = true; e.stopPropagation(); } }, true);
  document.getElementById('ed-helpb').addEventListener('click', helpOpen);
  document.getElementById('ed-moodsw').addEventListener('click', () => { readerMood = document.documentElement.dataset.mood === 'ivoire' ? 'nuit' : 'ivoire'; try { localStorage.setItem('lvmh-mood', readerMood); } catch (e) { } applyAll(); });
  document.getElementById('ed-path-s').addEventListener('change', e => { pathSel = e.target.value; try { localStorage.setItem('lvmh-path', pathSel); } catch (er) { } applyAll(); scrollTo(0, 0); });
  let speaking = false;
  document.getElementById('ed-listen').addEventListener('click', () => {
    const b = document.getElementById('ed-listen');
    if (speaking) { speechSynthesis.cancel(); speaking = false; b.textContent = '▶ Écouter'; return; }
    const sec = curSection(); if (!sec) return;
    const parts = [], w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const el = n.parentElement; if (!n.nodeValue.trim() || el.closest('svg, script, style, .ed-memo, [data-ed-ui], .ed-hid')) continue; const cs_ = getComputedStyle(el); if (cs_.display === 'none' || cs_.visibility === 'hidden') continue; parts.push(n.nodeValue.trim()); }
    const u = new SpeechSynthesisUtterance(parts.join('. ').replace(/\s+/g, ' ').replace(/\.\s*\./g, '.')); u.lang = curLang() === 'en' ? 'en-GB' : 'fr-FR'; u.rate = 1.02;
    u.onend = u.onerror = () => { speaking = false; b.textContent = '▶ Écouter'; };
    speechSynthesis.cancel(); speechSynthesis.speak(u); speaking = true; b.textContent = '■ Arrêter';
  });
  function pathsBox() {
    const P = JSON.parse(JSON.stringify(E.paths)), o = orderNow();
    const draw = () => `<h3>Parcours de lecture</h3><p class="ed-note">Créez des versions du rapport (ex. « Version courte · 5 min » pour le COMEX). Les lecteurs choisissent leur version en bas de page ; « Version complète » reste disponible.</p>
      <div class="ed-paths">${P.map((x, i) => `<div class="ed-path"><div class="ed-row left"><input data-pn="${i}" value="${esc(x.name)}" style="flex:1"><button data-pa="${i}">Tout cocher</button><button data-pd="${i}" class="dng">Supprimer</button></div>
        <div class="ed-pchk">${o.map((id, j) => `<label><input type="checkbox" data-pc="${i}" value="${id}" ${x.pages.includes(id) ? 'checked' : ''}> ${j + 1}. ${esc(pageNameFr(id))}</label>`).join('')}</div></div>`).join('') || '<p class="ed-note">Aucun parcours pour l’instant.</p>'}</div>
      <div class="ed-row"><button id="ed-p-add">+ Nouveau parcours</button><button data-m="close">Annuler</button><button class="pri" id="ed-p-ok">Appliquer</button></div>`;
    openModal(draw(), true);
    const body = document.getElementById('ed-mbody'), redraw = () => { body.innerHTML = draw(); };
    body.oninput = e => { const d = e.target.dataset; if (d.pn != null) P[+d.pn].name = e.target.value; };
    body.onchange = e => { const d = e.target.dataset; if (d.pc != null) { const x = P[+d.pc]; x.pages = e.target.checked ? [...new Set(x.pages.concat(e.target.value))] : x.pages.filter(y => y !== e.target.value); } };
    body.onclick = e => {
      const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
      if (b.id === 'ed-p-add') { P.push({ id: uid(), name: P.length ? `Parcours ${P.length + 1}` : 'Version courte', pages: o.filter(id => ['ouverture', 'chiffres', 'perception', 'retenir'].includes(id)) }); redraw(); }
      if (d.pa != null) { P[+d.pa].pages = o.slice(); redraw(); }
      if (d.pd != null) { P.splice(+d.pd, 1); redraw(); }
      if (b.id === 'ed-p-ok') { snapshot(); E.paths = P; if (!P.some(x => x.id === pathSel)) pathSel = ''; closeModal(); changed(P.length ? 'Parcours enregistrés : le choix apparaît en bas de page pour les lecteurs' : 'Parcours supprimés'); }
    };
  }

  /* ---------- page « Focus sujet » ---------- */
  function focusBox() {
    const M = (D.matrix || []).slice().sort((a, b) => b.volume - a.volume); if (!M.length) return status('Pas de matrice dans les données du mois', 'warn');
    openModal(`<h3>Page « Focus sujet »</h3><p class="ed-note">Choisissez un sujet de la matrice : la page est construite avec ses chiffres du mois (volume, sentiment, engagements, évolution vs M-1, réseaux, courbe quotidienne s’il a un onglet focus).</p>
      <input id="ed-fq2" placeholder="Filtrer les sujets…" style="width:100%;margin-bottom:8px"><div class="ed-picks ed-topics">${M.map((t, i) => `<button data-ti="${i}"><span>${esc(t.label)}</span><small>${nfr(t.volume)} pub. · ${sgn(t.net * 100, 0)}</small></button>`).join('')}</div>
      <div class="ed-row"><button data-m="close">Annuler</button></div>`, true);
    const body = document.getElementById('ed-mbody');
    document.getElementById('ed-fq2').oninput = e => { const q = e.target.value.toLowerCase(); body.querySelectorAll('[data-ti]').forEach(b => { b.hidden = q && !b.textContent.toLowerCase().includes(q); }); };
    body.onclick = e => { const b = e.target.closest('[data-ti]'); if (!b) return; closeModal(); focusPage(M[+b.dataset.ti]); };
  }
  function focusPage(t) {
    const tot = (D.tot && D.tot.cur && D.tot.cur.total) || M_sum(), share = t.volume / tot * 100, m1 = t.m1 || null;
    function M_sum() { return (D.matrix || []).reduce((a, x) => a + x.volume, 0) || 1; }
    const norm_ = x => String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
    const f = (D.focus || []).find(x => x.kind === 'daily' && (norm_(t.label).includes(norm_(x.sheet)) || norm_(x.sheet).includes(norm_(t.label))));
    const bp = t.by_platform || {}, nets = [['instagram', 'Instagram'], ['x', 'X'], ['facebook', 'Facebook'], ['linkedin', 'LinkedIn'], ['tiktok', 'TikTok']].filter(([k]) => bp[k]);
    const kpi = (l, v, d) => `<div class="ed-kl">${l}</div><div class="ed-kv">${v}</div><div class="ed-kd">${d}</div>`;
    const txt = `${esc(t.label)} totalise <b>${nfr(t.volume)} publications</b> en ${esc(TOKMAP.mois)}, soit ${nfr(share, 1)} % de la conversation, pour un sentiment net de <b>${sgn(t.net * 100, 0)}</b>${m1 ? ` (${m1.volume ? sgn((t.volume / m1.volume - 1) * 100, 0) + ' de volume' : ''}${m1.net != null ? ', ' + sgn((t.net - m1.net) * 100, 0, ' pts') + ' de sentiment' : ''} vs le mois précédent)` : ''}. ${nets.length ? `La conversation se joue d’abord sur ${nets.sort((a, b) => bp[b[0]] - bp[a[0]])[0][1]}.` : ''}`;
    addPage('blank', put => {
      put('kicker', 6, 9, { html: 'FOCUS SUJET' }); put('title', 6, 14, { html: esc(t.label), w: 130 });
      put('kpi', 6, 30, { w: 30, html: kpi('Publications', nfr(t.volume), m1 && m1.volume ? sgn((t.volume / m1.volume - 1) * 100, 0) + ' vs M-1' : nfr(share, 1) + ' % du volume') });
      put('kpi', 40, 30, { w: 30, html: kpi('Sentiment net', sgn(t.net * 100, 0), m1 && m1.net != null ? sgn((t.net - m1.net) * 100, 0, ' pts') + ' vs M-1' : `${nfr(t.pos)} positifs · ${nfr(t.neg)} négatifs`) });
      put('kpi', 74, 30, { w: 30, html: kpi('Engagements', t.engagements >= 1e6 ? nfr(t.engagements / 1e6, 1) + ' M' : nfr(t.engagements), t.reach ? nfr(t.reach / 1e6, 1) + ' M de reach' : '') });
      put('paragraph', 6, 54, { w: 62, html: txt });
      if (f) put('chart', 76, 58, { w: 74, h: 30, chart: { type: 'area', title: 'Publications par jour', labels: f.series.map(p => dl(p.date)), series: [{ name: t.label, values: f.series.map(p => p.value) }] } });
      else if (nets.length) put('chart', 76, 58, { w: 74, h: 30, chart: { type: 'donut', title: 'Répartition par réseau', labels: nets.map(n_ => n_[1]), center: nfr(t.volume), series: [{ name: 'Publications', values: nets.map(n_ => bp[n_[0]]) }] } });
      put('chart', 108, 26, { w: 42, h: 22, chart: { type: 'stacked', labels: ['Tonalité'], legend: true, series: [['Positif', '#6fcf97', 'pos'], ['Neutre', '#3f4b75', 'neu'], ['Négatif', '#ff7a72', 'neg']].map(([n_, c_, k]) => ({ name: n_, color: c_, values: [t[k] || 0] })) } });
    }, 'Focus · ' + t.label);
    status(`Page « Focus · ${t.label} » créée depuis les données du mois`, 'ok');
  }

  /* ---------- réglages du rapport ---------- */
  function applySettings() {
    const S = E.set || {};
    progB.hidden = !S.progress || on;
    wmL.hidden = !S.wm || on;
    if (S.wm) { const t = esc(S.wm), svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260"><text x="210" y="130" text-anchor="middle" transform="rotate(-24 210 130)" font-family="Jost, sans-serif" font-size="22" letter-spacing="6" fill="rgba(244,241,234,${S.wmo || .06})">${t}</text></svg>`; wmL.style.backgroundImage = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; }
    document.body.classList.toggle('ed-norail', !!S.norail && !on);
    document.body.classList.toggle('ed-nobrand', !!S.nobrand && !on);
    document.body.classList.toggle('ed-nocopy', !!S.nocopy && !on);
    if (window.__v5mx) window.__v5mx.setFilters(!!S.mxf && !on);
    if (window.__v5perc) window.__v5perc.setOpts({ hist: !!S.phist });
    if (window.__v5topics) window.__v5topics.setOpts({ share: !!S.tshare });
    if (window.__v5val) window.__v5val.setOpts({ hist: !!S.ehist });
    if (window.__v5ret) window.__v5ret.setOpts({ filter: !!S.rfil });
    if (window.__v5conc) window.__v5conc.setOpts({ extra: !!S.concx, hidden: S.hideBr || [] });
    if (window.__v5baro) window.__v5baro.setOpts({ cmp: !!S.bcmp && !on, hidden: S.hideBr || [] });
    imgButtons();
    progUpd();
  }
  function progUpd() { if (progB.hidden) return; const h = document.documentElement.scrollHeight - innerHeight; progB.firstChild.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; }
  addEventListener('scroll', progUpd, { passive: true });
  addEventListener('contextmenu', e => { if (!on && E.set && E.set.nocopy && app.contains(e.target)) e.preventDefault(); });
  addEventListener('copy', e => { if (!on && E.set && E.set.nocopy) e.preventDefault(); });
  function settingsBox() {
    const S = Object.assign({}, E.set);
    openModal(`<h3>Réglages du rapport</h3><p class="ed-note">S’appliquent aux lecteurs (aperçu pour les voir).</p>
      <div class="ed-row left ed-prof"><span>Profils :</span><button data-prof="all" title="Active toutes les interactions de lecture">Tout interactif</button><button data-prof="sober" title="Aucune interaction ni animation superflue : pour une projection ou une capture">Sobre</button><button data-prof="def" title="Réglages d’origine">Par défaut</button></div>
      <label class="ed-f ck"><input type="checkbox" id="es-progress" ${S.progress ? 'checked' : ''}> <span><b>Barre de lecture</b> : fine barre dorée en haut, qui avance avec le défilement</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-search" ${S.search !== false ? 'checked' : ''}> <span><b>Recherche pour les lecteurs</b> : Ctrl / Cmd + K pour aller à une page ou trouver un mot</span></label>
      <label class="ed-f">Filigrane (vide = aucun) <input id="es-wm" value="${esc(S.wm || '')}" placeholder="CONFIDENTIEL · ${CLIENT}"></label>
      <label class="ed-f">Intensité du filigrane <input type="range" id="es-wmo" min=".03" max=".2" step=".01" value="${S.wmo || .06}"></label>
      <label class="ed-f ck"><input type="checkbox" id="es-nocopy" ${S.nocopy ? 'checked' : ''}> <span><b>Limiter la copie</b> : sélection de texte, copier et clic droit désactivés (dissuasif, pas une vraie protection)</span></label>
      <h6 class="ed-mh">Mouvement et transitions</h6>
      <label class="ed-f ck"><input type="checkbox" id="es-intro" ${S.intro ? 'checked' : ''}> <span><b>Écran d’introduction</b> animé à l’ouverture (une fois par visite)</span></label><input id="es-introT" value="${esc(S.introT || '')}" placeholder="Texte de l’introduction : Rapport e-réputation" style="width:100%;margin:-4px 0 8px">
      <label class="ed-f ck"><input type="checkbox" id="es-smooth" ${S.smooth ? 'checked' : ''}> <span><b>Défilement fluide</b> à la molette (inertie douce)</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-snap" ${S.snap ? 'checked' : ''}> <span><b>Défilement aimanté</b> : la page se cale au début de chaque section</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-cursor" ${S.cursor ? 'checked' : ''}> <span><b>Curseur doré</b> qui suit la souris et grossit sur les éléments cliquables</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-moodsw" ${S.moodsw ? 'checked' : ''}> <span><b>Bouton jour / nuit</b> : chaque lecteur peut passer le rapport en version claire (Ivoire)</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-cite" ${S.cite ? 'checked' : ''}> <span><b>Citer un passage</b> : en sélectionnant du texte, le lecteur copie la citation avec sa source</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-navbtn" ${S.navbtn ? 'checked' : ''}> <span><b>Flèches de navigation</b> flottantes (page précédente / suivante)</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-crumb" ${S.crumb ? 'checked' : ''}> <span><b>Indicateur de page</b> (« 3 / 14 · Le mois en chiffres ») en haut à droite</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-noanim" ${S.noanim ? 'checked' : ''}> <span><b>Couper toutes les animations</b> (version sobre, impression écran)</span></label>
      <h6 class="ed-mh">Données et diffusion</h6>
      <label class="ed-f ck"><input type="checkbox" id="es-img" ${S.img ? 'checked' : ''}> <span><b>Images téléchargeables</b> : bouton « ⤓ Image » (PNG) au survol des graphiques</span></label>
      <label class="ed-f ck"${window.__v5mx ? '' : ' style="display:none"'}><input type="checkbox" id="es-mxf" ${S.mxf ? 'checked' : ''}> <span><b>Filtres sur la matrice</b> : le lecteur isole un pilier ou cherche un sujet</span></label>
      <h6 class="ed-mh"${window.__v5conv || window.__v5perc || window.__v5val || window.__v5ret || window.__v5topics ? '' : ' style="display:none"'}>Sections</h6>
      <label class="ed-f ck"${window.__v5perc ? '' : ' style="display:none"'}><input type="checkbox" id="es-phist" ${S.phist ? 'checked' : ''}> <span><b>Tonalité sur plusieurs mois</b> (« La perception ») : le lecteur passe de 3 périodes à 6 ou 12 mois</span></label>
      <label class="ed-f ck"${window.__v5val ? '' : ' style="display:none"'}><input type="checkbox" id="es-ehist" ${S.ehist ? 'checked' : ''}> <span><b>EMV mois par mois</b> (« La valeur médiatique ») : barres des 12 derniers mois, détail au survol</span></label>
      <label class="ed-f ck"${window.__v5conv ? '' : ' style="display:none"'}><input type="checkbox" id="es-cctl" ${(E.curve || {}).ctrl ? 'checked' : ''}> <span><b>Commandes sous la courbe</b> (« La conversation ») : mois précédent, année précédente, sentiment quotidien</span></label>
      <label class="ed-f ck"${window.__v5topics ? '' : ' style="display:none"'}><input type="checkbox" id="es-tshare" ${S.tshare ? 'checked' : ''}> <span><b>Sujets : part de la conversation</b> : sous chaque courbe de sujet, bascule entre publications et part des publications du jour</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-help" ${S.help ? 'checked' : ''}> <span><b>Mode d’emploi</b> : bouton « ? » qui liste au lecteur les interactions disponibles dans ce rapport</span></label>
      <label class="ed-f ck"${window.__v5ret ? '' : ' style="display:none"'}><input type="checkbox" id="es-rfil" ${S.rfil ? 'checked' : ''}> <span><b>Filtre « À retenir »</b> : leviers, signaux ou pistes, avec leur nombre</span></label>
      <h6 class="ed-mh"${window.__v5conc || window.__v5baro ? '' : ' style="display:none"'}>Concurrents</h6>
      <label class="ed-f ck"${window.__v5conc ? '' : ' style="display:none"'}><input type="checkbox" id="es-concx" ${S.concx ? 'checked' : ''}> <span><b>Modes supplémentaires</b> sur « Les concurrents » : score de sentiment, part de voix, évolution du score</span></label>
      <label class="ed-f ck"${window.__v5baro ? '' : ' style="display:none"'}><input type="checkbox" id="es-bcmp" ${S.bcmp ? 'checked' : ''}> <span><b>Comparer le baromètre</b> : sous l’historique du score, le lecteur superpose un concurrent (valeurs ou base 100)</span></label>
      <div class="ed-f"${Object.keys(D.conc || {}).length > 1 ? '' : ' style="display:none"'}><span>Concurrents affichés</span><div class="ed-chips">${Object.keys(D.conc || {}).filter(k => k !== CLIENT).map(k => `<label><input type="checkbox" data-br="${esc(k)}" ${(S.hideBr || []).includes(k) ? '' : 'checked'}> ${esc(k)}</label>`).join('')}</div></div>
      <label class="ed-f ck"><input type="checkbox" id="es-csv" ${S.csv ? 'checked' : ''}> <span><b>Données téléchargeables</b> : bouton « ⤓ Données » (CSV) au survol des graphiques et tableaux ajoutés</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-lockok" ${S.lockok ? 'checked' : ''}> <span><b>Verrouiller les pages validées</b> : plus de modification possible tant qu’une page est « Validée »</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-auto" ${autoOn() ? 'checked' : ''} ${mode === 'artifact' ? '' : 'disabled'}> <span><b>Enregistrement automatique</b> 2 minutes après la dernière modification (pour vous seulement, dans ce navigateur${mode === 'artifact' ? '' : ' ; artefact claude.ai uniquement'})</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-ask" ${S.ask ? 'checked' : ''}> <span><b>« Une question sur le rapport ? »</b> : les lecteurs interrogent l’IA sur les chiffres (artefact claude.ai, leur consentement est demandé)</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-vcolor" ${S.vcolor ? 'checked' : ''}> <span><b>Variations en couleur</b> : dans les textes ajoutés, {{…_vs_m1}} / {{…_vs_y1}} en vert ou rouge</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-typo" ${S.typo ? 'checked' : ''}> <span><b>Typographie française automatique</b> à chaque saisie (espaces fines, « », ’, …)</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-listen" ${S.listen ? 'checked' : ''}> <span><b>Bouton « Écouter »</b> : lecture à voix haute de la page affichée (voix du navigateur)</span></label>
      <label class="ed-f ck"><input type="checkbox" id="es-norail" ${S.norail ? 'checked' : ''}> Masquer le sommaire à points (droite)</label>
      <label class="ed-f ck"><input type="checkbox" id="es-nobrand" ${S.nobrand ? 'checked' : ''}> Masquer la marque Licter × ${CLIENT} (haut gauche)</label>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="es-ok">Appliquer</button></div>`);
    const PROF = { all: ['cctl', 'progress', 'search', 'img', 'mxf', 'concx', 'bcmp', 'phist', 'ehist', 'rfil', 'tshare', 'help', 'navbtn', 'crumb', 'cite', 'moodsw', 'csv'], sober: ['noanim', 'search'], def: ['search'] };
    const PROFOFF = ['cctl', 'progress', 'img', 'mxf', 'concx', 'bcmp', 'phist', 'ehist', 'rfil', 'tshare', 'help', 'navbtn', 'crumb', 'cite', 'moodsw', 'csv', 'noanim', 'smooth', 'snap', 'cursor', 'intro', 'listen'];
    document.querySelectorAll('[data-prof]').forEach(b => b.onclick = () => {
      const on_ = PROF[b.dataset.prof]; PROFOFF.concat(['search']).forEach(k => { const x = document.getElementById('es-' + k); if (x) x.checked = on_.includes(k); });
      status(`Profil « ${b.textContent} » prérempli : vérifiez puis « Appliquer »`, 'ok');
    });
    document.getElementById('es-ok').onclick = () => {
      const g = id => document.getElementById(id); snapshot();
      try { localStorage.setItem('lvmh-autosave', g('es-auto').checked ? '1' : ''); } catch (e) { }
      E.curve = Object.assign({}, E.curve, { ctrl: g('es-cctl').checked || undefined });
      const hb = [...document.querySelectorAll('[data-br]')].filter(x => !x.checked).map(x => x.dataset.br);
      E.set = { tshare: g('es-tshare').checked || undefined, help: g('es-help').checked || undefined, phist: g('es-phist').checked || undefined, ehist: g('es-ehist').checked || undefined, rfil: g('es-rfil').checked || undefined, concx: g('es-concx').checked || undefined, bcmp: g('es-bcmp').checked || undefined, hideBr: hb.length ? hb : undefined, img: g('es-img').checked || undefined, mxf: g('es-mxf').checked || undefined, progress: g('es-progress').checked || undefined, search: g('es-search').checked ? undefined : false, wm: g('es-wm').value.trim() || undefined, wmo: +g('es-wmo').value, nocopy: g('es-nocopy').checked || undefined, norail: g('es-norail').checked || undefined, nobrand: g('es-nobrand').checked || undefined, listen: g('es-listen').checked || undefined, vcolor: g('es-vcolor').checked || undefined, typo: g('es-typo').checked || undefined, ask: g('es-ask').checked || undefined, gloss: E.set.gloss, csv: g('es-csv').checked || undefined, lockok: g('es-lockok').checked || undefined, intro: g('es-intro').checked || undefined, introT: g('es-introT').value.trim() || undefined, smooth: g('es-smooth').checked || undefined, snap: g('es-snap').checked || undefined, cursor: g('es-cursor').checked || undefined, noanim: g('es-noanim').checked || undefined, navbtn: g('es-navbtn').checked || undefined, crumb: g('es-crumb').checked || undefined, moodsw: g('es-moodsw').checked || undefined, cite: g('es-cite').checked || undefined };
      closeModal(); changed('Réglages appliqués : visibles en aperçu et pour les lecteurs');
    };
  }

  /* ---------- palette de commandes (Ctrl / Cmd + K) ---------- */
  let cmdItems = [], cmdIx = 0;
  function cmdk() {
    const tm = document.getElementById('ed-toolsmenu'); if (tm) tm.hidden = true;
    cmdBox.hidden = false; const q = document.getElementById('ed-cmdq'); q.value = ''; q.placeholder = on ? 'Action, bloc à ajouter, page, mot du rapport…' : 'Aller à une page ou chercher un mot…'; cmdList(''); setTimeout(() => q.focus(), 20);
  }
  const cmdClose = () => { cmdBox.hidden = true; };
  function cmdList(q) {
    const nq = q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), m = l => l.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(nq);
    const goto = id => () => document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    let it = visOrder().map((id, i) => ({ g: 'Pages', l: `${i + 1}. ${pageName(id)}`, f: goto(id) }));
    if (on) {
      const acts = [['Enregistrer', 'save'], ['Aperçu lecteur', 'preview'], ['Présenter', 'present'], ['Contrôle qualité', 'qc'], ['Version anglaise', 'translate'], ['Mes blocs', 'lib'], ['Importer un autre mois', 'import'], ['Réglages du rapport', 'settings'], ['Parcours de lecture', 'paths'], ['Préparer le rapport du mois', 'month'], ['E-mail d’envoi', 'mail'], ['Exporter en PowerPoint / PDF', 'deck'], ['Alertes et seuils', 'alertsbox'], ['Annotations de la courbe (pics, événements)', 'peaks'], ['Image de la courbe (PNG)', 'curveimg'], ['Images des graphiques (PNG, SVG)', 'images'], ['Exporter l’historique (CSV)', 'histcsv'], ['Remplacer une couleur partout', 'recolor'], ['Alléger le rapport', 'slim'], ['Informations du document', 'docinfo'], ['Glossaire', 'gloss'], ['Vue d’ensemble', 'overview'], ['Variables personnalisées', 'vars'], ['Règles et repères', 'rulers'], ['Grille de colonnes', 'cols'], ['Aperçu mobile / tablette', 'device'], ['Relecture IA', 'proof'], ['Typographie française', 'typo'], ['Mode kiosque', 'kiosk'], ['Exporter les textes', 'texts'], ['Page Focus sujet', 'focuspage'], ['Suivi des modifications', 'track'], ['Charte (styles et ambiance)', 'charte'], ['Couleurs du document', 'theme'], ['Historique', 'history'], ['Rechercher et remplacer', 'find'], ['Grille magnétique', 'grid'], ['Pages et calques', 'left'], ['Annuler', 'undo'], ['Rétablir', 'redo'], ['Raccourcis', 'help']];
      it = acts.map(([l, a]) => ({ g: 'Actions', l, f: () => act(a) }))
        .concat(BLOCKS.flatMap(([gr, items]) => items.map(([k, l]) => ({ g: 'Ajouter', l: `${l} (${gr})`, f: () => addFromMenu(k) }))))
        .concat(TEMPLATES.map(([k, l]) => ({ g: 'Nouvelle page', l, f: () => addPage(k) })))
        .concat(it);
    }
    let res = q ? it.filter(x => m(x.l)) : it.filter(x => x.g !== 'Ajouter' || x.l.includes('(Texte)'));
    if (q.length >= 3) {
      const hits = [], w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode()) && hits.length < 12) { const v = n.nodeValue; if (!v.trim() || n.parentElement.closest('svg, script, style, .ed-sec-hidden, .ed-memo')) continue; const vv = v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), i = vv.indexOf(nq); if (i < 0) continue; const sec = sectionOf(n.parentElement); if (!sec) continue; const el = n.parentElement; hits.push({ g: 'Dans le rapport', l: (i > 30 ? '…' : '') + v.slice(Math.max(0, i - 30), i + nq.length + 50).trim(), sub: pageName(sec.id), f: () => { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('ed-flash'); setTimeout(() => el.classList.remove('ed-flash'), 1800); } }); }
      res = res.concat(hits);
    }
    cmdItems = res.slice(0, 60); cmdIx = 0; cmdDraw();
  }
  function cmdDraw() {
    let g = ''; const L = document.getElementById('ed-cmdl');
    L.innerHTML = cmdItems.map((x, i) => { const h = x.g !== g ? `<h6>${esc(x.g)}</h6>` : ''; g = x.g; return `${h}<button data-ci="${i}" class="${i === cmdIx ? 'on' : ''}"><span>${esc(x.l)}</span>${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</button>`; }).join('') || '<p class="ed-note">Aucun résultat.</p>';
    const b = L.querySelector('.on'); if (b) b.scrollIntoView({ block: 'nearest' });
  }
  function cmdRun(i) { const x = cmdItems[i]; if (!x) return; cmdClose(); x.f(); }
  function cmdKey(e) {
    const k = e.key;
    if (k === 'Escape') { e.preventDefault(); cmdClose(); }
    else if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); cmdIx = (cmdIx + (k === 'ArrowDown' ? 1 : -1) + cmdItems.length) % Math.max(1, cmdItems.length); cmdDraw(); }
    else if (k === 'Enter') { e.preventDefault(); cmdRun(cmdIx); }
    else return;
    e.stopImmediatePropagation();
  }
  cmdBox.addEventListener('input', e => { if (e.target.id === 'ed-cmdq') cmdList(e.target.value.trim()); });
  cmdBox.addEventListener('click', e => { const b = e.target.closest('[data-ci]'); if (b) return cmdRun(+b.dataset.ci); if (e.target === cmdBox) cmdClose(); });

  /* ---------- bibliothèques chargées à la demande ---------- */
  const libs = {};
  function loadLib(url, glob) {
    if (window[glob]) return Promise.resolve(window[glob]);
    return libs[url] = libs[url] || new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = url; sc.onload = () => window[glob] ? res(window[glob]) : rej(new Error('bibliothèque introuvable')); sc.onerror = () => { delete libs[url]; rej(new Error('chargement impossible')); }; document.head.appendChild(sc); });
  }

  /* ---------- export du rapport complet : PowerPoint / PDF ---------- */
  function deckBox() {
    openModal(`<h3>Exporter le rapport complet</h3><p class="ed-note">Chaque page visible devient une diapositive (image haute définition, telle que le lecteur la voit au premier écran). Les notes de présentation sont reprises dans le PowerPoint.</p>
      <div class="ed-opts"><label>Qualité <select id="ed-dk-q"><option value="1.5">Standard</option><option value="2" selected>Haute</option></select></label><label class="ck"><input type="checkbox" id="ed-dk-h" checked> Ignorer les pages masquées</label></div>
      <div class="ed-prog" id="ed-dk-p" hidden><i></i></div><p class="ed-note" id="ed-dk-n"></p>
      <div class="ed-row"><button data-m="close">Fermer</button><button id="ed-dk-pdf">PDF</button><button class="pri" id="ed-dk-ppt">PowerPoint (.pptx)</button></div>`);
    const g = id => document.getElementById(id);
    g('ed-dk-pdf').onclick = () => exportDeck('pdf'); g('ed-dk-ppt').onclick = () => exportDeck('pptx');
  }
  async function exportDeck(kind) {
    const g = id => document.getElementById(id), q = +g('ed-dk-q').value || 2, skipH = g('ed-dk-h').checked;
    ['ed-dk-pdf', 'ed-dk-ppt'].forEach(i => g(i).disabled = true); g('ed-dk-p').hidden = false;
    const note = t => { const n = g('ed-dk-n'); if (n) n.textContent = t; };
    try {
      note('Chargement des outils d’export…');
      const lib = await (h2i = h2i || loadLib('https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js', 'htmlToImage').catch(e => { h2i = null; throw e; }));
      const out = kind === 'pptx' ? await loadLib('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js', 'PptxGenJS') : (await loadLib('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', 'jspdf')).jsPDF;
      let ids = (skipH ? visOrder() : orderNow()); const W = innerWidth, Hh = innerHeight, y0 = scrollY;
      const mbox = modal.querySelector('.ed-mbox'); mbox.style.visibility = 'hidden';
      const wasOn = on; if (on) { if (editing) stopText(); select(null); on = false; document.body.classList.remove('admin', 'ed-on'); [bar, insp, left].forEach(x => x.hidden = true); applyAll(); }
      document.body.classList.add('ed-shot'); const shots = []; ids = ids.filter(id => { const s_ = document.getElementById(id); return s_ && s_.offsetHeight > 0 && getComputedStyle(s_).display !== 'none'; });
      for (let i = 0; i < ids.length; i++) {
        const sec = document.getElementById(ids[i]); scrollTo({ top: sec.getBoundingClientRect().top + scrollY, behavior: 'auto' });
        await new Promise(r => setTimeout(r, 900));
        const bgc = getComputedStyle(document.body).backgroundColor;
        shots.push(await lib.toJpeg(sec, { quality: .92, pixelRatio: q, width: W, height: Math.min(sec.offsetHeight, Hh), backgroundColor: bgc, filter: n => !(n.dataset && n.dataset.edUi !== undefined) }));
        g('ed-dk-p').firstChild.style.width = (i + 1) / ids.length * 100 + '%'; note(`Page ${i + 1} / ${ids.length} : ${pageNameFr(ids[i])}`);
      }
      document.body.classList.remove('ed-shot'); mbox.style.visibility = '';
      if (wasOn) enter(); scrollTo({ top: y0, behavior: 'auto' });
      note('Assemblage du fichier…'); let blob;
      if (kind === 'pptx') {
        const P = new out(); P.defineLayout({ name: CLIENT, width: 10, height: +(10 * Hh / W).toFixed(3) }); P.layout = CLIENT; P.title = `Rapport e-réputation ${CLIENT} · ${TOKMAP.mois}`; P.company = 'Licter';
        shots.forEach((d, i) => { const sl = P.addSlide(); sl.background = { color: '050A1F' }; sl.addImage({ data: d.replace(/^data:/, ''), x: 0, y: 0, w: 10, h: +(10 * Hh / W).toFixed(3) }); const nt = E.notes[ids[i]]; if (nt) sl.addNotes(nt); });
        blob = await P.write({ outputType: 'blob' });
      } else {
        const pdf = new out({ orientation: 'landscape', unit: 'px', format: [W, Hh], compress: true });
        shots.forEach((d, i) => { if (i) pdf.addPage([W, Hh], 'landscape'); pdf.addImage(d, 'JPEG', 0, 0, W, Hh); });
        blob = pdf.output('blob');
      }
      await download(fname(kind), blob, kind === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/pdf');
      note(`${kind === 'pptx' ? 'PowerPoint' : 'PDF'} prêt : ${ids.length} pages.`); status('Export terminé', 'ok');
    } catch (e) { document.body.classList.remove('ed-shot'); const mb = modal.querySelector('.ed-mbox'); if (mb) mb.style.visibility = ''; if (!on && !preview) enter(); note('Export impossible : ' + ((e && e.message) || 'erreur') + ' (connexion Internet nécessaire pour charger les outils)'); }
    ['ed-dk-pdf', 'ed-dk-ppt'].forEach(i => { if (g(i)) g(i).disabled = false; });
  }

  /* ---------- export PNG de la page (html-to-image chargé à la demande) ---------- */
  let h2i = null;
  async function exportPNG() {
    const sec = curSection(); if (!sec) return;
    status('Capture de la page…');
    h2i = h2i || loadLib('https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js', 'htmlToImage').catch(e => { h2i = null; throw e; });
    try {
      const lib = await h2i, wasSel = sels.slice(); select(null);
      document.body.classList.add('ed-shot');
      sec.scrollIntoView(); await new Promise(r => setTimeout(r, 400));
      const H_ = Math.min(sec.offsetHeight, innerHeight), bgc = getComputedStyle(document.body).backgroundColor;
      const blob = await lib.toBlob(sec, { pixelRatio: 2, height: H_, width: sec.offsetWidth, backgroundColor: bgc, cacheBust: false, filter: n => !(n.dataset && n.dataset.edUi !== undefined) });
      document.body.classList.remove('ed-shot'); sels = wasSel; paint();
      const name = fname('png').replace('.png', `_${pageNameFr(sec.id).replace(/[^\wÀ-ÿ-]+/g, '-')}.png`);
      if (downloads) { try { await downloads.save({ filename: name, data: blob }); status('Image proposée au téléchargement', 'ok'); } catch (e) { if (!e || e.code !== 'cancelled') status('Téléchargement refusé', 'err'); } }
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); status('Image téléchargée', 'ok'); }
    } catch (e) { document.body.classList.remove('ed-shot'); status('Capture impossible' + (e && e.message ? ' : ' + e.message : ' (connexion à jsdelivr ?)'), 'err'); }
  }

  /* ---------- IA : graphique en une phrase, synthèse exécutive ---------- */
  function aiChart() {
    if (!sampleFn) return status('L’assistant IA est disponible dans l’artefact claude.ai', 'warn');
    openModal(`<h3>Graphique décrit en une phrase</h3><label class="ed-f">Que voulez-vous montrer ? <textarea id="ed-acq" rows="3" placeholder="Ex. : comparer le score e-réputation de ${CLIENT} à ses concurrents ce mois-ci"></textarea></label>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-acgo">Créer le graphique</button></div>`);
    document.getElementById('ed-acgo').onclick = async () => {
      const q = document.getElementById('ed-acq').value.trim(); if (!q) return;
      const pr = presets(), b = document.getElementById('ed-acgo'); b.disabled = true; b.textContent = 'Réflexion…';
      try {
        const r = await sampleFn.json(`Un analyste veut ce graphique dans un rapport e-réputation ${CLIENT} : « ${q} ».
Jeux de données disponibles (index : nom) :
${pr.map((p, i) => `${i} : ${p[0]}`).join('\n')}
Types possibles : bar, hbar, line, area, combo, donut, pie, stacked, stackbar.
Réponds uniquement avec un objet JSON {"index": <numéro du jeu le plus pertinent>, "type": "<type le plus lisible>", "title": "<titre-insight court en français, 8 mots max>"}.`, { modelTier: 'quick' });
        const p = pr[+r.index]; if (!p) throw { code: 'no_match' };
        closeModal(); insertBlock('chart', { chart: Object.assign(JSON.parse(JSON.stringify(p[1])), { type: ['bar', 'hbar', 'line', 'area', 'combo', 'donut', 'pie', 'stacked', 'stackbar'].includes(r.type) ? r.type : p[1].type, title: String(r.title || ''), src: p[0] }), w: 80, h: 44 });
        status(`Graphique lié aux données du mois : « ${p[0]} »`, 'ok');
      } catch (e) { b.disabled = false; b.textContent = 'Créer le graphique'; status(e && e.code === 'not_granted' ? 'Assistant IA refusé' : 'L’IA n’a pas trouvé de jeu de données adapté : reformulez', 'err'); }
    };
  }
  async function aiSummary() {
    if (!sampleFn) return status('L’assistant IA est disponible dans l’artefact claude.ai', 'warn');
    status('Rédaction de la synthèse…');
    try {
      const r = await sampleFn.json(`${SYS}
Rédige la synthèse exécutive du rapport e-réputation ${CLIENT} de ${TOKMAP.mois}, pour un comité de direction.
Données du mois :
${dataContext()}
Réponds uniquement avec un objet JSON : {"title": "<titre-insight, 10 mots max>", "points": ["<5 constats chiffrés, 20 mots max chacun>"], "conclusion": "<recommandation ou point de vigilance, 30 mots max>"}. N’invente aucun chiffre.`, { modelTier: 'default' });
      if (!r || !Array.isArray(r.points)) throw {};
      addPage('blank', put => {
        put('kicker', 6, 10, { html: 'SYNTHÈSE EXÉCUTIVE · ' + esc(String(TOKMAP.mois || '').toUpperCase()) });
        put('title', 6, 15, { html: esc(r.title || 'L’essentiel du mois'), w: 130, style: { fontSize: '5rem' } });
        put('list', 6, 34, { w: 84, html: '<ul>' + r.points.slice(0, 6).map(x => `<li>${esc(x)}</li>`).join('') + '</ul>', style: { fontSize: '2rem', lineHeight: '1.7', color: '#f4f1ea' } });
        if (r.conclusion) put('callout', 98, 36, { w: 52, html: '<b>À retenir</b><br>' + esc(r.conclusion) });
      }, 'Synthèse exécutive');
      status('Page « Synthèse exécutive » créée : relisez-la', 'ok');
    } catch (e) { status(e && e.code === 'not_granted' ? 'Assistant IA refusé' : 'La synthèse n’a pas pu être rédigée', 'err'); }
  }

  function historyBox() {
    const list = points();
    openModal(`<h3>Historique</h3><p class="ed-note">Points de restauration gardés dans ce navigateur (un est créé à chaque enregistrement). ${mode === 'artifact' ? 'Toutes les versions enregistrées restent aussi disponibles dans l’historique de l’artefact sur claude.ai.' : ''}</p>
      <div class="ed-hist">${list.map((p, i) => `<div><span><b>${esc(p.label)}</b><small>${new Date(p.at).toLocaleString('fr-FR')}</small></span><button data-hc="${i}">Comparer</button><button data-hi="${i}">Restaurer</button></div>`).join('') || '<p class="ed-note">Aucun point pour l’instant.</p>'}</div>
      <div class="ed-row"><input id="ed-hl" placeholder="Nom du point (facultatif)" style="flex:1"><button id="ed-hadd">Créer un point maintenant</button><button class="pri" data-m="close">Fermer</button></div>`);
    document.getElementById('ed-hadd').onclick = () => { const ok = addPoint(document.getElementById('ed-hl').value); closeModal(); status(ok ? 'Point de restauration créé' : 'Stockage du navigateur plein : point non créé', ok ? 'ok' : 'err'); };
    document.querySelectorAll('[data-hc]').forEach(b => b.onclick = () => diffBox(list[+b.dataset.hc]));
    document.querySelectorAll('[data-hi]').forEach(b => b.onclick = () => { const p = list[+b.dataset.hi]; snapshot(); E = norm(JSON.parse(p.e)); closeModal(); changed('Point restauré : pensez à enregistrer'); });
  }
  function findBox() {
    openModal(`<h3>Rechercher et remplacer</h3><p class="ed-note">Dans tout le rapport : textes générés et éléments ajoutés.</p>
      <label class="ed-f">Rechercher <input id="ed-fq"></label><label class="ed-f">Remplacer par <input id="ed-fr"></label>
      <label class="ed-f ck"><input type="checkbox" id="ed-fc"> Respecter la casse</label><div class="ed-note" id="ed-fn"></div>
      <div class="ed-row"><button id="ed-fnext">Suivant</button><button data-m="close">Fermer</button><button class="pri" id="ed-fall">Tout remplacer</button></div>`);
    const q = document.getElementById('ed-fq'), rr = document.getElementById('ed-fr'), cs = document.getElementById('ed-fc'), info = document.getElementById('ed-fn');
    const rx = () => q.value ? new RegExp(q.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), cs.checked ? 'g' : 'gi') : null;
    const nodes = () => { const out = [], w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !n.parentElement.closest('svg, script, style, .ed-add') && n.nodeValue.trim() ? 1 : 2 }); let n; while ((n = w.nextNode())) out.push(n); return out; };
    const count = () => { const r = rx(); if (!r) { info.textContent = ''; return []; } const hits = nodes().filter(n => { r.lastIndex = 0; return r.test(n.nodeValue); }); const addHits = E.add.filter(a => { r.lastIndex = 0; return r.test(JSON.stringify([a.html, a.table, a.post, a.w_, a.chart && a.chart.title])); }); info.textContent = `${hits.length + addHits.length} occurrence(s) trouvée(s)`; return hits; };
    q.oninput = count; cs.onchange = count; q.focus();
    let ix = 0;
    document.getElementById('ed-fnext').onclick = () => { const hits = count(); if (!hits.length) return; const n = hits[ix++ % hits.length]; const el = selectable(n.parentElement); closeModal(); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => select(el), 400); } };
    document.getElementById('ed-fall').onclick = () => {
      const r = rx(); if (!r) return; snapshot(); let c = 0;
      const touched = new Set(), hits = nodes().filter(n => { r.lastIndex = 0; return r.test(n.nodeValue); });
      hits.forEach(n => { const el = n.parentElement.closest('[data-ed-html]') || n.parentElement, p = pathOf(el); if (p) { remember(el, p); touched.add(el); } });
      hits.forEach(n => { r.lastIndex = 0; n.nodeValue = n.nodeValue.replace(r, () => { c++; return rr.value; }); });
      touched.forEach(el => { const p = pathOf(el); (E.el[p] = E.el[p] || { u: unitOf(el) }).html = el.innerHTML; });
      const rep = s => typeof s === 'string' ? s.replace(r, () => { c++; return rr.value; }) : s;
      E.add.forEach(a => { a.html = rep(a.html); if (a.table && a.table.rows) a.table.rows = a.table.rows.map(row => row.map(rep)); if (a.post) for (const k in a.post) a.post[k] = rep(a.post[k]); if (a.w_) a.w_.label = rep(a.w_.label); if (a.chart) { a.chart.title = rep(a.chart.title); a.chart.labels = (a.chart.labels || []).map(rep); } });
      closeModal(); changed(`${c} remplacement(s)`);
    };
  }
  function openData(el) {
    const a = addOf(el), isChart = a.kind === 'chart', isTl = a.kind === 'timeline' || a.kind === 'accordion' || a.kind === 'tabs', isAcc = a.kind === 'accordion', isTabs = a.kind === 'tabs';
    let M = isChart ? JSON.parse(JSON.stringify(a.chart || {})) : JSON.parse(JSON.stringify(a.table || { rows: [['', '']] }));
    if (isChart) { M.labels = M.labels || []; M.series = M.series || []; if (!M.series.length) M.series = [{ name: 'Série 1', values: [] }]; }
    const grid = () => isChart
      ? `<table class="ed-grid"><tr><th>Libellé</th>${M.series.map((s, j) => `<th><input data-sn="${j}" value="${esc(s.name || '')}"><input type="color" data-sc="${j}" value="${s.color || PAL[j % PAL.length]}"><button data-dc="${j}" title="Retirer la série">×</button></th>`).join('')}</tr>
         ${M.labels.map((l, i) => `<tr><td><input data-l="${i}" value="${esc(l)}"></td>${M.series.map((s, j) => `<td><input data-v="${i},${j}" value="${s.values[i] ?? ''}" inputmode="decimal"></td>`).join('')}<td><button data-dr="${i}" title="Retirer la ligne">×</button></td></tr>`).join('')}</table>`
      : `<table class="ed-grid">${isTl ? `<tr><th>${isTabs ? 'Onglet' : isAcc ? 'Question / titre' : 'Date / étape'}</th><th>${isTabs ? 'Contenu' : isAcc ? 'Réponse / contenu' : 'Description'}</th><th></th></tr>` : ''}${M.rows.map((r, i) => `<tr>${r.map((c, j) => `<td><input data-t="${i},${j}" value="${esc(c)}"></td>`).join('')}<td><button data-dr="${i}">×</button></td></tr>`).join('')}${isTl ? '' : `<tr>${(M.rows[0] || []).map((_, j) => `<td><button data-dc="${j}">× col.</button></td>`).join('')}</tr>`}</table>`;
    const pr = isChart ? presets() : [], tp = !isChart && !isTl ? tablePresets() : [];
    if (M.src) M = isChart ? JSON.parse(JSON.stringify(linkedChart(M))) : JSON.parse(JSON.stringify(linkedTable(M)));
    const unlinkNote = () => { const l = document.getElementById('ed-link'); if (l && M.src) { delete M.src; l.checked = false; l.disabled = true; status('Valeurs modifiées à la main : la liaison aux données du mois est retirée', 'warn'); } };
    openModal(`<h3>${isChart ? 'Données du graphique' : isTabs ? 'Onglets' : isAcc ? 'Questions / réponses' : isTl ? 'Étapes de la frise' : 'Contenu du tableau'}</h3>
      ${isChart ? `<div class="ed-opts">
        <label>Type <select id="ed-ct">${[['bar', 'Barres'], ['stackbar', 'Barres empilées'], ['hbar', 'Barres horizontales'], ['line', 'Courbe'], ['area', 'Aire'], ['combo', 'Barres + courbe'], ['donut', 'Anneau'], ['pie', 'Camembert'], ['stacked', 'Empilé 100 %'], ['race', 'Course de barres (animée)'], ['radar', 'Radar'], ['treemap', 'Mosaïque (treemap)'], ['heatmap', 'Calendrier (heatmap)'], ['waterfall', 'Cascade'], ['scatter', 'Nuage de points']].map(([v, l]) => `<option value="${v}" ${M.type === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>Titre <input id="ed-cti" value="${esc(M.title || '')}"></label><label>Unité <input id="ed-cu" value="${esc(M.unit || '')}" placeholder=" %"></label>
        <label>Décimales <input id="ed-cd" type="number" min="0" max="3" value="${M.dec || 0}"></label><label>Min. axe <input id="ed-cn" value="${M.ymin ?? ''}" placeholder="auto"></label><label>Max. axe <input id="ed-cm" value="${M.ymax ?? ''}" placeholder="auto"></label>
        <label>Taille du texte <select id="ed-cfs">${[[.8, 'Petite'], [1, 'Normale'], [1.25, 'Grande'], [1.5, 'Très grande']].map(([v, l]) => `<option value="${v}" ${(+M.fs || 1) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>Palette <select id="ed-cp">${[['', 'Couleurs des séries'], ['maison', 'Maison'], ['document', 'Document'], ['contraste', 'Contraste'], ['or', 'Camaïeu or'], ['froid', 'Camaïeu bleu'], ['sentiment', 'Sentiment']].map(([v, l]) => `<option value="${v}" ${(M.palette || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label>Tri <select id="ed-cs">${[['', 'Aucun'], ['desc', 'Décroissant'], ['asc', 'Croissant']].map(([v, l]) => `<option value="${v}" ${(M.sort || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="ck"><input type="checkbox" id="ed-cl" ${M.legend !== false ? 'checked' : ''}> Légende</label><label class="ck"><input type="checkbox" id="ed-cv" ${M.values ? 'checked' : ''}> Valeurs</label>
        <label class="ck"><input type="checkbox" id="ed-cg" ${M.grid !== false ? 'checked' : ''}> Quadrillage</label><label class="ck"><input type="checkbox" id="ed-ca" ${M.anim !== false ? 'checked' : ''}> Animé</label><label>Style d’animation <select id="ed-cam"><option value="">Croissance</option><option value="stagger" ${M.animMode === 'stagger' ? 'selected' : ''}>Une barre après l’autre</option><option value="fade" ${M.animMode === 'fade' ? 'selected' : ''}>Fondu</option></select></label></div>
        <div class="ed-opts"><label>Données du rapport <select id="ed-pre"><option value="">Choisir…</option>${pr.map((p, i) => `<option value="${i}" ${M.src === p[0] ? 'selected' : ''}>${esc(p[0])}</option>`).join('')}</select></label>
        <label class="ck" title="Le graphique se recalcule avec l’Excel de chaque nouveau mois"><input type="checkbox" id="ed-link" ${M.src ? 'checked' : ''} ${M.src ? '' : 'disabled'}> Lier aux données du mois</label><label>Centre de l’anneau <input id="ed-cc" value="${esc(M.center || '')}" placeholder="{{sentiment_net}}"></label></div>
        <div class="ed-opts"><label>Ligne de référence <input id="ed-rf" value="${M.ref ?? ''}" placeholder="valeur" inputmode="decimal"></label><label>Libellé <input id="ed-rfl" value="${esc(M.refl || '')}" placeholder="Objectif"></label>
        <label class="ck"><input type="checkbox" id="ed-avg" ${M.avg ? 'checked' : ''}> Ligne de moyenne</label>
        <label>Mettre en avant <input id="ed-hl" value="${esc(M.hl || '')}" placeholder="libellé exact, ex. ${CLIENT}" list="ed-hll"><datalist id="ed-hll">${(M.labels || []).map(l => `<option value="${esc(l)}">`).join('')}</datalist></label>
        <label>Annotation du point <input id="ed-nt" value="${esc(M.note || '')}" placeholder="ex. Réponse au Monde"></label></div>`
        : isTabs ? '<div class="ed-opts"><p class="ed-note">Une ligne par onglet : titre puis contenu (variables acceptées).</p></div>'
        : isAcc ? `<div class="ed-opts"><label class="ck"><input type="checkbox" id="ed-o1" ${M.open1 ? 'checked' : ''}> Premier élément ouvert</label></div>`
        : isTl ? `<div class="ed-opts"><label>Disposition <select id="ed-td"><option value="v" ${M.dir !== 'h' ? 'selected' : ''}>Verticale</option><option value="h" ${M.dir === 'h' ? 'selected' : ''}>Horizontale</option></select></label></div>`
          : `<div class="ed-opts"><label class="ck"><input type="checkbox" id="ed-th" ${M.header !== false ? 'checked' : ''}> Première ligne = en-têtes</label>
            <label class="ck"><input type="checkbox" id="ed-tz" ${M.zebra ? 'checked' : ''}> Lignes alternées</label><label class="ck"><input type="checkbox" id="ed-tv" ${M.vcol ? 'checked' : ''}> Variations en vert / rouge</label>
            <label class="ck"><input type="checkbox" id="ed-tb" ${M.bars ? 'checked' : ''}> Barres dans les cellules</label><label class="ck"><input type="checkbox" id="ed-tso" ${M.sortable ? 'checked' : ''}> Triable par les lecteurs</label><label class="ck"><input type="checkbox" id="ed-tc" ${M.compact ? 'checked' : ''}> Compact</label>
            <label>Données du rapport <select id="ed-tpre"><option value="">Choisir…</option>${tp.map((p, i) => `<option value="${i}" ${M.src === p[0] ? 'selected' : ''}>${esc(p[0])}</option>`).join('')}</select></label>
            <label class="ck"><input type="checkbox" id="ed-link" ${M.src ? 'checked' : ''} ${M.src ? '' : 'disabled'}> Lier aux données du mois</label></div>`}
      <div class="ed-gwrap" id="ed-gw">${grid()}</div>
      <div class="ed-row left"><button id="ed-ar">+ Ligne</button>${isChart ? '<button id="ed-as">+ Série</button>' : isTl ? '' : '<button id="ed-ac">+ Colonne</button>'}</div>
      <details class="ed-paste"><summary>Coller depuis Excel / Google Sheets</summary><textarea id="ed-pa" rows="5" placeholder="Collez ici un tableau (première ligne = en-têtes${isChart ? ', première colonne = libellés' : ''})"></textarea><button id="ed-pi">Importer</button></details>
      <p class="ed-note">Les cellules et titres acceptent les variables, par ex. {{publications}}.</p>
      <div class="ed-row"><button data-m="close">Annuler</button><button class="pri" id="ed-apply">Appliquer</button></div>`, true);
    const gw = document.getElementById('ed-gw'), refresh = () => { gw.innerHTML = grid(); };
    gw.addEventListener('input', e => {
      const t = e.target, d = t.dataset;
      if (d.v || d.t) unlinkNote();
      if (d.l != null) M.labels[+d.l] = t.value;
      else if (d.v) { const [i, j] = d.v.split(',').map(Number); const v = t.value.replace(/\s/g, '').replace(',', '.'); M.series[j].values[i] = v === '' ? null : +v; }
      else if (d.sn != null) M.series[+d.sn].name = t.value;
      else if (d.sc != null) M.series[+d.sc].color = t.value;
      else if (d.t) { const [i, j] = d.t.split(',').map(Number); M.rows[i][j] = t.value; }
    });
    gw.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      unlinkNote();
      if (b.dataset.dr != null) { const i = +b.dataset.dr; if (isChart) { M.labels.splice(i, 1); M.series.forEach(s => s.values.splice(i, 1)); } else M.rows.splice(i, 1); }
      if (b.dataset.dc != null) { const j = +b.dataset.dc; if (isChart) { if (M.series.length > 1) M.series.splice(j, 1); } else M.rows.forEach(r => r.splice(j, 1)); }
      refresh();
    });
    document.getElementById('ed-ar').onclick = () => { if (isChart) { M.labels.push(''); M.series.forEach(s => s.values.push(null)); } else M.rows.push((M.rows[0] || ['', '']).map(() => '')); refresh(); };
    if (isChart) document.getElementById('ed-as').onclick = () => { M.series.push({ name: `Série ${M.series.length + 1}`, color: PAL[M.series.length % PAL.length], values: M.labels.map(() => null) }); refresh(); };
    else if (!isTl) document.getElementById('ed-ac').onclick = () => { M.rows.forEach(r => r.push('')); refresh(); };
    if (tp.length) document.getElementById('ed-tpre').onchange = e => { const p = tp[+e.target.value]; if (!p) return; M = Object.assign(JSON.parse(JSON.stringify(p[1])), { src: p[0] }); const l = document.getElementById('ed-link'); l.disabled = false; l.checked = true; refresh(); };
    const lk = document.getElementById('ed-link'); if (lk) lk.onchange = () => { if (!lk.checked) delete M.src; };
    if (isChart) document.getElementById('ed-pre').onchange = e => { const p = pr[+e.target.value]; if (!p) return; const t = M.title; M = JSON.parse(JSON.stringify(p[1])); M.title = t || ''; M.src = p[0]; const l = document.getElementById('ed-link'); l.disabled = false; l.checked = true; document.getElementById('ed-ct').value = M.type; document.getElementById('ed-cu').value = M.unit || ''; document.getElementById('ed-cd').value = M.dec || 0; document.getElementById('ed-cv').checked = !!M.values; document.getElementById('ed-cc').value = M.center || ''; refresh(); };
    document.getElementById('ed-pi').onclick = () => {
      const txt = document.getElementById('ed-pa').value.trim(); if (!txt) return; unlinkNote();
      const rows = txt.split(/\r?\n/).map(l => l.split(l.includes('\t') ? '\t' : (l.includes(';') ? ';' : ',')));
      if (isChart) {
        const head = rows.shift(); M.labels = rows.map(r => r[0]);
        M.series = head.slice(1).map((h, j) => ({ name: h || `Série ${j + 1}`, color: PAL[j % PAL.length], values: rows.map(r => { const v = String(r[j + 1] ?? '').replace(/\s|%|€/g, '').replace(',', '.'); return v === '' || isNaN(+v) ? null : +v; }) }));
      } else M.rows = isTl ? rows.map(r => [r[0] || '', r.slice(1).join(' ')]) : rows;
      refresh();
    };
    document.getElementById('ed-apply').onclick = () => {
      snapshot();
      const g = id => document.getElementById(id);
      if (lk && !lk.checked) delete M.src;
      if (isChart) { Object.assign(M, { type: g('ed-ct').value, title: g('ed-cti').value, unit: g('ed-cu').value, dec: +g('ed-cd').value || 0, ymin: g('ed-cn').value, ymax: g('ed-cm').value, fs: +g('ed-cfs').value, palette: g('ed-cp').value, sort: g('ed-cs').value, legend: g('ed-cl').checked, values: g('ed-cv').checked, grid: g('ed-cg').checked, anim: g('ed-ca').checked, animMode: g('ed-cam').value || undefined, center: g('ed-cc').value, ref: g('ed-rf').value.replace(',', '.'), refl: g('ed-rfl').value, avg: g('ed-avg').checked, hl: g('ed-hl').value, note: g('ed-hl').value ? g('ed-nt').value : '' }); a.chart = M; }
      else if (isTabs) { M.header = false; a.table = M; }
      else if (isAcc) { M.open1 = g('ed-o1').checked; M.header = false; a.table = M; }
      else if (isTl) { M.dir = g('ed-td').value; M.header = false; a.table = M; }
      else { Object.assign(M, { header: g('ed-th').checked, zebra: g('ed-tz').checked, vcol: g('ed-tv').checked, bars: g('ed-tb').checked, compact: g('ed-tc').checked, sortable: g('ed-tso').checked }); a.table = M; }
      closeModal(); changed();
    };
  }

  /* ---------- styles rapides ---------- */
  const QS = [['glass', 'Verre'], ['ivory', 'Carte ivoire'], ['gold', 'Carte or'], ['line', 'Contour or'], ['neon', 'Halo'], ['soft', 'Ombre douce'], ['pill', 'Pastille'], ['plain', 'Sans style']];
  const QSDEF = {
    glass: { background: 'rgba(11,20,48,.55)', backdropFilter: 'blur(14px)', border: '1px solid rgba(244,241,234,.16)', borderRadius: '1.6rem', padding: '2.4rem', boxShadow: '0 1.6rem 4rem rgba(0,0,0,.3)', color: '' },
    ivory: { background: '#f4f1ea', color: '#050a1f', border: 'none', borderRadius: '1.6rem', padding: '2.4rem', boxShadow: '0 1.6rem 4rem rgba(0,0,0,.25)', backdropFilter: '' },
    gold: { background: 'linear-gradient(135deg, #f0d6a6, #d8b47a)', color: '#050a1f', border: 'none', borderRadius: '1.6rem', padding: '2.4rem', boxShadow: '0 1.6rem 4rem rgba(216,180,122,.25)', backdropFilter: '' },
    line: { background: 'transparent', border: '1px solid #d8b47a', borderRadius: '1.2rem', padding: '2rem', boxShadow: 'none', backdropFilter: '', color: '' },
    neon: { background: 'rgba(216,180,122,.06)', border: '1px solid rgba(216,180,122,.7)', borderRadius: '1.2rem', padding: '2rem', boxShadow: '0 0 2.4rem rgba(216,180,122,.35), inset 0 0 1.6rem rgba(216,180,122,.12)', backdropFilter: '', color: '' },
    soft: { boxShadow: '0 2.4rem 6rem rgba(0,0,0,.45)', borderRadius: '1.6rem' },
    pill: { background: 'rgba(216,180,122,.16)', color: '#f0d6a6', border: '1px solid rgba(216,180,122,.4)', borderRadius: '99rem', padding: '.8rem 2rem', boxShadow: 'none', backdropFilter: '' },
    plain: { background: '', border: '', borderRadius: '', padding: '', boxShadow: '', backdropFilter: '', color: '' },
  };
  function readability(txt) {
    const t = String(txt || '').replace(/\s+/g, ' ').trim(); if (t.split(' ').length < 12) return null;
    const sents = Math.max(1, (t.match(/[.!?…]+(\s|$)/g) || []).length), words = t.split(/\s+/).filter(w => /[A-Za-zÀ-ÿ]/.test(w)), nw = words.length || 1;
    const syl = words.reduce((a, w) => a + Math.max(1, (w.toLowerCase().replace(/e\b/, '').match(/[aeiouyàâäéèêëîïôöùûü]+/g) || []).length), 0);
    const score = Math.round(207 - 1.015 * (nw / sents) - 73.6 * (syl / nw)), wps = nw / sents;
    return { score, wps, lab: score >= 70 ? 'Facile' : score >= 50 ? 'Standard' : score >= 30 ? 'Difficile' : 'Très difficile', cls: score >= 60 ? 'ok' : score >= 40 ? 'mid' : 'bad' };
  }
  function quickStyle(k) { const d = QSDEF[k]; if (!d || !sels.length) return; snapshot(); sels.forEach(el => { const pt = patchOf(el); if (!pt) return; pt.style = Object.assign({}, pt.style, d); if (pt.fx) delete pt.fx.grad; }); changed(); }

  /* ---------- inspecteur ---------- */
  const num = (id, label, val, step = .5, extra = '') => `<label class="ed-f">${label}<input type="number" id="${id}" step="${step}" value="${val === '' || val == null || isNaN(val) ? '' : r2(val)}" ${extra}></label>`;
  const swatches = attr => `<div class="ed-sw">${E.theme.colors.map(c => `<button ${attr}="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>`;
  const hexOf = c => { const m = String(c).match(/\d+(\.\d+)?/g); if (!m || (m[3] !== undefined && +m[3] === 0)) return '#000000'; return '#' + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join(''); };
  function inspect() {
    const B = document.getElementById('ed-ibody'); if (!B) return;
    const s = sel();
    insp.hidden = !on || preview || presenting;
    insp.classList.toggle('col', collapsed);
    if (collapsed) { B.innerHTML = '<button data-i="collapse" class="ed-open" title="Afficher l’inspecteur">Inspecteur ‹</button>'; return; }
    const tog = '<button data-i="collapse" class="ed-x" title="Replier l’inspecteur">›</button>';
    if (!s) {
      const sec = curSection(), bg = sec ? (E.bg[sec.id] || {}) : {};
      B.innerHTML = `<div class="ed-ih">Inspecteur${tog}</div><p class="ed-note">Cliquez un élément pour le modifier. Double-clic : écrire un texte ou éditer des données.</p>
        ${sec ? `<div class="ed-sec"><h6>Page affichée</h6><p class="ed-note"><b>${esc(pageName(sec.id))}</b></p>
        <div class="ed-btns"><button data-i="bgimg">Image de fond</button><button data-i="bgreset">Fond d'origine</button><button data-i="pagehide">${E.hide[sec.id] ? 'Afficher la page' : 'Masquer la page'}</button></div>
        <label class="ed-f">Couleur de fond <input type="color" id="ei-bgc" value="${bg.color || '#050a1f'}"></label>${swatches('data-bgcol')}
        <label class="ed-f">Dégradé <select id="ei-grad"><option value="">Aucun</option>${[['Nuit', 'linear-gradient(160deg,#0b1a44,#050a1f 60%)'], ['Or', 'linear-gradient(160deg,#3a2c14,#050a1f 70%)'], ['Ivoire', 'linear-gradient(160deg,#f4f1ea,#d9d2c3)'], ['Bordeaux', 'linear-gradient(160deg,#3b1020,#050a1f 70%)'], ['Aurore', 'radial-gradient(120% 90% at 0% 0%,#1b2a66 0%,#050a1f 55%)'], ['Halo or', 'radial-gradient(80% 70% at 85% 15%,rgba(216,180,122,.28),#050a1f 60%)']].map(([l, v]) => `<option value="${v}" ${bg.grad === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="ed-f">Fond animé <select id="ei-bga"><option value="">Aucun</option>${[['aurora', 'Aurore (halos lents)'], ['dust', 'Poussière d’or'], ['drift', 'Losanges en mouvement'], ['shine', 'Reflet doré']].map(([v, l]) => `<option value="${v}" ${bg.anim === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="ed-btns"><button data-i="bgall">Appliquer ce fond aux pages ajoutées</button></div>
        <div class="ed-btns"><button data-i="bgvid">${bg.video ? 'Changer la vidéo de fond' : 'Vidéo de fond'}</button>${bg.video ? '<button data-i="bgvidx">Retirer la vidéo</button>' : ''}</div>
        <div class="ed-btns"><button data-i="pattern" class="${bg.pattern ? 'on' : ''}">Motif losanges</button>${bg.image ? `<button data-i="fixedbg" class="${bg.fixed ? 'on' : ''}">Image fixe au défilement</button>` : ''}</div>
        ${bg.image || bg.video ? `<label class="ed-f">Assombrir l’image <input type="range" id="ei-dim" min="0" max="85" value="${Math.round((bg.dim || 0) * 100)}"></label>` : ''}
        <label class="ed-f">Durée prévue en présentation (min) <input type="number" id="ei-dur" min="0" step=".5" value="${E.dur[sec.id] || ''}" placeholder="—"></label>
        ${E.pages.some(p_ => p_.id === sec.id) ? `<label class="ed-f ck"><input type="checkbox" id="ei-pinpage" ${(E.pages.find(p_ => p_.id === sec.id) || {}).pin ? 'checked' : ''}> <span><b>Page épinglée (scrollytelling)</b> : la page reste à l’écran pendant le défilement et ses éléments apparaissent selon un pourcentage</span></label>` : ''}
        <label class="ed-f">Effet à l’arrivée sur la page <select id="ei-burst"><option value="">Aucun</option><option value="stars" ${bg.burst === 'stars' ? 'selected' : ''}>Étoiles dorées</option><option value="confetti" ${bg.burst === 'confetti' ? 'selected' : ''}>Confettis</option></select></label>
        <label class="ed-f">Entrée de la page <select id="ei-pe">${[['', 'Aucune'], ['fade', 'Fondu'], ['up', 'Montée'], ['slide', 'Glissement latéral'], ['zoom', 'Zoom'], ['out', 'Zoom arrière'], ['blur', 'Flou → net'], ['curtain', 'Rideau'], ['wipe', 'Balayage diagonal'], ['iris', 'Ouverture en cercle'], ...(E.pages.some(p_ => p_.id === sec.id) ? [['stack', 'Empilement (recouvre la page précédente)']] : [])].map(([v, l]) => `<option value="${v}" ${(bg.enter || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="ed-btns"><button data-i="png">Exporter cette page en image</button><button data-i="anchor">Copier l’ancre de la page</button></div>
        <h6 style="margin-top:14px">À faire sur cette page</h6><div class="ed-tasks">${(E.tasks[sec.id] || []).map((tk, i) => `<label class="${tk.done ? 'done' : ''}"><input type="checkbox" data-tk="${i}" ${tk.done ? 'checked' : ''}><span>${esc(tk.t)}</span><button data-i="tkdel${i}" title="Supprimer">×</button></label>`).join('')}</div>
        <div class="ed-row left"><input id="ei-tk" placeholder="Nouvelle tâche (ex. vérifier le pic du 17)" style="flex:1"><button data-i="tkadd">Ajouter</button></div>
        <label class="ed-f">Notes de présentation <textarea id="ei-notes" rows="5" placeholder="Visibles uniquement en mode « Présenter »">${esc(E.notes[sec.id] || '')}</textarea></label></div>` : ''}`;
      return;
    }
    const multi = sels.length > 1, a = isAdd(s) && addOf(s), pt = patchOf(s, false) || {}, cs = getComputedStyle(s), up = unitPx(s), u = a ? (a.u || 'rem') : (pt.u || unitOf(s));
    const r = s.getBoundingClientRect(), w = a ? (a.w || r.width / up) : (pt.w || r.width / up), h = a ? (a.h || r.height / up) : (pt.h || r.height / up);
    const fam = (FONTS.find(([l, v]) => cs.fontFamily.includes(l.replace(' (' + CLIENT + ')', ''))) || FONTS[0])[1];
    const isText = !a || ['text', 'html', 'table', 'timeline', 'progress', 'post', 'auto'].includes(a.kind);
    const fx = (a ? a.fx : pt.fx) || {}, f = fx.filter || {};
    const isImg = (a && a.kind === 'image') || s.tagName === 'IMG';
    const pagesOpts = orderNow().map(id => `<option value="#${id}" ${a && a.link === '#' + id ? 'selected' : ''}>${esc(pageName(id))}</option>`).join('');
    B.innerHTML = `<div class="ed-ih">${multi ? sels.length + ' éléments' : esc(kindLabel(s))}${a ? '' : ' <small>du rapport</small>'}${tog}</div>
      ${editing ? `<div class="ed-sec hl"><h6>Texte sélectionné</h6><div class="ed-btns"><button data-x="bold"><b>G</b></button><button data-x="italic"><i>I</i></button><button data-x="underline"><u>S</u></button><button data-x="strikeThrough"><s>B</s></button><button data-x="superscript">x²</button><label class="ed-f in">Couleur <input type="color" id="ex-col" value="#d8b47a"></label><button data-x="hilite">Surligner</button><button data-x="link">Lien</button><button data-x="ul">Puces</button><button data-x="ol">Numéros</button><button data-x="clear">Effacer</button><button data-x="rotw" title="Mots qui tournent">[[ ]]</button>${sampleFn ? '<button data-x="syn">Synonymes</button>' : ''}</div><div id="ed-syn"></div>
        ${a ? `<label class="ed-f">Insérer une donnée du mois <select id="ex-tok"><option value="">Choisir…</option>${TOKENS.map(([k, l, v]) => `<option value="${k}">${esc(l)} — ${esc(v)}</option>`).join('')}</select></label>` : ''}<p class="ed-note">Sélectionnez des mots puis appliquez. Échap pour terminer.</p><p class="ed-note ed-md">Raccourcis : <code>**gras**</code> · <code>_italique doré_</code> · <code>{+vert}</code> · <code>{-rouge}</code> · <code>:diamant:</code> (icône) · <code>((note))</code> · <code>[[a|b]]</code></p></div>` : ''}
      ${!multi ? `<div class="ed-sec"><h6>Position et taille <small>(${u})</small></h6><div class="ed-g2">
        ${a ? num('ei-x', 'X', a.x) + num('ei-y', 'Y', a.y) : num('ei-x', 'Décalage X', pt.tx || 0) + num('ei-y', 'Décalage Y', pt.ty || 0)}
        ${num('ei-w', 'Largeur', w)}${num('ei-h', 'Hauteur', a && a.kind === 'text' && !a.h ? '' : h, .5, 'placeholder="auto"')}
        ${num('ei-r', 'Rotation (°)', (a ? a.rot : pt.rot) || 0, 1)}</div></div>` : ''}
      <div class="ed-sec"><h6>Aligner ${multi ? 'la sélection' : 'dans le bloc parent'}</h6><div class="ed-btns al">${[['l', '⇤ Gauche'], ['c', '↔ Centre'], ['r', 'Droite ⇥'], ['t', '⤒ Haut'], ['m', '↕ Milieu'], ['b', 'Bas ⤓']].map(([k, l]) => `<button data-al="${k}">${l}</button>`).join('')}</div>
        ${multi ? `<div class="ed-btns"><button data-i="disth" ${sels.length < 3 ? 'disabled' : ''}>Répartir ↔</button><button data-i="distv" ${sels.length < 3 ? 'disabled' : ''}>Répartir ↕</button><button data-i="samew">Même largeur</button><button data-i="sameh">Même hauteur</button><button data-i="group">Grouper</button></div>
        <div class="ed-g2"><label class="ed-f">Colonnes <input type="number" id="ei-gridc" min="1" max="8" value="${Math.min(4, Math.ceil(Math.sqrt(sels.length)))}"></label>${num('ei-gridg', 'Espacement', 3, .5)}</div><div class="ed-btns"><button data-i="arrange">Disposer en grille</button></div>` : (a && a.grp ? '<div class="ed-btns"><button data-i="ungroup">Dégrouper</button></div>' : '')}</div>
      ${a && a.kind === 'chart' ? `<div class="ed-sec"><h6>Graphique</h6>${a.chart && a.chart.src ? `<p class="ed-note ed-live">● Lié aux données du mois : « ${esc(a.chart.src)} »</p>` : ''}<div class="ed-btns"><button data-i="data" class="pri">Modifier les données</button><button data-i="csv">Exporter (CSV)</button>${a.chart && a.chart.src ? '<button data-i="unlink">Délier (figer les valeurs)</button>' : ''}</div></div>` : ''}
      ${a && (a.kind === 'table' || a.kind === 'timeline') ? `<div class="ed-sec"><h6>${a.kind === 'table' ? 'Tableau' : 'Frise'}</h6>${a.table && a.table.src ? `<p class="ed-note ed-live">● Lié aux données du mois : « ${esc(a.table.src)} »</p>` : ''}<div class="ed-btns"><button data-i="data" class="pri">Modifier le contenu</button>${a.table && a.table.src ? '<button data-i="unlink">Délier (figer les valeurs)</button>' : ''}</div></div>` : ''}
      ${a && a.kind === 'video' ? `<div class="ed-sec"><h6>Vidéo</h6><div class="ed-btns"><button data-i="vid" class="pri">Choisir une vidéo</button><button data-i="fit">${a.fit === 'contain' ? 'Remplir le cadre' : 'Vidéo entière'}</button></div>
        <label class="ed-f ck"><input type="checkbox" id="ei-vctl" ${a.controls ? 'checked' : ''}> Lecteur avec commandes (sinon lecture auto. muette en boucle)</label>
        <label class="ed-f ck"><input type="checkbox" id="ei-scrub" ${a.scrub ? 'checked' : ''}> Piloter la vidéo par le défilement</label>
        <label class="ed-f">Ou adresse d’une vidéo (.mp4) <input id="ei-vurl" value="${esc(a.src && !/^data:/.test(a.src) ? a.src : '')}" placeholder="https://…/video.mp4"></label></div>` : ''}
      ${a && a.kind === 'icon' ? `<div class="ed-sec"><h6>Icône</h6><div class="ed-icons">${Object.keys(ICONS).map(k => `<button data-icon="${esc(k)}" title="${esc(k)}" class="${a.icon === k ? 'on' : ''}">${iconSVG(k, null)}</button>`).join('')}</div>${num('ei-sw', 'Épaisseur du trait', a.sw || 1.6, .2, 'min="0.6" max="4"')}</div>` : ''}
      ${a && (a.kind === 'progress' || a.kind === 'gauge') ? `<div class="ed-sec"><h6>${a.kind === 'progress' ? 'Progression' : 'Jauge'}</h6><label class="ed-f">Libellé <input id="ew-label" value="${esc(a.w_.label || '')}"></label>
        <div class="ed-g2"><label class="ed-f">Valeur <input id="ew-value" value="${esc(a.w_.value ?? '')}"></label>${num('ew-max', 'Maximum', a.w_.max || 100, 1)}<label class="ed-f">Unité <input id="ew-unit" value="${esc(a.w_.unit || '')}"></label>${num('ew-dec', 'Décimales', a.w_.dec || 0, 1, 'min="0" max="3"')}</div>
        <label class="ed-f">Texte affiché (facultatif) <input id="ew-display" value="${esc(a.w_.display || '')}" placeholder="ex. {{score}}"></label><label class="ed-f">Couleur <input type="color" id="ew-color" value="${a.w_.color || '#d8b47a'}"></label>${swatches('data-wcol')}</div>` : ''}
      ${a && a.kind === 'post' ? `<div class="ed-sec"><h6>Carte post</h6><div class="ed-btns"><button data-i="postimg" class="pri">Image du post</button></div>
        <label class="ed-f">Réseau <select id="ep-network">${['Instagram', 'X', 'LinkedIn', 'TikTok', 'Facebook', 'YouTube', 'Presse'].map(n => `<option ${a.post.network === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <div class="ed-g2"><label class="ed-f">Compte <input id="ep-handle" value="${esc(a.post.handle || '')}"></label><label class="ed-f">Date <input id="ep-date" value="${esc(a.post.date || '')}"></label><label class="ed-f">Engagements <input id="ep-engagements" value="${esc(a.post.engagements || '')}"></label><label class="ed-f">Reach <input id="ep-reach" value="${esc(a.post.reach || '')}"></label></div>
        <label class="ed-f">Texte du post <textarea id="ep-text" rows="3">${esc(a.post.text || '')}</textarea></label></div>` : ''}
      ${isImg ? `<div class="ed-sec"><h6>Image</h6>${a ? `<div class="ed-btns"><button data-i="img" class="pri">Remplacer l’image</button><button data-i="fit">${a.fit === 'contain' ? 'Remplir le cadre' : 'Image entière'}</button></div>
        <label class="ed-f">Zoom dans le cadre <input type="range" id="ei-zoom" min="1" max="3" step=".05" value="${a.zoom || 1}"></label><div class="ed-g2"><label class="ed-f">Cadrage horizontal <input type="range" id="ei-px" min="0" max="100" value="${a.posx ?? 50}"></label><label class="ed-f">Cadrage vertical <input type="range" id="ei-py" min="0" max="100" value="${a.posy ?? 50}"></label></div>
        <label class="ed-f">Texte alternatif <input id="ei-alt" value="${esc(a.alt || '')}"></label>${sampleFn ? '<div class="ed-btns"><button data-i="altia">Rédiger le texte alternatif (IA)</button></div>' : ''}` : ''}
        <label class="ed-f">Duotone <select id="ef-duo"><option value="">Aucun</option>${[['gold', 'Nuit et or'], ['navy', 'Encre et bleu'], ['rose', 'Bordeaux et poudre'], ['ivoire', 'Encre et ivoire']].map(([v, l]) => `<option value="${v}" ${fx.duo === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="ed-btns"><button data-i="vig" class="${fx.vig ? 'on' : ''}">Vignettage</button><button data-i="grain" class="${fx.grain ? 'on' : ''}">Grain argentique</button></div>
        <div class="ed-g2">${num('ef-bright', 'Luminosité %', f.bright || 100, 5)}${num('ef-contrast', 'Contraste %', f.contrast || 100, 5)}${num('ef-sat', 'Saturation %', f.sat || 100, 5)}${num('ef-gray', 'Noir et blanc %', f.gray || 0, 10)}${num('ef-sepia', 'Sépia %', f.sepia || 0, 10)}${num('ef-blur', 'Flou (px)', f.blur || 0, 1)}</div></div>` : ''}
      ${a && ['text', 'html'].includes(a.kind) && !multi && !a.memo ? `<div class="ed-sec"><h6>Transformer en</h6><div class="ed-btns tf">${[['kicker', 'Surtitre'], ['title', 'Titre'], ['subtitle', 'Sous-titre'], ['paragraph', 'Paragraphe'], ['quote', 'Citation'], ['bignum', 'Grand chiffre'], ['tag', 'Badge'], ['callout', 'Encadré insight'], ['button', 'Bouton'], ['bubble', 'Bulle']].map(([k, l]) => `<button data-tf="${k}">${l}</button>`).join('')}</div></div>` : ''}
      ${isText && !multi ? (rd => rd ? `<div class="ed-sec"><h6>Lisibilité</h6><div class="ed-read ${rd.cls}"><b>${rd.lab}</b><span>score ${rd.score} · ${nfr(rd.wps, 0)} mots par phrase</span></div>${rd.wps > 25 ? '<p class="ed-note">Phrases longues : pensez à couper en deux.</p>' : ''}</div>` : '')(readability(s.innerText)) : ''}
      ${isText && sampleFn && !multi ? `<div class="ed-sec ai"><h6>Assistant IA</h6><div class="ed-btns">${AI_MODES.map(([k, l]) => `<button data-ai="${k}">${l}</button>`).join('')}</div></div>` : ''}
      ${isText ? `<div class="ed-sec"><h6>Typographie</h6>
        <label class="ed-f">Style de texte <select id="ei-ts"><option value="">Aucun (libre)</option>${E.styles.map(x => `<option value="${esc(x.id)}" ${(a ? a.ts : pt.ts) === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
        <div class="ed-btns"><button data-i="mkstyle">Créer un style depuis cet élément</button>${(a ? a.ts : pt.ts) ? '<button data-i="updstyle">Mettre à jour le style</button>' : ''}<button data-i="charte">Gérer la charte</button></div>
        <label class="ed-f">Police <select id="ei-font">${FONTS.map(([l, v]) => `<option value="${esc(v)}" ${v === fam ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="ed-g2">${num('ei-fs', 'Taille', parseFloat(cs.fontSize) / up, .1)}<label class="ed-f">Graisse <select id="ei-fw">${[[200, 'Extra-fine'], [300, 'Fine'], [400, 'Normale'], [500, 'Medium'], [600, 'Semi-grasse'], [700, 'Grasse']].map(([v, l]) => `<option value="${v}" ${+cs.fontWeight === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        ${num('ei-lh', 'Interligne', (parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)) || 1.3, .05)}${num('ei-ls', 'Espacement', (parseFloat(cs.letterSpacing) || 0) / parseFloat(cs.fontSize), .01)}${num('ei-cols', 'Colonnes', parseInt(cs.columnCount) || 1, 1, 'min="1" max="4"')}</div>
        <div class="ed-btns"><button data-t="it" class="${cs.fontStyle === 'italic' ? 'on' : ''}"><i>Italique</i></button><button data-t="ul" class="${cs.textDecorationLine.includes('underline') ? 'on' : ''}"><u>Souligné</u></button><button data-t="up" class="${cs.textTransform === 'uppercase' ? 'on' : ''}">MAJUSCULES</button><button data-t="sc" class="${cs.fontVariantCaps === 'small-caps' ? 'on' : ''}">Petites caps</button></div>
        <div class="ed-btns">${[['left', 'Gauche'], ['center', 'Centré'], ['right', 'Droite'], ['justify', 'Justifié']].map(([v, l]) => `<button data-ta="${v}" class="${cs.textAlign === v ? 'on' : ''}">${l}</button>`).join('')}</div>
        <label class="ed-f">Couleur du texte <input type="color" id="ei-col" value="${hexOf(cs.color)}"></label>${swatches('data-col')}
        <div class="ed-g2"><label class="ed-f">Ombre du texte <select id="ef-tshadow"><option value="">Aucune</option><option value="drop" ${fx.tshadow === 'drop' ? 'selected' : ''}>Portée</option><option value="glow" ${fx.tshadow === 'glow' ? 'selected' : ''}>Lueur</option></select></label><label class="ed-f">Couleur lueur <input type="color" id="ef-tsc" value="${fx.tsc || '#d8b47a'}"></label></div>
        <div class="ed-g2">${num('ef-stroke', 'Contour (px)', fx.stroke || 0, .5, 'min="0" max="6"')}<label class="ed-f">Couleur du contour <input type="color" id="ef-strokec" value="${fx.strokec || '#d8b47a'}"></label></div>
        <div class="ed-btns"><button data-i="hollow" class="${fx.hollow ? 'on' : ''}">Texte évidé</button><button data-i="dropcap" class="${fx.dropcap ? 'on' : ''}">Lettrine</button><button data-i="vert" class="${cs.writingMode.startsWith('vertical') ? 'on' : ''}">Texte vertical</button><button data-i="timg" class="${fx.timg ? 'on' : ''}">${fx.timg ? 'Retirer l’image du texte' : 'Texte rempli d’une image'}</button></div>
        <label class="ed-f ck"><input type="checkbox" id="ef-tg" ${fx.tgrad ? 'checked' : ''}> Texte en dégradé</label>${fx.tgrad ? `<div class="ed-g2"><label class="ed-f">Couleur 1 <input type="color" id="ef-tg1" value="${fx.tgrad.c1}"></label><label class="ed-f">Couleur 2 <input type="color" id="ef-tg2" value="${fx.tgrad.c2}"></label></div>` : ''}</div>` : ''}
      <div class="ed-sec"><h6>Styles rapides</h6><div class="ed-qs">${QS.map(([k, l]) => `<button data-i="qs-${k}" class="qs-${k}">${l}</button>`).join('')}</div></div>
      <div class="ed-sec"><h6>Apparence</h6>
        <label class="ed-f">Fond <input type="color" id="ei-bg" value="${hexOf(cs.backgroundColor)}"></label>${swatches('data-fill')}<div class="ed-btns"><button data-i="nobg">Sans fond</button><button data-i="gradbg" class="${fx.grad ? 'on' : ''}">Fond en dégradé</button></div>
        ${fx.grad ? `<div class="ed-g2"><label class="ed-f">Couleur 1 <input type="color" id="ef-g1" value="${fx.grad.c1}"></label><label class="ed-f">Couleur 2 <input type="color" id="ef-g2" value="${fx.grad.c2}"></label>${num('ef-ga', 'Angle (°)', fx.grad.a || 135, 15)}</div>` : ''}
        <div class="ed-g2">${num('ei-op', 'Opacité (%)', Math.round(parseFloat(cs.opacity) * 100), 5, 'min="0" max="100"')}${num('ei-rad', 'Arrondi', parseFloat(cs.borderTopLeftRadius) / up || 0, .2)}
        ${num('ei-pad', 'Marge interne', parseFloat(cs.paddingTop) / up || 0, .2)}${num('ei-bw', 'Bordure (px)', parseFloat(cs.borderTopWidth) || 0, 1)}</div>
        <div class="ed-g2"><label class="ed-f">Couleur de bordure <input type="color" id="ei-bc" value="${hexOf(cs.borderTopColor)}"></label><label class="ed-f">Style <select id="ei-bs">${[['solid', 'Plein'], ['dashed', 'Tirets'], ['dotted', 'Pointillés'], ['double', 'Double']].map(([v, l]) => `<option value="${v}" ${cs.borderTopStyle === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
        <div class="ed-btns"><button data-i="shadow" class="${cs.boxShadow !== 'none' ? 'on' : ''}">Ombre</button><button data-i="blur" class="${cs.backdropFilter && cs.backdropFilter !== 'none' ? 'on' : ''}">Verre dépoli</button><button data-i="flipx" class="${fx.flipX ? 'on' : ''}">Miroir ↔</button><button data-i="flipy" class="${fx.flipY ? 'on' : ''}">Miroir ↕</button></div>
        <label class="ed-f">Forme du cadre <select id="ef-mask"><option value="">Rectangle</option>${[['circle', 'Cercle'], ['pill', 'Pilule'], ['arch', 'Arche'], ['hex', 'Hexagone'], ['diamond', 'Losange'], ['slant', 'Biseauté']].map(([v, l]) => `<option value="${v}" ${fx.mask === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="ed-f">Fusion <select id="ef-blend"><option value="">Normale</option>${[['multiply', 'Produit'], ['screen', 'Superposition claire'], ['overlay', 'Incrustation'], ['soft-light', 'Lumière douce'], ['luminosity', 'Luminosité']].map(([v, l]) => `<option value="${v}" ${fx.blend === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <div class="ed-sec"><h6>Animation & interaction</h6>
        ${a ? `<label class="ed-f">Entrée <select id="ei-anim">${ANIMS.map(([v, l]) => `<option value="${v}" ${(a.anim || 'none') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="ed-g2">${num('ei-dl', 'Délai (s)', a.delay || 0, .1, 'min="0"')}${num('ei-du', 'Durée (s)', a.dur || .9, .1, 'min="0.2"')}</div>
        <div class="ed-g2"><label class="ed-f">Courbe <select id="ei-ease">${Object.entries(EASES).map(([v, l]) => `<option value="${v}" ${(a.ease || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label><label class="ed-f ck"><input type="checkbox" id="ei-rep" ${a.rep ? 'checked' : ''}> Rejouer à chaque passage</label></div>
        <div class="ed-btns"><button data-i="animprev" ${(a.anim || 'none') === 'none' ? 'disabled' : ''}>▶ Prévisualiser</button><button data-i="pageanims">Animations de la page…</button></div>` : ''}
        <div class="ed-g2"><label class="ed-f">Au survol <select id="ef-hover"><option value="">Rien</option>${HOVERS.map(([v, l]) => `<option value="${v}" ${fx.hover === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="ed-f">En boucle <select id="ef-loop"><option value="">Rien</option>${LOOPS.filter(x => x[0] !== 'marquee' || (a && ['text', 'html'].includes(a.kind))).map(([v, l]) => `<option value="${v}" ${fx.loop === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
        ${a ? `<label class="ed-f">Profondeur à la souris (parallaxe) <input type="range" id="ef-mouse" min="-1" max="1" step=".1" value="${fx.mouse || 0}"></label>` : ''}
        ${a && (E.pages.find(p_ => p_.id === a.sec) || {}).pin ? `<div class="ed-g2">${num('ei-at', 'Apparaît à (%)', a.at ?? '', 5, 'min="0" max="100" placeholder="0"')}${num('ei-until', 'Disparaît à (%)', a.until ?? '', 5, 'min="0" max="100" placeholder="jamais"')}</div>` : ''}
        ${a ? `<label class="ed-f">Étape en présentation <input type="number" id="ei-step" min="1" value="${a.step || ''}" placeholder="toujours visible"></label>` : ''}
        ${fx.hover === 'color' ? `<label class="ed-f">Couleur au survol <input type="color" id="ef-hovc" value="${fx.hovc || '#d8b47a'}"></label>` : ''}
        ${a ? `<label class="ed-f">Parallaxe au défilement <input type="range" id="ef-plx" min="-1" max="1" step=".1" value="${fx.plx || 0}"></label>
        <label class="ed-f">Lien <select id="ei-linkp"><option value="">Aucun / adresse web ↓</option>${[['#next', '→ Page suivante'], ['#prev', '← Page précédente'], ['#top', '↑ Première page']].map(([v, l]) => `<option value="${v}" ${a && a.link === v ? 'selected' : ''}>${l}</option>`).join('')}${pagesOpts}</select></label><input id="ei-link" value="${esc(a.link && !a.link.startsWith('#') ? a.link : '')}" placeholder="https://…" aria-label="Adresse du lien">` : ''}</div>
      ${a && !multi ? `<div class="ed-sec"><h6>Animation au défilement</h6><label class="ed-f">Mode <select id="es-mode"><option value="">Aucune</option><option value="in" ${a.scr && a.scr.mode !== 'through' ? 'selected' : ''}>Arrive en place en entrant à l’écran</option><option value="through" ${a.scr && a.scr.mode === 'through' ? 'selected' : ''}>Bouge pendant tout le passage</option><option value="clip" ${a.scr && a.scr.mode === 'clip' ? 'selected' : ''}>Dévoilement progressif</option><option value="draw" ${a.scr && a.scr.mode === 'draw' ? 'selected' : ''}>Tracé du trait (dessin, flèche, courbe)</option><option value="fill" ${a.scr && a.scr.mode === 'fill' ? 'selected' : ''}>Texte qui se remplit mot à mot</option><option value="countup" ${a.scr && a.scr.mode === 'countup' ? 'selected' : ''}>Chiffre qui compte avec le défilement</option></select></label>
        ${a.scr && a.scr.mode === 'clip' ? `<label class="ed-f">Sens <select id="es-dir"><option value="lr" ${a.scr.dir !== 'bt' && a.scr.dir !== 'c' ? 'selected' : ''}>Gauche → droite</option><option value="bt" ${a.scr.dir === 'bt' ? 'selected' : ''}>Bas → haut</option><option value="c" ${a.scr.dir === 'c' ? 'selected' : ''}>Cercle depuis le centre</option></select></label>` : ''}
        ${a.scr && !['clip', 'draw', 'fill', 'countup'].includes(a.scr.mode) ? `<div class="ed-g2">${num('es-x', 'Décalage X', a.scr.x || 0, 2)}${num('es-y', 'Décalage Y', a.scr.y || 0, 2)}${num('es-rot', 'Rotation (°)', a.scr.rot || 0, 5)}${num('es-scale', 'Échelle', a.scr.scale ?? 1, .05)}${a.scr.mode !== 'through' ? num('es-op', 'Opacité départ', a.scr.op ?? 1, .1, 'min="0" max="1"') : ''}</div><p class="ed-note">Valeurs au départ : l’élément les quitte en défilant. Visible en aperçu.</p>` : ''}</div>` : ''}
      ${a && !multi ? `<div class="ed-sec"><h6>Interaction</h6>
        <label class="ed-f">Info-bulle au survol <textarea id="ei-tip" rows="2" placeholder="Texte affiché au survol (lecteurs)">${esc(a.tip || '')}</textarea></label>
        <label class="ed-f">Au clic, afficher / masquer <select id="ei-toggle"><option value="">Rien</option>${E.add.filter(x => x.sec === a.sec && x.id !== a.id).map(x => `<option value="${x.id}" ${a.toggle === x.id ? 'selected' : ''}>${esc(x.name || (x.html || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 30) || kindLabel(addEl(x.id) || document.body))}</option>`).join('')}</select></label>
        <label class="ed-f">Autre action au clic <select id="ei-act">${ACTS.filter(x => x[0] !== 'flipself' || a.kind === 'flip').map(([v, l]) => `<option value="${v}" ${((a.act || {}).t || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        ${a.act && a.act.t === 'replay' ? `<label class="ed-f">Élément à rejouer <select id="ei-acttg"><option value="">Choisir…</option>${E.add.filter(x => x.sec === a.sec).map(x => `<option value="${x.id}" ${a.act.target === x.id ? 'selected' : ''}>${esc(x.id === a.id ? 'Lui-même' : (x.name || (x.html || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 30) || kindLabel(addEl(x.id) || document.body)))}</option>`).join('')}</select></label>` : ''}
        ${a.act && a.act.t === 'goto' ? `<label class="ed-f">Page <select id="ei-acttg"><option value="">Choisir…</option>${orderNow().map(id => `<option value="${id}" ${a.act.target === id ? 'selected' : ''}>${esc(pageNameFr(id))}</option>`).join('')}</select></label>` : ''}
        <label class="ed-f">Au survol, faire apparaître <select id="ei-hshow"><option value="">Rien</option>${E.add.filter(x => x.sec === a.sec && x.id !== a.id).map(x => `<option value="${x.id}" ${a.hshow === x.id ? 'selected' : ''}>${esc(x.name || (x.html || '').replace(/<[^>]+>/g, ' ').trim().slice(0, 30) || kindLabel(addEl(x.id) || document.body))}</option>`).join('')}</select></label>
        <label class="ed-f ck"><input type="checkbox" id="ei-reveal" ${a.reveal ? 'checked' : ''}> Caché jusqu’au clic sur un autre élément</label></div>` : ''}
      ${!a && !multi && (s.tagName === 'IMG' || /url\(/.test(cs.backgroundImage)) ? `<div class="ed-sec"><h6>Image du rapport</h6><div class="ed-btns"><button data-i="genimg" class="pri">Remplacer l’image</button>${pt.src || (pt.style && pt.style.backgroundImage) ? '<button data-i="genimgx">Image d’origine</button>' : ''}</div></div>` : ''}
      ${a && a.kind === 'compare' ? `<div class="ed-sec"><h6>Avant / après</h6><div class="ed-btns"><button data-i="cmp1">Image « avant »</button><button data-i="cmp2">Image « après »</button></div><div class="ed-g2"><label class="ed-f">Libellé gauche <input id="ei-l1" value="${esc(a.l1 || '')}"></label><label class="ed-f">Libellé droite <input id="ei-l2" value="${esc(a.l2 || '')}"></label></div><p class="ed-note">Les lecteurs font glisser le curseur.</p></div>` : ''}
      ${a && a.kind === 'carousel' ? `<div class="ed-sec"><h6>Carrousel</h6><div class="ed-cars">${(a.items || []).map((x, i) => `<div><img src="${esc(x.src)}" alt=""><input data-cap="${i}" value="${esc(x.cap || '')}" placeholder="Légende"><button data-i="cardel${i}" title="Retirer">×</button></div>`).join('')}</div>
        <div class="ed-btns"><button data-i="caradd" class="pri">Ajouter une image</button></div><div class="ed-g2">${num('ei-cint', 'Défilement (s)', a.int || 5, 1, 'min="2"')}<label class="ed-f ck"><input type="checkbox" id="ei-cauto" ${a.auto !== false ? 'checked' : ''}> Automatique</label></div></div>` : ''}
      ${a && a.kind === 'kpi2' ? `<div class="ed-sec"><h6>Chiffre comparé</h6><p class="ed-note ed-live">● Lié aux données du mois</p><label class="ed-f">Indicateur <select id="ei-k2">${Object.entries(KPI2).map(([k, v]) => `<option value="${k}" ${a.metric === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></label><label class="ed-f">Libellé (facultatif) <input id="ei-k2l" value="${esc(a.label || '')}" placeholder="${esc((KPI2[a.metric] || KPI2.publications)[0])}"></label></div>` : ''}
      ${a && a.kind === 'flip' ? `<div class="ed-sec"><h6>Carte retournable</h6><label class="ed-f">Recto <textarea id="ei-ffront" rows="3">${esc((a.html || '').replace(/<br>/g, '\n'))}</textarea></label><label class="ed-f">Verso <textarea id="ei-fback" rows="3">${esc((a.back || '').replace(/<br>/g, '\n'))}</textarea></label>
        <div class="ed-g2"><label class="ed-f">Se retourne <select id="ei-fon"><option value="hover" ${a.flipOn !== 'click' ? 'selected' : ''}>Au survol</option><option value="click" ${a.flipOn === 'click' ? 'selected' : ''}>Au clic</option></select></label><label class="ed-f">Couleur recto <input type="color" id="ei-fc1" value="${a.c1 || '#0b1430'}"></label><label class="ed-f">Couleur verso <input type="color" id="ei-fc2" value="${a.c2 || '#d8b47a'}"></label></div><div class="ed-btns"><button data-i="flipview">Voir l’autre face</button></div></div>` : ''}
      ${a && a.kind === 'tabs' ? `<div class="ed-sec"><h6>Onglets</h6><div class="ed-btns"><button data-i="data" class="pri">Modifier les onglets</button></div></div>` : ''}
      ${a && a.kind === 'hotspot' ? `<div class="ed-sec"><h6>Image à points</h6><div class="ed-btns"><button data-i="hsimg">${a.src ? 'Changer l’image' : 'Choisir l’image'}</button>${a.src ? '<button data-i="hsadd" class="pri">+ Placer un point</button>' : ''}</div>${(a.pts || []).map((p_, i) => `<div class="ed-row left"><b class="ed-hsn">${i + 1}</b><input data-hp="${i}" value="${esc(p_.t || '')}" style="flex:1"><button data-i="hsdel${i}">×</button></div>`).join('')}<p class="ed-note">Le texte de chaque point s’affiche au survol (ou au toucher sur mobile).</p></div>` : ''}
      ${a && a.kind === 'reveal' ? `<div class="ed-sec"><h6>Révélation</h6><label class="ed-f">Question <textarea id="ei-rq" rows="2">${esc((a.html || '').replace(/<br>/g, '\n'))}</textarea></label><label class="ed-f">Réponse (variables acceptées) <textarea id="ei-ra" rows="2">${esc((a.ans || '').replace(/<br>/g, '\n'))}</textarea></label><label class="ed-f">Texte du bouton <input id="ei-rb" value="${esc(a.btn || 'Révéler la réponse')}"></label></div>` : ''}
      ${a && a.kind === 'cmp2' ? `<div class="ed-sec"><h6>Comparer deux mois</h6><p class="ed-note ed-live">● Historique (${HIST.length} périodes ; bimestres en moyenne mensuelle)</p><div class="ed-g2"><label class="ed-f">Période A <select id="ei-ka"><option value="">Auto (même mois l’an dernier)</option>${HIST.map(h => `<option value="${h.key}" ${a.ka === h.key ? 'selected' : ''}>${esc(histFull(h))}</option>`).join('')}</select></label><label class="ed-f">Période B <select id="ei-kb"><option value="">Auto (mois du rapport)</option>${HIST.map(h => `<option value="${h.key}" ${a.kb === h.key ? 'selected' : ''}>${esc(histFull(h))}</option>`).join('')}</select></label></div></div>` : ''}
      ${a && a.kind === 'toptl' ? `<div class="ed-sec"><h6>Sujet n°1 mois par mois</h6>${num('ei-dn', 'Nombre de périodes', a.n || 12, 1, 'min="3" max="20"')}</div>` : ''}
      ${a && a.kind === 'alerts' ? `<div class="ed-sec"><h6>Points d’attention</h6><p class="ed-note">${(E.alerts || []).length} alerte(s) définie(s), ${alertsNow().length} déclenchée(s) ce mois-ci.</p><div class="ed-btns"><button data-i="alertsbox" class="pri">Régler les alertes</button></div><label class="ed-f">Titre <input id="ei-dtit" value="${esc(a.title ?? '')}" placeholder="Points d’attention"></label></div>` : ''}
      ${a && a.kind === 'trend' ? `<div class="ed-sec"><h6>Tendance sur un an</h6><p class="ed-note ed-live">● ${HIST.length} mois d’historique (Excel du dossier DATA)</p><label class="ed-f">Indicateur <select id="ei-hmet">${Object.entries(HMET).map(([k, v]) => `<option value="${k}" ${(a.metric || 'total') === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></label><label class="ed-f">Titre <input id="ei-dtit" value="${esc(a.title || '')}" placeholder="automatique"></label></div>` : ''}
      ${a && ['cloud', 'rank', 'senti', 'versus'].includes(a.kind) ? `<div class="ed-sec"><h6>${esc(kindLabel(s))}</h6><p class="ed-note ed-live">● Calculé depuis les données du mois</p>
        ${a.kind === 'cloud' ? `<div class="ed-g2">${num('ei-dn', 'Nombre de sujets', a.n || 28, 1, 'min="5" max="40"')}<label class="ed-f">Couleurs <select id="ei-dcol"><option value="">Selon le sentiment</option><option value="gold" ${a.color === 'gold' ? 'selected' : ''}>Or</option></select></label></div>` : ''}
        ${a.kind === 'rank' ? `<label class="ed-f">Classer par <select id="ei-dmet">${Object.entries(METRICS).map(([k, v]) => `<option value="${k}" ${(a.metric || 'volume') === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></label><div class="ed-g2">${num('ei-dn', 'Nombre', a.n || 8, 1, 'min="3" max="20"')}${num('ei-dmin', 'Volume minimum', a.min || 0, 10)}</div><label class="ed-f ck"><input type="checkbox" id="ei-dasc" ${a.asc ? 'checked' : ''}> Ordre croissant (les plus bas)</label><label class="ed-f">Titre <input id="ei-dtit" value="${esc(a.title || '')}" placeholder="automatique"></label>` : ''}
        ${a.kind === 'senti' ? `<label class="ed-f">Périmètre <select id="ei-dtop"><option value="">Tout ${CLIENT}</option>${(D.matrix || []).slice().sort((x, y) => y.volume - x.volume).map(t => `<option ${a.topic === t.label ? 'selected' : ''}>${esc(t.label)}</option>`).join('')}</select></label><label class="ed-f">Titre <input id="ei-dtit" value="${esc(a.title || '')}" placeholder="automatique"></label>` : ''}
        ${a.kind === 'versus' ? `<label class="ed-f">Concurrent <select id="ei-dbr">${Object.keys((D.baro && D.baro.brands) || {}).filter(k => k !== CLIENT).map(k => `<option ${a.brand === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></label>` : ''}</div>` : ''}
      ${a && a.kind === 'team' ? `<div class="ed-sec"><h6>Équipe</h6><div class="ed-btns"><button data-i="data" class="pri">Modifier les personnes</button></div><p class="ed-note">Une ligne par personne : nom, rôle, contact.</p></div>` : ''}
      ${a && a.kind === 'countdown' ? `<div class="ed-sec"><h6>Compte à rebours</h6><label class="ed-f">Date et heure <input type="datetime-local" id="ei-cdd" value="${esc(a.date || '')}"></label><label class="ed-f">Libellé <input id="ei-cdl" value="${esc(a.label || '')}"></label></div>` : ''}
      ${a && a.kind === 'ticker' ? `<div class="ed-sec"><h6>Bandeau défilant</h6><label class="ed-f">Éléments (un par ligne, variables acceptées) <textarea id="ei-tki" rows="5">${esc(a.items || '')}</textarea></label>${num('ei-tks', 'Durée d’un tour (s)', a.speed || 30, 1, 'min="5"')}</div>` : ''}
      ${a && a.kind === 'auto' ? `<div class="ed-sec"><h6>Insight automatique</h6><p class="ed-note ed-live">● Phrases recalculées chaque mois à partir de l’Excel, sans IA</p><div class="ed-autos">${Object.entries(AUTO_L).map(([k, l]) => `<label class="ed-f ck"><input type="checkbox" data-auto="${k}" ${(a.rules || []).includes(k) ? 'checked' : ''}> ${l}</label>`).join('')}</div><div class="ed-btns"><button data-i="auto2text">Convertir en texte modifiable</button></div></div>` : ''}
      ${a && a.kind === 'draw' ? `<div class="ed-sec"><h6>Dessin</h6>${num('ei-dsw', 'Épaisseur du trait', a.sw || 3, .5, 'min="0.5"')}<p class="ed-note">Couleur = couleur du texte (Typographie).</p></div>` : ''}
      ${a && a.kind === 'movers' ? `<div class="ed-sec"><h6>Mouvements du mois</h6><p class="ed-note ed-live">● Calculé depuis la matrice du mois (vs M-1)</p>${num('ei-mvmin', 'Volume minimum', a.min || 40, 10)}</div>` : ''}
      ${a && a.kind === 'connector' ? `<div class="ed-sec"><h6>Flèche</h6><label class="ed-f">Pointes <select id="ec-head">${[['end', 'À la fin'], ['start', 'Au début'], ['both', 'Aux deux bouts'], ['none', 'Aucune']].map(([v, l]) => `<option value="${v}" ${(a.cn || {}).head === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="ed-f">Courbure <input type="range" id="ec-curve" min="-1" max="1" step=".1" value="${(a.cn || {}).curve || 0}"></label><div class="ed-g2">${num('ec-sw', 'Épaisseur', (a.cn || {}).sw || 2.5, .5)}<label class="ed-f ck"><input type="checkbox" id="ec-dash" ${(a.cn || {}).dash ? 'checked' : ''}> Pointillés</label></div><p class="ed-note">Couleur = couleur du texte. Pivotez avec la poignée ronde.</p></div>` : ''}
      ${a && a.kind === 'accordion' ? `<div class="ed-sec"><h6>Questions / réponses</h6><div class="ed-btns"><button data-i="data" class="pri">Modifier le contenu</button></div></div>` : ''}
      ${a && a.kind === 'qr' ? `<div class="ed-sec"><h6>QR code</h6><label class="ed-f">Adresse <input id="ei-qr" value="${esc(a.url || '')}"></label><p class="ed-note">Couleur du QR = couleur du texte (Typographie), fond = Apparence.</p></div>` : ''}
      <div class="ed-sec"><h6>Affichage</h6>
        ${a && !multi ? `<label class="ed-f ck"><input type="checkbox" id="ei-pin" ${a.pin ? 'checked' : ''}> Épinglé à l’écran : visible sur toutes les pages (logo, pied de page, n° de page avec {{page}} / {{pages}})</label>
        ${a.pin ? `<label class="ed-f ck"><input type="checkbox" id="ei-pinskip" ${a.pinSkip ? 'checked' : ''}> Masquer sur la couverture</label>` : ''}` : ''}
        <label class="ed-f">Visible sur <select id="ei-dev">${[['', 'Tous les écrans'], ['d', 'Ordinateur uniquement'], ['m', 'Mobile uniquement'], ['p', 'Présentation uniquement'], ['r', 'Lecture uniquement (pas en présentation)']].map(([v, l]) => `<option value="${v}" ${((a ? a.dev : pt.dev) || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        ${a && !a.pin ? `<label class="ed-f">Ordre sur téléphone <input type="number" id="ei-mo" value="${a.mo ?? ''}" placeholder="auto (de haut en bas)"></label>` : ''}
        ${a ? `<label class="ed-f">Langue <select id="ei-lang">${[['', 'FR et EN'], ['fr', 'Français uniquement'], ['en', 'Anglais uniquement']].map(([v, l]) => `<option value="${v}" ${(a.lang || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>` : ''}
        ${/\d/.test(s.textContent || '') ? `<label class="ed-f ck"><input type="checkbox" id="ei-count" ${(a ? a.count : pt.count) ? 'checked' : ''}> Compteur animé (le chiffre défile à l’apparition)</label>` : ''}</div>
      <div class="ed-sec"><h6>Calque</h6><div class="ed-btns">${commentsNs && !multi ? '<button data-i="comment">Commenter</button>' : ''}<button data-i="front" title="]">Avancer</button><button data-i="back" title="[">Reculer</button><button data-i="lock" class="${(a ? a.lock : pt.lock) ? 'on' : ''}">${(a ? a.lock : pt.lock) ? 'Verrouillé' : 'Verrouiller'}</button>
        <button data-i="dup">Dupliquer</button>${sels.some(isAdd) ? `<select id="ei-sendto" title="Déplacer vers une autre page"><option value="">Envoyer vers…</option>${orderNow().map(id => `<option value="${id}">${esc(pageNameFr(id))}</option>`).join('')}</select>` : ''}${sels.some(isAdd) ? '<button data-i="tolib">Enregistrer dans Mes blocs</button>' : ''}<button data-i="copystyle">Copier le style</button><button data-i="pastestyle" ${clip && clip.style ? '' : 'disabled'}>Coller le style</button>
        <button data-i="reset">Réinitialiser</button><button data-i="del" class="dng">Supprimer</button></div>
        ${!a ? '<p class="ed-note">Élément du rapport : « Supprimer » le masque, « Réinitialiser » rétablit l’original.</p>' : ''}</div>`;
  }
  insp.addEventListener('pointerdown', e => { if (editing && e.target.closest('button')) e.preventDefault(); });
  insp.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    const s = sel(), d = b.dataset, sec = curSection();
    if (d.x) {
      if (d.x === 'rotw') { inline('insertText', '[[premier|deuxième|troisième]]'); return status('Mots en rotation : séparez-les par | entre [[ ]] (visible en aperçu)', 'ok'); }
      if (d.x === 'syn') {
        const sl = getSelection(), w_ = (savedRange ? savedRange.toString() : sl.toString()).trim(); const box = document.getElementById('ed-syn');
        if (!w_ || w_.split(/\s+/).length > 4) { box.innerHTML = '<p class="ed-note">Sélectionnez un mot ou une courte expression.</p>'; return; }
        box.innerHTML = '<p class="ed-note">Recherche…</p>'; const ctx_ = (editing.innerText || '').slice(0, 400);
        try { const r = await sampleFn.json(`Propose 6 synonymes ou reformulations courtes, en français, pour « ${w_} » dans ce contexte (rapport e-réputation ${CLIENT}, registre soigné) : « ${ctx_} ». Réponds uniquement avec un tableau JSON de chaînes.`, { modelTier: 'quick' }); box.innerHTML = `<div class="ed-btns">${(Array.isArray(r) ? r : []).slice(0, 6).map(x => `<button data-x="synput" data-v="${esc(String(x))}">${esc(String(x))}</button>`).join('')}</div>`; }
        catch (e) { box.innerHTML = '<p class="ed-note err">Pas de suggestion.</p>'; }
        return;
      }
      if (d.x === 'synput') { inline('insertText', d.v); document.getElementById('ed-syn').innerHTML = ''; return; }
      if (d.x === 'link') { const t = await ask('Adresse du lien', 'https://'); if (t) inline('createLink', t); }
      else if (d.x === 'ul') inline('insertUnorderedList'); else if (d.x === 'ol') inline('insertOrderedList');
      else if (d.x === 'clear') inline('removeFormat'); else if (d.x === 'hilite') inline('hiliteColor', 'rgba(216,180,122,.35)');
      else inline(d.x);
      return;
    }
    if (d.al) return align(d.al);
    if (d.col) return setStyleAll('color', d.col);
    if (d.fill) return setStyleAll('background', d.fill);
    if (d.bgcol && sec) { snapshot(); E.bg[sec.id] = Object.assign({}, E.bg[sec.id], { color: d.bgcol, grad: '' }); return changed(); }
    if (d.wcol) { snapshot(); addOf(s).w_.color = d.wcol; return changed(); }
    if (d.icon) { snapshot(); addOf(s).icon = d.icon; return changed(); }
    if (d.ta) return setStyleAll('textAlign', d.ta);
    if (d.ai) return aiRewrite(s, d.ai);
    if (d.tf) { const a_ = addOf(s), def = blockDef(d.tf, a_.u || 'rem'); if (!def) return; snapshot(); Object.assign(a_, { kind: def.kind, style: JSON.parse(JSON.stringify(def.style || {})), fx: def.fx ? JSON.parse(JSON.stringify(def.fx)) : {}, w: def.w || a_.w, h: def.h, link: def.link && !a_.link ? def.link : a_.link, ts: undefined }); return changed('Bloc transformé'); }
    if (d.t) {
      const cs = getComputedStyle(s);
      if (d.t === 'it') return setStyleAll('fontStyle', cs.fontStyle === 'italic' ? 'normal' : 'italic');
      if (d.t === 'ul') return setStyleAll('textDecoration', cs.textDecorationLine.includes('underline') ? 'none' : 'underline');
      if (d.t === 'up') return setStyleAll('textTransform', cs.textTransform === 'uppercase' ? 'none' : 'uppercase');
      if (d.t === 'sc') return setStyleAll('fontVariantCaps', cs.fontVariantCaps === 'small-caps' ? 'normal' : 'small-caps');
    }
    const k = d.i; if (!k) return;
    if (k === 'collapse') { collapsed = !collapsed; return inspect(); }
    if (k === 'charte') return charteBox();
    if (k === 'tkadd' && sec) { const inp = document.getElementById('ei-tk'), t_ = inp.value.trim(); if (!t_) return; snapshot(); (E.tasks[sec.id] = E.tasks[sec.id] || []).push({ t: t_, at: new Date().toISOString() }); return changed('Tâche ajoutée'); }
    if (k.startsWith('tkdel') && sec) { snapshot(); E.tasks[sec.id].splice(+k.slice(5), 1); if (!E.tasks[sec.id].length) delete E.tasks[sec.id]; return changed(); }
    if (k === 'bgall' && sec) { const src_ = E.bg[sec.id]; if (!src_) return status('Cette page n’a pas de fond personnalisé', 'warn'); snapshot(); E.pages.forEach(p_ => { if (p_.id !== sec.id) E.bg[p_.id] = JSON.parse(JSON.stringify(src_)); }); return changed(`Fond appliqué à ${E.pages.filter(p_ => p_.id !== sec.id).length} page(s) ajoutée(s)`); }
    if (k === 'bgvid' && sec) { const src = await pickVideo(); if (src) { snapshot(); E.bg[sec.id] = Object.assign({}, E.bg[sec.id], { video: src, dim: (E.bg[sec.id] || {}).dim ?? .45 }); changed(); } return; }
    if (k === 'bgvidx' && sec) { snapshot(); delete E.bg[sec.id].video; return changed(); }
    if (k === 'tolib') return toLib();
    if (k === 'png') return exportPNG();
    if (k === 'anchor' && sec) { const t = '#' + sec.id; try { await navigator.clipboard.writeText(t); status(`Ancre ${t} copiée : ajoutez-la à la fin du lien partagé pour ouvrir directement cette page`, 'ok'); } catch (er) { status(`Ancre de la page : ${t} (à ajouter à la fin du lien partagé)`, 'ok'); } return; }
    if (k === 'bgimg') { const src = await pickImage(); if (src && sec) { snapshot(); E.bg[sec.id] = Object.assign({}, E.bg[sec.id], { image: src, dim: .45 }); changed(); } return; }
    if (k === 'bgreset') { if (sec && E.bg[sec.id]) { snapshot(); delete E.bg[sec.id]; changed(); } return; }
    if (k === 'pattern' && sec) { snapshot(); E.bg[sec.id] = Object.assign({}, E.bg[sec.id]); E.bg[sec.id].pattern = !E.bg[sec.id].pattern || undefined; return changed(); }
    if (k === 'fixedbg' && sec) { snapshot(); E.bg[sec.id].fixed = !E.bg[sec.id].fixed || undefined; return changed(); }
    if (k === 'pagehide') { if (sec) { snapshot(); E.hide[sec.id] ? delete E.hide[sec.id] : (E.hide[sec.id] = true); changed(); } return; }
    if (!s) return;
    const a = isAdd(s) && addOf(s);
    if (k === 'data') return openData(s);
    if (k === 'unlink') { snapshot(); const o = a.kind === 'chart' ? a.chart : a.table, L = a.kind === 'chart' ? linkedChart(o) : linkedTable(o); if (a.kind === 'chart') a.chart = Object.assign({}, L); else a.table = Object.assign({}, L); delete (a.kind === 'chart' ? a.chart : a.table).src; return changed('Valeurs figées : elles ne suivront plus les données du mois'); }
    if (k === 'vid') { const src = await pickVideo(); if (src) { snapshot(); a.src = src; changed(); } return; }
    if (k === 'comment') { try { await commentsNs.openComposer({ element: s }); } catch (er) { status('Commentaire impossible : ' + ((er && er.code) || 'erreur'), 'err'); } return; }
    if (k === 'vig' || k === 'grain') return setFx(k, !(((patchOf(s, false) || {}).fx || {})[k]) || null);
    if (k === 'timg') { if (((patchOf(s, false) || {}).fx || {}).timg) return setFx('timg', null); const src = await pickImage(); if (src) setFx('timg', src); return; }
    if (k.startsWith('qs-')) return quickStyle(k.slice(3));
    if (k === 'caradd') { const src = await pickImage(); if (src) { snapshot(); a.items = (a.items || []).concat({ src, cap: '' }); changed(); } return; }
    if (k.startsWith('cardel')) { snapshot(); a.items.splice(+k.slice(6), 1); return changed(); }
    if (k === 'hollow') return setFx('hollow', !(((patchOf(s, false) || {}).fx || {}).hollow) || null);
    if (k === 'dropcap') return setFx('dropcap', !(((patchOf(s, false) || {}).fx || {}).dropcap) || null);
    if (k === 'vert') return setStyleAll('writingMode', getComputedStyle(s).writingMode.startsWith('vertical') ? 'horizontal-tb' : 'vertical-rl');
    if (k === 'mkstyle' || k === 'updstyle') {
      const cs = getComputedStyle(s), up = unitPx(s), cur = (patchOf(s, false) || {}).ts;
      const st_ = { fontFamily: cs.fontFamily, fontSize: r2(parseFloat(cs.fontSize) / up * (unitOf(s) === 'px' ? .1 : 1)) + 'rem', fontWeight: cs.fontWeight, fontStyle: cs.fontStyle, lineHeight: String(r2(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)) || 1.3), letterSpacing: r2((parseFloat(cs.letterSpacing) || 0) / parseFloat(cs.fontSize)) + 'em', textTransform: cs.textTransform, color: hexOf(cs.color) };
      if (k === 'updstyle') { const ts = E.styles.find(x => x.id === cur); if (!ts) return; snapshot(); ts.style = st_; }
      else { const nm = await ask('Nom du nouveau style', 'Mon style'); if (!nm) return; snapshot(); const id = 's' + Date.now().toString(36); E.styles.push({ id, name: nm, style: st_ }); sels.forEach(el => { const pt = patchOf(el); pt.ts = id; }); }
      sels.forEach(el => { const pt = patchOf(el); if (pt.style) Object.keys(st_).forEach(x => delete pt.style[x]); });
      return changed(k === 'updstyle' ? 'Style mis à jour partout où il est utilisé' : 'Style créé');
    }
    if (k === 'genimg') { const src = await pickImage(); if (!src) return; snapshot(); const pt = patchOf(s); if (s.tagName === 'IMG') pt.src = src; else pt.style = Object.assign({}, pt.style, { backgroundImage: `url("${src}")`, backgroundSize: 'cover', backgroundPosition: 'center' }); return changed('Image remplacée'); }
    if (k === 'genimgx') { snapshot(); const pt = patchOf(s); delete pt.src; if (pt.style) ['backgroundImage', 'backgroundSize', 'backgroundPosition'].forEach(x => delete pt.style[x]); return changed(); }
    if (k === 'cmp1' || k === 'cmp2') { const src = await pickImage(); if (src) { snapshot(); a[k === 'cmp1' ? 'src' : 'src2'] = src; changed(); } return; }
    if (k === 'altia') return altIA(s);
    if (k === 'alertsbox') return alertsBox();
    if (k === 'animprev') return animPreview(s, a);
    if (k === 'pageanims') return pageAnims();
    if (k === 'flipview') { const f_ = s.querySelector('.ed-flip'); if (f_) f_.classList.toggle('fl'); return; }
    if (k === 'hsimg') { const src = await pickImage(); if (src) { snapshot(); a.src = src; changed(); } return; }
    if (k === 'hsadd') { hsPlace = a.id; document.body.classList.add('ed-hsplace'); return status('Cliquez sur l’image à l’endroit du point', 'warn'); }
    if (k.startsWith('hsdel')) { snapshot(); a.pts.splice(+k.slice(5), 1); return changed(); }
    if (k === 'csv') return csvDl(a);
    if (k === 'auto2text') { snapshot(); const R_ = autoRules(); a.html = (a.rules || []).map(r_ => R_[r_]).filter(Boolean).join('<br><br>'); a.kind = 'html'; delete a.rules; return changed('Converti en texte : il ne suivra plus les données du mois'); }
    if (k === 'img') { const src = await pickImage(); if (src) { snapshot(); a.src = src; changed(); } return; }
    if (k === 'postimg') { const src = await pickImage(); if (src) { snapshot(); a.post.src = src; changed(); } return; }
    if (k === 'fit') { snapshot(); a.fit = a.fit === 'contain' ? 'cover' : 'contain'; return changed(); }
    if (k === 'nobg') { snapshot(); sels.forEach(el => { const pt = patchOf(el); pt.style = Object.assign({}, pt.style, { background: 'transparent' }); if (pt.fx) delete pt.fx.grad; }); return changed(); }
    if (k === 'gradbg') return setFx('grad', (patchOf(s, false) || {}).fx && patchOf(s).fx.grad ? null : { c1: '#d8b47a', c2: '#7f9cff', a: 135 });
    if (k === 'shadow') return setStyleAll('boxShadow', getComputedStyle(s).boxShadow !== 'none' ? 'none' : '0 1.6rem 4rem rgba(0,0,0,.35)');
    if (k === 'blur') { const on_ = getComputedStyle(s).backdropFilter && getComputedStyle(s).backdropFilter !== 'none'; snapshot(); sels.forEach(el => { const pt = patchOf(el); pt.style = Object.assign({}, pt.style, { backdropFilter: on_ ? 'none' : 'blur(12px)', background: on_ ? (pt.style || {}).background : 'rgba(11,20,48,.55)' }); }); return changed(); }
    if (k === 'flipx' || k === 'flipy') { const key = k === 'flipx' ? 'flipX' : 'flipY'; return setFx(key, !((patchOf(s, false) || {}).fx || {})[key]); }
    if (k === 'front' || k === 'back') return zstep(k === 'front' ? 1 : -1);
    if (k === 'lock') { snapshot(); const v = !(a ? a.lock : (patchOf(s, false) || {}).lock); sels.forEach(el => { patchOf(el).lock = v || undefined; }); return changed(v ? 'Verrouillé' : 'Déverrouillé'); }
    if (k === 'dup') return duplicate();
    if (k === 'group') return group(true);
    if (k === 'ungroup') return group(false);
    if (k === 'disth' || k === 'distv') return distribute(k === 'disth');
    if (k === 'arrange') {
      const cols = Math.max(1, +document.getElementById('ei-gridc').value || 2), gap = parseFloat(document.getElementById('ei-gridg').value) || 0;
      const items = sels.filter(isAdd).map(el => ({ el, a: addOf(el), r: el.getBoundingClientRect() })).sort((x, y) => (x.r.top - y.r.top) || (x.r.left - y.r.left)); if (!items.length) return;
      snapshot(); const up = unitPx(items[0].el), x0 = Math.min(...items.map(i => i.a.x)), y0 = Math.min(...items.map(i => i.a.y));
      const cw = Math.max(...items.map(i => i.r.width / up)), rows = []; items.forEach((it, i) => { (rows[Math.floor(i / cols)] = rows[Math.floor(i / cols)] || []).push(it); });
      let y = y0; rows.forEach(row => { row.forEach((it, j) => { it.a.x = r2(x0 + j * (cw + gap)); it.a.y = r2(y); }); y += Math.max(...row.map(it => it.r.height / up)) + gap; });
      return changed('Disposé en grille');
    }
    if (k === 'samew' || k === 'sameh') { snapshot(); const ref = s.getBoundingClientRect(); sels.forEach(el => { const pt = patchOf(el), up = unitPx(el); if (k === 'samew') pt.w = r2(ref.width / up); else pt.h = r2(ref.height / up); if (!isAdd(el)) pt.u = unitOf(el); }); return changed(); }
    if (k === 'copystyle') { const pt = patchOf(s, false) || {}; clip = Object.assign({}, clip, { style: Object.assign({}, pt.style), fx: Object.assign({}, pt.fx) }); status('Style copié', 'ok'); return inspect(); }
    if (k === 'pastestyle' && clip && clip.style) { snapshot(); sels.forEach(el => { const pt = patchOf(el); pt.style = Object.assign({}, pt.style, clip.style); pt.fx = Object.assign({}, pt.fx, clip.fx); }); return changed(); }
    if (k === 'reset') { snapshot(); sels.forEach(el => { if (isAdd(el)) { const o = addOf(el); const def = blockDef({ shape: 'shape', html: 'callout', text: 'paragraph' }[o.kind] || o.kind, o.u || 'rem'); o.style = (def && def.style) || {}; o.rot = 0; o.fx = {}; } else delete E.el[pathOf(el)]; }); return changed(); }
    if (k === 'del') return removeSel();
  });
  insp.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'ei-notes') { const sec = curSection(); if (sec) { if (t.value.trim()) E.notes[sec.id] = t.value; else delete E.notes[sec.id]; E.updated = new Date().toISOString(); dirty = true; store.set(KEY, JSON.stringify(E)); } }
  });
  insp.addEventListener('change', async e => {
    const t = e.target, s = sel(), sec = curSection();
    if (t.id === 'ex-col') return inline('foreColor', t.value);
    if (t.id === 'ex-tok') { if (t.value) inline('insertText', `{{${t.value}}}`); t.value = ''; return; }
    if (t.id === 'ei-notes') return status(mode === 'artifact' ? 'Notes modifiées : pensez à enregistrer' : 'Notes gardées dans ce navigateur', 'warn');
    if (t.id === 'ei-bgc' && sec) { snapshot(); E.bg[sec.id] = Object.assign({}, E.bg[sec.id], { color: t.value, grad: '' }); return changed(); }
    if (t.id === 'ei-grad' && sec) { snapshot(); E.bg[sec.id] = Object.assign({}, E.bg[sec.id], { grad: t.value }); return changed(); }
    if (t.id === 'ei-sendto' && t.value) { const to = t.value; snapshot(); const items = sels.filter(isAdd).map(addOf); items.forEach(a_ => { a_.sec = to; a_.parent = to; a_.pin = undefined; }); changed(`${items.length} élément(s) envoyé(s) vers « ${pageNameFr(to)} »`); document.getElementById(to).scrollIntoView(); sels = items.map(a_ => addEl(a_.id)).filter(Boolean); paint(); inspect(); return; }
    if (t.dataset.tk != null && sec) { snapshot(); E.tasks[sec.id][+t.dataset.tk].done = t.checked || undefined; return changed(t.checked ? 'Tâche faite' : ''); }
    if (t.id === 'ei-dur' && sec) { snapshot(); const v_ = parseFloat(String(t.value).replace(',', '.')); if (v_ > 0) E.dur[sec.id] = v_; else delete E.dur[sec.id]; const tot = Object.values(E.dur).reduce((a, x) => a + x, 0); return changed(`Durée totale prévue : ${nfr(tot, 1)} min`); }
    if (t.id === 'ei-pinpage' && sec) { const pg_ = E.pages.find(p_ => p_.id === sec.id); if (!pg_) return; snapshot(); pg_.pin = t.checked || undefined; if (t.checked && (pg_.h || 100) < 200) pg_.h = 300; return changed(t.checked ? 'Page épinglée sur 3 écrans : réglez « Apparaît à … % » sur chaque élément' : ''); }
    if (t.id === 'ei-burst' && sec) { snapshot(); E.bg[sec.id] = Object.assign({}, E.bg[sec.id], { burst: t.value || undefined }); return changed(t.value ? 'Effet visible une fois, à l’arrivée sur la page (aperçu)' : ''); }
    if (t.id === 'ei-bga' && sec) { snapshot(); E.bg[sec.id] = Object.assign({}, E.bg[sec.id], { anim: t.value || undefined }); return changed(); }
    if (t.id === 'ei-pe' && sec) { snapshot(); E.bg[sec.id] = Object.assign({}, E.bg[sec.id], { enter: t.value || undefined }); return changed(t.value ? 'Transition visible en aperçu / lecture' : ''); }
    if (t.id === 'ei-dim' && sec) { snapshot(); E.bg[sec.id].dim = t.value / 100; return changed(); }
    if (!s) return;
    const a = isAdd(s) && addOf(s), v = t.value, n = parseFloat(String(v).replace(',', '.')), u = a ? (a.u || 'rem') : ((patchOf(s, false) || {}).u || unitOf(s));
    if (t.id === 'ei-l1' || t.id === 'ei-l2') { snapshot(); a[t.id.slice(3)] = v; return changed(); }
    if (t.id.startsWith('ec-')) { snapshot(); a.cn = Object.assign({}, a.cn, { [t.id.slice(3)]: t.type === 'checkbox' ? t.checked : (t.id === 'ec-head' ? v : +v) }); return changed(); }
    if (t.id === 'es-mode') { snapshot(); a.scr = v ? Object.assign({ x: 0, y: v === 'in' ? 8 : -6, rot: 0, scale: 1, op: v === 'in' ? 0 : undefined }, a.scr, { mode: v }) : undefined; return changed(v ? 'Animation au défilement : visible en aperçu' : ''); }
    if (t.id === 'es-dir') { snapshot(); a.scr = Object.assign({}, a.scr, { dir: v }); return changed(); }
    if (/^es-(x|y|rot|scale|op)$/.test(t.id)) { snapshot(); a.scr = Object.assign({}, a.scr, { [t.id.slice(3)]: isNaN(n) ? undefined : n }); return changed(); }
    if (t.dataset.cap != null) { snapshot(); a.items[+t.dataset.cap].cap = v; return changed(); }
    if (t.dataset.auto) { snapshot(); const r_ = new Set(a.rules || []); t.checked ? r_.add(t.dataset.auto) : r_.delete(t.dataset.auto); a.rules = Object.keys(AUTO_L).filter(k => r_.has(k)); return changed(); }
    if (t.id === 'ei-k2') { snapshot(); a.metric = v; return changed(); }
    if (t.id === 'ei-k2l') { snapshot(); a.label = v.trim() || undefined; return changed(); }
    if (t.id === 'ei-dsw') { snapshot(); a.sw = n || 3; return changed(); }
    if (t.id === 'ei-cint') { snapshot(); a.int = Math.max(2, n || 5); return changed(); }
    if (t.id === 'ei-cauto') { snapshot(); a.auto = t.checked ? undefined : false; return changed(); }
    if (t.id === 'ei-mvmin') { snapshot(); a.min = n || 0; return changed(); }
    if (t.id === 'ei-mo') { snapshot(); a.mo = v === '' ? undefined : n; return changed(v === '' ? '' : 'Ordre sur téléphone : les plus petits nombres en premier'); }
    if (t.id === 'ei-at' || t.id === 'ei-until') { snapshot(); a[t.id.slice(3)] = isNaN(n) ? undefined : Math.max(0, Math.min(100, n)); return changed(); }
    if (t.id === 'ei-step') { snapshot(); a.step = n > 0 ? Math.round(n) : undefined; return changed(a.step ? 'En présentation, l’élément apparaît à l’étape ' + a.step + ' (→ ou Espace)' : ''); }
    if (t.id === 'ei-scrub') { snapshot(); a.scrub = t.checked || undefined; return changed(t.checked ? 'La vidéo avance et recule avec le défilement (lecteurs)' : ''); }
    if (t.id === 'ei-ease') { snapshot(); a.ease = v || undefined; return changed(); }
    if (t.id === 'ei-rep') { snapshot(); a.rep = t.checked || undefined; return changed(); }
    if (t.id === 'ei-act') { snapshot(); a.act = v ? { t: v, target: (a.act || {}).target } : undefined; return changed(v === 'lightbox' ? 'Au clic, l’image s’affiche en grand (lecteurs)' : v === 'sparkle' ? 'Au clic, pluie d’étoiles dorées (lecteurs)' : ''); }
    if (t.id === 'ei-acttg') { snapshot(); a.act = Object.assign({}, a.act, { target: v || undefined }); return changed(); }
    if (t.id === 'ei-hshow') { snapshot(); a.hshow = v || undefined; return changed(v ? 'L’élément choisi est caché et apparaît au survol (lecteurs)' : ''); }
    if (t.id === 'ei-fc1' || t.id === 'ei-fc2') { snapshot(); a[t.id === 'ei-fc1' ? 'c1' : 'c2'] = v; return changed(); }
    if (t.id === 'ei-fon') { snapshot(); a.flipOn = v; return changed(); }
    if (t.id === 'ei-ffront' || t.id === 'ei-fback') { snapshot(); a[t.id === 'ei-ffront' ? 'html' : 'back'] = v.replace(/\n/g, '<br>'); return changed(); }
    if (t.id === 'ei-rq') { snapshot(); a.html = v.replace(/\n/g, '<br>'); return changed(); }
    if (t.id === 'ei-ra') { snapshot(); a.ans = v.replace(/\n/g, '<br>'); return changed(); }
    if (t.id === 'ei-rb') { snapshot(); a.btn = v; return changed(); }
    if (t.id === 'ei-ka' || t.id === 'ei-kb') { snapshot(); a[t.id.slice(3)] = v || undefined; return changed(); }
    if (t.id === 'ei-hmet') { snapshot(); a.metric = v; return changed(); }
    if (t.id === 'ei-dn') { snapshot(); a.n = Math.max(1, Math.round(n || 8)); return changed(); }
    if (t.id === 'ei-dmin') { snapshot(); a.min = n || 0; return changed(); }
    if (t.id === 'ei-dcol') { snapshot(); a.color = v || undefined; return changed(); }
    if (t.id === 'ei-dmet') { snapshot(); a.metric = v; return changed(); }
    if (t.id === 'ei-dasc') { snapshot(); a.asc = t.checked || undefined; return changed(); }
    if (t.id === 'ei-dtit') { snapshot(); a.title = v.trim() || undefined; return changed(); }
    if (t.id === 'ei-dtop') { snapshot(); a.topic = v || undefined; return changed(); }
    if (t.id === 'ei-dbr') { snapshot(); a.brand = v; return changed(); }
    if (t.id === 'ei-cdd') { snapshot(); a.date = v || undefined; return changed(); }
    if (t.id === 'ei-cdl') { snapshot(); a.label = v; return changed(); }
    if (t.id === 'ei-tki') { snapshot(); a.items = v; return changed(); }
    if (t.id === 'ei-tks') { snapshot(); a.speed = Math.max(5, n || 30); return changed(); }
    if (t.dataset.hp != null) { snapshot(); a.pts[+t.dataset.hp].t = v; return changed(); }
    if (t.id === 'ei-lang') { snapshot(); a.lang = v || undefined; return changed(v ? 'Visible seulement dans cette langue (lecteurs)' : ''); }
    if (t.id === 'ei-gridc') return;
    if (t.id === 'ei-tip') { snapshot(); a.tip = v.trim() || undefined; return changed(); }
    if (t.id === 'ei-toggle') { snapshot(); a.toggle = v || undefined; return changed(v ? 'Au clic : affiche / masque l’élément choisi (en lecture)' : ''); }
    if (t.id === 'ei-reveal') { snapshot(); a.reveal = t.checked || undefined; return changed(); }
    if (t.id === 'ei-pinskip') { snapshot(); a.pinSkip = t.checked || undefined; return changed(); }
    if (t.id === 'ei-pin') {
      snapshot(); const r = s.getBoundingClientRect(), rp = remPx();
      if (t.checked) { Object.assign(a, { pin: true, u: 'rem', x: r2(r.left / rp), y: r2(r.top / rp) }); }
      else { const sec_ = curSection() || document.getElementById(a.sec); const sr = sec_.getBoundingClientRect(); Object.assign(a, { pin: undefined, pinSkip: undefined, sec: sec_.id, parent: sec_.id, u: 'rem', x: r2((r.left - sr.left) / rp), y: r2((r.top - sr.top) / rp) }); }
      return changed(t.checked ? 'Épinglé : visible sur toutes les pages' : 'Désépinglé : posé sur la page affichée');
    }
    if (t.id === 'ei-qr') { const svg = await makeQR(v.trim()); if (svg) { snapshot(); a.url = v.trim(); a.svg = svg; changed(); } return; }
    if (t.id === 'ei-ts') { snapshot(); const def = E.styles.find(x => x.id === v); sels.forEach(el => { const pt = patchOf(el); pt.ts = v || undefined; if (def && pt.style) Object.keys(def.style).forEach(x => delete pt.style[x]); }); return changed(); }
    if (t.id === 'ei-dev') { snapshot(); sels.forEach(el => { patchOf(el).dev = v || undefined; }); return changed(v ? (v === 'd' ? 'Masqué sur mobile' : 'Visible sur mobile uniquement') : ''); }
    if (t.id === 'ei-count') { snapshot(); sels.forEach(el => { patchOf(el).count = t.checked || undefined; }); return changed(); }
    if (t.id === 'ei-vctl') { snapshot(); a.controls = t.checked || undefined; return changed(); }
    if (t.id === 'ei-vurl') { snapshot(); a.src = v.trim() || a.src; return changed(); }
    if (t.id.startsWith('ef-')) {
      const fx = Object.assign({}, (patchOf(s, false) || {}).fx), fl = Object.assign({}, fx.filter);
      switch (t.id) {
        case 'ef-stroke': return setFx('stroke', n || null);
        case 'ef-hovc': return setFx('hovc', v);
        case 'ef-mouse': return setFx('mouse', +v || null);
        case 'ef-duo': return setFx('duo', v || null);
        case 'ef-strokec': return setFx('strokec', v);
        case 'ef-bright': case 'ef-contrast': case 'ef-sat': case 'ef-gray': case 'ef-sepia': case 'ef-blur': fl[t.id.slice(3)] = n || 0; return setFx('filter', fl);
        case 'ef-tshadow': return setFx('tshadow', v || null);
        case 'ef-tsc': return setFx('tsc', v);
        case 'ef-tg': return setFx('tgrad', t.checked ? { c1: '#f0d6a6', c2: '#d8b47a', a: 90 } : null);
        case 'ef-tg1': return setFx('tgrad', Object.assign({}, fx.tgrad, { c1: v }));
        case 'ef-tg2': return setFx('tgrad', Object.assign({}, fx.tgrad, { c2: v }));
        case 'ef-g1': return setFx('grad', Object.assign({}, fx.grad, { c1: v }));
        case 'ef-g2': return setFx('grad', Object.assign({}, fx.grad, { c2: v }));
        case 'ef-ga': return setFx('grad', Object.assign({}, fx.grad, { a: n || 0 }));
        case 'ef-mask': return setFx('mask', v || null);
        case 'ef-blend': return setFx('blend', v || null);
        case 'ef-hover': return setFx('hover', v || null);
        case 'ef-loop': return setFx('loop', v || null);
        case 'ef-plx': return setFx('plx', +v || null);
      }
      return;
    }
    if (t.id.startsWith('ew-')) { snapshot(); const k = t.id.slice(3); a.w_[k] = ['max', 'dec'].includes(k) ? (n || 0) : v; return changed(); }
    if (t.id.startsWith('ep-')) { snapshot(); a.post[t.id.slice(3)] = v; return changed(); }
    snapshot();
    const pt = patchOf(s);
    switch (t.id) {
      case 'ei-x': if (a) a.x = n; else { pt.tx = n; pt.u = u; } break;
      case 'ei-y': if (a) a.y = n; else { pt.ty = n; pt.u = u; } break;
      case 'ei-w': pt.w = isNaN(n) ? undefined : n; if (!a) pt.u = u; break;
      case 'ei-h': pt.h = isNaN(n) ? undefined : n; if (!a) pt.u = u; break;
      case 'ei-r': pt.rot = n || 0; break;
      case 'ei-sw': a.sw = n || 1.6; break;
      case 'ei-px': a.posx = n; break;
      case 'ei-zoom': a.zoom = n > 1 ? n : undefined; break;
      case 'ei-py': a.posy = n; break;
      case 'ei-font': undo.pop(); return setStyleAll('fontFamily', v);
      case 'ei-fs': undo.pop(); return setStyleAll('fontSize', n + u);
      case 'ei-fw': undo.pop(); return setStyleAll('fontWeight', v);
      case 'ei-lh': undo.pop(); return setStyleAll('lineHeight', String(n));
      case 'ei-ls': undo.pop(); return setStyleAll('letterSpacing', n + 'em');
      case 'ei-cols': undo.pop(); return setStyleAll('columnCount', String(Math.max(1, Math.min(4, n || 1))));
      case 'ei-col': undo.pop(); return setStyleAll('color', v);
      case 'ei-bg': undo.pop(); return setStyleAll('background', v);
      case 'ei-op': undo.pop(); return setStyleAll('opacity', String(Math.max(0, Math.min(100, n)) / 100));
      case 'ei-rad': undo.pop(); return setStyleAll('borderRadius', n + u);
      case 'ei-pad': undo.pop(); return setStyleAll('padding', n + u);
      case 'ei-bw': case 'ei-bc': case 'ei-bs': undo.pop(); return setStyleAll('border', `${parseFloat(document.getElementById('ei-bw').value) || 1}px ${document.getElementById('ei-bs').value} ${document.getElementById('ei-bc').value}`);
      case 'ei-link': a.link = v.trim() || undefined; break;
      case 'ei-linkp': a.link = v || undefined; break;
      case 'ei-anim': a.anim = v; break;
      case 'ei-dl': a.delay = n || 0; break;
      case 'ei-du': a.dur = n || .9; break;
      case 'ei-alt': a.alt = v; break;
      default: undo.pop(); return;
    }
    changed();
  });

  /* ---------- opérations sur la sélection ---------- */
  function removeSel() {
    if (!sels.length) return; snapshot();
    sels.forEach(el => { if (isAdd(el)) E.add = E.add.filter(x => x.id !== el.dataset.addId); else patchOf(el).hidden = true; });
    sels = []; changed('Supprimé · « Annuler » pour revenir');
  }
  function asAdd(el, dx = 2) {
    if (isAdd(el)) { const c = JSON.parse(JSON.stringify(addOf(el))); c.id = uid(); c.x += dx; c.y += dx; return c; }
    const parent = el.parentElement, up = unitPx(el), r = el.getBoundingClientRect(), pr = parent.getBoundingClientRect(), u = unitOf(el);
    return { id: uid(), kind: 'html', sec: sectionOf(el).id, parent: pathOf(parent) || sectionOf(el).id, u, html: el.outerHTML.replace(/\sid="[^"]*"/g, '').replace(/\sdata-ed-html="[^"]*"/g, ''), x: r2((r.left - pr.left) / up + dx), y: r2((r.top - pr.top) / up + dx), w: r2(r.width / up) };
  }
  function regroup(items) { const m = {}; items.forEach(c => { if (c.grp) c.grp = m[c.grp] = m[c.grp] || 'g' + uid(); }); return items; }
  function duplicate() {
    if (!sels.length) return; snapshot();
    const items = regroup(sels.map(el => asAdd(el))); items.forEach(c => E.add.push(c));
    changed('Dupliqué'); sels = items.map(c => addEl(c.id)).filter(Boolean); inspect(); paint();
  }
  function copy() { if (!sels.length) return; clip = Object.assign({}, clip, { items: sels.map(el => asAdd(el, 0)) }); status(`${sels.length} élément(s) copié(s)`, 'ok'); }
  function paste() {
    if (!clip || !clip.items || !clip.items.length) return;
    const parent = container(); if (!parent) return;
    snapshot();
    const u = parent.closest('.mx5 .box') ? 'px' : 'rem';
    const items = regroup(clip.items.map(it => { const c = JSON.parse(JSON.stringify(it)); c.id = uid(); c.sec = sectionOf(parent).id; c.parent = pathOf(parent) || c.sec; if (c.u !== u) { const k = u === 'px' ? 10 : .1; c.x *= k; c.y *= k; if (c.w) c.w *= k; if (c.h) c.h *= k; c.u = u; } c.x += 3; c.y += 3; return c; }));
    items.forEach(c => E.add.push(c));
    changed('Collé'); sels = items.map(c => addEl(c.id)).filter(Boolean); inspect(); paint();
  }
  function group(v) {
    const ads = sels.filter(isAdd); if (v && ads.length < 2) { status('Sélectionnez au moins deux éléments ajoutés (Maj + clic)', 'warn'); return; }
    snapshot(); const g = 'g' + uid();
    if (v) ads.forEach(el => { addOf(el).grp = g; }); else { const ids = new Set(ads.map(el => addOf(el).grp).filter(Boolean)); E.add.forEach(a => { if (ids.has(a.grp)) delete a.grp; }); }
    changed(v ? 'Groupé' : 'Dégroupé');
  }
  function zstep(dir) {
    if (!sels.length) return; snapshot();
    sels.forEach(el => { const pt = patchOf(el), z = (parseInt(getComputedStyle(el).zIndex) || (isAdd(el) ? 30 : 0)) + dir * 2; pt.style = Object.assign({}, pt.style, { zIndex: String(z) }); });
    changed();
  }
  function moveBy(el, dxp, dyp) {
    const up = unitPx(el);
    if (isAdd(el)) { const a = addOf(el); a.x = r2(a.x + dxp / up); a.y = r2(a.y + dyp / up); }
    else { const pt = patchOf(el); pt.tx = r2((pt.tx || 0) + dxp / up); pt.ty = r2((pt.ty || 0) + dyp / up); }
  }
  function align(k) {
    if (!sels.length) return; snapshot();
    const rects = sels.map(el => el.getBoundingClientRect());
    let ref;
    if (sels.length > 1) ref = { left: Math.min(...rects.map(r => r.left)), right: Math.max(...rects.map(r => r.right)), top: Math.min(...rects.map(r => r.top)), bottom: Math.max(...rects.map(r => r.bottom)) };
    else { const p = sels[0].parentElement.getBoundingClientRect(); ref = { left: p.left, right: p.right, top: Math.max(p.top, 0), bottom: Math.min(p.bottom, innerHeight) }; if (sectionOf(sels[0]) === sels[0].parentElement) { ref.left = p.left + 6 * remPx(); ref.right = p.right - 6 * remPx(); } }
    sels.forEach((el, i) => {
      const r = rects[i]; let dx = 0, dy = 0;
      if (k === 'l') dx = ref.left - r.left; if (k === 'r') dx = ref.right - r.right; if (k === 'c') dx = (ref.left + ref.right) / 2 - (r.left + r.width / 2);
      if (k === 't') dy = ref.top - r.top; if (k === 'b') dy = ref.bottom - r.bottom; if (k === 'm') dy = (ref.top + ref.bottom) / 2 - (r.top + r.height / 2);
      moveBy(el, dx, dy);
    });
    changed();
  }
  function distribute(horiz) {
    if (sels.length < 3) return; snapshot();
    const items = sels.map(el => ({ el, r: el.getBoundingClientRect() })).sort((a, b) => horiz ? a.r.left - b.r.left : a.r.top - b.r.top);
    const first = items[0].r, last = items[items.length - 1].r;
    const total = items.reduce((s, it) => s + (horiz ? it.r.width : it.r.height), 0);
    const gap = ((horiz ? last.right - first.left : last.bottom - first.top) - total) / (items.length - 1);
    let pos = horiz ? first.left : first.top;
    items.forEach(it => { const cur = horiz ? it.r.left : it.r.top; moveBy(it.el, horiz ? pos - cur : 0, horiz ? 0 : pos - cur); pos += (horiz ? it.r.width : it.r.height) + gap; });
    changed('Espacements répartis');
  }

  /* ---------- présentation ---------- */
  let presT0 = 0, presTimer = null;
  let presPage = null, presPageT0 = 0;
  setInterval(() => {
    if (!presenting) return; const el = document.getElementById('ed-pr-pt'); if (!el) return; const tgt = (E.dur[presPage] || 0) * 60, s_ = Math.floor((Date.now() - presPageT0) / 1000), f = x => `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`;
    const tot = Object.values(E.dur).reduce((a, x) => a + (+x || 0), 0) * 60, el2 = Math.floor((Date.now() - presT0) / 1000);
    el.textContent = tgt ? `Page ${f(s_)} / ${f(tgt)}` : `Page ${f(s_)}`; el.className = tgt && s_ > tgt ? 'over' : tgt && s_ > tgt * .8 ? 'warn' : '';
    const tt = document.getElementById('ed-pr-time'); if (tt && tot) tt.classList.toggle('over', el2 > tot);
  }, 1000);
  function presenterNotes() {
    if (!presenting) return;
    const sec = curSection();
    document.getElementById('ed-pr-page').textContent = sec ? `${orderNow().indexOf(sec.id) + 1} / ${orderNow().length} · ${pageName(sec.id)}` : '';
    document.getElementById('ed-pr-notes').textContent = sec && E.notes[sec.id] ? E.notes[sec.id] : 'Pas de note pour cette page.';
    if (sec && sec.id !== presPage) { presPage = sec.id; presPageT0 = Date.now(); }
  }
  /* ---------- outils de présentation ---------- */
  const ptools = { laser: false, spot: false, pen: false, black: false };
  function presTool(k) {
    if (!presenting) return;
    if (k === 'black') { ptools.black = !ptools.black; blackD.hidden = !ptools.black; }
    else if (k !== 'none') { const was = ptools[k]; ['laser', 'spot', 'pen'].forEach(x => { ptools[x] = false; }); ptools[k] = !was; }
    laserD.hidden = !ptools.laser; spotD.hidden = !ptools.spot; penC.hidden = !ptools.pen && !penDirty;
    penC.classList.toggle('on', ptools.pen); document.body.classList.toggle('ed-tool', ptools.laser || ptools.spot || ptools.pen);
    present.querySelectorAll('.ed-pr-tools [data-a]').forEach(b => b.classList.toggle('on', !!ptools[b.dataset.a] || (b.dataset.a === 'live' && liveOn)));
    if (ptools.pen) { penC.width = innerWidth * devicePixelRatio; penC.height = innerHeight * devicePixelRatio; penDirty = false; }
  }
  let penDirty = false, penLast = null, penY = 0;
  function penClear() { const g = penC.getContext('2d'); g.clearRect(0, 0, penC.width, penC.height); penDirty = false; if (!ptools.pen) penC.hidden = true; }
  addEventListener('pointermove', e => {
    if (!presenting) return;
    if (ptools.laser) { laserD.style.left = e.clientX + 'px'; laserD.style.top = e.clientY + 'px'; }
    if (ptools.spot) spotD.style.setProperty('--x', e.clientX + 'px'), spotD.style.setProperty('--y', e.clientY + 'px');
    if (ptools.pen && penLast && e.buttons) { const g = penC.getContext('2d'), d = devicePixelRatio; g.strokeStyle = '#ff5a4e'; g.lineWidth = 4 * d; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(penLast[0] * d, penLast[1] * d); g.lineTo(e.clientX * d, e.clientY * d); g.stroke(); penLast = [e.clientX, e.clientY]; penDirty = true; }
  }, true);
  penC.addEventListener('pointerdown', e => { if (!ptools.pen) return; e.preventDefault(); penLast = [e.clientX, e.clientY]; penY = scrollY; });
  addEventListener('pointerup', () => { penLast = null; }, true);
  addEventListener('scroll', () => { if (penDirty && !ptools.pen && Math.abs(scrollY - penY) > 40) penClear(); }, { passive: true });
  addEventListener('wheel', e => { if (ptools.pen) e.preventDefault(); }, { passive: false });

  /* ---------- en direct : suivre le présentateur (capacité « room ») ---------- */
  let liveOn = false, following = null, lastPlace = '', placeT = 0;
  function myPlace() {
    const cy = innerHeight / 2, sec = [...app.children].find(s_ => { const r = s_.getBoundingClientRect(); return r.top <= cy && r.bottom >= cy && s_.offsetHeight; }); if (!sec) return null;
    const r = sec.getBoundingClientRect(); return { page: sec.id, pos: Math.round(Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight))) * 1000) / 1000 };
  }
  function sendPlace(force) {
    if (!room) return; const p_ = myPlace(); if (!p_) return; const k = p_.page + ':' + p_.pos + ':' + liveOn;
    if (!force && k === lastPlace) return; lastPlace = k;
    room.presence({ page: p_.page, pos: p_.pos, live: liveOn || null }).catch(() => { });
  }
  addEventListener('scroll', () => { if (!room) return; clearTimeout(placeT); placeT = setTimeout(sendPlace, liveOn ? 120 : 600); }, { passive: true });
  function setLive(v) { liveOn = !!v; sendPlace(true); presTool('none'); status(liveOn ? 'En direct : les participants peuvent suivre votre défilement' : 'Diffusion arrêtée', 'ok'); }
  function goPlace(pr) {
    if (!pr || !pr.page) return; const sec = document.getElementById(pr.page); if (!sec) return;
    const y = sec.getBoundingClientRect().top + scrollY + (pr.pos || 0) * Math.max(0, sec.offsetHeight - innerHeight);
    if (Math.abs(scrollY - y) > 4) scrollTo({ top: y, behavior: Math.abs(scrollY - y) > innerHeight * 2 ? 'auto' : 'smooth' });
  }
  function follow(peer) {
    following = peer ? peer.peer : null;
    if (room) room.presence({ follow: peer ? { of: peer.peer } : null }).catch(() => { });
    if (peer) goPlace(peer.presence); liveUI();
  }
  let peersNow = [];
  function liveUI() {
    const host = peersNow.find(x => !x.isMe && x.presence && x.presence.live);
    const n = peersNow.filter(x => !x.isMe).length;
    liveB.hidden = on || presenting || !(host || following);
    document.getElementById('ed-live-t').textContent = host ? `Présentation en direct · ${n + 1} connecté${n ? 's' : ''}` : 'Présentation terminée';
    document.getElementById('ed-live-f').textContent = following ? 'Ne plus suivre' : 'Suivre';
    const lb = document.getElementById('ed-livebtn'); if (lb) lb.hidden = !room;
  }
  liveB.addEventListener('click', e => { if (e.target.id !== 'ed-live-f') return; if (following) follow(null); else follow(peersNow.find(x => !x.isMe && x.presence && x.presence.live) || null); });
  async function roomBoot() {
    if (!room) return;
    room.onPeers(ch => {
      peersNow = ch.peers.slice();
      if (following) { const t = peersNow.find(x => x.peer === following); if (!t) following = null; else goPlace(t.presence); }
      liveUI();
    });
    if ('onFollow' in room) room.onFollow(t => follow(t));
    sendPlace(true); liveUI();
  }
  addEventListener('keydown', e => { if (following && e.key === 'Escape') { e.preventDefault(); follow(null); } });

  function setPresent(v) {
    if (v) {
      if (editing) stopText(); select(null); on = false; preview = false; presenting = true; document.body.classList.add('ed-presenting'); document.querySelectorAll('.ed-step-on').forEach(x => x.classList.remove('ed-step-on'));
      document.body.classList.remove('admin', 'ed-on'); bar.hidden = true; insp.hidden = true; left.hidden = true; pbar.hidden = true; present.hidden = false; paint();
      presT0 = Date.now(); clearInterval(presTimer);
      presTimer = setInterval(() => { const s = Math.floor((Date.now() - presT0) / 1000); document.getElementById('ed-pr-time').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
      presenterNotes(); document.documentElement.requestFullscreen?.().catch(() => { }); liveUI();
    } else { document.body.classList.remove('ed-presenting'); ['laser', 'spot', 'pen'].forEach(x => { ptools[x] = false; }); ptools.black = false; [laserD, spotD, blackD].forEach(x => x.hidden = true); penClear(); penC.hidden = true; document.body.classList.remove('ed-tool'); if (liveOn) setLive(false); presenting = false; clearInterval(presTimer); present.hidden = true; if (document.fullscreenElement) document.exitFullscreen?.(); enter(); }
  }
  addEventListener('scroll', () => { if (presenting) presenterNotes(); }, { passive: true });

  /* ---------- actions de la barre ---------- */
  async function act(a) {
    if (a !== 'toolsmenu') { const tm = document.getElementById('ed-toolsmenu'); if (tm) tm.hidden = true; }
    switch (a) {
      case 'toolsmenu': { const m = document.getElementById('ed-toolsmenu'); m.hidden = !m.hidden; document.getElementById('ed-addmenu').hidden = true; return; }
      case 'qc': return qcBox();
      case 'settings': return settingsBox();
      case 'paths': return pathsBox();
      case 'proof': return proofBox();
      case 'overview': return overview();
      case 'month': return monthBox();
      case 'mail': return mailBox();
      case 'deck': return deckBox();
      case 'alertsbox': return alertsBox();
      case 'peaks': return peaksBox();
      case 'curveimg': return curveImage('png');
      case 'images': return imagesBox();
      case 'histcsv': return histCsv();
      case 'recolor': return recolorBox();
      case 'slim': return slimBox();
      case 'docinfo': return docInfo();
      case 'gloss': return glossBox();
      case 'vars': return varsBox();
      case 'rulers': rulersOn = !rulersOn; return guidesDraw();
      case 'cols': colsOn = !colsOn; colsDraw(); return status(colsOn ? 'Grille de 12 colonnes : les éléments s’alignent sur les colonnes (K pour masquer)' : '', 'ok');
      case 'device': return deviceBox();
      case 'typo': return typoAll();
      case 'kiosk': return kioskBox();
      case 'unkiosk': return kioskStop();
      case 'texts': return textsBox();
      case 'focuspage': return focusBox();
      case 'live': return setLive(!liveOn);
      case 'laser': case 'spot': case 'pen': case 'black': return presTool(a);
      case 'penclear': return penClear();
      case 'cmdk': return cmdk();
      case 'translate': return trBox();
      case 'lib': return libBox();
      case 'import': return importBox();
      case 'track': trackOn = !trackOn; applyAll(); return status(trackOn ? `Suivi : ${Object.keys(E.el).length} élément(s) du rapport modifié(s) (orange), ${E.add.length} ajouté(s) (vert)` : '', 'ok');
      case 'left': left.hidden = !left.hidden; leftPanel(); return;
      case 'addmenu': { const m = document.getElementById('ed-addmenu'); m.hidden = !m.hidden; return; }
      case 'undo': return doUndo();
      case 'redo': return doRedo();
      case 'find': return findBox();
      case 'grid': gridOn = !gridOn; gridOv.hidden = !gridOn; document.getElementById('ed-gridb').classList.toggle('on', gridOn); gridOv.style.backgroundSize = `${remPx() * 2}px ${remPx() * 2}px, ${remPx() * 10}px ${remPx() * 10}px`; return;
      case 'theme': return themeBox();
      case 'charte': return charteBox();
      case 'history': return historyBox();
      case 'preview': return setPreview(true);
      case 'unpreview': return setPreview(false);
      case 'present': return setPresent(true);
      case 'unpresent': return setPresent(false);
      case 'help': return help();
      case 'save': return save();
      case 'export-json': return exportJSON();
      case 'export-html': return exportHTML();
      case 'quit': return exit();
    }
  }
  async function addFromMenu(kind) {
    document.getElementById('ed-addmenu').hidden = true;
    let extra = {};
    if (kind === 'ai_insight' || kind === 'ai_titles') return aiCompose(kind === 'ai_titles' ? 'titles' : 'insight');
    if (kind === 'ai_chart') return aiChart();
    if (kind === 'ai_summary') return aiSummary();
    if (kind === 'media') { const src = await mediaBox(); if (!src) return; extra.src = src; kind = 'image'; }
    else if (kind === 'image') { const src = await pickImage(); if (!src) return; extra.src = src; }
    if (kind === 'video') { const src = await pickVideo(); if (!src) return; extra.src = src; }
    if (kind === 'lib') return libBox();
    if (kind === 'draw') return drawStart();
    if (kind === 'postshot') return postFromShot();
    if (kind === 'qr') { const u = await ask('Adresse du QR code', 'https://'); if (!u || u === 'https://') return; const svg = await makeQR(u); if (!svg) return; Object.assign(extra, { url: u, svg }); }
    snapshot(); const a = addBlock(kind, extra); if (!a) { undo.pop(); return; }
    changed('Ajouté'); select(addEl(a.id));
    if (kind === 'chart' || kind === 'timeline' || kind === 'accordion' || kind === 'tabs') openData(addEl(a.id));
    if (kind === 'hotspot') { const src = await pickImage(); if (src) { snapshot(); addOf(addEl(a.id)).src = src; changed('Image à points : « + Placer un point » dans l’inspecteur'); } }
    if (kind === 'carousel') { const src = await pickImage(); if (src) { snapshot(); addOf(addEl(a.id)).items = [{ src, cap: '' }]; changed(); } }
  }
  bar.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) { e.preventDefault(); act(b.dataset.a); return; } const ad = e.target.closest('[data-add]'); if (ad) addFromMenu(ad.dataset.add); });
  [pbar, present].forEach(x => x.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) act(b.dataset.a); }));
  left.addEventListener('click', e => { const b = e.target.closest('[data-a="left"], [data-a="import"]'); if (b) act(b.dataset.a); });
  addEventListener('scroll', () => { if (on && !left.hidden) leftPanel(); if (on && !sel()) inspect(); }, { passive: true });

  /* ---------- souris : survol, sélection, déplacement, poignées, repères ---------- */
  let drag = null;
  function snapTargets(el) {
    const sec = sectionOf(el), par = el.parentElement, xs = [], ys = [];
    const pr = par.getBoundingClientRect(); xs.push(pr.left, (pr.left + pr.right) / 2, pr.right); ys.push(Math.max(pr.top, 0), (Math.max(pr.top, 0) + Math.min(pr.bottom, innerHeight)) / 2);
    if (par === sec) xs.push(pr.left + 6 * remPx(), pr.right - 6 * remPx());
    if (sec && colsOn) { const sr = sec.getBoundingClientRect(), rp = remPx(), mg = 6 * rp, gw = (sr.width - 2 * mg - 11 * 2 * rp) / 12; for (let i = 0; i < 12; i++) { const x = sr.left + mg + i * (gw + 2 * rp); xs.push(x, x + gw); } }
    if (sec && E.guides[sec.id]) { const sr = sec.getBoundingClientRect(), rp = remPx(); (E.guides[sec.id].x || []).forEach(x => xs.push(sr.left + x * rp)); (E.guides[sec.id].y || []).forEach(y => ys.push(sr.top + y * rp)); }
    if (sec) [...sec.children].flatMap(c => [c, ...c.children]).filter(n => !n.matches('[data-ed-ui], .ed-add, script, style') && !n.contains(el) && !el.contains(n)).slice(0, 120).forEach(n => { const r = n.getBoundingClientRect(); if (r.width < 24 || r.height < 12 || r.bottom < 0 || r.top > innerHeight || r.width > innerWidth * .96) return; xs.push(r.left, r.right); ys.push(r.top, r.bottom); });
    (sec ? sec.querySelectorAll('.ed-add') : []).forEach(n => { if (sels.includes(n)) return; const r = n.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; xs.push(r.left, (r.left + r.right) / 2, r.right); ys.push(r.top, (r.top + r.bottom) / 2, r.bottom); });
    return { xs, ys, par: pr };
  }
  function snapDelta(r, T, dx, dy) {
    if (gridOn) { const g = remPx() * 2; const nx = Math.round((r.left + dx - T.par.left) / g) * g + T.par.left, ny = Math.round((r.top + dy - T.par.top) / g) * g + T.par.top; guideX.style.display = guideY.style.display = 'none'; return [nx - r.left, ny - r.top]; }
    const th = 6; let bx = null, by = null;
    for (const cand of [r.left + dx, r.left + r.width / 2 + dx, r.right + dx]) for (const x of T.xs) { const d = x - cand; if (Math.abs(d) < th && (bx === null || Math.abs(d) < Math.abs(bx.d))) bx = { d, x }; }
    for (const cand of [r.top + dy, r.top + r.height / 2 + dy, r.bottom + dy]) for (const y of T.ys) { const d = y - cand; if (Math.abs(d) < th && (by === null || Math.abs(d) < Math.abs(by.d))) by = { d, y }; }
    guideX.style.display = bx ? 'block' : 'none'; if (bx) guideX.style.left = bx.x + 'px';
    guideY.style.display = by ? 'block' : 'none'; if (by) guideY.style.top = by.y + 'px';
    return [dx + (bx ? bx.d : 0), dy + (by ? by.d : 0)];
  }
  addEventListener('pointermove', e => {
    if (!on) return;
    if (drag) {
      const d = drag; let dxp = e.clientX - d.x0, dyp = e.clientY - d.y0;
      if (Math.abs(dxp) + Math.abs(dyp) > 3) d.moved = true;
      if (!d.moved) return;
      if (d.kind === 'move') {
        if (!e.ctrlKey) { const r0 = d.items.length === 1 ? d.items[0].r : d.bbox; [dxp, dyp] = snapDelta(r0, d.snap, dxp, dyp); } else guideX.style.display = guideY.style.display = 'none';
        d.dxp = dxp; d.dyp = dyp;
        d.items.forEach(it => { const dx = dxp / it.up, dy = dyp / it.up; if (it.add) { it.el.style.left = (it.x + dx) + it.u; it.el.style.top = (it.y + dy) + it.u; } else it.el.style.translate = `${it.tx + dx}${it.u} ${it.ty + dy}${it.u}`; });
      } else if (d.kind === 'rot') {
        let ang = Math.atan2(e.clientY - d.cy, e.clientX - d.cx) * 180 / Math.PI + 90;
        if (e.shiftKey) ang = Math.round(ang / 15) * 15;
        d.ang = Math.round(ang); d.el.style.rotate = d.ang + 'deg';
      } else {
        const dx = dxp / d.up, dy = dyp / d.up, w = Math.max(1, d.w + (d.h_ !== 's' ? dx : 0)), h = Math.max(.3, d.h + (d.h_ !== 'e' ? dy : 0));
        d.nw = w; d.nh = d.ratio && d.h_ === 'se' && !e.shiftKey ? w * d.ratio : h;
        if (d.h_ !== 's') d.el.style.width = w + d.u;
        if (d.h_ !== 'e') d.el.style.height = d.nh + d.u;
      }
      paint(); return;
    }
    const t = selectable(e.target); if (t !== hovEl) { hovEl = t; paint(); }
  }, true);
  addEventListener('pointerdown', e => {
    if (!on || e.button !== 0) return;
    if (hsPlace) { const hn = addEl(hsPlace), im = hn && hn.querySelector('img'); if (im && im.contains(e.target) || (hn && hn.contains(e.target))) { e.preventDefault(); e.stopPropagation(); const r = (im || hn).getBoundingClientRect(), a_ = addOf(hn); snapshot(); a_.pts = (a_.pts || []).concat({ x: r2((e.clientX - r.left) / r.width * 100), y: r2((e.clientY - r.top) / r.height * 100), t: 'Point ' + ((a_.pts || []).length + 1) }); hsPlace = null; document.body.classList.remove('ed-hsplace'); changed('Point placé : écrivez son texte dans l’inspecteur'); select(addEl(a_.id)); return; } hsPlace = null; document.body.classList.remove('ed-hsplace'); }
    if (!e.target.closest('.ed-dd')) ['ed-addmenu', 'ed-toolsmenu'].forEach(i => { const m = document.getElementById(i); if (m) m.hidden = true; });
    const handle = e.target.closest('.ed-h, .ed-rot');
    if (e.target.closest('[data-ed-ui]') && !handle) return;
    if (editing && editing.contains(e.target)) return;
    if (editing) stopText();
    const s = sel();
    if (handle && s) {
      e.preventDefault(); e.stopPropagation();
      if (s.dataset.edLock) { status('Élément verrouillé', 'warn'); return; }
      const up = unitPx(s), r = s.getBoundingClientRect(), a = isAdd(s) && addOf(s);
      if (handle.classList.contains('ed-rot')) { drag = { kind: 'rot', el: s, cx: r.left + r.width / 2, cy: r.top + r.height / 2, x0: e.clientX, y0: e.clientY }; return; }
      drag = { kind: 'size', h_: handle.dataset.h, el: s, up, u: a ? (a.u || 'rem') : unitOf(s), w: r.width / up, h: r.height / up, x0: e.clientX, y0: e.clientY, ratio: a && (a.kind === 'image' || a.kind === 'icon' || a.kind === 'qr') ? r.height / r.width : 0 };
      return;
    }
    let t = selectable(e.target);
    if (!t) { if (app.contains(e.target)) { e.preventDefault(); e.stopPropagation(); select(null); } return; }
    e.preventDefault(); e.stopPropagation();
    if (e.shiftKey) { groupOf(t).forEach(x => select(x, true)); return; }
    if (e.altKey) { if (s && s.parentElement && !s.parentElement.matches('section') && s.contains(t)) t = s.parentElement; select(t); }
    else if (!sels.includes(t)) { const g = groupOf(t); select(t); if (g.length > 1) { sels = g; paint(); inspect(); } }
    if (!sel() || sels.some(el => el.dataset.edLock)) return;
    const rs = sels.map(el => el.getBoundingClientRect());
    drag = { kind: 'move', x0: e.clientX, y0: e.clientY, snap: snapTargets(sel()), bbox: { left: Math.min(...rs.map(r => r.left)), top: Math.min(...rs.map(r => r.top)), right: Math.max(...rs.map(r => r.right)), bottom: Math.max(...rs.map(r => r.bottom)), get width() { return this.right - this.left; }, get height() { return this.bottom - this.top; } }, items: sels.map((el, i) => {
      const up = unitPx(el), r = rs[i];
      if (isAdd(el)) { const a = addOf(el); return { el, add: true, x: a.x, y: a.y, up, u: a.u || 'rem', r }; }
      const pt = patchOf(el, false) || {}; return { el, up, u: pt.u || unitOf(el), tx: pt.tx || 0, ty: pt.ty || 0, r };
    }) };
  }, true);
  addEventListener('pointerup', () => {
    if (!on || !drag) return;
    const d = drag; drag = null; guideX.style.display = guideY.style.display = 'none';
    if (!d.moved) return;
    snapshot();
    if (d.kind === 'move') d.items.forEach(it => { const dx = d.dxp / it.up, dy = d.dyp / it.up; if (it.add) { const a = addOf(it.el); a.x = r2(it.x + dx); a.y = r2(it.y + dy); } else { const pt = patchOf(it.el); pt.u = it.u; pt.tx = r2(it.tx + dx); pt.ty = r2(it.ty + dy); } });
    else if (d.kind === 'rot') { const pt = patchOf(d.el); pt.rot = d.ang; }
    else { const pt = patchOf(d.el); if (d.h_ !== 's') pt.w = r2(d.nw); if (d.h_ !== 'e') pt.h = r2(d.nh); if (!isAdd(d.el)) pt.u = d.u; }
    changed();
  }, true);
  addEventListener('click', e => { if (on && !e.target.closest('[data-ed-ui]') && (app.contains(e.target) || fixedL.contains(e.target)) && !(editing && editing.contains(e.target))) { e.preventDefault(); e.stopPropagation(); } }, true);
  addEventListener('dblclick', e => { if (!on || e.target.closest('[data-ed-ui]')) return; const t = selectable(e.target); if (t) { e.preventDefault(); startText(t); } }, true);
  addEventListener('paste', e => { if (!editing) return; e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); }, true);
  addEventListener('keydown', e => {
    if (!drawC.hidden && (e.key === 'Enter' || e.key === 'Escape')) { e.preventDefault(); e.stopImmediatePropagation(); drawEnd(e.key === 'Enter'); return; }
    if (e.key === 'Alt' && on) { altDown = true; measure(); }
    if (!cmdBox.hidden) { cmdKey(e); return; }
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'k' || e.key === 'K') && (on || E.set.search !== false)) { e.preventDefault(); e.stopImmediatePropagation(); cmdk(); return; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) { e.preventDefault(); on || preview || presenting ? exit() : askCode(); return; }
    if (presenting && !e.ctrlKey && !e.metaKey && !e.altKey && stepKey(e)) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (presenting && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target.matches && e.target.matches('input, textarea'))) { const m_ = { l: 'laser', s: 'spot', d: 'pen', b: 'black', c: 'penclear' }[e.key.toLowerCase()]; if (m_) { e.preventDefault(); e.stopImmediatePropagation(); act(m_); return; } }
    if (presenting && e.key === 'Escape') { if (ptools.laser || ptools.spot || ptools.pen || ptools.black) { ['laser', 'spot', 'pen', 'black'].forEach(x => { if (ptools[x]) presTool(x); }); return; } setPresent(false); return; }
    if (!on) return;
    if (!modal.hidden) { if (e.key === 'Escape') closeModal(); if (!modal.contains(e.target)) e.stopImmediatePropagation(); return; }
    if (editing) { if (e.key === 'Escape') { e.preventDefault(); stopText(); } e.stopImmediatePropagation(); return; }
    if (e.target.matches && e.target.matches('input, select, textarea')) { e.stopImmediatePropagation(); return; }
    const mod = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
    if (mod && key === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); }
    else if (mod && key === 's') { e.preventDefault(); save(); }
    else if (mod && key === 'c') { e.preventDefault(); copy(); }
    else if (mod && key === 'v') { e.preventDefault(); paste(); }
    else if (mod && key === 'd') { e.preventDefault(); duplicate(); }
    else if (mod && key === 'f') { e.preventDefault(); findBox(); }
    else if (mod && key === 'g') { e.preventDefault(); group(!e.shiftKey); }
    else if (mod && key === 'a') { e.preventDefault(); const sec = curSection(); if (sec) { sels = [...sec.querySelectorAll('.ed-add')]; select(sels[sels.length - 1] || null, false); sels = [...sec.querySelectorAll('.ed-add')]; paint(); inspect(); } }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && sels.length) { e.preventDefault(); removeSel(); }
    else if (e.key === 'Escape') select(null);
    else if (e.key === 'Enter' && sel()) { e.preventDefault(); startText(sel()); }
    else if (e.key === '[' || e.key === ']') zstep(e.key === ']' ? 1 : -1);
    else if (key === 'p') act('left');
    else if (key === 'g') act('grid');
    else if (key === 'o') act('overview');
    else if (key === 'r' && !mod) act('rulers');
    else if (key === 'k' && !mod) act('cols');
    else if (e.key === '?') help();
    else if (sels.length && e.key.startsWith('Arrow')) {
      e.preventDefault();
      const st_ = e.shiftKey ? 1 : .2, dx = e.key === 'ArrowLeft' ? -st_ : e.key === 'ArrowRight' ? st_ : 0, dy = e.key === 'ArrowUp' ? -st_ : e.key === 'ArrowDown' ? st_ : 0;
      snapshot();
      sels.forEach(el => { const k = unitOf(el) === 'px' ? 10 : 1; if (isAdd(el)) { const a = addOf(el); a.x = r2(a.x + dx * k); a.y = r2(a.y + dy * k); } else { const pt = patchOf(el); pt.tx = r2((pt.tx || 0) + dx * k); pt.ty = r2((pt.ty || 0) + dy * k); } });
      changed();
    }
    e.stopImmediatePropagation();
  }, true);

  /* ---------- accès admin ---------- */
  function askCode() { login.hidden = false; document.getElementById('ed-err').textContent = ''; const i = document.getElementById('ed-code'); i.value = ''; setTimeout(() => i.focus(), 30); }
  lock.onclick = askCode;
  if (window.__ED_PREVIEW) lock.hidden = true;
  document.getElementById('ed-cancel').onclick = () => { login.hidden = true; };
  login.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    if (sha256(document.getElementById('ed-code').value) === HASH) { login.hidden = true; store.sset('lvmh-admin', '1'); enter(); }
    else document.getElementById('ed-err').textContent = 'Code incorrect.';
  });
  function enter() {
    on = true; preview = false; presenting = false; document.body.classList.add('admin', 'ed-on'); bar.hidden = false; pbar.hidden = true; present.hidden = true; lock.hidden = true; insp.hidden = false;
    bar.classList.toggle('art', mode === 'artifact');
    const d = store.get(KEY);
    if (d) { try { const dj = JSON.parse(d); if (dj.updated && dj.updated !== E.updated && (!E.updated || dj.updated > E.updated)) banner.hidden = false; } catch (e) { } }
    applyAll();
    status(mode === 'artifact' ? 'Enregistrez pour publier les modifications à tous les lecteurs' : 'Fichier local : les modifications restent dans ce navigateur');
  }
  function setPreview(v) {
    if (v) { if (editing) stopText(); select(null); on = false; preview = true; document.body.classList.remove('admin', 'ed-on'); bar.hidden = true; insp.hidden = true; left.hidden = true; pbar.hidden = false; gridOv.hidden = true; applyAll(); }
    else { gridOv.hidden = !gridOn; enter(); }
  }
  function exit() {
    if (editing) stopText();
    on = false; preview = false; presenting = false; clearInterval(presTimer); select(null); hovEl = null; paint();
    document.body.classList.remove('admin', 'ed-on'); [bar, pbar, present, insp, left, banner, gridOv].forEach(x => x.hidden = true); lock.hidden = false;
    store.sset('lvmh-admin', ''); applyAll();
  }
  document.getElementById('ed-restore').onclick = () => { try { snapshot(); E = norm(JSON.parse(store.get(KEY))); dirty = true; applyAll(); } catch (e) { } banner.hidden = true; status('Brouillon restauré : pensez à enregistrer', 'warn'); };
  document.getElementById('ed-discard').onclick = () => { store.del(KEY); banner.hidden = true; };
  addEventListener('beforeunload', e => { if (on && dirty && mode === 'artifact') { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- démarrage ---------- */
  function aiMenu() { const g = [...document.querySelectorAll('#ed-addmenu .ed-mg')].find(x => x.querySelector('[data-add="ai_insight"]')); if (g) g.hidden = !sampleFn; }
  aiMenu();
  applyAll();
  (async () => {
    let fromFile = false;
    if (/^https?:$/.test(location.protocol) && !window.__ED_PREVIEW) try {
      const r = await fetch('edits.json', { cache: 'no-store' });
      if (r.ok) { const j = await r.json(); if (j && j.v) { E = norm(j); fromFile = true; applyAll(); } }
    } catch (e) { }
    if (!fromFile && location.protocol === 'file:') { const d = store.get(KEY); if (d) { try { E = norm(JSON.parse(d)); applyAll(); } catch (e) { } } }
    introShow();
    if (window.claude && window.claude.use) {
      try {
        artifact = await window.claude.use('artifact');
        if (artifact) { mode = 'artifact'; bar.classList.add('art'); }
        assets = await window.claude.use('assets');
        downloads = await window.claude.use('downloads');
        if (!downloads) bar.querySelectorAll('.loc').forEach(b => { b.hidden = true; });
        [sampleFn, commentsNs, room] = await Promise.all([window.claude.use('sample').catch(() => null), window.claude.use('comments').catch(() => null), window.claude.use('room').catch(() => null)]);
        roomBoot();
        aiMenu(); askUI(); if (on) inspect();
      } catch (e) { }
    }
    if (store.sget('lvmh-admin') === '1' && !window.__ED_PREVIEW) enter();
  })();
  window.__editor5 = { get edits() { return E; }, applyAll, enter: () => enter(), presets, renderChart, tokens: TOKENS };
})();
