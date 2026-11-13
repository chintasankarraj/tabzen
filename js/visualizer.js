/**
 * TabZen Canvas Breathing Visualizer
 * High-DPI hardware-accelerated generative canvas rendering.
 * Features:
 * - 3 Visualizer Modes: Organic Orb, Sacred Mandala, Liquid Silk
 * - Interactive Mouse Magnetic Physics & Mobile Gyro Parallax
 * - Interactive Crystal Singing Bowl Shockwave Ripples (A-L keys)
 * - Real-Time Web Audio FFT Reactive Waves & customizable mood themes
 * - Real-Time Hospital-Grade Glowing EKG Pulse Wave & Cardiac Coherence HUD
 */

const ZEN_THEMES = {
  cosmic: {
    id: 'cosmic',
    name: 'Cosmic OLED',
    inhale: { core1: 'rgba(45, 212, 191, 0.85)', core2: 'rgba(99, 102, 241, 0.7)', ring: '#2dd4bf', particle: 'rgba(94, 234, 212, 0.65)', outer: 'rgba(56, 189, 248, 0.15)' },
    hold: { core1: 'rgba(129, 140, 248, 0.85)', core2: 'rgba(192, 132, 252, 0.7)', ring: '#818cf8', particle: 'rgba(192, 132, 252, 0.65)', outer: 'rgba(147, 51, 234, 0.15)' },
    exhale: { core1: 'rgba(251, 146, 60, 0.85)', core2: 'rgba(244, 63, 94, 0.7)', ring: '#fb923c', particle: 'rgba(253, 186, 116, 0.65)', outer: 'rgba(244, 63, 94, 0.12)' },
    rest: { core1: 'rgba(59, 130, 246, 0.75)', core2: 'rgba(99, 102, 241, 0.6)', ring: '#60a5fa', particle: 'rgba(147, 197, 253, 0.55)', outer: 'rgba(30, 58, 138, 0.12)' }
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Dusk',
    inhale: { core1: 'rgba(244, 63, 94, 0.85)', core2: 'rgba(192, 132, 252, 0.75)', ring: '#f43f5e', particle: 'rgba(251, 113, 133, 0.65)', outer: 'rgba(244, 63, 94, 0.18)' },
    hold: { core1: 'rgba(217, 70, 239, 0.85)', core2: 'rgba(168, 85, 247, 0.75)', ring: '#d946ef', particle: 'rgba(232, 121, 249, 0.65)', outer: 'rgba(217, 70, 239, 0.18)' },
    exhale: { core1: 'rgba(251, 113, 133, 0.85)', core2: 'rgba(244, 63, 94, 0.7)', ring: '#fb7185', particle: 'rgba(254, 205, 211, 0.65)', outer: 'rgba(251, 113, 133, 0.15)' },
    rest: { core1: 'rgba(168, 85, 247, 0.8)', core2: 'rgba(99, 102, 241, 0.6)', ring: '#a855f7', particle: 'rgba(192, 132, 252, 0.55)', outer: 'rgba(147, 51, 234, 0.15)' }
  },
  forest: {
    id: 'forest',
    name: 'Forest Zen',
    inhale: { core1: 'rgba(16, 185, 129, 0.85)', core2: 'rgba(45, 212, 191, 0.75)', ring: '#10b981', particle: 'rgba(52, 211, 153, 0.65)', outer: 'rgba(16, 185, 129, 0.18)' },
    hold: { core1: 'rgba(5, 150, 105, 0.85)', core2: 'rgba(13, 148, 136, 0.75)', ring: '#34d399', particle: 'rgba(110, 231, 183, 0.65)', outer: 'rgba(5, 150, 105, 0.18)' },
    exhale: { core1: 'rgba(132, 204, 22, 0.85)', core2: 'rgba(16, 185, 129, 0.7)', ring: '#84cc16', particle: 'rgba(190, 242, 100, 0.65)', outer: 'rgba(132, 204, 22, 0.15)' },
    rest: { core1: 'rgba(20, 184, 166, 0.8)', core2: 'rgba(16, 185, 129, 0.6)', ring: '#14b8a6', particle: 'rgba(94, 234, 212, 0.55)', outer: 'rgba(13, 148, 136, 0.15)' }
  },
  solar: {
    id: 'solar',
    name: 'Solar Dawn',
    inhale: { core1: 'rgba(245, 158, 11, 0.85)', core2: 'rgba(251, 146, 60, 0.75)', ring: '#f59e0b', particle: 'rgba(252, 211, 77, 0.65)', outer: 'rgba(245, 158, 11, 0.18)' },
    hold: { core1: 'rgba(234, 88, 12, 0.85)', core2: 'rgba(244, 63, 94, 0.75)', ring: '#ea580c', particle: 'rgba(253, 186, 116, 0.65)', outer: 'rgba(234, 88, 12, 0.18)' },
    exhale: { core1: 'rgba(251, 191, 36, 0.85)', core2: 'rgba(245, 158, 11, 0.7)', ring: '#fbbf24', particle: 'rgba(254, 240, 138, 0.65)', outer: 'rgba(251, 191, 36, 0.15)' },
    rest: { core1: 'rgba(217, 119, 6, 0.8)', core2: 'rgba(180, 83, 9, 0.6)', ring: '#d97706', particle: 'rgba(252, 211, 77, 0.55)', outer: 'rgba(180, 83, 9, 0.15)' }
  }
};

class ZenVisualizer {
  constructor(canvas, audioEngine = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.audioEngine = audioEngine;

    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;

    // Visualizer Mode: 'orb' | 'mandala' | 'silk'
    this.mode = 'orb';

    // Animation state
    this.time = 0;
    this.currentScale = 0.35;
    this.targetScale = 0.35;
    this.lungVolume = 0;
    this.phase = 'inhale';
    this.progress = 0;

    // Cardiac Coherence & EKG State
    this.heartRate = null;
    this.isCoherenceLocked = false;
    this.ekgOffset = 0;

    // Acoustic Microphone Breath Energy (0 - 1)
    this.micEnergy = 0;

    // Bilateral EMDR Anxiety Relief Guide
    this.isEMDREnabled = false;

    // Night-Shift Blue-Light Filter
    this.isBlueLightFilter = false;

    // Interactive Keyboard Crystal Bowl Ripples
    this.ripples = [];

    // Interactive Parallax Physics (Mouse & Gyro)
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.rawMouseAbsX = -9999;
    this.rawMouseAbsY = -9999;

    // Active theme
    this.themeId = 'cosmic';
    this.theme = ZEN_THEMES.cosmic;

    // Particles
    this.particles = [];
    this.numParticles = 85;

    this._initResize();
    this._initInteractivity();
    this._initParticles();
    this._animate();
  }

  setAudioEngine(engine) {
    this.audioEngine = engine;
  }

  setTheme(themeId) {
    if (ZEN_THEMES[themeId]) {
      this.themeId = themeId;
      this.theme = ZEN_THEMES[themeId];
    }
  }

  setMode(mode) {
    if (['orb', 'mandala', 'silk'].includes(mode)) {
      this.mode = mode;
    }
  }

  setHeartRate(bpm, isCoherenceLocked = false) {
    this.heartRate = bpm;
    this.isCoherenceLocked = isCoherenceLocked;
  }

  setMicEnergy(energy) {
    this.micEnergy = Math.max(0, Math.min(1, energy));
  }

  setEMDREnabled(enabled) {
    this.isEMDREnabled = Boolean(enabled);
  }

  setBlueLightFilter(enabled) {
    this.isBlueLightFilter = Boolean(enabled);
  }

  triggerRipple(x = null, y = null, color = null) {
    const ripX = x !== null ? x : (this.centerX + this.mouseX);
    const ripY = y !== null ? y : (this.centerY + this.mouseY);
    const ripColor = color || (this.theme[this.phase] ? this.theme[this.phase].ring : '#2dd4bf');

    this.ripples.push({
      x: ripX,
      y: ripY,
      radius: 10,
      maxRadius: 280,
      alpha: 0.85,
      color: ripColor
    });
  }

  _initResize() {
    const resize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);

      this.centerX = this.width / 2;
      this.centerY = this.height / 2;
    };

    window.addEventListener('resize', resize);
    resize();
  }

  _initInteractivity() {
    const container = this.canvas.parentElement;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      this.rawMouseAbsX = clientX;
      this.rawMouseAbsY = clientY;

      this.targetMouseX = ((clientX / this.width) - 0.5) * 35;
      this.targetMouseY = ((clientY / this.height) - 0.5) * 35;
    });

    container.addEventListener('mouseleave', () => {
      this.targetMouseX = 0;
      this.targetMouseY = 0;
      this.rawMouseAbsX = -9999;
      this.rawMouseAbsY = -9999;
    });

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          this.targetMouseX = Math.max(-30, Math.min(30, e.gamma * 0.8));
          this.targetMouseY = Math.max(-30, Math.min(30, (e.beta - 45) * 0.8));
        }
      });
    }
  }

  _initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 260;
      this.particles.push({
        x: this.centerX + Math.cos(angle) * dist,
        y: this.centerY + Math.sin(angle) * dist,
        baseAngle: angle,
        dist: dist,
        size: 0.8 + Math.random() * 2.2,
        speed: 0.002 + Math.random() * 0.005,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        alpha: 0.2 + Math.random() * 0.6
      });
    }
  }

  updateState(state) {
    this.lungVolume = state.lungVolume;
    this.phase = state.phase;
    this.progress = state.phaseProgress;

    const minScale = 0.35;
    const maxScale = 0.95;
    this.targetScale = minScale + (this.lungVolume * (maxScale - minScale));
  }

  _animate() {
    this.time += 0.018;

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    this.currentScale += (this.targetScale - this.currentScale) * 0.06;

    this._render();
    requestAnimationFrame(() => this._animate());
  }

  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const palette = this.theme[this.phase] || this.theme.inhale;
    const maxBaseRadius = Math.min(this.width, this.height) * 0.22;
    const currentRadius = maxBaseRadius * this.currentScale;

    const audioData = this.audioEngine ? this.audioEngine.getAudioData() : null;

    const dynamicCenterX = this.centerX + this.mouseX;
    const dynamicCenterY = this.centerY + this.mouseY;

    // 1. Ambient Particles
    this._renderParticles(ctx, palette, currentRadius, audioData, dynamicCenterX, dynamicCenterY);

    // 2. Crystal Bowl Ripples
    this._renderRipples(ctx);

    // 3. Visualizer Mode
    if (this.mode === 'mandala') {
      this._renderMandala(ctx, palette, currentRadius, audioData, dynamicCenterX, dynamicCenterY);
    } else if (this.mode === 'silk') {
      this._renderSilk(ctx, palette, currentRadius, audioData, dynamicCenterX, dynamicCenterY);
    } else {
      this._renderAura(ctx, palette, currentRadius, audioData, dynamicCenterX, dynamicCenterY);
      this._renderCore(ctx, palette, currentRadius, audioData, dynamicCenterX, dynamicCenterY);
    }

    // 4. Circular Progress Arc
    this._renderProgressArc(ctx, palette, currentRadius, dynamicCenterX, dynamicCenterY);

    // 5. Bilateral EMDR Anxiety Relief Guide (if active)
    if (this.isEMDREnabled) {
      this._renderEMDRGuide(ctx, palette, dynamicCenterX, dynamicCenterY);
    }

    // 6. Live Cardiac EKG & Coherence Waveform (if active)
    if (this.heartRate) {
      this._renderEKG(ctx, palette);
    }
  }

  _renderEMDRGuide(ctx, palette, cX, cY) {
    ctx.save();
    const trackY = Math.min(this.height * 0.22, 110);
    const trackWidth = this.width * 0.82;
    const trackLeft = cX - trackWidth / 2;
    const trackRight = cX + trackWidth / 2;

    // Draw dashed guide rail
    ctx.beginPath();
    ctx.moveTo(trackLeft, trackY);
    ctx.lineTo(trackRight, trackY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Smooth horizontal bilateral saccade (0.35 Hz sinusoidal pacing)
    const emdrPhase = (Math.sin(this.time * 2.2) + 1) / 2; // 0 to 1
    const beaconX = trackLeft + emdrPhase * trackWidth;

    // Luminous Beacon Halo
    const beaconColor = this.isBlueLightFilter ? '#f59e0b' : palette.ring;
    const beaconGrad = ctx.createRadialGradient(beaconX, trackY, 2, beaconX, trackY, 32);
    beaconGrad.addColorStop(0, '#ffffff');
    beaconGrad.addColorStop(0.35, beaconColor);
    beaconGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(beaconX, trackY, 32, 0, Math.PI * 2);
    ctx.fillStyle = beaconGrad;
    ctx.fill();

    // Central Beacon Pip
    ctx.beginPath();
    ctx.arc(beaconX, trackY, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = beaconColor;
    ctx.shadowBlur = 20;
    ctx.fill();

    // Guidance text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 11.5px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👁️ Follow the moving light with your eyes (Bilateral EMDR)', cX, trackY - 16);

    ctx.restore();
  }

  _renderRipples(ctx) {
    if (this.ripples.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.radius += 5.5;
      rip.alpha *= 0.94;

      if (rip.alpha <= 0.02 || rip.radius >= rip.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rip.color;
      ctx.lineWidth = 2.5 * rip.alpha;
      ctx.globalAlpha = rip.alpha;
      ctx.shadowColor = rip.color;
      ctx.shadowBlur = 16;
      ctx.stroke();
    }

    ctx.restore();
  }

  _renderEKG(ctx, palette) {
    ctx.save();

    const ekgY = this.height - 32;
    const ekgW = this.width * 0.85;
    const startX = this.centerX - ekgW / 2;
    const speed = (this.heartRate / 60) * 4;
    this.ekgOffset = (this.ekgOffset + speed) % ekgW;

    ctx.beginPath();
    for (let x = 0; x <= ekgW; x += 3) {
      const progressAlong = (x + this.ekgOffset) % ekgW;
      const cyclePos = (progressAlong % 120) / 120;

      let yOffset = 0;
      if (cyclePos > 0.35 && cyclePos < 0.42) {
        yOffset = -Math.sin(((cyclePos - 0.35) / 0.07) * Math.PI) * 5;
      } else if (cyclePos >= 0.42 && cyclePos < 0.45) {
        yOffset = 3;
      } else if (cyclePos >= 0.45 && cyclePos < 0.52) {
        const spikeProg = (cyclePos - 0.45) / 0.07;
        yOffset = -Math.sin(spikeProg * Math.PI) * 26;
      } else if (cyclePos >= 0.52 && cyclePos < 0.56) {
        yOffset = 4;
      } else if (cyclePos >= 0.65 && cyclePos < 0.80) {
        yOffset = -Math.sin(((cyclePos - 0.65) / 0.15) * Math.PI) * 7;
      }

      const drawX = startX + x;
      const drawY = ekgY + yOffset;

      if (x === 0) ctx.moveTo(drawX, drawY);
      else ctx.lineTo(drawX, drawY);
    }

    const ekgColor = this.isCoherenceLocked ? '#f59e0b' : '#2dd4bf';
    ctx.strokeStyle = ekgColor;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = ekgColor;
    ctx.shadowBlur = this.isCoherenceLocked ? 14 : 8;
    ctx.globalAlpha = 0.75;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(startX + ekgW - 5, ekgY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  _renderAura(ctx, palette, radius, audioData, cX, cY) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const freqData = audioData ? audioData.freqData : null;
    const audioEnergy = audioData ? audioData.energy : 0;
    const micBoost = this.micEnergy * 28;
    const totalEnergy = Math.min(1.0, audioEnergy + this.micEnergy * 0.5);

    const ringCounts = [
      { rFactor: 1.45, freq: 4, amp: 7, speed: 0.9, alpha: 0.16 },
      { rFactor: 1.25, freq: 5, amp: 9, speed: -1.2, alpha: 0.26 },
      { rFactor: 1.10, freq: 6, amp: 6, speed: 1.5, alpha: 0.42 }
    ];

    ringCounts.forEach((ring, ringIdx) => {
      const r = (radius + micBoost) * ring.rFactor;
      ctx.beginPath();
      
      let stepIdx = 0;
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.05) {
        let offset = Math.sin(theta * ring.freq + this.time * ring.speed) * ring.amp;

        if (freqData && freqData.length > 0) {
          const bin = (stepIdx * 2 + ringIdx * 8) % freqData.length;
          const fftVal = (freqData[bin] / 255.0);
          offset += fftVal * 16.0 * ring.rFactor;
        }

        const x = cX + Math.cos(theta) * (r + offset);
        const y = cY + Math.sin(theta) * (r + offset);
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        stepIdx++;
      }
      ctx.closePath();
      ctx.strokeStyle = this.isBlueLightFilter ? '#f59e0b' : palette.ring;
      ctx.lineWidth = 1.5 + (totalEnergy * 2.5);
      ctx.globalAlpha = Math.min(0.95, ring.alpha + (totalEnergy * 0.4));
      ctx.stroke();
    });

    const bgRadius = (radius + micBoost) * (2.1 + totalEnergy * 0.5);
    const bgGlow = ctx.createRadialGradient(cX, cY, radius * 0.3, cX, cY, bgRadius);
    bgGlow.addColorStop(0, this.isBlueLightFilter ? 'rgba(245, 158, 11, 0.18)' : palette.outer);
    bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGlow;
    ctx.beginPath();
    ctx.arc(cX, cY, bgRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _renderCore(ctx, palette, radius, audioData, cX, cY) {
    ctx.save();

    const bassBoost = audioData ? audioData.bass * 8 : 0;
    const micBoost = this.micEnergy * 18;
    const effectiveRadius = radius + bassBoost + micBoost;

    const grad = ctx.createRadialGradient(
      cX, cY, effectiveRadius * 0.05,
      cX, cY, effectiveRadius
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.25, this.isBlueLightFilter ? '#f59e0b' : palette.core1);
    grad.addColorStop(0.7, this.isBlueLightFilter ? '#d97706' : palette.core2);
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.15)');

    ctx.shadowColor = this.isBlueLightFilter ? '#f59e0b' : palette.ring;
    ctx.shadowBlur = (35 + (audioData ? audioData.energy * 25 : 0) + this.micEnergy * 20) * this.currentScale;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cX, cY, effectiveRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _renderMandala(ctx, palette, radius, audioData, cX, cY) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const petals = 8;
    const rotationSpeed = this.time * 0.25;
    const audioEnergy = audioData ? audioData.energy : 0;
    const bloomScale = radius * 1.6;

    const grad = ctx.createRadialGradient(cX, cY, radius * 0.1, cX, cY, radius * 0.85);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, palette.core1);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cX, cY, radius * 0.85, 0, Math.PI * 2);
    ctx.fill();

    for (let layer = 0; layer < 2; layer++) {
      const layerOffset = layer * (Math.PI / petals);
      const layerRadius = bloomScale * (layer === 0 ? 1.0 : 0.75);

      for (let i = 0; i < petals; i++) {
        const angle = (i * (Math.PI * 2 / petals)) + (layer === 0 ? rotationSpeed : -rotationSpeed) + layerOffset;
        const tipX = cX + Math.cos(angle) * layerRadius;
        const tipY = cY + Math.sin(angle) * layerRadius;

        const leftAngle = angle - 0.32;
        const rightAngle = angle + 0.32;
        const ctrlDist = layerRadius * 0.55;

        const cp1X = cX + Math.cos(leftAngle) * ctrlDist;
        const cp1Y = cY + Math.sin(leftAngle) * ctrlDist;
        const cp2X = cX + Math.cos(rightAngle) * ctrlDist;
        const cp2Y = cY + Math.sin(rightAngle) * ctrlDist;

        ctx.beginPath();
        ctx.moveTo(cX, cY);
        ctx.bezierCurveTo(cp1X, cp1Y, tipX, tipY, tipX, tipY);
        ctx.bezierCurveTo(tipX, tipY, cp2X, cp2Y, cX, cY);

        ctx.strokeStyle = palette.ring;
        ctx.lineWidth = 1.5 + (audioEnergy * 2);
        ctx.globalAlpha = 0.45 + (audioEnergy * 0.35);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(tipX, tipY, 2.5 + (audioEnergy * 3), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }

    ctx.beginPath();
    ctx.arc(cX, cY, radius * 0.55, 0, Math.PI * 2);
    ctx.arc(cX, cY, radius * 0.95, 0, Math.PI * 2);
    ctx.strokeStyle = palette.ring;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    ctx.stroke();

    ctx.restore();
  }

  _renderSilk(ctx, palette, radius, audioData, cX, cY) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const ribbons = 4;
    const audioEnergy = audioData ? audioData.energy : 0;
    const waveW = this.width * 0.85;
    const startX = cX - waveW / 2;

    for (let r = 0; r < ribbons; r++) {
      const yOffset = (r - 1.5) * 28 * this.currentScale;
      const freq = 0.015 + r * 0.005;
      const amp = (24 + r * 12) * this.currentScale + (audioEnergy * 30);
      const speed = this.time * (1.2 + r * 0.4);

      ctx.beginPath();
      for (let x = 0; x <= waveW; x += 6) {
        const drawX = startX + x;
        const envelope = Math.sin((x / waveW) * Math.PI);
        const drawY = cY + yOffset + Math.sin(x * freq + speed) * amp * envelope;

        if (x === 0) ctx.moveTo(drawX, drawY);
        else ctx.lineTo(drawX, drawY);
      }

      ctx.strokeStyle = r % 2 === 0 ? palette.ring : palette.core2;
      ctx.lineWidth = 2.5 + (audioEnergy * 2);
      ctx.globalAlpha = 0.5 - (r * 0.08) + (audioEnergy * 0.3);
      ctx.stroke();
    }

    const silkGlow = ctx.createRadialGradient(cX, cY, 10, cX, cY, radius * 1.5);
    silkGlow.addColorStop(0, palette.core1);
    silkGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = silkGlow;
    ctx.beginPath();
    ctx.arc(cX, cY, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _renderProgressArc(ctx, palette, radius, cX, cY) {
    ctx.save();

    const arcRadius = radius + 24;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * this.progress);

    ctx.beginPath();
    ctx.arc(cX, cY, arcRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (this.progress > 0) {
      ctx.beginPath();
      ctx.arc(cX, cY, arcRadius, startAngle, endAngle);
      ctx.strokeStyle = palette.ring;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.shadowColor = palette.ring;
      ctx.shadowBlur = 12;
      ctx.stroke();

      const tipX = cX + Math.cos(endAngle) * arcRadius;
      const tipY = cY + Math.sin(endAngle) * arcRadius;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.fill();
    }

    ctx.restore();
  }

  _renderParticles(ctx, palette, currentRadius, audioData, cX, cY) {
    ctx.save();

    const isExhale = this.phase === 'exhale';
    const isHold = this.phase === 'hold';
    const energyBonus = audioData ? audioData.energy * 2.5 : 0;

    this.particles.forEach(p => {
      p.baseAngle += p.speed;

      if (!isHold) {
        const drift = isExhale ? 0.35 : -0.35;
        p.dist += drift;
        if (p.dist < currentRadius * 0.9) p.dist = currentRadius * 1.8 + Math.random() * 40;
        if (p.dist > Math.max(this.width, this.height) * 0.45) p.dist = currentRadius + 30;
      }

      let posX = cX + Math.cos(p.baseAngle) * p.dist;
      let posY = cY + Math.sin(p.baseAngle) * p.dist;

      if (this.rawMouseAbsX > 0) {
        const dx = posX - this.rawMouseAbsX;
        const dy = posY - this.rawMouseAbsY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 90) {
          const repelForce = (1 - (distance / 90)) * 24;
          posX += (dx / distance) * repelForce;
          posY += (dy / distance) * repelForce;
        }
      }

      const alphaPulse = p.alpha * (0.6 + 0.4 * Math.sin(this.time * 2 + p.baseAngle * 3));

      ctx.beginPath();
      ctx.arc(posX, posY, p.size + energyBonus, 0, Math.PI * 2);
      ctx.fillStyle = palette.particle;
      ctx.globalAlpha = Math.max(0.1, Math.min(0.95, alphaPulse + energyBonus * 0.2));
      ctx.shadowColor = palette.ring;
      ctx.shadowBlur = 8;
      ctx.fill();
    });

    ctx.restore();
  }
}

window.ZEN_THEMES = ZEN_THEMES;
window.ZenVisualizer = ZenVisualizer;
