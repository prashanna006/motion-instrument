const HYSTERESIS = 0.8;

let _zones = [];
let _currentZoneIndex = -1;

export const NOTE_PERSONALITIES = {
  'C4':  { freq: 261.63, name: 'The Dreamer' },
  'D4':  { freq: 293.66, name: 'The Wanderer' },
  'E4':  { freq: 329.63, name: 'The Lover' },
  'F4':  { freq: 349.23, name: 'The Mystic' },
  'G4':  { freq: 392.00, name: 'The Hero' },
  'A4':  { freq: 440.00, name: 'The Anchor' },
  'B4':  { freq: 493.88, name: 'The Rebel' },
  'C5':  { freq: 523.25, name: 'The Sage' },
  'D5':  { freq: 587.33, name: 'The Poet' },
  'E5':  { freq: 659.25, name: 'The Spark' },
  'F5':  { freq: 698.46, name: 'The Ghost' },
  'G5':  { freq: 783.99, name: 'The Storm' },
  'A5':  { freq: 880.00, name: 'The Oracle' },
  'B5':  { freq: 987.77, name: 'The Finale' },
  'C3':  { freq: 130.81, name: 'The Ancient' },
  'D3':  { freq: 146.83, name: 'The Shadow' },
  'E3':  { freq: 164.81, name: 'The Drifter' },
  'F3':  { freq: 174.61, name: 'The Relic' },
  'G3':  { freq: 196.00, name: 'The Titan' },
  'A3':  { freq: 220.00, name: 'The Stranger' },
  'B3':  { freq: 246.94, name: 'The Dusk' },
};

export function setZones(zones) {
  _zones = zones;
  _currentZoneIndex = -1;
}

export function getZone(value) {
  if (_zones.length === 0) return null;

  const current = _zones[_currentZoneIndex];

  if (current) {
    const inLower = value >= current.min - HYSTERESIS;
    const inUpper = value <= current.max + HYSTERESIS;
    if (inLower && inUpper) return current;
  }

  for (let i = 0; i < _zones.length; i++) {
    if (value >= _zones[i].min && value <= _zones[i].max) {
      _currentZoneIndex = i;
      return _zones[i];
    }
  }

  if (value < _zones[0].min) {
    _currentZoneIndex = 0;
    return _zones[0];
  }

  if (value > _zones[_zones.length - 1].max) {
    _currentZoneIndex = _zones.length - 1;
    return _zones[_zones.length - 1];
  }

  return current ?? null;
}

export function getCurrentZone() {
  return _zones[_currentZoneIndex] ?? null;
}

export function resetZone() {
  _currentZoneIndex = -1;
}

export function buildZones(notes, minVal, maxVal) {
  const count = notes.length;
  const step = (maxVal - minVal) / count;
  return notes.map((note, i) => ({
    min: minVal + i * step,
    max: minVal + (i + 1) * step,
    note,
    label: note,
    personality: NOTE_PERSONALITIES[note] ?? { freq: null, name: '???' }
  }));
}