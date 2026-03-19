import { buildZones, setZones } from '../zones.js';

const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];

let _synth = null;
let _reverb = null;
let _delay = null;
let _currentNote = null;
let _lastNote = null;
let _playing = false;

export function init() {
  setZones(buildZones(NOTES, -9, 9));

  _reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();
  _delay = new Tone.FeedbackDelay({
    delayTime: '8n',
    feedback: 0.3,
    wet: 0.2
  }).connect(_reverb);

  _synth = new Tone.PluckSynth({
    attackNoise: 1,
    dampening: 4000,
    resonance: 0.98
  }).connect(_delay);
}

export function play() {
  _playing = true;
}

export function pause() {
  _playing = false;
  _lastNote = null;
}

export function stop() {
  pause();
}

export function dispose() {
  _synth?.dispose();
  _reverb?.dispose();
  _delay?.dispose();
  _synth = null;
  _reverb = null;
  _delay = null;
  _currentNote = null;
  _lastNote = null;
}

export function update(sensor, zone) {
  if (!_playing || !_synth) return;

  _currentNote = zone.note;

  if (_currentNote !== _lastNote) {
    _synth.triggerAttack(_currentNote);
    _lastNote = _currentNote;
  }
}