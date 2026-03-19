import { buildZones, setZones } from '../zones.js';
import { onGesture, offGesture } from '../gesture.js';

const DRUMS = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3'];
const DRUM_LABELS = ['Kick', 'Snare', 'Hi-hat', 'Tom 1', 'Tom 2', 'Rim', 'Clap', 'Crash'];

let _membrane = null;
let _metal = null;
let _noise = null;
let _reverb = null;
let _currentZone = null;
let _playing = false;

const DRUM_PERSONALITIES = {
  'C2': { freq: 65.41,  name: 'The Kick'   },
  'D2': { freq: 73.42,  name: 'The Snare'  },
  'E2': { freq: 82.41,  name: 'The Hi-hat' },
  'F2': { freq: 87.31,  name: 'The Tom 1'  },
  'G2': { freq: 98.00,  name: 'The Tom 2'  },
  'A2': { freq: 110.00, name: 'The Rim'    },
  'B2': { freq: 123.47, name: 'The Clap'   },
  'C3': { freq: 130.81, name: 'The Crash'  },
};

export function init() {
  const zones = buildZones(DRUMS, -9, 9).map((z, i) => ({
    ...z,
    label: DRUM_LABELS[i],
    personality: DRUM_PERSONALITIES[z.note]
  }));
  setZones(zones);

  _reverb = new Tone.Reverb({ decay: 1.2, wet: 0.2 }).toDestination();
  _membrane = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
  }).connect(_reverb);

  _metal = new Tone.MetalSynth({
    frequency: 400,
    envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  }).connect(_reverb);
  _metal.volume.value = -12;

  _noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 }
  }).connect(_reverb);
  _noise.volume.value = -10;
}

function triggerDrum(zone) {
  if (!zone || !_playing) return;
  const note = zone.note;

  if (note === 'C2') {
    _membrane.triggerAttackRelease('C1', '8n');
  } else if (note === 'D2') {
    _noise.triggerAttackRelease('8n');
    _membrane.triggerAttackRelease('G1', '16n');
  } else if (note === 'E2' || note === 'B2') {
    _metal.triggerAttackRelease('16n');
  } else if (note === 'F2' || note === 'G2') {
    _membrane.triggerAttackRelease(note, '8n');
  } else if (note === 'A2') {
    _noise.triggerAttackRelease('16n');
  } else if (note === 'C3') {
    _metal.triggerAttackRelease('8n');
    _membrane.triggerAttackRelease('C2', '4n');
  }
}

const _onShake = () => triggerDrum(_currentZone);
const _onFlick = () => triggerDrum(_currentZone);

export function play() {
  _playing = true;
  onGesture('shake', _onShake);
  onGesture('flick', _onFlick);
}

export function pause() {
  _playing = false;
  offGesture('shake', _onShake);
  offGesture('flick', _onFlick);
}

export function stop() {
  pause();
}

export function dispose() {
  pause();
  _membrane?.dispose();
  _metal?.dispose();
  _noise?.dispose();
  _reverb?.dispose();
  _membrane = null;
  _metal = null;
  _noise = null;
  _reverb = null;
}

export function update(sensor, zone) {
  _currentZone = zone;
}