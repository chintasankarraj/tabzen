# 🧘‍♂️ TabZen — 60-Second Reset, Pomodoro Flow & Procedural Breathing Synthesizer

> An ultra-aesthetic, zero-dependency breathwork visualizer, ambient sound synthesizer, biofeedback coherence tracker, and deep work companion built with **pure Web Audio API**, **HTML5 Canvas**, and **Web Speech API**.

---

## 💡 What is TabZen?

Developers and knowledge workers spend 8+ hours a day staring at glowing screens, accumulating subtle cognitive fatigue, hyperfocus burnout, and "screen apnea" (unconsciously shallow breathing while debugging or deep in code).

**TabZen** is an all-in-one mindfulness & productivity companion that:
- Runs directly in the browser with **zero dependencies** and **zero audio files**.
- Features **Dual Operating Modes**:
  - **🧘 Micro-Reset Mode**: Guided 60s, 3m, or 5m breathwork resets.
  - **⏱️ Pomodoro Flow Mode**: 25-minute Deep Work focus sprint with subtle brown noise/alpha waves that **automatically launches a 60-second guided breathing reset break** when time expires!
- Synthesizes organic soundscapes (Tibetan singing bowls, ocean waves, brown noise, and 10 Hz alpha binaural beats) purely in code using the browser's native **Web Audio API**.
- Offers **8D Spatial Audio Orbiting** that rotates sound in a 360° circular field around headphones.
- Features **Interactive Heart Rate & Cardiac-Respiratory Coherence Biofeedback (Tap-to-Sync)**:
  - Tap your pulse to calculate BPM and project a live, glowing **EKG waveform** across the screen.
  - Locks into golden **0.1 Hz Mayer Wave Resonance** when your heart rhythm synchronizes with your breath!
- Renders **3 visualizer styles** at 60 FPS on **HTML5 Canvas**:
  - **🔮 Organic Orb** (Classic glowing aura and particle sphere)
  - **🪷 Sacred Mandala** (8-fold kaleidoscopic blooming lotus with golden ratio geometry)
  - **〰️ Liquid Silk** (Fluid undulating sinusoidal ribbons)
- Features an **Interactive 432Hz Pentatonic Crystal Bowl Instrument** (<kbd>A</kbd> - <kbd>L</kbd> keys & on-screen dock):
  - Play 9 tuned Solfeggio singing bowls (D4 to A5 harmonic spectrum) that trigger physical, expanding shockwave ripples across the canvas!
- **Native 10-Second HD Video Clip Recorder** (`canvas.captureStream` + `MediaRecorder`):
  - 1-click video recording that captures 60 FPS Canvas visuals synchronized with the Web Audio stream into a downloadable high-res `.webm` video for instant LinkedIn posting!
- **7 Sacred Solfeggio Frequencies & Speaker-Friendly Isochronic Pulser**:
  - Tune harmonic singing bowls across 396Hz, 432Hz, 528Hz, 639Hz, 741Hz, 852Hz, and 963Hz.
  - Isochronic rhythmic amplitude pulser (Alpha 10Hz, Theta 6Hz, Delta 2Hz) that works on regular laptop and phone speakers without headphones.
- **Procedural Rain & Distant Rolling Thunder Synthesizer**:
  - 100% mathematical sound generation simulating high-frequency droplet rainfall and deep acoustic sub-bass thunder rumblers with zero MP3 files.
- Tracks **Mindful Consistency Analytics & 7-Day Activity Heatmap**:
  - Daily tracking of cumulative mindful minutes, completed resets, estimated O₂ circulated, and a color-coded consistency heatmap.
- Features **1-Click Direct LinkedIn Post Composer & Native Device Web Share API**:
  - Automatically formats session reflection text, opens LinkedIn's feed composer, and generates a 1200x675 PNG share card.
- Features **interactive mouse & mobile gyro parallax physics** with magnetic particle repulsion.
- Includes a **Global Multi-Language Voice Whisperer** via Web Speech API in **7 languages**:
  - 🇬🇧 English, 🇪🇸 Spanish, 🇫🇷 French, 🇯🇵 Japanese, 🇩🇪 German, 🇮🇳 Hindi, and 🇮🇳 **Telugu (తెలుగు)**.
- Features **1-click Soundscape Presets** (*Temple Zen*, *Midnight Coast*, *Alpha Focus*, *Rain Sanctuary*, *Chimes Only*).
- Includes an interactive **Custom Rhythm Builder** where you can dial in your own Inhale, Hold, and Exhale intervals.
- Offers **4 visual themes** (Cosmic OLED, Sakura Dusk, Forest Zen, Solar Dawn).
- Operates as a **Progressive Web App (PWA)** that installs to your desktop or mobile home screen and works **100% offline**.

---

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in any modern web browser (Chrome, Edge, Safari, Firefox).

### Option 2: Run Local Dev Server
```bash
# Using Python:
python -m http.server 8080

# Or using Node:
npx serve
```
Then visit `http://localhost:8080`.

### Option 3: Deploy to the Web in 30 Seconds
- **GitHub Pages:** Push this repository to GitHub, go to *Settings > Pages*, and select the `main` branch.
- **Vercel:** Drag and drop the folder into [Vercel Dashboard](https://vercel.com) or run `vercel`.
- **Netlify:** Drag and drop the folder onto [Netlify Drop](https://app.netlify.com/drop).

---

## 🧠 Technical Highlights

| Component | Technical Implementation |
|---|---|
| **10s HD Video Clip Recorder** | Hardware-accelerated `canvas.captureStream(60)` blended with Web Audio `createMediaStreamDestination()` tracks via `MediaRecorder` into ready-to-share 60 FPS WebM video clips. |
| **Solfeggio & Isochronic Pulser** | 7 Sacred Solfeggio frequencies (396Hz to 963Hz) + speaker-friendly amplitude-modulated square wave pulses (Alpha 10Hz, Theta 6Hz, Delta 2Hz). |
| **Procedural Rain & Thunder** | Algorithmic stochastic white noise pass-through with micro-droplet click synthesis and resonant low-pass brown noise rolling thunder bursts. |
| **432Hz Crystal Bowl Synthesizer** | 9-note Solfeggio pentatonic keyboard instrument (D4 to A5) playable via <kbd>A</kbd>-<kbd>L</kbd> keys or on-screen dock. Triggers expanding screen-blend shockwave ripples. |
| **Mindful Analytics & Heatmap** | Persistent tracking of mindful minutes, breath count, estimated O₂ circulated, and a color-coded 7-day consistency activity heatmap. |
| **Heart Rate EKG & Coherence** | Tap-to-sync inter-beat interval estimator. Computes resting BPM and draws a live, hospital-grade EKG cardiogram wave. Locks onto 0.1 Hz Mayer wave resonance during coherence breathing. |
| **Dual-Mode Pomodoro Flow** | State machine toggles between 25-minute deep focus sprints and 60-second guided breath breaks with acoustic transition chimes. |
| **Multi-Language Voice Whisperer** | Native browser `window.speechSynthesis` tuned to soothing 0.8x cadence in English, Spanish, French, Japanese, German, Hindi, and Telugu. |
| **Sacred Mandala Geometry** | Procedural 8-fold symmetrical lotus blossom rendered with cubic Bezier curves that blooms on Inhale, pulses on Hold, and folds on Exhale. |
| **8D Spatial Audio Orbit** | Web Audio `StereoPannerNode` orbits the soundscape in a smooth 360° stereo field (-0.85 to +0.85 pan) for immersive headphone listening. |
| **Mouse & Gyro Parallax** | Spring-damped cursor tracking with magnetic stardust repulsion and `deviceorientation` mobile tilt. |
| **Audio-Reactive FFT Aura** | Web Audio `AnalyserNode` streams live frequency data into the Canvas engine; aura rings physically ripple to the 432 Hz Solfeggio tones in real-time. |
| **Tibetan Singing Bowl** | Procedural harmonic chime using Solfeggio frequencies (432Hz / 528Hz) with multiple detuned sine oscillators and exponential decay envelopes. |
| **Breath-Synced Tidal Wave** | Algorithmic brown noise passed through a resonant `BiquadFilterNode` modulated in real-time by the breath cycle phase. |
| **Binaural Alpha Waves** | Dual stereo carrier oscillators (216 Hz Left, 226 Hz Right) creating a natural 10 Hz Alpha beat frequency in headphones to induce relaxed focus. |
| **1-Click LinkedIn Intent & Card** | Direct 1-click LinkedIn feed composer with auto-generated reflection and off-screen 1200x675 canvas PNG card download. |
| **PWA & Offline Service Worker** | `manifest.json` and CacheFirst `sw.js` enable desktop/mobile home screen installation with 100% offline reliability. |

---

## ⌨️ Keyboard Shortcuts

- <kbd>Space</kbd> — Start / Pause Reset Session
- <kbd>A</kbd> - <kbd>L</kbd> — Play 432Hz Pentatonic Crystal Bowls
- <kbd>F</kbd> — Toggle Zen Fullscreen Mode
- <kbd>H</kbd> — Open Heartbeat Tap-to-Sync Modal
- <kbd>M</kbd> — Quick Audio Mute / Unmute
- <kbd>R</kbd> — Reset Current Session
- <kbd>1</kbd> - <kbd>5</kbd> — Switch Breathing Protocols

---

## 📢 Ready-to-Post LinkedIn Captions

### Option A: The "Full-Stack Biofeedback & Pomodoro" Hook *(Recommended)*
```text
Ever catch yourself holding your breath or forgetting to take breaks during a 4-hour coding sprint? It's called "screen apnea" — and it wrecks focus and cardiovascular health.

Over the weekend, I decided to build the ultimate developer reset tool:

Meet TabZen 🧘‍♂️ — an ultra-minimalist breathing synthesizer, Pomodoro flow timer, and cardiac coherence tracker.

Here's why it was such a fun technical challenge:
1. Zero Audio Assets: Tibetan singing bowls, ocean waves, brown noise, and 10Hz alpha binaural beats are all synthesized in real time using the native Web Audio API.
2. 8D Spatial Audio: Headphone users experience a 360° circular rotating soundscape using StereoPannerNode LFOs.
3. Live EKG & Cardiac Coherence: Tap your pulse (<kbd>H</kbd>) to render a live, glowing EKG waveform. It locks onto 0.1 Hz Mayer wave resonance when your breath and heart synchronize!
4. Dual Mode (Pomodoro Flow): 25-minute deep focus sprint with background alpha waves that automatically launches a 60-second guided breathing reset break!
5. 3 Visualizer Modes: Sacred Geometric Mandala lotus that blooms on inhale, Liquid Silk ribbons, or the classic Organic Orb.
6. Multi-Language Voice Guide: Whispered breath cues in English, Spanish, French, Japanese, German, Hindi, and Telugu using Web Speech API.
7. 100% Offline PWA: Installable as a standalone app with instant 1-click 1200x675 PNG share card generation.

Built with pure vanilla HTML, modern CSS, and JavaScript — zero frameworks, zero build steps.

Live Demo: [YOUR LIVE LINK]
GitHub: [YOUR GITHUB REPO LINK]

How do you stay mindful during deep work sessions? Let me know below! 👇

#webdev #javascript #frontend #mindfulness #developer #creativecoding #webaudio #pwa #biofeedback
```
