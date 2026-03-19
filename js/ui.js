const root = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');
const playBtn = document.getElementById('play-btn');
const permissionOverlay = document.getElementById('permission-overlay');
const permissionClose = document.getElementById('permission-close');
const instrumentCurrent = document.getElementById('instrument-current');
const instrumentDropdown = document.getElementById('instrument-dropdown');

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

instrumentCurrent.onclick = (e) => {
  e.stopPropagation();
  const isOpen = instrumentDropdown.classList.contains('open');
  instrumentDropdown.classList.toggle('open', !isOpen);
  instrumentCurrent.classList.toggle('open', !isOpen);
};

document.addEventListener('click', () => {
  instrumentDropdown.classList.remove('open');
  instrumentCurrent.classList.remove('open');
});

instrumentDropdown.addEventListener('click', (e) => e.stopPropagation());

document.querySelectorAll('.instrument-option').forEach(btn => {
  btn.onclick = function () {
    document.querySelectorAll('.instrument-option').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('instrument-current-icon').textContent =
      this.querySelector('.option-icon').textContent;
    document.getElementById('instrument-current-name').textContent =
      this.querySelector('.option-name').textContent;
    instrumentDropdown.classList.remove('open');
    instrumentCurrent.classList.remove('open');
  };
});

const sliders = [
  { id: 'fx-reverb', valId: 'fx-reverb-val' },
  { id: 'fx-sustain', valId: 'fx-sustain-val' },
  { id: 'fx-delay', valId: 'fx-delay-val' },
  { id: 'fx-filter', valId: 'fx-filter-val' },
];

sliders.forEach(({ id, valId }) => {
  const slider = document.getElementById(id);
  const valEl = document.getElementById(valId);
  slider.oninput = () => {
    valEl.textContent = slider.value + '%';
  };
});

export function updateZoneDisplay(zone) {
  if (!zone) return;
  const noteEl = document.getElementById('zone-note');
  const labelEl = document.getElementById('zone-label');
  const freqEl = document.getElementById('zone-freq');

  noteEl.textContent = zone.note;
  labelEl.textContent = zone.personality?.name ?? '--';
  freqEl.textContent = zone.personality?.freq
    ? `${zone.personality.freq.toFixed(2)} Hz`
    : '--';
}