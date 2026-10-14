// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const fmtTime = s => `${Math.floor(s / 3600)}h ${Math.floor(s % 3600 / 60)}m ${s % 60}s`;

// Cards: [icon, label, key in data]
const cards = [
  ['🖥️', 'Container hostname', 'hostname'],
  ['👥', 'Visitors', '_visitors'],
  ['⏱️', 'Uptime', '_uptime'],
  ['🧠', 'Memory (RSS)', '_mem'],
  ['🟢', 'Node version', 'nodeVersion'],
  ['🐧', 'Platform', 'platform'],
  ['⚙️', 'CPU cores', 'cpuCores'],
  ['🌍', 'Environment', 'environment'],
  ['📨', 'Total requests', 'totalRequests'],
  ['🏷️', 'App version', 'version']
];

let visitors = 0;
const memHistory = [];   // last 20 memory readings for the chart

// ---------- Cards ----------
function renderCards(d) {
  d._visitors = visitors;
  d._uptime = fmtTime(d.uptimeSeconds);
  d._mem = d.memoryMB + ' MB';
  $('grid').replaceChildren();
  cards.forEach(([icon, label, key], i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = (i * 40) + 'ms';
    const ic = document.createElement('div'); ic.className = 'icon'; ic.textContent = icon;
    const lb = document.createElement('div'); lb.className = 'label'; lb.textContent = label;
    const vl = document.createElement('div'); vl.className = 'value'; vl.textContent = d[key];
    card.append(ic, lb, vl);
    $('grid').append(card);
  });
}

// ---------- Memory chart (plain SVG, no library) ----------
function renderChart() {
  const svg = $('chart');
  svg.replaceChildren();
  if (memHistory.length < 2) return;
  const W = 600, H = 160, pad = 14;
  const min = Math.min(...memHistory) - 2, max = Math.max(...memHistory) + 2;
  const pts = memHistory.map((v, i) => {
    const x = pad + i * (W - 2 * pad) / (memHistory.length - 1);
    const y = H - pad - (v - min) / (max - min) * (H - 2 * pad);
    return [x, y];
  });
  const ns = 'http://www.w3.org/2000/svg';
  const area = document.createElementNS(ns, 'polygon');
  area.setAttribute('points', [[pts[0][0], H - pad], ...pts, [pts[pts.length - 1][0], H - pad]].map(p => p.join(',')).join(' '));
  area.setAttribute('fill', 'rgba(15,98,254,.15)');
  const line = document.createElementNS(ns, 'polyline');
  line.setAttribute('points', pts.map(p => p.join(',')).join(' '));
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', '#0f62fe');
  line.setAttribute('stroke-width', '3');
  line.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(area, line);
}

// ---------- Load data from server ----------
async function load() {
  try {
    const [info, vis] = await Promise.all([
      fetch('/api/info').then(r => r.json()),
      fetch('/api/visit').then(r => r.json()),
      fetch('/health').then(r => r.json())
    ]);
    visitors = vis.visitors;
    memHistory.push(info.memoryMB);
    if (memHistory.length > 20) memHistory.shift();
    renderCards(info);
    renderChart();
    $('statusText').textContent = 'Healthy';
    $('status').className = 'badge';
  } catch (e) {
    $('statusText').textContent = 'Down';
    $('status').className = 'badge down';
  }
}

// ---------- Load test: 100 requests to /health ----------
async function loadTest() {
  const total = 100, batch = 10;
  let done = 0;
  const btn = $('loadBtn');
  btn.disabled = true;
  $('barFill').style.width = '0%';
  $('loadResult').textContent = 'Running…';
  const start = performance.now();
  try {
    for (let i = 0; i < total; i += batch) {
      await Promise.all(Array.from({ length: batch }, () => fetch('/health')));
      done += batch;
      $('barFill').style.width = (done / total * 100) + '%';
    }
    const secs = (performance.now() - start) / 1000;
    $('loadResult').textContent = `✅ ${total} requests in ${secs.toFixed(2)}s (~${Math.round(total / secs)} requests/sec)`;
  } catch (e) {
    $('loadResult').textContent = '❌ Load test failed';
  }
  btn.disabled = false;
  load();
}

// ---------- Buttons ----------
$('refreshBtn').onclick = load;
$('visitBtn').onclick = async () => { await fetch('/api/visit', { method: 'POST' }); load(); };
$('loadBtn').onclick = loadTest;

// Theme toggle (remembered in the browser)
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.dataset.theme = saved;
$('themeBtn').onclick = () => {
  const root = document.documentElement;
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
};

// ---------- Timers ----------
setInterval(() => { $('clock').textContent = new Date().toLocaleTimeString(); }, 1000);
setInterval(load, 5000);
load();
