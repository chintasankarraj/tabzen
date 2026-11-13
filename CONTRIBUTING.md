# Contributing to TabZen 🧘‍♂️

Thank you for your interest in contributing to **TabZen**! We welcome improvements, bug reports, and ideas that keep TabZen minimal, calming, and ultra-performant.

---

## 🏛️ Core Design Principles

1. **Zero External Dependencies**:
   - No audio assets (`.mp3`, `.wav`) — all sounds, bells, waves, rain, and noise must be generated procedurally via the browser's native **Web Audio API**.
   - No frontend frameworks or bundle steps (React, Vue, Webpack, etc.) — pure vanilla ES6+ JavaScript, native CSS custom properties, and semantic HTML5.
   - Anyone should be able to double-click `index.html` on any device and have it run instantly.

2. **60 FPS Hardware Acceleration**:
   - Visualizations must run smoothly on HTML5 Canvas using `requestAnimationFrame`, high-DPI scaling (`window.devicePixelRatio`), and efficient math.

3. **Privacy First**:
   - All session records, streaks, and custom rhythms are stored strictly on the user's local device using `localStorage`. No telemetry, no third-party trackers, no cloud sync required.

---

## 🛠️ Local Development

1. Clone or open the project folder:
   ```bash
   git clone https://github.com/your-username/tabzen.git
   cd tabzen
   ```

2. Start a local server:
   ```bash
   npm start
   # or
   python -m http.server 3000
   ```

3. Open `http://localhost:3000` in your browser.

4. Run code validation:
   ```bash
   npm test
   ```

---

## 📂 Project Architecture

```
tabzen/
├── index.html           # Semantic stage, HUD, modals, accessibility
├── manifest.json        # PWA manifest
├── sw.js                # Offline Service Worker (CacheFirst)
├── css/
│   └── styles.css       # Design tokens, glassmorphism, responsive grid
└── js/
    ├── breathing-engine.js  # Breathwork state machine & Pomodoro timer
    ├── audio-engine.js      # Procedural Web Audio synthesizer (432Hz, rain, waves)
    ├── visualizer.js        # Canvas visualizer (Orb, Mandala, Silk, EKG)
    └── app.js               # Application coordinator, DOM wiring, analytics
```

---

## 💡 Submitting a Pull Request

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Verify syntax with `npm test`.
3. Commit your changes with clear, descriptive messages.
4. Push to your branch and open a Pull Request.
