import { initSensor, stopSensor, sensor } from './sensor.js';
import { startGestures, stopGestures } from './gesture.js';
import { play as audioPlay, pause as audioPause, setInstrument } from './audio.js';
import * as Theremin from './instruments/theremin.js';
import * as Pluck from './instruments/pluck.js';
import * as Drums from './instruments/drums.js';
import * as Pad from './instruments/pad.js';

const INSTRUMENTS = {
  theremin: Theremin,
  pluck: Pluck,
  drums: Drums,
  pad: Pad
};

let _currentInstrument = 'theremin';
let _isPlaying = false;

const splash = document.getElementById('splash-screen');
const root = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');
const playBtn = document.getElementById('play-btn');
const permissionOverlay = document.getElementById('permission-overlay');
const permissionClose = document.getElementById('permission-close');
const permissionBtn = document.getElementById('permission-btn');
const instrumentCurrent = document.getElementById('instrument-current');
const instrumentDropdown = document.getElementById('instrument-dropdown');

setTimeout(() => {
  splash.classList.add('hidden');
  setTimeout(() => splash.style.display = 'none', 800);
}, 2500);

function updateFavicon(theme) {
  const isDark = theme === 'dark' ||
    (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const bg = isDark ? '%230f0c08' : '%23e4dada';
  const favicon = document.getElementById('favicon');
  favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='${bg}'/><text y='82' x='50' text-anchor='middle' font-size='80' font-family='serif' fill='%23ff6b4a'>𝄞</text></svg>`;
}

const saved = localStorage.getItem('theme');
if (saved) {
  root.setAttribute('data-theme', saved);
  toggleBtn.textContent = saved === 'dark' ? '☀' : '☾';
  updateFavicon(saved);
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  toggleBtn.textContent = prefersDark ? '☀' : '☾';
  updateFavicon(prefersDark ? 'dark' : 'light');
}

toggleBtn.onclick = () => {
  const current = root.getAttribute('data-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveCurrent = current || (prefersDark ? 'dark' : 'light');
  const next = effectiveCurrent === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  toggleBtn.textContent = next === 'dark' ? '☀' : '☾';
  updateFavicon(next);
};

permissionClose.onclick = () => {
  permissionOverlay.classList.add('hidden');
};

permissionBtn.onclick = async () => {
  await initSensor(
    () => permissionOverlay.classList.add('hidden'),
    () => {
      document.getElementById('permission-desc').textContent =
        'Motion access was denied. Please enable it in your browser settings.';
    }
  );
};

async function switchInstrument(name) {
  if (!INSTRUMENTS[name]) return;
  _currentInstrument = name;
  await setInstrument(INSTRUMENTS[name]);
  if (_isPlaying) {
    INSTRUMENTS[name].play?.();
  }
}

playBtn.onclick = async function () {
  if (!_isPlaying) {
    await initSensor(
      () => permissionOverlay.classList.add('hidden'),
      () => permissionOverlay.classList.remove('hidden')
    );
    await setInstrument(INSTRUMENTS[_currentInstrument]);
    await audioPlay();
    startGestures();
    _isPlaying = true;
    this.dataset.state = 'playing';
    document.getElementById('play-btn-icon').textContent = '⏸';
    document.getElementById('play-btn-label').textContent = 'Playing';
  } else {
    await audioPause();
    stopGestures();
    stopSensor();
    _isPlaying = false;
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
  btn.onclick = async function () {
    document.querySelectorAll('.instrument-option').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('instrument-current-icon').textContent =
      this.querySelector('.option-icon').textContent;
    document.getElementById('instrument-current-name').textContent =
      this.querySelector('.option-name').textContent;
    instrumentDropdown.classList.remove('open');
    instrumentCurrent.classList.remove('open');
    await switchInstrument(this.dataset.instrument);
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

document.addEventListener('visibilitychange', async () => {
  if (document.hidden && _isPlaying) {
    await audioPause();
    stopGestures();
  } else if (!document.hidden && _isPlaying) {
    await audioPlay();
    startGestures();
  }
});

export function updateZoneDisplay(zone) {
  if (!zone) return;
  document.getElementById('zone-note').textContent = zone.note;
  document.getElementById('zone-label').textContent = zone.personality?.name ?? '--';
  document.getElementById('zone-freq').textContent = zone.personality?.freq
    ? `${zone.personality.freq.toFixed(2)} Hz`
    : '--';
}