/**
 * TabZen Main Application Controller
 * Wires together breathing state machine, procedural audio synthesizer,
 * canvas visualizer, theme engine, haptic feedback, multi-language Web Speech cues,
 * 8D spatial audio, visualizer modes (Orb, Mandala, Silk), custom rhythm builder,
 * Pomodoro Flow mode, Heart Rate EKG Coherence tracker, and shareable PNG card generator.
 */

document.addEventListener('DOMContentLoaded', () => {
  // PWA Service Worker Registration
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // DOM Elements
  const canvas = document.getElementById('zen-canvas');
  const playBtn = document.getElementById('play-btn');
  const playBtnIcon = document.getElementById('play-btn-icon');
  const playBtnText = document.getElementById('play-btn-text');
  const resetBtn = document.getElementById('reset-btn');
  const muteBtn = document.getElementById('mute-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const soundSettingsBtn = document.getElementById('sound-settings-btn');
  const closeSoundDrawerBtn = document.getElementById('close-sound-drawer');
  const soundDrawer = document.getElementById('sound-drawer');

  // App Mode Elements
  const modeResetBtn = document.getElementById('mode-reset-btn');
  const modePomodoroBtn = document.getElementById('mode-pomodoro-btn');
  const protocolSelectorBar = document.getElementById('protocol-selector-bar');
  const durationSelectorBar = document.getElementById('duration-selector-bar');

  // Text Elements
  const phaseTitle = document.getElementById('phase-title');
  const phaseCue = document.getElementById('phase-cue');
  const countdownTimer = document.getElementById('countdown-timer');
  const sessionProgress = document.getElementById('session-progress-fill');
  const sessionTimeDisplay = document.getElementById('session-time-display');
  const cyclesCountDisplay = document.getElementById('cycles-count');
  const streakCountDisplay = document.getElementById('streak-count');

  // Protocol, Visualizer Mode & Duration Selectors
  const protocolPills = document.querySelectorAll('.protocol-pill');
  const durationPills = document.querySelectorAll('.duration-pill');
  const themeButtons = document.querySelectorAll('.theme-opt-btn');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const vizModeButtons = document.querySelectorAll('.viz-mode-btn');
  const voiceGuideToggle = document.getElementById('voice-guide-toggle');
  const spatialAudioToggle = document.getElementById('spatial-audio-toggle');
  const voiceLangSelect = document.getElementById('voice-lang-select');

  // Heart Rate EKG Elements
  const openHeartbeatBtn = document.getElementById('open-heartbeat-btn');
  const ekgBadgeText = document.getElementById('ekg-badge-text');
  const heartbeatModal = document.getElementById('heartbeat-modal');
  const heartbeatTapBtn = document.getElementById('heartbeat-tap-btn');
  const tapFeedbackText = document.getElementById('tap-feedback-text');
  const heartbeatCalcDisplay = document.getElementById('heartbeat-calc-display');
  const applyHeartbeatBtn = document.getElementById('apply-heartbeat-btn');
  const closeHeartbeatModal = document.getElementById('close-heartbeat-modal');

  // Mic Breath, Circadian, Blue-Light & EMDR Elements
  const micBreathBtn = document.getElementById('mic-breath-btn');
  const micBadgeText = document.getElementById('mic-badge-text');
  const circadianBtn = document.getElementById('circadian-btn');
  const blueLightBtn = document.getElementById('blue-light-btn');
  const emdrToggleBtn = document.getElementById('emdr-toggle-btn');

  // Audio Sliders & Synthesizers
  const masterVol = document.getElementById('master-vol');
  const bellVol = document.getElementById('bell-vol');
  const waveVol = document.getElementById('wave-vol');
  const noiseVol = document.getElementById('noise-vol');
  const binauralVol = document.getElementById('binaural-vol');
  const rainVol = document.getElementById('rain-vol');
  const thunderVol = document.getElementById('thunder-vol');
  const isochronicVol = document.getElementById('isochronic-vol');
  const isochronicRateSelect = document.getElementById('isochronic-rate-select');
  const solfeggioSelect = document.getElementById('solfeggio-select');
  const solfeggioValBadge = document.getElementById('solfeggio-val-badge');
  const triggerThunderBtn = document.getElementById('trigger-thunder-btn');

  // Video Recording Elements
  const recordVideoBtn = document.getElementById('record-video-btn');
  const recordBtnText = document.getElementById('record-btn-text');
  const modalRecordVideoBtn = document.getElementById('modal-record-video-btn');

  // Custom Rhythm Elements
  const openCustomCfgBtn = document.getElementById('open-custom-cfg');
  const customModal = document.getElementById('custom-rhythm-modal');
  const closeCustomModal = document.getElementById('close-custom-modal');
  const saveCustomBtn = document.getElementById('save-custom-btn');
  const customInhaleSlider = document.getElementById('custom-inhale-slider');
  const customHoldSlider = document.getElementById('custom-hold-slider');
  const customExhaleSlider = document.getElementById('custom-exhale-slider');
  const customRestSlider = document.getElementById('custom-rest-slider');
  const customInhaleVal = document.getElementById('custom-inhale-val');
  const customHoldVal = document.getElementById('custom-hold-val');
  const customExhaleVal = document.getElementById('custom-exhale-val');
  const customRestVal = document.getElementById('custom-rest-val');

  // Analytics Modal Elements
  const openAnalyticsBtn = document.getElementById('open-analytics-btn');
  const analyticsModal = document.getElementById('analytics-modal');
  const closeAnalyticsModal = document.getElementById('close-analytics-modal');
  const resetAnalyticsBtn = document.getElementById('reset-analytics-btn');
  const analyticsTotalMinutes = document.getElementById('analytics-total-minutes');
  const analyticsTotalBreaths = document.getElementById('analytics-total-breaths');
  const analyticsOxygen = document.getElementById('analytics-oxygen');
  const analyticsStreak = document.getElementById('analytics-streak');
  const heatmapGrid = document.getElementById('heatmap-grid');
  const heatmapTooltip = document.getElementById('heatmap-tooltip');

  // Interactive Crystal Bowl Keys
  const zenKeyButtons = document.querySelectorAll('.zen-key');

  // Completion Modal & Share Elements
  const completionModal = document.getElementById('completion-modal');
  const closeCompletionModal = document.getElementById('close-completion-modal');
  const linkedinDirectBtn = document.getElementById('linkedin-direct-btn');
  const nativeShareBtn = document.getElementById('native-share-btn');
  const copyShareBtn = document.getElementById('copy-share-btn');
  const downloadCardBtn = document.getElementById('download-card-btn');
  const shareFeedback = document.getElementById('share-feedback');
  const modalStatsBreaths = document.getElementById('modal-stats-breaths');
  const modalStatsTime = document.getElementById('modal-stats-time');
  const modalStatsReduction = document.getElementById('modal-stats-reduction');
  const modalQuoteText = document.getElementById('modal-quote-text');
  const modalQuoteAuthor = document.getElementById('modal-quote-author');
  const offscreenCardCanvas = document.getElementById('offscreen-card-canvas');

  // Multi-Language Voice Translations Dictionary
  const VOICE_LANGUAGES = {
    en: { lang: 'en-US', inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale', rest: 'Rest', ready: 'Voice guide ready' },
    es: { lang: 'es-ES', inhale: 'Inhala', hold: 'Mantén', exhale: 'Exhala', rest: 'Descansa', ready: 'Guía de voz lista' },
    fr: { lang: 'fr-FR', inhale: 'Inspirez', hold: 'Retenez', exhale: 'Expirez', rest: 'Reposez', ready: 'Guide vocal prêt' },
    ja: { lang: 'ja-JP', inhale: '吸って', hold: '止めて', exhale: '吐いて', rest: '休んで', ready: '音声ガイド準備完了' },
    de: { lang: 'de-DE', inhale: 'Einatmen', hold: 'Halten', exhale: 'Ausatmen', rest: 'Ruhen', ready: 'Sprachführung bereit' },
    hi: { lang: 'hi-IN', inhale: 'सांस अंदर', hold: 'रोकें', exhale: 'सांस बाहर', rest: 'विश्राम', ready: 'वॉइस गाइड तैयार' },
    te: { lang: 'te-IN', inhale: 'శ్వాస తీసుకోండి', hold: 'ఆపండి', exhale: 'శ్వాస వదలండి', rest: 'విశ్రాంతి', ready: 'వాయిస్ గైడ్ సిద్ధంగా ఉంది' }
  };

  // Quotes Repository
  const MINDFUL_QUOTES = [
    { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thích Nhất Hạnh" },
    { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { text: "Quiet the mind, and the soul will speak.", author: "Jaya Jaya Myra" },
    { text: "A calm mind brings inner strength and self-confidence, so that's very important for good health.", author: "Dalai Lama" },
    { text: "Tension is who you think you should be. Relaxation is who you are.", author: "Chinese Proverb" },
    { text: "Between stimulus and response there is a space. In that space is our power to choose.", author: "Viktor E. Frankl" }
  ];

  // Initialize Engines
  const audioEngine = new ZenAudioEngine();
  const visualizer = new ZenVisualizer(canvas, audioEngine);

  let currentDuration = 60; // 60s default
  let currentActiveStats = null;
  let currentActiveQuote = null;
  let isVoiceGuideEnabled = false;
  let selectedVoiceLang = 'en';

  // Heart Rate & Coherence State
  let tapTimestamps = [];
  let calculatedBPM = null;
  let isCardiacCoherenceLocked = false;

  // Visualizer Mode Selection
  vizModeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      vizModeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      visualizer.setMode(btn.dataset.mode);
    });
  });

  // 8D Spatial Audio Toggle
  if (spatialAudioToggle) {
    spatialAudioToggle.addEventListener('change', (e) => {
      audioEngine.set8DEnabled(e.target.checked);
    });
  }

  // Multi-Language Web Speech Voice Whisperer
  class VoiceWhisperer {
    constructor() {
      this.synth = window.speechSynthesis || null;
      this.voice = null;
      this.currentLangKey = 'en';
      this.init();
    }
    init() {
      if (!this.synth) return;
      this.updateVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.updateVoice();
      }
    }
    setLanguage(langKey) {
      if (VOICE_LANGUAGES[langKey]) {
        this.currentLangKey = langKey;
        this.updateVoice();
      }
    }
    updateVoice() {
      if (!this.synth) return;
      const targetLang = VOICE_LANGUAGES[this.currentLangKey].lang.substring(0, 2);
      const voices = this.synth.getVoices();
      this.voice = voices.find(v => v.lang.startsWith(targetLang) && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Mohan') || v.name.includes('Zira'))) 
                || voices.find(v => v.lang.startsWith(targetLang))
                || voices[0];
    }
    speak(phraseId) {
      if (!isVoiceGuideEnabled || !this.synth) return;
      try {
        const dict = VOICE_LANGUAGES[this.currentLangKey] || VOICE_LANGUAGES.en;
        const text = dict[phraseId] || phraseId;
        this.synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        if (this.voice) utter.voice = this.voice;
        utter.rate = this.currentLangKey === 'ja' ? 0.9 : 0.8;
        utter.pitch = 0.9;
        utter.volume = 0.8;
        this.synth.speak(utter);
      } catch (e) {}
    }
  }

  const voiceWhisperer = new VoiceWhisperer();

  if (voiceLangSelect) {
    voiceLangSelect.addEventListener('change', (e) => {
      selectedVoiceLang = e.target.value;
      voiceWhisperer.setLanguage(selectedVoiceLang);
      if (isVoiceGuideEnabled) {
        voiceWhisperer.speak('ready');
      }
    });
  }

  if (voiceGuideToggle) {
    voiceGuideToggle.addEventListener('change', (e) => {
      isVoiceGuideEnabled = e.target.checked;
      if (isVoiceGuideEnabled) {
        voiceWhisperer.speak('ready');
      }
    });
  }

  // Heartbeat Tap-to-Sync Engine
  openHeartbeatBtn.addEventListener('click', () => {
    tapTimestamps = [];
    heartbeatCalcDisplay.textContent = '';
    tapFeedbackText.textContent = 'Tap Here';
    applyHeartbeatBtn.style.display = 'none';
    heartbeatModal.classList.add('show');
  });

  closeHeartbeatModal.addEventListener('click', () => heartbeatModal.classList.remove('show'));

  heartbeatTapBtn.addEventListener('click', () => {
    const now = performance.now();
    tapTimestamps.push(now);

    // Keep last 8 taps
    if (tapTimestamps.length > 8) tapTimestamps.shift();

    tapFeedbackText.textContent = `${tapTimestamps.length} / 6 taps`;

    if (tapTimestamps.length >= 4) {
      // Calculate average inter-tap interval
      let totalIntervalMs = 0;
      for (let i = 1; i < tapTimestamps.length; i++) {
        totalIntervalMs += (tapTimestamps[i] - tapTimestamps[i - 1]);
      }
      const avgIntervalSec = (totalIntervalMs / (tapTimestamps.length - 1)) / 1000;
      const bpm = Math.round(60 / avgIntervalSec);

      if (bpm >= 45 && bpm <= 140) {
        calculatedBPM = bpm;
        heartbeatCalcDisplay.textContent = `Pulse: ${calculatedBPM} BPM`;
        applyHeartbeatBtn.style.display = 'block';
      }
    }
  });

  applyHeartbeatBtn.addEventListener('click', () => {
    if (calculatedBPM) {
      // Check for 0.1 Hz Mayer Wave Cardiac-Respiratory Resonance
      isCardiacCoherenceLocked = (breathingEngine.protocolId === 'resonant' || breathingEngine.protocolId === 'box');

      visualizer.setHeartRate(calculatedBPM, isCardiacCoherenceLocked);
      ekgBadgeText.textContent = `${calculatedBPM} BPM${isCardiacCoherenceLocked ? ' • Locked ✨' : ''}`;
      openHeartbeatBtn.classList.toggle('locked', isCardiacCoherenceLocked);

      heartbeatModal.classList.remove('show');
    }
  });

  // Soundscape Preset Switching
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const presetKey = btn.dataset.preset;
      const preset = audioEngine.applyPreset(presetKey);
      if (preset) {
        masterVol.value = preset.volumes.master;
        bellVol.value = preset.volumes.bell;
        waveVol.value = preset.volumes.wave;
        noiseVol.value = preset.volumes.noise;
        binauralVol.value = preset.volumes.binaural;
        if (rainVol && preset.volumes.rain !== undefined) rainVol.value = preset.volumes.rain;
        if (thunderVol && preset.volumes.thunder !== undefined) thunderVol.value = preset.volumes.thunder;
        if (isochronicVol && preset.volumes.isochronic !== undefined) isochronicVol.value = preset.volumes.isochronic;
      }
    });
  });

  // Streak, Consistency & Analytics Storage
  const statsStorage = {
    get: () => {
      try {
        const parsed = JSON.parse(localStorage.getItem('tabzen_stats'));
        if (parsed && typeof parsed === 'object') {
          return {
            totalMinutes: parsed.totalMinutes || 0,
            totalSeconds: parsed.totalSeconds || 0,
            totalSessions: parsed.totalSessions || 0,
            totalBreaths: parsed.totalBreaths || 0,
            lastActiveDate: parsed.lastActiveDate || null,
            currentStreak: parsed.currentStreak || 1,
            bestStreak: parsed.bestStreak || parsed.currentStreak || 1,
            dailyLog: parsed.dailyLog || {}
          };
        }
      } catch (e) {}
      return {
        totalMinutes: 0,
        totalSeconds: 0,
        totalSessions: 0,
        totalBreaths: 0,
        lastActiveDate: null,
        currentStreak: 1,
        bestStreak: 1,
        dailyLog: {}
      };
    },
    saveSession: (durationSec, completedCycles = 1) => {
      const stats = statsStorage.get();
      const today = new Date().toISOString().split('T')[0];
      const mins = Math.max(1, Math.round(durationSec / 60));
      const cycles = Math.max(1, completedCycles || 1);

      stats.totalSeconds += durationSec;
      stats.totalMinutes += mins;
      stats.totalSessions += 1;
      stats.totalBreaths += cycles;

      // Update daily activity log
      if (!stats.dailyLog[today]) {
        stats.dailyLog[today] = { seconds: 0, minutes: 0, sessions: 0, breaths: 0 };
      }
      stats.dailyLog[today].seconds += durationSec;
      stats.dailyLog[today].minutes += mins;
      stats.dailyLog[today].sessions += 1;
      stats.dailyLog[today].breaths += cycles;

      // Streak calculation
      if (stats.lastActiveDate) {
        const last = new Date(stats.lastActiveDate);
        const cur = new Date(today);
        const diffDays = Math.round((cur - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          stats.currentStreak += 1;
        } else if (diffDays > 1) {
          stats.currentStreak = 1;
        }
      } else {
        stats.currentStreak = 1;
      }

      if (stats.currentStreak > (stats.bestStreak || 1)) {
        stats.bestStreak = stats.currentStreak;
      }
      stats.lastActiveDate = today;

      try {
        localStorage.setItem('tabzen_stats', JSON.stringify(stats));
      } catch (e) {}

      return stats;
    },
    clear: () => {
      localStorage.removeItem('tabzen_stats');
      if (streakCountDisplay) streakCountDisplay.textContent = '1';
    }
  };

  // Render Mindful Analytics & 7-Day Consistency Heatmap
  function renderAnalyticsModal() {
    const stats = statsStorage.get();

    if (analyticsTotalMinutes) analyticsTotalMinutes.textContent = stats.totalMinutes;
    if (analyticsTotalBreaths) analyticsTotalBreaths.textContent = stats.totalBreaths;
    
    // Oxygen calculation: ~0.5L fresh air per conscious breath cycle
    const estOxygen = (stats.totalBreaths > 0 
      ? (stats.totalBreaths * 0.5) 
      : (stats.totalMinutes * 6 * 0.5)
    ).toFixed(1);
    if (analyticsOxygen) analyticsOxygen.textContent = `${estOxygen} L`;
    if (analyticsStreak) analyticsStreak.textContent = `${stats.currentStreak} 🔥`;

    if (!heatmapGrid) return;
    heatmapGrid.innerHTML = '';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];
      const dayNum = d.getDate();

      const log = stats.dailyLog && stats.dailyLog[dateStr] 
        ? stats.dailyLog[dateStr] 
        : { minutes: 0, sessions: 0, breaths: 0 };
      
      let level = 0;
      if (log.minutes >= 5 || log.sessions >= 3) level = 3;
      else if (log.minutes >= 3 || log.sessions >= 2) level = 2;
      else if (log.minutes >= 1 || log.sessions >= 1) level = 1;

      const col = document.createElement('div');
      col.className = 'heatmap-day-col';

      const nameEl = document.createElement('span');
      nameEl.className = 'heatmap-day-name';
      nameEl.textContent = dayName;

      const tile = document.createElement('div');
      tile.className = `heatmap-tile level-${level}`;
      tile.dataset.date = dateStr;
      tile.dataset.minutes = log.minutes;
      tile.dataset.sessions = log.sessions;
      tile.dataset.breaths = log.breaths;

      // Dynamic hover tooltip
      tile.addEventListener('mouseenter', () => {
        if (!heatmapTooltip) return;
        heatmapTooltip.textContent = `${dayName}, ${dateStr.slice(5)}: ${log.sessions} reset${log.sessions === 1 ? '' : 's'} • ${log.minutes}m • ${log.breaths} breaths`;
        heatmapTooltip.classList.add('show');
      });
      tile.addEventListener('mouseleave', () => {
        if (heatmapTooltip) heatmapTooltip.classList.remove('show');
      });

      const dateLbl = document.createElement('span');
      dateLbl.className = 'heatmap-date-lbl';
      dateLbl.textContent = dayNum;

      col.appendChild(nameEl);
      col.appendChild(tile);
      col.appendChild(dateLbl);
      heatmapGrid.appendChild(col);
    }
  }

  // Analytics Modal Listeners
  if (openAnalyticsBtn) {
    openAnalyticsBtn.addEventListener('click', () => {
      renderAnalyticsModal();
      analyticsModal.classList.add('show');
    });
  }

  if (closeAnalyticsModal) {
    closeAnalyticsModal.addEventListener('click', () => {
      analyticsModal.classList.remove('show');
    });
  }

  if (resetAnalyticsBtn) {
    resetAnalyticsBtn.addEventListener('click', () => {
      if (confirm('Reset your local mindful reset history and heatmap?')) {
        statsStorage.clear();
        renderAnalyticsModal();
      }
    });
  }

  // Interactive 432Hz Crystal Bowl Synthesizer (A-L keys)
  const KEY_NOTE_MAP = {
    'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 4, 'h': 5, 'j': 6, 'k': 7, 'l': 8
  };

  const NOTE_RIPPLE_COLORS = [
    '#fb7185', '#fb923c', '#facc15', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#f43f5e'
  ];

  function playCrystalBowl(idx, fromKeyEl = null) {
    if (idx < 0 || idx > 8) return;
    audioEngine.resume();
    audioEngine.playTunedNote(idx);

    // Compute ripple position
    let ripX = null;
    let ripY = null;
    if (fromKeyEl && canvas) {
      const rect = fromKeyEl.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      ripX = rect.left + rect.width / 2 - canvasRect.left;
      ripY = visualizer.height - 40;
    } else {
      ripX = visualizer.centerX + (idx - 4) * 40;
      ripY = visualizer.centerY + (Math.sin(idx * 0.8) * 30);
    }

    const noteColor = NOTE_RIPPLE_COLORS[idx] || '#2dd4bf';
    visualizer.triggerRipple(ripX, ripY, noteColor);

    // Visual button active pulse
    const keyBtn = fromKeyEl || document.querySelector(`.zen-key[data-note-idx="${idx}"]`);
    if (keyBtn) {
      keyBtn.classList.add('active');
      setTimeout(() => keyBtn.classList.remove('active'), 200);
    }

    // Micro-haptic
    if ('vibrate' in navigator) {
      try { navigator.vibrate(15); } catch (e) {}
    }
  }

  // Attach touch/click listeners to on-screen Zen keys
  zenKeyButtons.forEach(btn => {
    const noteIdx = parseInt(btn.dataset.noteIdx, 10);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      playCrystalBowl(noteIdx, btn);
    });
  });

  // Theme Management
  function applyTheme(themeId) {
    document.body.setAttribute('data-theme', themeId);
    visualizer.setTheme(themeId);
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeId);
    });
    localStorage.setItem('tabzen_theme', themeId);
  }

  const savedTheme = localStorage.getItem('tabzen_theme') || 'cosmic';
  applyTheme(savedTheme);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  // Circadian Solar Clock Engine (Auto-Theme Based on Local Time)
  let isCircadianActive = false;
  function getCircadianThemeForNow() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'solar';   // Solar Dawn (morning energize)
    if (hour >= 11 && hour < 17) return 'forest'; // Forest Zen (midday deep focus)
    if (hour >= 17 && hour < 21) return 'sakura'; // Sakura Dusk (evening wind-down)
    return 'cosmic';                              // Cosmic OLED (night reset)
  }

  if (circadianBtn) {
    circadianBtn.addEventListener('click', () => {
      isCircadianActive = !isCircadianActive;
      circadianBtn.classList.toggle('active', isCircadianActive);
      if (isCircadianActive) {
        const targetTheme = getCircadianThemeForNow();
        applyTheme(targetTheme);
        shareFeedback.textContent = `🌓 Circadian Solar Mode ON: Synced to ${targetTheme.toUpperCase()} theme`;
        shareFeedback.classList.add('visible');
        setTimeout(() => shareFeedback.classList.remove('visible'), 4000);
      } else {
        shareFeedback.textContent = 'Circadian Mode OFF (Manual Theme)';
        shareFeedback.classList.add('visible');
        setTimeout(() => shareFeedback.classList.remove('visible'), 2500);
      }
    });
  }

  // Night-Shift Blue-Light Shield (2700K Warm Melatonin Protection)
  let isBlueLightShield = false;
  if (blueLightBtn) {
    blueLightBtn.addEventListener('click', () => {
      isBlueLightShield = !isBlueLightShield;
      document.body.classList.toggle('blue-light-shield', isBlueLightShield);
      blueLightBtn.classList.toggle('active', isBlueLightShield);
      visualizer.setBlueLightFilter(isBlueLightShield);
      shareFeedback.textContent = isBlueLightShield 
        ? '🌙 Night-Shift Blue-Light Shield ON (Warm 2700K Amber)' 
        : 'Blue-Light Shield OFF';
      shareFeedback.classList.add('visible');
      setTimeout(() => shareFeedback.classList.remove('visible'), 3000);
    });
  }

  // Acoustic Microphone Breath Follower ("Live Breath Tracking")
  let isMicTracking = false;
  if (micBreathBtn) {
    micBreathBtn.addEventListener('click', async () => {
      if (!isMicTracking) {
        try {
          await audioEngine.startMicBreathDetection((energy) => {
            visualizer.setMicEnergy(energy);
          });
          isMicTracking = true;
          micBreathBtn.classList.add('active');
          if (micBadgeText) micBadgeText.textContent = 'Live Breath';
          shareFeedback.textContent = '🎙️ Mic Breath Active: Exhale softly to expand visualizer!';
          shareFeedback.classList.add('visible');
          setTimeout(() => shareFeedback.classList.remove('visible'), 4000);
        } catch (err) {
          alert('Microphone access blocked or unavailable: ' + err.message);
        }
      } else {
        audioEngine.stopMicBreathDetection();
        visualizer.setMicEnergy(0);
        isMicTracking = false;
        micBreathBtn.classList.remove('active');
        if (micBadgeText) micBadgeText.textContent = 'Mic Sync';
        shareFeedback.textContent = 'Mic Breath Follower paused';
        shareFeedback.classList.add('visible');
        setTimeout(() => shareFeedback.classList.remove('visible'), 2500);
      }
    });
  }

  // Bilateral EMDR Anxiety Relief Guide
  let isEMDRActive = false;
  function toggleEMDR() {
    isEMDRActive = !isEMDRActive;
    if (emdrToggleBtn) emdrToggleBtn.classList.toggle('active', isEMDRActive);
    visualizer.setEMDREnabled(isEMDRActive);
    shareFeedback.textContent = isEMDRActive 
      ? '👁️ Bilateral EMDR Guide ON: Follow the light with your eyes' 
      : 'EMDR Guide OFF';
    shareFeedback.classList.add('visible');
    setTimeout(() => shareFeedback.classList.remove('visible'), 3000);
  }

  if (emdrToggleBtn) {
    emdrToggleBtn.addEventListener('click', toggleEMDR);
  }

  const currentStats = statsStorage.get();
  if (streakCountDisplay) streakCountDisplay.textContent = currentStats.currentStreak;

  // Haptic Feedback for Mobile Devices
  function triggerHaptics(phaseId) {
    if ('vibrate' in navigator) {
      try {
        if (phaseId === 'inhale') {
          navigator.vibrate([45]);
        } else if (phaseId === 'hold') {
          navigator.vibrate([25]);
        } else if (phaseId === 'exhale') {
          navigator.vibrate([35, 40, 35]);
        } else {
          navigator.vibrate([20]);
        }
      } catch (e) {}
    }
  }

  // Load Saved Custom Rhythm
  function loadCustomRhythm() {
    try {
      const saved = JSON.parse(localStorage.getItem('tabzen_custom_rhythm'));
      if (saved) return saved;
    } catch (e) {}
    return { inhale: 4, hold: 4, exhale: 4, rest: 2 };
  }

  function getCustomPhasesArray(cfg) {
    const phases = [
      { id: 'inhale', name: 'Inhale', duration: cfg.inhale, cue: 'Breathe in steadily' }
    ];
    if (cfg.hold > 0) {
      phases.push({ id: 'hold', name: 'Hold', duration: cfg.hold, cue: 'Retain gently with calm' });
    }
    phases.push({ id: 'exhale', name: 'Exhale', duration: cfg.exhale, cue: 'Release smoothly' });
    if (cfg.rest > 0) {
      phases.push({ id: 'rest', name: 'Hold', duration: cfg.rest, cue: 'Rest in pure stillness' });
    }
    return phases;
  }

  const currentCustomCfg = loadCustomRhythm();

  // Initialize Breathing Engine
  const breathingEngine = new BreathingEngine({
    protocolId: 'box',
    targetDuration: currentDuration,
    customPhases: getCustomPhasesArray(currentCustomCfg),
    onTick: (state) => {
      visualizer.updateState(state);

      if (state.appMode === 'reset' || state.pomodoroPhase === 'break') {
        audioEngine.updateBreathWave(state.phase, state.phaseProgress);
      }

      phaseTitle.textContent = state.phaseName;
      phaseCue.textContent = state.phaseCue;

      if (state.appMode === 'pomodoro' && state.pomodoroPhase === 'work') {
        countdownTimer.textContent = state.pomodoroDisplay;
      } else {
        countdownTimer.textContent = state.phaseTimeRemaining.toFixed(1) + 's';
      }

      document.body.setAttribute('data-phase', state.phase);

      if (sessionProgress) {
        sessionProgress.style.width = `${state.sessionProgress * 100}%`;
      }
      if (sessionTimeDisplay) {
        const mins = Math.floor(state.elapsedInSession / 60);
        const secs = Math.floor(state.elapsedInSession % 60);
        sessionTimeDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
      if (cyclesCountDisplay) {
        cyclesCountDisplay.textContent = state.completedCycles;
      }
    },
    onPhaseChange: (phase) => {
      audioEngine.playBell(phase.id);
      triggerHaptics(phase.id);
      voiceWhisperer.speak(phase.id);
    },
    onPomodoroPhaseChange: (from, to) => {
      if (to === 'break') {
        audioEngine.playBell('inhale');
        voiceWhisperer.speak('inhale');
      }
    },
    onSessionComplete: (stats) => {
      audioEngine.stopAmbience();
      updatePlayBtn(false);

      const updated = statsStorage.saveSession(stats.durationSeconds, stats.completedCycles);
      if (streakCountDisplay) streakCountDisplay.textContent = updated.currentStreak;

      showCompletionModal(stats);
    }
  });

  // App Mode Switch (Micro-Reset vs Pomodoro Flow)
  modeResetBtn.addEventListener('click', () => {
    modeResetBtn.classList.add('active');
    modePomodoroBtn.classList.remove('active');
    protocolSelectorBar.style.display = 'flex';
    durationSelectorBar.style.display = 'flex';
    breathingEngine.setAppMode('reset');
    updatePlayBtn(false);
  });

  modePomodoroBtn.addEventListener('click', () => {
    modePomodoroBtn.classList.add('active');
    modeResetBtn.classList.remove('active');
    protocolSelectorBar.style.display = 'none';
    durationSelectorBar.style.display = 'none';
    breathingEngine.setAppMode('pomodoro');
    updatePlayBtn(false);
  });

  // UI Event Handlers
  async function togglePlay() {
    await audioEngine.resume();

    if (!breathingEngine.isRunning || breathingEngine.isPaused) {
      breathingEngine.start();
      audioEngine.startAmbience();
      updatePlayBtn(true);
    } else {
      breathingEngine.pause();
      audioEngine.stopAmbience();
      updatePlayBtn(false);
    }
  }

  function updatePlayBtn(isPlaying) {
    if (isPlaying) {
      playBtnIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
      playBtnText.textContent = 'Pause';
      playBtn.classList.add('is-running');
      document.body.classList.add('session-active');
    } else {
      playBtnIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
      playBtnText.textContent = breathingEngine.appMode === 'pomodoro' ? 'Start Sprint' : 'Begin Reset';
      playBtn.classList.remove('is-running');
      document.body.classList.remove('session-active');
    }
  }

  playBtn.addEventListener('click', togglePlay);

  resetBtn.addEventListener('click', () => {
    breathingEngine.reset();
    audioEngine.stopAmbience();
    updatePlayBtn(false);
  });

  // Mute Toggle
  muteBtn.addEventListener('click', () => {
    const isMuted = audioEngine.toggleMute();
    muteBtn.classList.toggle('active', isMuted);
    muteBtn.setAttribute('title', isMuted ? 'Unmute (M)' : 'Mute Sound (M)');
    if (isMuted) {
      muteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;
    } else {
      muteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
    }
  });

  // Fullscreen Zen Mode
  fullscreenBtn.addEventListener('click', toggleZenFullscreen);

  function toggleZenFullscreen() {
    const isZen = document.body.classList.toggle('zen-mode');
    fullscreenBtn.classList.toggle('active', isZen);

    if (isZen && !document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else if (!isZen && document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // Sound Settings Drawer
  soundSettingsBtn.addEventListener('click', () => {
    soundDrawer.classList.toggle('open');
  });
  closeSoundDrawerBtn.addEventListener('click', () => {
    soundDrawer.classList.remove('open');
  });

  // Volume Sliders & Procedural Synthesizers
  masterVol.addEventListener('input', (e) => audioEngine.setVolume('master', parseFloat(e.target.value)));
  bellVol.addEventListener('input', (e) => audioEngine.setVolume('bell', parseFloat(e.target.value)));
  waveVol.addEventListener('input', (e) => audioEngine.setVolume('wave', parseFloat(e.target.value)));
  noiseVol.addEventListener('input', (e) => audioEngine.setVolume('noise', parseFloat(e.target.value)));
  binauralVol.addEventListener('input', (e) => audioEngine.setVolume('binaural', parseFloat(e.target.value)));

  if (rainVol) {
    rainVol.addEventListener('input', (e) => audioEngine.setVolume('rain', parseFloat(e.target.value)));
  }
  if (thunderVol) {
    thunderVol.addEventListener('input', (e) => audioEngine.setVolume('thunder', parseFloat(e.target.value)));
  }
  if (isochronicVol) {
    isochronicVol.addEventListener('input', (e) => audioEngine.setVolume('isochronic', parseFloat(e.target.value)));
  }
  if (isochronicRateSelect) {
    isochronicRateSelect.addEventListener('change', (e) => audioEngine.setIsochronicRate(e.target.value));
  }
  if (solfeggioSelect) {
    solfeggioSelect.addEventListener('change', (e) => {
      audioEngine.setSolfeggioFrequency(e.target.value);
      if (solfeggioValBadge) solfeggioValBadge.textContent = `${e.target.value} Hz`;
    });
  }
  if (triggerThunderBtn) {
    triggerThunderBtn.addEventListener('click', () => {
      audioEngine.resume();
      audioEngine.triggerThunder();
      visualizer.triggerRipple(visualizer.centerX, visualizer.centerY - 50, '#facc15');
    });
  }

  // 10-Second HD Video Clip Recorder with Web Audio Track Sync
  let isRecordingVideo = false;
  let videoMediaRecorder = null;
  let recordedVideoChunks = [];
  let recordCountdownTimer = null;

  async function recordZenVideoClip(durationSec = 10) {
    if (isRecordingVideo) return;
    if (!canvas || !('captureStream' in canvas) || typeof MediaRecorder === 'undefined') {
      alert('Video recording is not supported in this browser version. Use a modern desktop browser (Chrome/Edge/Firefox).');
      return;
    }

    try {
      await audioEngine.resume();
      isRecordingVideo = true;
      recordedVideoChunks = [];

      // 1. Capture 60FPS high-DPI canvas stream
      const canvasStream = canvas.captureStream(60);

      // 2. Mix Web Audio destination stream if available
      const audioTrack = audioEngine.getAudioStreamTrack();
      const combinedTracks = [...canvasStream.getVideoTracks()];
      if (audioTrack) {
        combinedTracks.push(audioTrack);
      }
      const combinedStream = new MediaStream(combinedTracks);

      // 3. Determine best supported WebM codec
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ];
      const selectedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';

      videoMediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6000000 // High-quality 6 Mbps
      });

      videoMediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedVideoChunks.push(e.data);
        }
      };

      videoMediaRecorder.onstop = () => {
        clearInterval(recordCountdownTimer);
        isRecordingVideo = false;
        if (recordVideoBtn) {
          recordVideoBtn.classList.remove('recording');
          recordBtnText.textContent = 'Record Clip';
        }
        if (modalRecordVideoBtn) {
          modalRecordVideoBtn.textContent = 'Record 10s Video Clip (WebM)';
          modalRecordVideoBtn.classList.remove('recording');
        }

        const blob = new Blob(recordedVideoChunks, { type: selectedMime });
        const videoUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `tabzen-reset-clip-${Date.now()}.webm`;
        a.href = videoUrl;
        a.click();
        URL.revokeObjectURL(videoUrl);

        if (shareFeedback) {
          shareFeedback.textContent = '🎥 10-Second HD Video clip downloaded! Upload directly to LinkedIn/X.';
          shareFeedback.classList.add('visible');
          setTimeout(() => shareFeedback.classList.remove('visible'), 5000);
        }
      };

      // 4. Update UI Countdown
      let remainingSec = durationSec;
      if (recordVideoBtn) {
        recordVideoBtn.classList.add('recording');
        recordBtnText.textContent = `${remainingSec}s...`;
      }
      if (modalRecordVideoBtn) {
        modalRecordVideoBtn.classList.add('recording');
        modalRecordVideoBtn.textContent = `Recording (${remainingSec}s)...`;
      }

      recordCountdownTimer = setInterval(() => {
        remainingSec--;
        if (remainingSec > 0) {
          if (recordVideoBtn) recordBtnText.textContent = `${remainingSec}s...`;
          if (modalRecordVideoBtn) modalRecordVideoBtn.textContent = `Recording (${remainingSec}s)...`;
        } else {
          clearInterval(recordCountdownTimer);
        }
      }, 1000);

      videoMediaRecorder.start();

      // Automatically stop after durationSec
      setTimeout(() => {
        if (videoMediaRecorder && videoMediaRecorder.state === 'recording') {
          videoMediaRecorder.stop();
        }
      }, durationSec * 1000);

    } catch (err) {
      console.error('Error starting video recording:', err);
      isRecordingVideo = false;
      clearInterval(recordCountdownTimer);
      if (recordVideoBtn) {
        recordVideoBtn.classList.remove('recording');
        recordBtnText.textContent = 'Record Clip';
      }
    }
  }

  if (recordVideoBtn) {
    recordVideoBtn.addEventListener('click', () => recordZenVideoClip(10));
  }

  if (modalRecordVideoBtn) {
    modalRecordVideoBtn.addEventListener('click', () => recordZenVideoClip(10));
  }

  // Protocol Selection
  protocolPills.forEach(pill => {
    pill.addEventListener('click', () => {
      protocolPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const protocol = pill.dataset.protocol;
      breathingEngine.setProtocol(protocol);

      // Re-evaluate cardiac resonance
      if (calculatedBPM) {
        isCardiacCoherenceLocked = (protocol === 'resonant' || protocol === 'box');
        visualizer.setHeartRate(calculatedBPM, isCardiacCoherenceLocked);
        ekgBadgeText.textContent = `${calculatedBPM} BPM${isCardiacCoherenceLocked ? ' • Locked ✨' : ''}`;
        openHeartbeatBtn.classList.toggle('locked', isCardiacCoherenceLocked);
      }
    });
  });

  // Duration Selection
  durationPills.forEach(pill => {
    pill.addEventListener('click', () => {
      durationPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const dur = parseInt(pill.dataset.duration, 10);
      currentDuration = dur;
      breathingEngine.setTargetDuration(dur);
    });
  });

  // Custom Rhythm Builder Modal
  function syncCustomSliders(cfg) {
    customInhaleSlider.value = cfg.inhale;
    customHoldSlider.value = cfg.hold;
    customExhaleSlider.value = cfg.exhale;
    customRestSlider.value = cfg.rest;

    customInhaleVal.textContent = `${cfg.inhale.toFixed(1)}s`;
    customHoldVal.textContent = `${cfg.hold.toFixed(1)}s`;
    customExhaleVal.textContent = `${cfg.exhale.toFixed(1)}s`;
    customRestVal.textContent = `${cfg.rest.toFixed(1)}s`;
  }

  syncCustomSliders(currentCustomCfg);

  customInhaleSlider.addEventListener('input', (e) => customInhaleVal.textContent = `${parseFloat(e.target.value).toFixed(1)}s`);
  customHoldSlider.addEventListener('input', (e) => customHoldVal.textContent = `${parseFloat(e.target.value).toFixed(1)}s`);
  customExhaleSlider.addEventListener('input', (e) => customExhaleVal.textContent = `${parseFloat(e.target.value).toFixed(1)}s`);
  customRestSlider.addEventListener('input', (e) => customRestVal.textContent = `${parseFloat(e.target.value).toFixed(1)}s`);

  openCustomCfgBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    customModal.classList.add('show');
  });

  closeCustomModal.addEventListener('click', () => customModal.classList.remove('show'));

  saveCustomBtn.addEventListener('click', () => {
    const newCfg = {
      inhale: parseFloat(customInhaleSlider.value),
      hold: parseFloat(customHoldSlider.value),
      exhale: parseFloat(customExhaleSlider.value),
      rest: parseFloat(customRestSlider.value)
    };

    localStorage.setItem('tabzen_custom_rhythm', JSON.stringify(newCfg));
    breathingEngine.setCustomPhases(getCustomPhasesArray(newCfg));

    protocolPills.forEach(p => p.classList.remove('active'));
    const customPill = document.querySelector('.protocol-pill[data-protocol="custom"]');
    if (customPill) customPill.classList.add('active');
    breathingEngine.setProtocol('custom');

    customModal.classList.remove('show');
  });

  // Keyboard Shortcuts (Space, F, H, M, R, 1-5, and A-L Crystal Chimes)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const lowerKey = e.key.toLowerCase();

    // Check for 432Hz Crystal Bowl key triggers (A - L)
    if (KEY_NOTE_MAP[lowerKey] !== undefined) {
      e.preventDefault();
      playCrystalBowl(KEY_NOTE_MAP[lowerKey]);
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleZenFullscreen();
    } else if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      toggleEMDR();
    } else if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      openHeartbeatBtn.click();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      muteBtn.click();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      resetBtn.click();
    } else if (e.key >= '1' && e.key <= '5') {
      const idx = parseInt(e.key, 10) - 1;
      if (protocolPills[idx]) protocolPills[idx].click();
    }
  });

  // Share Text Generator for LinkedIn & Clipboard
  function generateShareText() {
    const activeProto = breathingEngine.activeProtocol.name;
    const breaths = modalStatsBreaths.textContent;
    const time = modalStatsTime.textContent;
    const stats = statsStorage.get();

    const bpmLine = calculatedBPM ? `🫀 Heart Rate: ${calculatedBPM} BPM (Coherence: ${isCardiacCoherenceLocked ? 'Locked 0.1Hz Resonance ✨' : 'Stabilized'})\n` : '';

    return `Just completed a 60-second mindful reset on TabZen 🧘‍♂️\n\n` +
      `⏱️ Mindful Duration: ${time}\n` +
      `🫁 Breathing Protocol: ${activeProto}\n` +
      `✨ Cycles Completed: ${breaths}\n` +
      bpmLine +
      `🔥 Current Streak: ${stats.currentStreak} days\n` +
      `💨 Oxygen Circulated: ${(stats.totalBreaths * 0.5).toFixed(1)} Liters\n\n` +
      `Nervous system downshifted & clarity restored. Ready for the next deep work sprint!\n\n` +
      `TabZen: Zero-dependency procedural breathwork visualizer built with Web Audio API & HTML5 Canvas.\n` +
      `#mindfulness #webdev #frontend #deepwork #healthtech #javascript`;
  }

  // Completion Modal & Social Sharing
  function showCompletionModal(stats) {
    currentActiveStats = stats;
    modalStatsBreaths.textContent = stats.completedCycles || 1;
    modalStatsTime.textContent = stats.durationSeconds >= 60 
      ? `${Math.round(stats.durationSeconds / 60)} min`
      : `${stats.durationSeconds}s`;
    modalStatsReduction.textContent = `~${stats.estimatedStressReduction}%`;

    currentActiveQuote = MINDFUL_QUOTES[Math.floor(Math.random() * MINDFUL_QUOTES.length)];
    modalQuoteText.textContent = `"${currentActiveQuote.text}"`;
    modalQuoteAuthor.textContent = `— ${currentActiveQuote.author}`;

    completionModal.classList.add('show');
  }

  closeCompletionModal.addEventListener('click', () => {
    completionModal.classList.remove('show');
  });

  // 1-Click Direct LinkedIn Post Composer
  if (linkedinDirectBtn) {
    linkedinDirectBtn.addEventListener('click', () => {
      const shareText = generateShareText();
      const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;
      
      // Open LinkedIn Feed Composer
      window.open(linkedInUrl, '_blank', 'noopener,noreferrer');

      // Auto-download 1200x675 card so user can attach it directly
      downloadCardBtn.click();

      shareFeedback.textContent = '🚀 Opening LinkedIn! Your 1200x675 card is downloading to attach.';
      shareFeedback.classList.add('visible');
      setTimeout(() => shareFeedback.classList.remove('visible'), 5000);
    });
  }

  // Native Mobile/Device Share API
  if (nativeShareBtn && navigator.share) {
    nativeShareBtn.style.display = 'flex';
    nativeShareBtn.addEventListener('click', async () => {
      const shareText = generateShareText();
      const cvs = offscreenCardCanvas;

      cvs.toBlob(async (blob) => {
        try {
          if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'tabzen-reset.png', { type: 'image/png' })] })) {
            const file = new File([blob], 'tabzen-mindful-reset.png', { type: 'image/png' });
            await navigator.share({
              title: 'TabZen — Mindful Reset',
              text: shareText,
              files: [file]
            });
          } else {
            await navigator.share({
              title: 'TabZen — Mindful Reset',
              text: shareText
            });
          }
          shareFeedback.textContent = 'Shared successfully!';
          shareFeedback.classList.add('visible');
          setTimeout(() => shareFeedback.classList.remove('visible'), 3000);
        } catch (err) {
          if (err.name !== 'AbortError') {
            copyShareBtn.click();
          }
        }
      }, 'image/png');
    });
  }

  // Copy Reflection / LinkedIn snippet
  copyShareBtn.addEventListener('click', () => {
    const shareText = generateShareText();

    navigator.clipboard.writeText(shareText).then(() => {
      shareFeedback.textContent = 'Copied reflection to clipboard! Ready to paste on LinkedIn.';
      shareFeedback.classList.add('visible');
      setTimeout(() => shareFeedback.classList.remove('visible'), 4000);
    }).catch(() => {
      shareFeedback.textContent = 'Select and copy text manually.';
      shareFeedback.classList.add('visible');
    });
  });

  // High-Resolution 1200x675 Canvas "Share Card" PNG Generator
  downloadCardBtn.addEventListener('click', () => {
    if (!currentActiveStats || !currentActiveQuote) return;

    const cvs = offscreenCardCanvas;
    const ctx = cvs.getContext('2d');
    const width = 1200;
    const height = 675;

    // 1. Draw Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#07090e');
    bgGrad.addColorStop(0.5, '#0d131f');
    bgGrad.addColorStop(1, '#07090e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Glowing Orbs
    const radGlow1 = ctx.createRadialGradient(200, 150, 20, 200, 150, 400);
    radGlow1.addColorStop(0, 'rgba(45, 212, 191, 0.22)');
    radGlow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGlow1;
    ctx.fillRect(0, 0, width, height);

    const radGlow2 = ctx.createRadialGradient(1000, 520, 20, 1000, 520, 450);
    radGlow2.addColorStop(0, 'rgba(129, 140, 248, 0.2)');
    radGlow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGlow2;
    ctx.fillRect(0, 0, width, height);

    // 3. Card Border Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 4. Header: Brand Icon & Title
    ctx.fillStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.arc(95, 95, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, sans-serif';
    ctx.fillText('TabZen', 135, 105);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 15px system-ui, sans-serif';
    ctx.fillText('60-SECOND RESET & PROCEDURAL SYNTHESIZER', 270, 104);

    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    ctx.fillStyle = '#64748b';
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(todayStr, width - 80, 105);
    ctx.textAlign = 'left';

    // 5. Hero Badge: Protocol
    ctx.fillStyle = 'rgba(45, 212, 191, 0.15)';
    ctx.fillRect(80, 160, 360, 44);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
    ctx.strokeRect(80, 160, 360, 44);

    ctx.fillStyle = '#2dd4bf';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`✨ ${currentActiveStats.protocol.toUpperCase()} • 💨 ${((currentActiveStats.completedCycles || 1) * 0.5).toFixed(1)}L O₂`, 100, 188);

    // 6. Three Major Stat Cards
    const statsData = [
      { label: 'MINDFUL TIME', val: modalStatsTime.textContent },
      { label: 'BREATH CYCLES', val: `${currentActiveStats.completedCycles || 1} Completed` },
      { label: 'HRV COHERENCE', val: calculatedBPM ? `${calculatedBPM} BPM (Locked)` : `~${currentActiveStats.estimatedStressReduction}% Drop` }
    ];

    statsData.forEach((st, idx) => {
      const cardX = 80 + idx * 355;
      const cardY = 230;
      const cardW = 330;
      const cardH = 130;

      ctx.fillStyle = 'rgba(15, 20, 31, 0.75)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 13px system-ui, sans-serif';
      ctx.fillText(st.label, cardX + 24, cardY + 36);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText(st.val, cardX + 24, cardY + 86);
    });

    // 7. Quote Block
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(80, 390, width - 160, 130);
    ctx.fillStyle = '#2dd4bf';
    ctx.fillRect(80, 390, 6, 130);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'italic 20px Georgia, serif';
    ctx.fillText(`"${currentActiveQuote.text}"`, 110, 445);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px system-ui, sans-serif';
    ctx.fillText(`— ${currentActiveQuote.author}`, 110, 485);

    // 8. Footer Watermark
    ctx.fillStyle = '#64748b';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Pure Web Audio API & HTML5 Canvas • TabZen', 80, height - 70);

    const streakVal = statsStorage.get().currentStreak;
    ctx.fillStyle = '#fb923c';
    ctx.textAlign = 'right';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`🔥 ${streakVal}-Day Mindful Reset Streak`, width - 80, height - 70);

    // Trigger PNG Download
    const dataUrl = cvs.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `tabzen-reset-${Date.now()}.png`;
    a.href = dataUrl;
    a.click();

    shareFeedback.textContent = 'Mindful Card (PNG) downloaded! Attach it to your LinkedIn post.';
    shareFeedback.classList.add('visible');
    setTimeout(() => shareFeedback.classList.remove('visible'), 5000);
  });
});
