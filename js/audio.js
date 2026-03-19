import { sensor } from './sensor.js';
import { getZone } from './zones.js';
import { updateZoneDisplay } from './ui.js';

let _instrument = null;
let _running = false;
let _frameId = null;
let _audioStarted = false;

export async function startAudio() {
  if (!_audioStarted) {
    await Tone.start();
    _audioStarted = true;
  }

  if (Tone.context.state === 'suspended') {
    await Tone.context.resume();
  }
}

export async function stopAudio() {
  _running = false;
  if (_frameId) {
    cancelAnimationFrame(_frameId);
    _frameId = null;
  }

  if (_instrument) {
    _instrument.stop?.();
  }

  if (Tone.context.state === 'running') {
    await Tone.context.suspend();
  }
}

export async function setInstrument(instrumentModule) {
  if (_instrument) {
    _instrument.stop?.();
    _instrument.dispose?.();
  }

  _instrument = instrumentModule;
  _instrument.init?.();
}

export function getInstrument() {
  return _instrument;
}

function loop() {
  if (!_running) return;
  if (!_instrument) {
    _frameId = requestAnimationFrame(loop);
    return;
  }

  const zone = getZone(sensor.y);
  if (zone) {
    updateZoneDisplay(zone);
    _instrument.update?.(sensor, zone);
  }

  updateSensorBars();

  _frameId = requestAnimationFrame(loop);
}

export async function play() {
  await startAudio();
  _running = true;
  _frameId = requestAnimationFrame(loop);
  _instrument?.play?.();
}

export async function pause() {
  _running = false;
  if (_frameId) {
    cancelAnimationFrame(_frameId);
    _frameId = null;
  }
  _instrument?.pause?.();
  await Tone.context.suspend();
}

function updateSensorBars() {
  const barX = document.getElementById('bar-x');
  const barY = document.getElementById('bar-y');
  const barZ = document.getElementById('bar-z');

  if (barX) barX.style.width = sensorToPercent(sensor.x) + '%';
  if (barY) barY.style.width = sensorToPercent(sensor.y) + '%';
  if (barZ) barZ.style.width = sensorToPercent(sensor.z) + '%';
}

function sensorToPercent(value) {
  const clamped = Math.max(-10, Math.min(10, value));
  return ((clamped + 10) / 20) * 100;
}