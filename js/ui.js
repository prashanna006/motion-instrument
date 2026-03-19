const root = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');
const playBtn = document.getElementById('play-btn');
const permissionOverlay = document.getElementById('permission-overlay');
const permissionClose = document.getElementById('permission-close');

const saved = localStorage.getItem('theme');
if (saved) {
  root.setAttribute('data-theme', saved);
  toggleBtn.textContent = saved === 'dark' ? '☀' : '☾';
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  toggleBtn.textContent = prefersDark ? '☀' : '☾';
}

toggleBtn.onclick = () => {
  const current = root.getAttribute('data-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveCurrent = current || (prefersDark ? 'dark' : 'light');
  const next = effectiveCurrent === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  toggleBtn.textContent = next === 'dark' ? '☀' : '☾';
};

permissionClose.onclick = () => {
  permissionOverlay.classList.add('hidden');
};

playBtn.onclick = function () {
  const state = this.dataset.state;
  if (state === 'idle' || state === 'paused') {
    this.dataset.state = 'playing';
    document.getElementById('play-btn-icon').textContent = '⏸';
    document.getElementById('play-btn-label').textContent = 'Playing';
  } else {
    this.dataset.state = 'paused';
    document.getElementById('play-btn-icon').textContent = '▶';
    document.getElementById('play-btn-label').textContent = 'Play';
  }
};

document.querySelectorAll('.instrument-btn').forEach(btn => {
  btn.onclick = function () {
    document.querySelectorAll('.instrument-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  };
});