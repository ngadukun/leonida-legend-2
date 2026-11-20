// Leonida Legend — offline GTA VI trophy guide and tracker.
// Loads app/data/trophies.json (same origin, no network), renders the checklist,
// saves earned trophies in localStorage, and routes by hash:
//   #/            tracker with a guide open
//   #trophy-<id>  tracker with that trophy's guide open
//   #roadmap      roadmap to the Platinum
//   #watch        missable trophies and the pre-finale checklist
const KEY = 'leonida-legend-earned';
const DEFAULT_SELECTED = 17;

const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const detailEl = $('detail');
const emptyEl = $('empty');

let trophies = [];
let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
} catch {
  earned = new Set();
}
let selectedId = DEFAULT_SELECTED;

const filters = { q: '', tier: 'all', kind: 'all', hideEarned: false, spoilers: false };

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function isStoryHidden(t) {
  return filters.spoilers && t.kind === 'story' && !earned.has(t.id);
}

function visibleTrophies() {
  const q = filters.q.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.tier !== 'all' && t.grade !== filters.tier) return false;
    if (filters.kind !== 'all' && t.kind !== filters.kind) return false;
    if (filters.hideEarned && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderList() {
  const list = visibleTrophies();
  rowsEl.replaceChildren();
  emptyEl.hidden = list.length > 0;
  for (const t of list) {
    const li = document.createElement('li');
    li.className = 'row' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    if (isStoryHidden(t)) {
      li.classList.add('locked');
      const box = document.createElement('span');
      box.textContent = '🔒';
      const name = document.createElement('div');
      const strong = document.createElement('div');
      strong.className = 'row-name';
      strong.textContent = 'Hidden story trophy';
      const desc = document.createElement('div');
      desc.className = 'row-desc';
      desc.textContent = 'Spoilers off — earn it to reveal the name and description.';
      name.append(strong, desc);
      const grade = document.createElement('div');
      grade.className = 'row-grade';
      grade.textContent = gradeLabel(t);
      li.append(box, name, grade);
      rowsEl.append(li);
      continue;
    }
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderAll();
    });
    const mid = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'row-name';
    name.textContent = t.name;
    const desc = document.createElement('div');
    desc.className = 'row-desc';
    desc.textContent = t.description;
    const meta = document.createElement('div');
    meta.className = 'row-meta';
    const badge = document.createElement('span');
    badge.className = `badge ${t.grade}`;
    badge.textContent = t.grade;
    meta.append(badge);
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = t.kind;
    meta.append(tag);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag';
      flag.textContent = 'MISSABLE';
      meta.append(flag);
    }
    mid.append(name, desc, meta);
    const grade = document.createElement('div');
    grade.className = 'row-grade';
    grade.textContent = `#${t.id}`;
    li.append(box, mid, grade);
    li.addEventListener('click', () => {
      selectedId = t.id;
      renderAll();
      if (location.hash.startsWith('#trophy-')) history.replaceState(null, '', `#trophy-${t.id}`);
    });
    rowsEl.append(li);
  }
  $('list-hint').textContent = `${list.length} of ${trophies.length} trophies shown · tick one off and it stays ticked · click a row to open its guide`;
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId) ?? trophies[0];
  if (!t) {
    detailEl.textContent = '';
    return;
  }
  detailEl.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = t.name;
  detailEl.append(h);
  const meta = document.createElement('div');
  meta.className = 'meta-row';
  const badge = document.createElement('span');
  badge.className = `badge ${t.grade}`;
  badge.textContent = t.grade;
  meta.append(badge);
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = t.kind;
  meta.append(tag);
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag';
    flag.textContent = 'MISSABLE';
    meta.append(flag);
  }
  detailEl.append(meta);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official: “${t.description}”`;
  detailEl.append(official);
  if (t.missable) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    warn.textContent = 'Missable — do this while its window is open. See Watch-outs for the point of no return.';
    detailEl.append(warn);
  }
  const guideLabel = document.createElement('div');
  guideLabel.className = 'guide-label';
  guideLabel.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = t.guide;
  detailEl.append(guideLabel, guide);
  const sourcesLabel = document.createElement('div');
  sourcesLabel.className = 'sources-label';
  sourcesLabel.textContent = 'Sources';
  const sources = document.createElement('p');
  sources.className = 'sources';
  sources.textContent = t.sources.join(' · ');
  detailEl.append(sourcesLabel, sources);
}

function renderWatch() {
  const list = $('missable-list');
  list.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = `${t.name} — ${gradeLabel(t)}`;
    const span = document.createElement('span');
    span.textContent = t.guide;
    li.append(strong, span);
    list.append(li);
  }
  $('watch-count').textContent = `${trophies.filter((x) => x.missable).length} missable`;
}

function updateProgress() {
  const total = trophies.length;
  const got = earned.size;
  const pct = total ? Math.round((got / total) * 100) : 0;
  $('earned-count').textContent = `${got} of ${total} earned`;
  $('earned-pct').textContent = `${pct}% to Platinum`;
  $('bar-fill').style.width = `${pct}%`;
  const gold = trophies.filter((t) => t.grade === 'gold' && earned.has(t.id)).length;
  const silver = trophies.filter((t) => t.grade === 'silver' && earned.has(t.id)).length;
  const missLeft = trophies.filter((t) => t.missable && !earned.has(t.id)).length;
  $('stats-line').textContent = `Gold ${gold} of 2 · Silver ${silver} of 6 · Missables left ${missLeft}`;
}

function showView(name) {
  $('tracker-view').hidden = name !== 'tracker';
  $('roadmap-view').hidden = name !== 'roadmap';
  $('watch-view').hidden = name !== 'watch';
  $('controls').style.display = name === 'tracker' ? '' : 'none';
  $('tab-tracker').classList.toggle('active', name === 'tracker');
  $('tab-roadmap').classList.toggle('active', name === 'roadmap');
  $('tab-watch').classList.toggle('active', name === 'watch');
}

function route() {
  const hash = location.hash || '#/';
  const match = hash.match(/^#trophy-(\d+)$/);
  if (match) {
    const id = Number(match[1]);
    if (trophies.some((t) => t.id === id)) selectedId = id;
    showView('tracker');
  } else if (hash === '#roadmap') {
    showView('roadmap');
  } else if (hash === '#watch') {
    showView('watch');
  } else {
    selectedId = DEFAULT_SELECTED;
    showView('tracker');
  }
  renderAll();
  window.scrollTo(0, 0);
}

function renderAll() {
  renderList();
  renderDetail();
  updateProgress();
}

function wireControls() {
  $('q').addEventListener('input', (e) => {
    filters.q = e.target.value;
    renderList();
  });
  $('tier').addEventListener('change', (e) => {
    filters.tier = e.target.value;
    renderList();
  });
  $('kind').addEventListener('change', (e) => {
    filters.kind = e.target.value;
    renderList();
  });
  $('hide-earned').addEventListener('change', (e) => {
    filters.hideEarned = e.target.checked;
    renderList();
  });
  $('spoilers').addEventListener('change', (e) => {
    filters.spoilers = e.target.checked;
    renderList();
  });
  $('export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify([...earned].sort((a, b) => a - b), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-legend-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const ids = JSON.parse(await file.text());
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(ids.filter((id) => valid.has(id)));
      save();
      renderAll();
    } catch {
      // A bad import file changes nothing.
    }
    e.target.value = '';
  });
}

fetch('data/trophies.json')
  .then((response) => response.json())
  .then((doc) => {
    trophies = doc.trophies;
    wireControls();
    renderWatch();
    window.addEventListener('hashchange', route);
    route();
  });
