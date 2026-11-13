/**
 * TabZen Web Audio Synthesizer
 * 100% procedural sound synthesis using the Web Audio API.
 * Features:
 * - Real-time AnalyserNode FFT output
 * - 8D Spatial Audio Panning & 1-click sound presets
 * - Interactive 9-Note 432Hz Solfeggio Pentatonic Crystal Bowl Synthesizer (A-L keys)
 */

const SOUND_PRESETS = {
  temple: {
    id: 'temple',
    name: 'Temple Zen',
    icon: '🧘',
    volumes: { master: 0.75, bell: 0.9, wave: 0.2, noise: 0.25, binaural: 0.45 }
  },
  ocean: {
    id: 'ocean',
    name: 'Midnight Coast',
    icon: '🌊',
    volumes: { master: 0.75, bell: 0.45, wave: 0.95, noise: 0.35, binaural: 0.3 }
  },
  alpha: {
    id: 'alpha',
    name: 'Deep Alpha Focus',
    icon: '🧠',
    volumes: { master: 0.75, bell: 0.35, wave: 0.2, noise: 0.6, binaural: 0.85 }
  },
  chimes: {
    id: 'chimes',
    name: 'Chimes Only',
    icon: '🔔',
    volumes: { master: 0.75, bell: 0.9, wave: 0.0, noise: 0.0, binaural: 0.0 }
  }
};

class ZenAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.spatialPanner = null;
    this.freqData = null;
    this.timeData = null;

    this.isMuted = false;
    this.isPlaying = false;
    this.is8DEnabled = true;
    this.panAngle = 0;
    this.activePreset = 'temple';

    // Component Gain Nodes
    this.bellGain = null;
    this.waveGain = null;
    this.noiseGain = null;
    this.binauralGain = null;

    // Noise nodes
    this.noiseSource = null;
    this.waveSource = null;
    this.waveFilter = null;

    // Binaural nodes
    this.leftOsc = null;
    this.rightOsc = null;

    // Volumes (0 - 1)
    this.volumes = {
      master: 0.75,
      bell: 0.9,
      wave: 0.2,
      noise: 0.25,
      binaural: 0.45
    };

    // Frequencies for bell chords (Hz)
    this.bellFrequencies = {
      inhale: [432, 864, 1296, 2160], // Solfeggio 432Hz harmonic series
      hold: [528, 1056, 1584],        // Solfeggio 528Hz clarity
      exhale: [396, 792, 1188],       // Grounding 396Hz release
      rest: [288, 576, 864]
    };

    // 9-Note 432Hz Solfeggio Pentatonic Scale (Cannot hit a bad note)
    this.crystalNotes = [
      { key: 'A', name: 'D4', freq: 288 },
      { key: 'S', name: 'E4', freq: 324 },
      { key: 'D', name: 'G4', freq: 384 },
      { key: 'F', name: 'A4', freq: 432 }, // Sacred 432Hz
      { key: 'G', name: 'B4', freq: 486 },
      { key: 'H', name: 'D5', freq: 576 },
      { key: 'J', name: 'E5', freq: 648 },
      { key: 'K', name: 'G5', freq: 768 },
      { key: 'L', name: 'A5', freq: 864 }
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volumes.master, this.ctx.currentTime);

    // Audio-Reactive FFT Analyser Node
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.78;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount);

    // 8D Stereo Spatial Panner
    if (this.ctx.createStereoPanner) {
      this.spatialPanner = this.ctx.createStereoPanner();
      this.spatialPanner.pan.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.spatialPanner);
      this.spatialPanner.connect(this.analyser);
    } else {
      this.masterGain.connect(this.analyser);
    }

    this.analyser.connect(this.ctx.destination);

    // Sub busses
    this.bellGain = this.ctx.createGain();
    this.bellGain.gain.setValueAtTime(this.volumes.bell, this.ctx.currentTime);
    this.bellGain.connect(this.masterGain);

    this.waveGain = this.ctx.createGain();
    this.waveGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.waveGain.connect(this.masterGain);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.noiseGain.connect(this.masterGain);

    this.binauralGain = this.ctx.createGain();
    this.binauralGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.binauralGain.connect(this.masterGain);

    this._setupNoiseGenerators();
    this._setupBinauralGenerators();
  }

  async resume() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  set8DEnabled(enabled) {
    this.is8DEnabled = enabled;
    if (!enabled && this.spatialPanner && this.ctx) {
      this.spatialPanner.pan.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
  }

  applyPreset(presetKey) {
    const preset = SOUND_PRESETS[presetKey];
    if (!preset) return;

    this.activePreset = presetKey;
    Object.keys(preset.volumes).forEach(type => {
      this.setVolume(type, preset.volumes[type]);
    });
    return preset;
  }

  getAudioData() {
    if (!this.analyser || !this.ctx || this.isMuted) {
      return { freqData: null, energy: 0, bass: 0, treble: 0 };
    }

    this.analyser.getByteFrequencyData(this.freqData);

    let sum = 0;
    let bassSum = 0;
    let trebleSum = 0;
    const count = this.freqData.length;
    const bassCount = Math.floor(count * 0.25);

    for (let i = 0; i < count; i++) {
      const val = this.freqData[i];
      sum += val;
      if (i < bassCount) bassSum += val;
      else trebleSum += val;
    }

    return {
      freqData: this.freqData,
      energy: sum / (count * 255),
      bass: bassSum / (bassCount * 255),
      treble: trebleSum / ((count - bassCount) * 255)
    };
  }

  _setupNoiseGenerators() {
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    // Ambient Background Brown Noise
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    const ambientFilter = this.ctx.createBiquadFilter();
    ambientFilter.type = 'lowpass';
    ambientFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    this.noiseSource.connect(ambientFilter);
    ambientFilter.connect(this.noiseGain);
    this.noiseSource.start();

    // Breath-Modulated Tidal Wave
    this.waveSource = this.ctx.createBufferSource();
    this.waveSource.buffer = noiseBuffer;
    this.waveSource.loop = true;

    this.waveFilter = this.ctx.createBiquadFilter();
    this.waveFilter.type = 'bandpass';
    this.waveFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.waveFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);

    this.waveSource.connect(this.waveFilter);
    this.waveFilter.connect(this.waveGain);
    this.waveSource.start();
  }

  _setupBinauralGenerators() {
    const merger = this.ctx.createChannelMerger(2);

    this.leftOsc = this.ctx.createOscillator();
    this.leftOsc.type = 'sine';
    this.leftOsc.frequency.setValueAtTime(216, this.ctx.currentTime);

    const leftGain = this.ctx.createGain();
    leftGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0);

    this.rightOsc = this.ctx.createOscillator();
    this.rightOsc.type = 'sine';
    this.rightOsc.frequency.setValueAtTime(226, this.ctx.currentTime);

    const rightGain = this.ctx.createGain();
    rightGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    merger.connect(this.binauralGain);

    this.leftOsc.start();
    this.rightOsc.start();
  }

  playBell(phase = 'inhale') {
    if (this.isMuted || !this.ctx || this.volumes.bell <= 0) return;

    const freqs = this.bellFrequencies[phase] || this.bellFrequencies.inhale;
    const now = this.ctx.currentTime;
    const duration = phase === 'hold' ? 1.8 : 3.5;

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      osc.type = 'sine';
      const detune = (Math.random() - 0.5) * 8;
      osc.frequency.setValueAtTime(freq + detune, now);

      const overtoneDecay = duration / (1 + idx * 0.9);
      const amplitude = (0.28 / (idx + 1)) * (this.volumes.bell);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(amplitude, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + overtoneDecay);

      if (panner) {
        panner.pan.setValueAtTime((idx % 2 === 0 ? 0.25 : -0.25), now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.bellGain);
      } else {
        osc.connect(gain);
        gain.connect(this.bellGain);
      }

      osc.start(now);
      osc.stop(now + overtoneDecay + 0.1);
    });
  }

  /**
   * Plays an interactive tuned Solfeggio Pentatonic note (A-L keys)
   * @param {number} noteIdx - 0 to 8
   */
  playTunedNote(noteIdx) {
    if (this.isMuted || !this.ctx || noteIdx < 0 || noteIdx >= this.crystalNotes.length) return null;
    const note = this.crystalNotes[noteIdx];
    const now = this.ctx.currentTime;
    const fundamental = note.freq;

    const overtones = [
      { mult: 1.0, gain: 0.35, decay: 3.2 },
      { mult: 2.76, gain: 0.16, decay: 1.8 },
      { mult: 5.4, gain: 0.08, decay: 1.1 }
    ];

    overtones.forEach((ot) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ot.mult, now);

      const amp = ot.gain * this.volumes.bell;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(amp, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + ot.decay);

      if (panner) {
        const pan = ((noteIdx / (this.crystalNotes.length - 1)) - 0.5) * 0.7;
        panner.pan.setValueAtTime(pan, now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.bellGain);
      } else {
        osc.connect(gain);
        gain.connect(this.bellGain);
      }

      osc.start(now);
      osc.stop(now + ot.decay + 0.1);
    });

    return note;
  }

  updateBreathWave(phase, progress) {
    if (!this.ctx || !this.waveGain || !this.waveFilter) return;

    const now = this.ctx.currentTime;
    let targetVol = 0;
    let targetFreq = 300;

    if (phase === 'inhale') {
      const eased = Math.sin((progress * Math.PI) / 2);
      targetVol = (0.15 + (eased * 0.75)) * this.volumes.wave;
      targetFreq = 320 + (eased * 480);
    } else if (phase === 'hold') {
      targetVol = 0.75 * this.volumes.wave;
      targetFreq = 680;
    } else if (phase === 'exhale') {
      const eased = Math.cos((progress * Math.PI) / 2);
      targetVol = (0.1 + (eased * 0.65)) * this.volumes.wave;
      targetFreq = 300 + (eased * 450);
    } else {
      targetVol = 0.08 * this.volumes.wave;
      targetFreq = 260;
    }

    this.waveGain.gain.setTargetAtTime(targetVol, now, 0.08);
    this.waveFilter.frequency.setTargetAtTime(targetFreq, now, 0.08);

    // 8D Spatial Audio: Orbit pan angle in circle
    if (this.is8DEnabled && this.spatialPanner) {
      this.panAngle += 0.015;
      const panValue = Math.sin(this.panAngle) * 0.85;
      this.spatialPanner.pan.setTargetAtTime(panValue, now, 0.08);
    }
  }

  startAmbience() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.isPlaying = true;

    this.noiseGain.gain.cancelScheduledValues(now);
    this.noiseGain.gain.setTargetAtTime(this.volumes.noise, now, 0.5);

    this.binauralGain.gain.cancelScheduledValues(now);
    this.binauralGain.gain.setTargetAtTime(this.volumes.binaural * 0.45, now, 0.5);
  }

  stopAmbience() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.isPlaying = false;

    this.noiseGain.gain.cancelScheduledValues(now);
    this.noiseGain.gain.setTargetAtTime(0, now, 0.4);

    this.waveGain.gain.cancelScheduledValues(now);
    this.waveGain.gain.setTargetAtTime(0, now, 0.4);

    this.binauralGain.gain.cancelScheduledValues(now);
    this.binauralGain.gain.setTargetAtTime(0, now, 0.4);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volumes.master, now, 0.05);
    }
    return this.isMuted;
  }

  setVolume(type, val) {
    if (this.volumes[type] !== undefined) {
      this.volumes[type] = Math.max(0, Math.min(1, val));
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      if (type === 'master' && !this.isMuted) {
        this.masterGain.gain.setTargetAtTime(this.volumes.master, now, 0.05);
      } else if (type === 'bell') {
        this.bellGain.gain.setTargetAtTime(this.volumes.bell, now, 0.05);
      } else if (type === 'noise' && this.isPlaying) {
        this.noiseGain.gain.setTargetAtTime(this.volumes.noise, now, 0.05);
      } else if (type === 'binaural' && this.isPlaying) {
        this.binauralGain.gain.setTargetAtTime(this.volumes.binaural * 0.45, now, 0.05);
      }
    }
  }
}

window.SOUND_PRESETS = SOUND_PRESETS;
window.ZenAudioEngine = ZenAudioEngine;
