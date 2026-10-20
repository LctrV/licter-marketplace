/* Vue présentateur Licter (skill creer-deck). Ne pas modifier dans un deck : réinsérer avec scripts/ajouter_presentateur.py.
   Touche P : ouvre la vue présentateur dans une fenêtre à part (deuxième écran), ou par-dessus le deck si les fenêtres
   sont bloquées. Maj + P : force l'affichage par-dessus le deck (répétition sur un seul écran).
   Lit dans chaque <section id> : <aside class="notes"> (notes orales) et data-duree="2" (minutes prévues). */
(() => {
  'use strict';
  if (window.__PRESENTATEUR__) return;

  /* ---------- aperçu : ce deck tourne dans une miniature de la vue présentateur ---------- */
  if ((window.name || '').indexOf('deck-apercu') === 0) {
    window.__PRESENTATEUR__ = { apercu: true };
    const st = document.createElement('style');
    st.textContent = '[data-ed-ui],#ed-lock,.pv-ui,section aside.notes{display:none!important}html,body{overflow:hidden!important}*{animation-play-state:paused!important}';
    (document.head || document.documentElement).appendChild(st);
    return;
  }

  /* notes masquées dans le deck ; <html class="imprimer-notes"> les affiche à l'impression (PDF avec notes) */
  const NST = document.createElement('style'); NST.id = 'pv-notes-style';
  NST.textContent = 'section aside.notes{display:none!important}@media print{html.imprimer-notes section aside.notes{display:block!important;position:static!important;margin-top:1.5em;padding-top:.8em;border-top:1px solid #999;font-size:14px;color:#333;background:#fff}}';
  (document.head || document.documentElement).appendChild(NST);

  /* ---------- lecture du deck ---------- */
  const snapshot = () => {
    const c = document.documentElement.cloneNode(true);
    c.querySelectorAll('[data-ed-ui], .pv-ui, #pv-style, #pv-notes-style').forEach(x => x.remove());
    return '<!doctype html>\n' + c.outerHTML;
  };
  let pristine = null;
  const sections = () => {
    const d = window.__DECK__;
    if (d && typeof d.ids === 'function') return d.ids().map(id => document.getElementById(id)).filter(Boolean);
    const root = document.querySelector('[data-deck]') || document.querySelector('main') || document.body;
    return Array.from(root.children).filter(e => e.tagName === 'SECTION' && e.id);
  };
  const currentId = () => {
    const d = window.__DECK__;
    if (d && typeof d.current === 'function') { try { const c = d.current(); if (c) return c; } catch (e) { } }
    const s = sections(); if (!s.length) return null;
    const act = s.find(x => x.classList.contains('active') || x.classList.contains('present'));
    if (act) return act.id;
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const hit = s.find(x => { const r = x.getBoundingClientRect(); return r.left <= cx && r.right >= cx && r.top <= cy && r.bottom >= cy; });
    return (hit || s[0]).id;
  };
  const goId = id => {
    const d = window.__DECK__;
    if (d && typeof d.go === 'function') return d.go(id);
    const el = document.getElementById(id); if (el) el.scrollIntoView({ block: 'start' });
  };
  const step = dir => {
    const d = window.__DECK__;
    if (d && typeof (dir > 0 ? d.next : d.prev) === 'function') return dir > 0 ? d.next() : d.prev();
    const ids = sections().map(s => s.id), i = ids.indexOf(currentId());
    const j = Math.max(0, Math.min(ids.length - 1, i + dir)); if (ids[j]) goId(ids[j]);
  };
  const info = sec => {
    if (!sec) return { titre: '', notes: '', duree: 0 };
    const n = sec.querySelector(':scope > aside.notes, :scope aside.notes');
    const h = sec.querySelector('h1, h2, h3');
    return {
      titre: (sec.dataset.titre || (h ? h.textContent : sec.id)).trim().replace(/\s+/g, ' '),
      notes: n ? n.innerHTML.trim() : '',
      duree: parseFloat(String(sec.dataset.duree || '0').replace(',', '.')) || 0
    };
  };

  /* ---------- style commun aux deux affichages ---------- */
  const CSS = `
  .pv{--bg:#0d1117;--pn:#161b22;--ln:#30363d;--tx:#e6edf3;--mu:#8b949e;--ac:#f97316;--ok:#3fb950;--wa:#d29922;--ko:#f85149;
      position:fixed;inset:0;z-index:2147483646;background:var(--bg);color:var(--tx);font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;
      display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;gap:14px;padding:14px;box-sizing:border-box}
  .pv *{box-sizing:border-box}
  .pv-top{grid-column:1/-1;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
  .pv-pos{font-weight:600}.pv-pos small{color:var(--mu);font-weight:400;margin-left:8px}
  .pv-sp{flex:1}
  .pv-tm{display:flex;gap:16px;align-items:baseline;font-variant-numeric:tabular-nums}
  .pv-tm b{font-size:26px;font-weight:600}.pv-tm span{color:var(--mu)}
  .pv-tm .warn{color:var(--wa)}.pv-tm .over{color:var(--ko)}.pv-tm .ok{color:var(--ok)}
  .pv-col{display:flex;flex-direction:column;gap:10px;min-height:0}
  .pv-lb{color:var(--mu);font-size:12px;text-transform:uppercase;letter-spacing:.06em}
  .pv-box{position:relative;background:#000;border:1px solid var(--ln);border-radius:8px;overflow:hidden;width:100%}
  .pv-box iframe{position:absolute;left:0;top:0;border:0;transform-origin:0 0;pointer-events:none;background:#fff}
  .pv-box .pv-fb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;text-align:center;font-size:20px;color:var(--mu)}
  .pv-next{opacity:.92}
  .pv-notes{flex:1;min-height:0;overflow:auto;background:var(--pn);border:1px solid var(--ln);border-radius:8px;padding:14px 16px;font-size:var(--nfs,22px);line-height:1.5}
  .pv-notes:empty::before{content:"Pas de note pour cette slide.";color:var(--mu)}
  .pv-notes p{margin:0 0 .6em}.pv-notes ul{margin:0 0 .6em;padding-left:1.2em}
  .pv-bar{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .pv button,.pv select{background:var(--pn);color:var(--tx);border:1px solid var(--ln);border-radius:6px;padding:7px 12px;font:inherit;cursor:pointer}
  .pv button:hover{border-color:var(--mu)}.pv button.on{background:var(--ac);border-color:var(--ac);color:#111}
  .pv select{max-width:280px}
  .pv-help{color:var(--mu);font-size:12px}
  .pv-prog{grid-column:1/-1;height:4px;background:var(--ln);border-radius:2px;overflow:hidden}.pv-prog i{display:block;height:100%;background:var(--ac);width:0}
  @media (max-width:760px){.pv{grid-template-columns:1fr;grid-template-rows:auto auto auto minmax(0,1fr) auto;overflow:auto}}
  .pv-noir{position:fixed;inset:0;background:#000;z-index:2147483647;cursor:none}`;

  const HTML = `
  <div class="pv-top">
    <div class="pv-pos" data-r="pos"></div><span class="pv-sp"></span>
    <div class="pv-tm"><span>Slide</span><b data-r="tslide">0:00</b><span data-r="tcible"></span></div>
    <div class="pv-tm"><span>Total</span><b data-r="ttotal">0:00</b><span data-r="tplan"></span></div>
    <div class="pv-tm"><span data-r="rythme"></span></div>
    <div class="pv-tm"><b data-r="heure"></b></div>
  </div>
  <div class="pv-col">
    <div class="pv-lb">Slide affichée</div>
    <div class="pv-box" data-r="bcur"><div class="pv-fb" data-r="fcur"></div></div>
  </div>
  <div class="pv-col">
    <div class="pv-lb">Slide suivante</div>
    <div class="pv-box pv-next" data-r="bnext"><div class="pv-fb" data-r="fnext"></div></div>
    <div class="pv-lb">Notes <button data-a="nmoins" title="Texte plus petit">A−</button> <button data-a="nplus" title="Texte plus grand">A+</button></div>
    <div class="pv-notes" data-r="notes"></div>
  </div>
  <div class="pv-prog"><i data-r="prog"></i></div>
  <div class="pv-bar">
    <button data-a="prev" title="← ou Page précédente">← Précédente</button>
    <button data-a="next" title="→, Espace ou Page suivante">Suivante →</button>
    <select data-r="liste" title="Aller à une slide"></select>
    <button data-a="pause" title="T">Pause</button>
    <button data-a="reset" title="R">Remettre à zéro</button>
    <button data-a="noir" title="B">Écran noir</button>
    <span class="pv-sp"></span>
    <span class="pv-help">← → Espace : naviguer · B : écran noir · T : pause · R : zéro · Échap : fermer</span>
    <button data-a="fermer">Fermer</button>
  </div>`;

  /* ---------- état ---------- */
  const S = { ui: null, win: null, doc: null, root: null, mode: null, cur: null, t0: 0, pausedAt: 0, slideT0: 0, nfs: 22, timer: 0, poll: 0, noir: null };
  try { S.nfs = parseInt(localStorage.getItem('pv-nfs'), 10) || 22; } catch (e) { }
  const fmt = s => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${x}` : `${m}:${x}`; };
  const now = () => S.pausedAt || Date.now();
  const R = k => S.root.querySelector(`[data-r="${k}"]`);

  /* ---------- miniatures (le deck lui-même, dans une iframe mise à l'échelle) ---------- */
  function mini(box, fb, name) {
    let f = box.querySelector('iframe');
    if (!f) {
      f = S.doc.createElement('iframe');
      f.name = name; f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true');
      try { f.srcdoc = pristine; } catch (e) { }
      box.appendChild(f);
      f.addEventListener('load', () => { f.dataset.ok = '1'; fit(); render(); });
    }
    return f;
  }
  function fit() {
    if (!S.root) return;
    const W = Math.max(640, window.innerWidth), H = Math.max(360, window.innerHeight);
    ['bcur', 'bnext'].forEach(k => {
      const box = R(k), f = box.querySelector('iframe'); if (!f) return;
      const w = box.clientWidth, sc = w / W;
      box.style.height = Math.round(H * sc) + 'px';
      f.style.width = W + 'px'; f.style.height = H + 'px'; f.style.transform = `scale(${sc})`;
    });
    if (S.mode === 'fenetre') {
      const cur = R('bcur'), col = cur.parentElement, max = col.clientHeight - 30;
      if (cur.clientHeight > max && max > 100) { const sc = max / H; cur.style.height = max + 'px'; cur.style.width = Math.round(W * sc) + 'px'; const f = cur.querySelector('iframe'); if (f) f.style.transform = `scale(${sc})`; }
    }
  }
  function showIn(box, fb, id, titre) {
    const f = box.querySelector('iframe');
    fb.textContent = titre || (id ? '' : 'Fin de la présentation');
    let ok = false;
    if (f && f.dataset.ok && id) { try { const w = f.contentWindow; if (w.__DECK__ && w.__DECK__.go) { w.__DECK__.go(id); ok = true; } else { const el = w.document.getElementById(id); if (el) { el.scrollIntoView({ block: 'start' }); ok = true; } } } catch (e) { } }
    if (f) f.style.visibility = ok ? 'visible' : 'hidden';
    fb.style.display = ok ? 'none' : 'flex';
  }

  /* ---------- rendu ---------- */
  function render() {
    if (!S.root) return;
    const secs = sections(), ids = secs.map(s => s.id), id = currentId(), i = Math.max(0, ids.indexOf(id));
    if (id !== S.cur) { S.cur = id; S.slideT0 = Date.now(); }
    const a = info(secs[i]), n = secs[i + 1] ? info(secs[i + 1]) : null;
    R('pos').innerHTML = `${i + 1} / ${ids.length}<small></small>`; R('pos').querySelector('small').textContent = a.titre;
    R('notes').innerHTML = a.notes; R('notes').style.setProperty('--nfs', S.nfs + 'px');
    R('prog').style.width = (ids.length > 1 ? i / (ids.length - 1) * 100 : 100) + '%';
    showIn(R('bcur'), R('fcur'), id, a.titre);
    showIn(R('bnext'), R('fnext'), n ? ids[i + 1] : null, n ? n.titre : '');
    const sel = R('liste');
    if (sel.options.length !== ids.length) sel.innerHTML = secs.map((s, k) => `<option value="${s.id}">${k + 1}. ${info(s).titre.replace(/[<&]/g, c => c === '<' ? '&lt;' : '&amp;').slice(0, 60)}</option>`).join('');
    sel.value = id;
    tick();
  }
  function tick() {
    if (!S.root) return;
    const secs = sections(), ids = secs.map(s => s.id), i = Math.max(0, ids.indexOf(S.cur));
    const tot = (now() - S.t0) / 1000, sl = (Date.now() - S.slideT0) / 1000;
    const durs = secs.map(s => info(s).duree * 60), plan = durs.reduce((x, y) => x + y, 0), cible = durs[i] || 0;
    const ts = R('tslide'); ts.textContent = fmt(sl); ts.className = cible ? (sl > cible ? 'over' : sl > cible * .8 ? 'warn' : '') : '';
    R('tcible').textContent = cible ? '/ ' + fmt(cible) : '';
    const tt = R('ttotal'); tt.textContent = fmt(tot); tt.className = plan && tot > plan ? 'over' : '';
    R('tplan').textContent = plan ? '/ ' + fmt(plan) : '';
    const r = R('rythme');
    if (plan) {
      const attendu = durs.slice(0, i).reduce((x, y) => x + y, 0) + Math.min(sl, cible || sl), ecart = tot - attendu;
      r.textContent = Math.abs(ecart) < 30 ? 'Dans les temps' : ecart > 0 ? `En retard de ${fmt(ecart)}` : `En avance de ${fmt(-ecart)}`;
      r.className = Math.abs(ecart) < 30 ? 'ok' : ecart > 0 ? 'over' : 'ok';
    } else r.textContent = '';
    R('heure').textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const pb = S.root.querySelector('[data-a="pause"]'); pb.textContent = S.pausedAt ? 'Reprendre' : 'Pause'; pb.classList.toggle('on', !!S.pausedAt);
    S.root.querySelector('[data-a="noir"]').classList.toggle('on', !!S.noir);
  }

  /* ---------- actions ---------- */
  function noir(v) {
    if (v === undefined) v = !S.noir;
    if (v && !S.noir) { S.noir = document.createElement('div'); S.noir.className = 'pv-noir pv-ui'; S.noir.addEventListener('click', () => noir(false)); document.body.appendChild(S.noir); }
    if (!v && S.noir) { S.noir.remove(); S.noir = null; }
    tick();
  }
  function act(a) {
    if (a === 'next') step(1);
    else if (a === 'prev') step(-1);
    else if (a === 'first') { const s = sections(); if (s[0]) goId(s[0].id); }
    else if (a === 'last') { const s = sections(); if (s.length) goId(s[s.length - 1].id); }
    else if (a === 'pause') { if (S.pausedAt) { S.t0 += Date.now() - S.pausedAt; S.pausedAt = 0; } else S.pausedAt = Date.now(); }
    else if (a === 'reset') { S.t0 = Date.now(); S.slideT0 = Date.now(); if (S.pausedAt) S.pausedAt = S.t0; }
    else if (a === 'noir') noir();
    else if (a === 'nplus' || a === 'nmoins') { S.nfs = Math.max(12, Math.min(48, S.nfs + (a === 'nplus' ? 2 : -2))); try { localStorage.setItem('pv-nfs', S.nfs); } catch (e) { } }
    else if (a === 'fermer') return fermer();
    setTimeout(render, 30);
  }
  function key(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target && e.target.closest && e.target.closest('select, input, textarea')) return;
    const k = e.key, m = {
      ArrowRight: 'next', ArrowDown: 'next', PageDown: 'next', ' ': 'next', Enter: 'next', ArrowLeft: 'prev', ArrowUp: 'prev', PageUp: 'prev',
      Home: 'first', End: 'last', b: 'noir', B: 'noir', '.': 'noir', t: 'pause', T: 'pause', r: 'reset', R: 'reset', Escape: 'fermer'
    }[k];
    if (!m) return;
    e.preventDefault(); e.stopPropagation();
    if (m === 'fermer' && S.noir) return noir(false);
    act(m);
  }
  function bind() {
    S.root.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) { e.preventDefault(); act(b.dataset.a); } });
    R('liste').addEventListener('change', e => { goId(e.target.value); setTimeout(render, 30); });
    S.root.ownerDocument.addEventListener('keydown', key, true);
    mini(R('bcur'), R('fcur'), 'deck-apercu-courante');
    mini(R('bnext'), R('fnext'), 'deck-apercu-suivante');
    S.timer = setInterval(tick, 500);
    S.poll = setInterval(() => { if (currentId() !== S.cur) render(); if (S.mode === 'fenetre' && S.win.closed) fermer(); }, 400);
    S.t0 = Date.now(); S.pausedAt = 0; S.slideT0 = Date.now(); S.cur = null;
    setTimeout(() => { fit(); render(); }, 0);
  }

  /* ---------- ouverture / fermeture ---------- */
  function ouvrir(force) {
    if (S.root) { if (S.mode === 'fenetre' && S.win && !S.win.closed) S.win.focus(); return; }
    if (pristine === null) pristine = snapshot();
    let w = null;
    if (force !== 'surcouche') { try { w = window.open('', 'deck-presentateur', 'popup=yes,width=1280,height=800'); } catch (e) { w = null; } }
    let usable = false;
    if (w) { try { usable = !!w.document; } catch (e) { usable = false; } }
    if (w && usable) {
      S.mode = 'fenetre'; S.win = w; S.doc = w.document;
      const d = S.doc;   /* construit par le DOM : aucune balise de fin de document dans ce script (inject.py s'y repère) */
      d.documentElement.lang = 'fr'; d.title = 'Vue présentateur · ' + (document.title || 'Deck');
      d.querySelectorAll('#pv-style').forEach(x => x.remove());
      if (!d.querySelector('meta[name="viewport"]')) { const mv = d.createElement('meta'); mv.name = 'viewport'; mv.content = 'width=device-width,initial-scale=1'; d.head.appendChild(mv); }
      const st = d.createElement('style'); st.id = 'pv-style'; st.textContent = 'html,body{margin:0;height:100%;background:#0d1117}' + CSS; d.head.appendChild(st);
      d.body.innerHTML = '<div class="pv" id="pv">' + HTML + '</div>';
      S.root = S.doc.getElementById('pv');
      w.addEventListener('resize', fit); w.addEventListener('beforeunload', () => setTimeout(() => { if (S.win && S.win.closed) fermer(); }, 50));
    } else {
      if (w) { try { w.close(); } catch (e) { } }
      S.mode = 'surcouche'; S.win = window; S.doc = document;
      if (!document.getElementById('pv-style')) { const st = document.createElement('style'); st.id = 'pv-style'; st.textContent = CSS; document.head.appendChild(st); }
      S.root = document.createElement('div'); S.root.className = 'pv pv-ui'; S.root.innerHTML = HTML; document.body.appendChild(S.root);
    }
    bind();
  }
  function fermer() {
    clearInterval(S.timer); clearInterval(S.poll);
    if (S.root) { try { S.root.ownerDocument.removeEventListener('keydown', key, true); } catch (e) { } }
    if (S.mode === 'fenetre') { try { if (!S.win.closed) S.win.close(); } catch (e) { } }
    else if (S.root) S.root.remove();
    S.root = null; S.doc = null; S.win = null; S.mode = null;
  }

  /* ---------- raccourci dans le deck ---------- */
  addEventListener('keydown', e => {
    if (e.key !== 'p' && e.key !== 'P') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const b = document.body.classList;
    if (b.contains('admin') || b.contains('ed-on') || b.contains('ed-presenting')) return;   /* éditeur Licter actif */
    if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return;
    if (S.root && S.mode === 'surcouche') return;
    e.preventDefault();
    ouvrir(e.shiftKey ? 'surcouche' : 'fenetre');
  });
  addEventListener('resize', () => { if (S.root) fit(); });
  addEventListener('deck:change', () => { if (S.root) render(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { pristine = snapshot(); });
  else pristine = snapshot();

  window.__PRESENTATEUR__ = { ouvrir: () => ouvrir('fenetre'), surcouche: () => ouvrir('surcouche'), fermer, etat: () => ({ mode: S.mode, courante: S.cur }) };
})();
