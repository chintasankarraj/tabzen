/**
 * TabZen Breathing State Machine
 * Accurately tracks breath cycles, sub-second phases, easing, and session metrics.
 * Supports custom personalized interval protocols and Pomodoro Deep Work Flow.
 */

const BREATH_PROTOCOLS = {
  box: {
    id: 'box',
    name: 'Box Breathing',
    badge: 'Navy SEAL Focus',
    description: 'Equal intervals to regulate autonomic stress response and restore razor-sharp clarity.',
    phases: [
      { id: 'inhale', name: 'Inhale', duration: 4.0, cue: 'Breathe in steadily through your nose' },
      { id: 'hold', name: 'Hold', duration: 4.0, cue: 'Retain gently, keeping lungs soft' },
      { id: 'exhale', name: 'Exhale', duration: 4.0, cue: 'Release smoothly through your mouth' },
      { id: 'rest', name: 'Hold', duration: 4.0, cue: 'Rest in pure stillness' }
    ]
  },
  relax: {
    id: 'relax',
    name: '4-7-8 Relax',
    badge: 'Dr. Weil Method',
    description: 'Extended exhale activates the vagus nerve and downregulates fight-or-flight tension.',
    phases: [
      { id: 'inhale', name: 'Inhale', duration: 4.0, cue: 'Inhale quietly through your nose' },
      { id: 'hold', name: 'Hold', duration: 7.0, cue: 'Hold breath with tranquil focus' },
      { id: 'exhale', name: 'Exhale', duration: 8.0, cue: 'Whoosh exhale completely through mouth' }
    ]
  },
  resonant: {
    id: 'resonant',
    name: 'Resonant / HRV',
    badge: 'Optimal Coherence',
    description: '5.5 breaths per minute optimizes Heart Rate Variability (HRV) and synchronizes blood pressure.',
    phases: [
      { id: 'inhale', name: 'Inhale', duration: 5.5, cue: 'Smooth rhythmic expansion' },
      { id: 'exhale', name: 'Exhale', duration: 5.5, cue: 'Effortless continuous release' }
    ]
  },
  awaken: {
    id: 'awaken',
    name: 'Awaken & Reset',
    badge: 'Energy Boost',
    description: 'Short stimulating breath pattern to defeat afternoon fatigue and brain fog.',
    phases: [
      { id: 'inhale', name: 'Inhale', duration: 4.0, cue: 'Deep energizing breath in' },
      { id: 'hold', name: 'Hold', duration: 2.0, cue: 'Lock in oxygen and alertness' },
      { id: 'exhale', name: 'Exhale', duration: 4.0, cue: 'Clear out sluggishness' }
    ]
  },
  custom: {
    id: 'custom',
    name: 'Custom Protocol',
    badge: 'Personalized',
    description: 'Your tailored rhythm intervals.',
    phases: [
      { id: 'inhale', name: 'Inhale', duration: 4.0, cue: 'Inhale deeply' },
      { id: 'hold', name: 'Hold', duration: 4.0, cue: 'Pause and retain' },
      { id: 'exhale', name: 'Exhale', duration: 4.0, cue: 'Release slowly' },
      { id: 'rest', name: 'Rest', duration: 2.0, cue: 'Rest and reset' }
    ]
  }
};

class BreathingEngine {
  constructor(options = {}) {
    this.protocolId = options.protocolId || 'box';
    this.targetDuration = options.targetDuration || 60; // 60s default
    this.customPhases = options.customPhases || null;

    // App Mode: 'reset' | 'pomodoro'
    this.appMode = 'reset';
    this.pomodoroPhase = 'work'; // 'work' | 'break'
    this.pomodoroWorkDuration = 25 * 60; // 25 mins
    this.pomodoroBreakDuration = 60;    // 60s reset
    this.pomodoroRemaining = this.pomodoroWorkDuration;
    this.lastPomodoroTick = 0;

    this.isRunning = false;
    this.isPaused = false;

    this.currentPhaseIdx = 0;
    this.phaseStartTime = 0;
    this.sessionStartTime = 0;
    this.elapsedInSession = 0;
    this.completedCycles = 0;

    this.animationFrameId = null;

    // Callbacks
    this.onTick = options.onTick || (() => {});
    this.onPhaseChange = options.onPhaseChange || (() => {});
    this.onSessionComplete = options.onSessionComplete || (() => {});
    this.onPomodoroPhaseChange = options.onPomodoroPhaseChange || (() => {});
  }

  get activeProtocol() {
    if (this.protocolId === 'custom' && this.customPhases) {
      return {
        id: 'custom',
        name: 'Custom Protocol',
        badge: 'Personalized',
        description: 'Your customized rhythmic breathing intervals.',
        phases: this.customPhases
      };
    }
    return BREATH_PROTOCOLS[this.protocolId] || BREATH_PROTOCOLS.box;
  }

  get currentPhase() {
    const phases = this.activeProtocol.phases;
    return phases[this.currentPhaseIdx % phases.length];
  }

  setAppMode(mode) {
    if (mode === 'reset' || mode === 'pomodoro') {
      this.reset();
      this.appMode = mode;
      this.pomodoroPhase = 'work';
      this.pomodoroRemaining = this.pomodoroWorkDuration;
    }
  }

  setProtocol(id) {
    if (BREATH_PROTOCOLS[id] || id === 'custom') {
      const wasRunning = this.isRunning;
      this.reset();
      this.protocolId = id;
      if (wasRunning) {
        this.start();
      }
    }
  }

  setCustomPhases(phases) {
    this.customPhases = phases;
    if (this.protocolId === 'custom') {
      this.reset();
    }
  }

  setTargetDuration(seconds) {
    this.targetDuration = seconds;
  }

  start() {
    if (this.isRunning && !this.isPaused) return;

    const now = performance.now();
    if (this.isPaused) {
      const pausedDuration = now - this.pauseTime;
      this.phaseStartTime += pausedDuration;
      this.sessionStartTime += pausedDuration;
      this.lastPomodoroTick = now;
      this.isPaused = false;
    } else {
      this.isRunning = true;
      this.isPaused = false;
      this.currentPhaseIdx = 0;
      this.completedCycles = 0;
      this.elapsedInSession = 0;
      this.sessionStartTime = now;
      this.phaseStartTime = now;
      this.lastPomodoroTick = now;

      if (this.appMode === 'reset' || this.pomodoroPhase === 'break') {
        this.onPhaseChange(this.currentPhase, this.currentPhaseIdx);
      }
    }

    this._loop();
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this.pauseTime = performance.now();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentPhaseIdx = 0;
    this.completedCycles = 0;
    this.elapsedInSession = 0;
    this.pomodoroPhase = 'work';
    this.pomodoroRemaining = this.pomodoroWorkDuration;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.onTick(this._buildState(0, this.currentPhase.duration, 0));
  }

  _loop() {
    if (!this.isRunning || this.isPaused) return;

    const now = performance.now();

    // 1. Pomodoro Work Sprint Logic
    if (this.appMode === 'pomodoro' && this.pomodoroPhase === 'work') {
      const deltaSec = (now - this.lastPomodoroTick) / 1000;
      this.lastPomodoroTick = now;
      this.pomodoroRemaining = Math.max(0, this.pomodoroRemaining - deltaSec);

      if (this.pomodoroRemaining <= 0) {
        // Transition from 25m Focus to 60s Guided Breath Reset!
        this.pomodoroPhase = 'break';
        this.sessionStartTime = now;
        this.phaseStartTime = now;
        this.elapsedInSession = 0;
        this.currentPhaseIdx = 0;
        this.onPomodoroPhaseChange('work', 'break');
        this.onPhaseChange(this.currentPhase, 0);
      }

      this.onTick(this._buildPomodoroWorkState());
      this.animationFrameId = requestAnimationFrame(() => this._loop());
      return;
    }

    // 2. Breath Reset Cycle Logic (Used in Reset mode and Pomodoro Break)
    const phaseDurationMs = this.currentPhase.duration * 1000;
    const timeInPhaseMs = now - this.phaseStartTime;
    this.elapsedInSession = (now - this.sessionStartTime) / 1000;

    // Phase transition check
    if (timeInPhaseMs >= phaseDurationMs) {
      const phases = this.activeProtocol.phases;
      this.currentPhaseIdx = (this.currentPhaseIdx + 1) % phases.length;
      this.phaseStartTime = now;

      if (this.currentPhaseIdx === 0) {
        this.completedCycles++;
      }

      this.onPhaseChange(this.currentPhase, this.currentPhaseIdx);
    }

    // Target session duration check (if not infinite)
    const effectiveTarget = this.appMode === 'pomodoro' ? this.pomodoroBreakDuration : this.targetDuration;
    if (effectiveTarget > 0 && this.elapsedInSession >= effectiveTarget) {
      this.finishSession();
      return;
    }

    const progress = Math.min(1.0, (now - this.phaseStartTime) / (this.currentPhase.duration * 1000));
    const remainingInPhase = Math.max(0, this.currentPhase.duration * (1 - progress));

    this.onTick(this._buildState(progress, remainingInPhase, this.elapsedInSession));

    this.animationFrameId = requestAnimationFrame(() => this._loop());
  }

  _buildPomodoroWorkState() {
    const total = this.pomodoroWorkDuration;
    const rem = this.pomodoroRemaining;
    const progress = (total - rem) / total;
    const mins = Math.floor(rem / 60);
    const secs = Math.floor(rem % 60);

    return {
      appMode: 'pomodoro',
      pomodoroPhase: 'work',
      pomodoroRemaining: rem,
      pomodoroDisplay: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
      phase: 'focus',
      phaseName: 'Deep Work Sprint',
      phaseCue: 'Maintain calm focus. Background alpha waves active.',
      phaseProgress: progress,
      phaseTimeRemaining: rem,
      lungVolume: 0.5,
      elapsedInSession: total - rem,
      targetDuration: total,
      sessionProgress: progress,
      completedCycles: 0,
      isRunning: this.isRunning,
      isPaused: this.isPaused
    };
  }

  _buildState(progress, remainingInPhase, elapsedInSession) {
    const phase = this.currentPhase;
    let lungVolume = 0;
    if (phase.id === 'inhale') {
      lungVolume = progress;
    } else if (phase.id === 'hold') {
      lungVolume = 1.0;
    } else if (phase.id === 'exhale') {
      lungVolume = 1.0 - progress;
    } else {
      lungVolume = 0.0;
    }

    const effectiveTarget = this.appMode === 'pomodoro' ? this.pomodoroBreakDuration : this.targetDuration;

    return {
      appMode: this.appMode,
      pomodoroPhase: this.pomodoroPhase,
      phase: phase.id,
      phaseName: phase.name,
      phaseCue: phase.cue,
      phaseProgress: progress,
      phaseDuration: phase.duration,
      phaseTimeRemaining: remainingInPhase,
      lungVolume: lungVolume,
      elapsedInSession: elapsedInSession,
      targetDuration: effectiveTarget,
      sessionProgress: effectiveTarget > 0 ? Math.min(1.0, elapsedInSession / effectiveTarget) : 0,
      completedCycles: this.completedCycles,
      isRunning: this.isRunning,
      isPaused: this.isPaused
    };
  }

  finishSession() {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const stats = {
      appMode: this.appMode,
      protocol: this.activeProtocol.name,
      durationSeconds: Math.round(this.elapsedInSession),
      completedCycles: this.completedCycles,
      estimatedStressReduction: Math.min(38, Math.round(this.completedCycles * 3.5 + (this.elapsedInSession / 10))),
      timestamp: new Date().toISOString()
    };

    if (this.appMode === 'pomodoro') {
      this.pomodoroPhase = 'work';
      this.pomodoroRemaining = this.pomodoroWorkDuration;
    }

    this.onSessionComplete(stats);
  }
}

window.BREATH_PROTOCOLS = BREATH_PROTOCOLS;
window.BreathingEngine = BreathingEngine;
