const SMOOTHING_WINDOW = 8;
const THROTTLE_MS = 50;

const _history = {
  x: [], y: [], z: [],
  gx: [], gy: [], gz: []
};

export const sensor = {
  x: 0, y: 0, z: 0,
  gx: 0, gy: 0, gz: 0,
  active: false,
  supported: false
};

function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function push(arr, val) {
  arr.push(val ?? 0);
  if (arr.length > SMOOTHING_WINDOW) arr.shift();
}

let lastUpdate = 0;

function onMotion(e) {
  const now = Date.now();
  if (now - lastUpdate < THROTTLE_MS) return;
  lastUpdate = now;

  const acc = e.accelerationIncludingGravity;
  const rot = e.rotationRate;

  push(_history.x, acc?.x);
  push(_history.y, acc?.y);
  push(_history.z, acc?.z);
  push(_history.gx, rot?.alpha);
  push(_history.gy, rot?.beta);
  push(_history.gz, rot?.gamma);

  sensor.x = average(_history.x);
  sensor.y = average(_history.y);
  sensor.z = average(_history.z);
  sensor.gx = average(_history.gx);
  sensor.gy = average(_history.gy);
  sensor.gz = average(_history.gz);
}

export async function initSensor(onPermissionGranted, onPermissionDenied) {
  if (!window.DeviceMotionEvent) {
    sensor.supported = false;
    return;
  }

  sensor.supported = true;

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const response = await DeviceMotionEvent.requestPermission();
      if (response === 'granted') {
        window.addEventListener('devicemotion', onMotion);
        sensor.active = true;
        onPermissionGranted?.();
      } else {
        onPermissionDenied?.();
      }
    } catch (err) {
      onPermissionDenied?.();
    }
  } else {
    window.addEventListener('devicemotion', onMotion);
    sensor.active = true;
    onPermissionGranted?.();
  }
}

export function stopSensor() {
  window.removeEventListener('devicemotion', onMotion);
  sensor.active = false;
}