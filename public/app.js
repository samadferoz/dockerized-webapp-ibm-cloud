const fmt = s => { const h=Math.floor(s/3600), m=Math.floor(s%3600/60); return `${h}h ${m}m ${s%60}s`; };
const cards = [
  ['Container hostname','hostname'], ['Visitors','_visitors'], ['Uptime','_uptime'],
  ['Memory (RSS)','_mem'], ['Node version','nodeVersion'], ['Platform','platform'],
  ['CPU cores','cpuCores'], ['Environment','environment'], ['Total requests','totalRequests'], ['App version','version']
];
let visitors = 0;

function render(d) {
  d._visitors = visitors; d._uptime = fmt(d.uptimeSeconds); d._mem = d.memoryMB + ' MB';
  const grid = document.getElementById('grid'); grid.innerHTML = '';
  cards.forEach(([label,key]) => {
    const el = document.createElement('div'); el.className = 'card';
    const l = document.createElement('div'); l.className = 'label'; l.textContent = label;
    const v = document.createElement('div'); v.className = 'value'; v.textContent = d[key];
    el.append(l, v); grid.append(el);
  });
}

async function load() {
  const badge = document.getElementById('status');
  try {
    const [info, vis, health] = await Promise.all([
      fetch('/api/info').then(r => r.json()),
      fetch('/api/visit').then(r => r.json()),
      fetch('/health').then(r => r.json())
    ]);
    visitors = vis.visitors;
    render(info);
    badge.textContent = 'Healthy'; badge.className = 'badge';
  } catch (e) {
    badge.textContent = 'Down'; badge.className = 'badge down';
  }
}

document.getElementById('refreshBtn').onclick = load;
document.getElementById('visitBtn').onclick = async () => {
  await fetch('/api/visit', { method: 'POST' }); load();
};
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
document.getElementById('themeBtn').onclick = () => {
  const r = document.documentElement;
  const next = r.dataset.theme === 'dark' ? 'light' : 'dark';
  r.dataset.theme = next;
  localStorage.setItem('theme', next);
};
setInterval(() => document.getElementById('clock').textContent = new Date().toLocaleTimeString(), 1000);
setInterval(load, 5000);
load();
