import { buildZones, setZones } from '../zones.js';

const NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

let _synth = null;
let _reverb = null;
let _vibrato = null;
let _currentNote = null;
let _playing = false;

export function init() {
  setZones(buildZones(NOTES, -9, 9));

  _reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).toDestination();
  _vibrato = new Tone.Vibrato({ frequency: 5, depth: 0.15 }).connect(_reverb);

  _synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.3,
      decay: 0.1,
      sustain: 1.0,
      release: 0.8
    }
  }).connect(_vibrato);
}

export function play() {
  _playing = true;
  if (_currentNote) {
    _synth.triggerAttack(_currentNote);
  }
}

export function pause() {
  _playing = false;
  _synth?.triggerRelease();
}

export function stop() {
  _playing = false;
  _synth?.triggerRelease();
}

export function dispose() {
  _synth?.dispose();
  _reverb?.dispose();
  _vibrato?.dispose();
  _synth = null;
  _reverb = null;
  _vibrato = null;
  _currentNote = null;
}

export function update(sensor, zone) {
  if (!_playing || !_synth) return;

  const note = zone.note;
  const volume = Math.max(-30, Math.min(0, sensor.x * 2));

  _synth.volume.rampTo(volume, 0.1);

  if (note !== _currentNote) {
    _currentNote = note;
    _synth.triggerAttack(note);
  }
}