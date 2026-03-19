import { sensor } from './sensor.js';

const SHAKE_THRESHOLD = 15;
const FLICK_THRESHOLD = 10;
const FLIP_THRESHOLD = 8;
const COOLDOWN_MS = 350;

const _listeners = {
  shake: [],
  flick: [],
  flip: []
};

const _cooldowns = {
  shake: 0,
  flick: 0,
  flip: 0
};

let _prevX = 0;
let _prevY = 0;
let _prevZ = 0;
let _running = false;
let _frameId = null;

function magnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

function fire(gesture) {
  const now = Date.now();
  if (now - _cooldowns[gesture] < COOLDOWN_MS) return;
  _cooldowns[gesture] = now;
  _listeners[gesture].forEach(cb => cb());
}

function detect() {
  if (!_running) return;

  const dx = sensor.x - _prevX;
  const dy = sensor.y - _prevY;
  const dz = sensor.z - _prevZ;

  const delta = magnitude(dx, dy, dz);
  const gyroMag = magnitude(sensor.gx, sensor.gy, sensor.gz);

  if (delta > SHAKE_THRESHOLD) fire('shake');
  if (Math.abs(dx) > FLICK_THRESHOLD || Math.abs(dy) > FLICK_THRESHOLD) fire('flick');
  if (gyroMag > FLIP_THRESHOLD) fire('flip');

  _prevX = sensor.x;
  _prevY = sensor.y;
  _prevZ = sensor.z;

  _frameId = requestAnimationFrame(detect);
}

export function startGestures() {
  if (_running) return;
  _running = true;
  _frameId = requestAnimationFrame(detect);
}

export function stopGestures() {
  _running = false;
  if (_frameId) {
    cancelAnimationFrame(_frameId);
    _frameId = null;
  }
}

export function onGesture(gesture, callback) {
  if (_listeners[gesture]) {
    _listeners[gesture].push(callback);
  }
}

export function offGesture(gesture, callback) {
  if (_listeners[gesture]) {
    _listeners[gesture] = _listeners[gesture].filter(cb => cb !== callback);
  }
}