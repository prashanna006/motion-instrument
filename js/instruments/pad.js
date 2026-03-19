import { buildZones, setZones } from '../zones.js';

const NOTES = ['C3', 'E3', 'G3', 'B3', 'C4', 'E4', 'G4', 'B4'];

let _synth = null;
let _reverb = null;
let _chorus = null;
let _filter = null;
let _currentNote = null;
let _lastNote = null;
let _playing = false;

export function init() {
  setZones(buildZones(NOTES, -9, 9));

  _reverb = new Tone.Reverb({ decay: 6, wet: 0.6 }).toDestination();

  _chorus = new Tone.Chorus({
    frequency: 0.8,
    delayTime: 3.5,
    depth: 0.7,
    wet: 0.4
  }).connect(_reverb);
  _chorus.start();

  _filter = new Tone.Filter({
    frequency: 800,
    type: 'lowpass',
    rolloff: -24
  }).connect(_chorus);

  _synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 1.2,
      decay: 0.5,
      sustain: 0.8,
      release: 2.5
    }
  }).connect(_filter);

  _synth.volume.value = -6;
}

export function play() {
  _playing = true;
  if (_currentNote) {
    _synth.triggerAttack(_currentNote);
  }
}

export function pause() {
  _playing = false;
  _synth?.releaseAll();
  _lastNote = null;
}

export function stop() {
  pause();
}

export function dispose() {
  _synth?.releaseAll();
  _synth?.dispose();
  _reverb?.dispose();
  _chorus?.dispose();
  _filter?.dispose();
  _synth = null;
  _reverb = null;
  _chorus = null;
  _filter = null;
  _currentNote = null;
  _lastNote = null;
}

export function update(sensor, zone) {
  if (!_playing || !_synth) return;

  _currentNote = zone.note;

  const filterFreq = Math.max(200, Math.min(8000, 800 + sensor.gx * 100));
  _filter.frequency.rampTo(filterFreq, 0.5);

  if (_currentNote !== _lastNote) {
    if (_lastNote) _synth.triggerRelease(_lastNote);
    _synth.triggerAttack(_currentNote);
    _lastNote = _currentNote;
  }
}