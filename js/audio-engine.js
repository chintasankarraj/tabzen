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
    volumes: { master: 0.75, bell: 0.9, wave: 0.2, noise: 0.25, binaural: 0.45, rain: 0.0, thunder: 0.0, isochronic: 0.0 }
  },
  ocean: {
    id: 'ocean',
    name: 'Midnight Coast',
    icon: '🌊',
    volumes: { master: 0.75, bell: 0.45, wave: 0.95, noise: 0.35, binaural: 0.3, rain: 0.0, thunder: 0.0, isochronic: 0.0 }
  },
  alpha: {
    id: 'alpha',
    name: 'Deep Alpha Focus',
    icon: '🧠',
    volumes: { master: 0.75, bell: 0.35, wave: 0.2, noise: 0.6, binaural: 0.85, rain: 0.0, thunder: 0.0, isochronic: 0.5 }
  },
  rain: {
    id: 'rain',
    name: 'Rainy Sanctuary',
    icon: '🌧️',
    volumes: { master: 0.75, bell: 0.65, wave: 0.15, noise: 0.2, binaural: 0.25, rain: 0.85, thunder: 0.5, isochronic: 0.0 }
  },
  chimes: {
    id: 'chimes',
    name: 'Chimes Only',
    icon: '🔔',
    volumes: { master: 0.75, bell: 0.9, wave: 0.0, noise: 0.0, binaural: 0.0, rain: 0.0, thunder: 0.0, isochronic: 0.0 }
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
    this.rainGain = null;
    this.thunderGain = null;
    this.isochronicGain = null;

    // MediaStreamDestination for video recording
    this.mediaStreamDest = null;

    // Noise nodes
    this.noiseSource = null;
    this.waveSource = null;
    this.waveFilter = null;
    this.rainSource = null;

    // Binaural & Isochronic nodes
    this.leftOsc = null;
    this.rightOsc = null;
    this.isochronicCarrier = null;
    this.isochronicLFO = null;
    this.isochronicPulseGain = null;
    this.isochronicRate = 10; // 10Hz Alpha by default

    // Solfeggio Sacred Tuning (Hz)
    this.solfeggioFreq = 432;

    // Acoustic Microphone Breath Follower
    this.micStream = null;
    this.micSource = null;
    this.micAnalyser = null;
    this.micData = null;
    this.micInterval = null;
    this.isMicActive = false;

    // Volumes (0 - 1)
    this.volumes = {
      master: 0.75,
      bell: 0.9,
      wave: 0.2,
      noise: 0.25,
      binaural: 0.45,
      rain: 0.0,
      thunder: 0.0,
      isochronic: 0.0
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

    // MediaStreamDestination for Video Recording with Web Audio Sync
    if (this.ctx.createMediaStreamDestination) {
      this.mediaStreamDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.mediaStreamDest);
    }

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

    // Rain Bus
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.rainGain.connect(this.masterGain);

    // Thunder Bus
    this.thunderGain = this.ctx.createGain();
    this.thunderGain.gain.setValueAtTime(this.volumes.thunder, this.ctx.currentTime);
    this.thunderGain.connect(this.masterGain);

    // Isochronic Pulser Bus
    this.isochronicGain = this.ctx.createGain();
    this.isochronicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.isochronicGain.connect(this.masterGain);

    this._setupNoiseGenerators();
    this._setupBinauralGenerators();
    this._setupRainGenerator();
    this._setupIsochronicGenerator();
  }

  getAudioStreamTrack() {
    if (!this.mediaStreamDest) return null;
    return this.mediaStreamDest.stream.getAudioTracks()[0] || null;
  }

  /**
   * Sets the base sacred Solfeggio frequency and shifts harmonic chord tables
   * @param {number} freq - 396, 432, 528, 639, 741, 852, 963
   */
  setSolfeggioFrequency(freq) {
    const f = parseInt(freq, 10) || 432;
    this.solfeggioFreq = f;

    // Recalculate harmonic bell chords around selected Solfeggio fundamental
    this.bellFrequencies = {
      inhale: [f, f * 2, f * 3, f * 5],
      hold: [Math.round(f * 1.25), Math.round(f * 2.5), Math.round(f * 3.75)],
      exhale: [Math.round(f * 0.75), Math.round(f * 1.5), Math.round(f * 2.25)],
      rest: [Math.round(f * 0.5), f, Math.round(f * 1.5)]
    };

    // Update isochronic carrier pitch
    if (this.isochronicCarrier && this.ctx) {
      this.isochronicCarrier.frequency.setTargetAtTime(f / 2, this.ctx.currentTime, 0.1);
    }
  }

  setIsochronicRate(rate) {
    const r = parseFloat(rate) || 10;
    this.isochronicRate = r;
    if (this.isochronicLFO && this.ctx) {
      this.isochronicLFO.frequency.setTargetAtTime(r, this.ctx.currentTime, 0.05);
    }
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

  /**
   * Starts Acoustic Breath Detection via microphone input
   * @param {function} onEnergyUpdate - Callback receives 0.0 - 1.0 breath energy
   */
  async startMicBreathDetection(onEnergyUpdate) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone not supported on this browser.');
    }
    await this.resume();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.micStream = stream;
    this.micSource = this.ctx.createMediaStreamSource(stream);

    // Bandpass filter to isolate breath / human airflow frequencies (250Hz - 1600Hz)
    const breathFilter = this.ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    breathFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    this.micAnalyser = this.ctx.createAnalyser();
    this.micAnalyser.fftSize = 256;
    this.micAnalyser.smoothingTimeConstant = 0.65;
    this.micData = new Uint8Array(this.micAnalyser.frequencyBinCount);

    this.micSource.connect(breathFilter);
    breathFilter.connect(this.micAnalyser);

    this.isMicActive = true;

    // Real-time acoustic energy follower loop
    this.micInterval = setInterval(() => {
      if (!this.isMicActive || !this.micAnalyser) return;
      this.micAnalyser.getByteFrequencyData(this.micData);
      let sum = 0;
      for (let i = 0; i < this.micData.length; i++) {
        sum += this.micData[i];
      }
      const rawLevel = sum / (this.micData.length * 255);
      const threshold = 0.08;
      const energy = rawLevel > threshold ? Math.min(1.0, (rawLevel - threshold) * 3.5) : 0;
      if (onEnergyUpdate) onEnergyUpdate(energy);
    }, 45);

    return true;
  }

  stopMicBreathDetection() {
    this.isMicActive = false;
    if (this.micInterval) clearInterval(this.micInterval);
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      try { this.micSource.disconnect(); } catch (e) {}
      this.micSource = null;
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

  _setupRainGenerator() {
    // 100% Procedural Rain Synthesizer (White noise pass + gentle acoustic bandpass)
    const bufferSize = this.ctx.sampleRate * 4;
    const rainBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = rainBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = rainBuffer;
    this.rainSource.loop = true;

    // Highpass + Bandpass to simulate soothing rainfall hiss
    const rainFilter1 = this.ctx.createBiquadFilter();
    rainFilter1.type = 'highpass';
    rainFilter1.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const rainFilter2 = this.ctx.createBiquadFilter();
    rainFilter2.type = 'bandpass';
    rainFilter2.frequency.setValueAtTime(3200, this.ctx.currentTime);
    rainFilter2.Q.setValueAtTime(0.85, this.ctx.currentTime);

    this.rainSource.connect(rainFilter1);
    rainFilter1.connect(rainFilter2);
    rainFilter2.connect(this.rainGain);
    this.rainSource.start();

    // Random acoustic droplet generator loop
    setInterval(() => {
      if (!this.isPlaying || this.isMuted || this.volumes.rain <= 0.05 || !this.ctx) return;
      if (Math.random() > 0.45) this._playWaterDroplet();
    }, 280);
  }

  _playWaterDroplet() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dropOsc = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();

    const baseFreq = 2200 + Math.random() * 1800;
    dropOsc.type = 'sine';
    dropOsc.frequency.setValueAtTime(baseFreq, now);
    dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.04);

    const dropVol = (0.015 + Math.random() * 0.035) * this.volumes.rain;
    dropGain.gain.setValueAtTime(0.0001, now);
    dropGain.gain.linearRampToValueAtTime(dropVol, now + 0.01);
    dropGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.05);

    dropOsc.connect(dropGain);
    dropGain.connect(this.rainGain);
    dropOsc.start(now);
    dropOsc.stop(now + 0.06);
  }

  _setupIsochronicGenerator() {
    // Isochronic Pulser (Carrier + Square amplitude LFO for speaker-friendly brainwave entrainment)
    this.isochronicCarrier = this.ctx.createOscillator();
    this.isochronicCarrier.type = 'sine';
    this.isochronicCarrier.frequency.setValueAtTime(this.solfeggioFreq / 2, this.ctx.currentTime);

    this.isochronicPulseGain = this.ctx.createGain();
    this.isochronicPulseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    this.isochronicLFO = this.ctx.createOscillator();
    this.isochronicLFO.type = 'square';
    this.isochronicLFO.frequency.setValueAtTime(this.isochronicRate, this.ctx.currentTime);

    const lfoDepth = this.ctx.createGain();
    lfoDepth.gain.setValueAtTime(0.5, this.ctx.currentTime);

    this.isochronicLFO.connect(lfoDepth);
    lfoDepth.connect(this.isochronicPulseGain.gain);

    this.isochronicCarrier.connect(this.isochronicPulseGain);
    this.isochronicPulseGain.connect(this.isochronicGain);

    this.isochronicCarrier.start();
    this.isochronicLFO.start();
  }

  /**
   * Procedural Distant Rolling Thunder Synthesizer
   */
  triggerThunder() {
    if (this.isMuted || !this.ctx || this.volumes.thunder <= 0) return;
    const now = this.ctx.currentTime;
    const duration = 5.5;

    const thunderBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = thunderBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.45;
    }

    const thunderSrc = this.ctx.createBufferSource();
    thunderSrc.buffer = thunderBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(75, now);
    filter.frequency.linearRampToValueAtTime(140, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(45, now + duration);

    const gain = this.ctx.createGain();
    const peakVol = 0.85 * this.volumes.thunder;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakVol * 0.5, now + 0.6);
    gain.gain.linearRampToValueAtTime(peakVol, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    thunderSrc.connect(filter);
    filter.connect(gain);
    gain.connect(this.thunderGain);

    thunderSrc.start(now);
    thunderSrc.stop(now + duration + 0.1);
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

    if (this.rainGain) {
      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.setTargetAtTime(this.volumes.rain, now, 0.5);
    }

    if (this.isochronicGain) {
      this.isochronicGain.gain.cancelScheduledValues(now);
      this.isochronicGain.gain.setTargetAtTime(this.volumes.isochronic * 0.35, now, 0.5);
    }
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

    if (this.rainGain) {
      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.setTargetAtTime(0, now, 0.4);
    }

    if (this.isochronicGain) {
      this.isochronicGain.gain.cancelScheduledValues(now);
      this.isochronicGain.gain.setTargetAtTime(0, now, 0.4);
    }
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
      } else if (type === 'rain' && this.isPlaying) {
        this.rainGain.gain.setTargetAtTime(this.volumes.rain, now, 0.05);
      } else if (type === 'thunder') {
        this.thunderGain.gain.setTargetAtTime(this.volumes.thunder, now, 0.05);
      } else if (type === 'isochronic' && this.isPlaying) {
        this.isochronicGain.gain.setTargetAtTime(this.volumes.isochronic * 0.35, now, 0.05);
      }
    }
  }
}

window.SOUND_PRESETS = SOUND_PRESETS;
window.ZenAudioEngine = ZenAudioEngine;
