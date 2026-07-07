<div align="center">
  
# 🏟️ OmniPitch 2026

**The GenAI-Powered Digital Twin & Command Center for the FIFA World Cup 2026**

[![Vue 3](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

*An immersive, real-time, 3D stadium management ecosystem engineered with glassmorphic aesthetics, cyberpunk-inspired data visualization, and cutting-edge Google Generative AI.*

</div>

---

## 🌟 The Vision

OmniPitch 2026 is an unprecedented stadium management solution designed specifically for the scale of the World Cup. It bridges the gap between chaotic physical infrastructure and sleek digital intelligence. By rendering a **Holographic 3D Digital Twin** of the stadium in the browser, OmniPitch fuses real-time IoT telemetry with the predictive, conversational, and multimodal vision capabilities of the `gemini-1.5-flash` (and simulated `2.5-flash`) AI models.

**Three distinct personas, one unified core:**
- 📱 **Fan Dashboard**: Hyper-localized navigation, live AI match feeds, and conversational AI copilot.
- 🦺 **Volunteer Portal**: Vision-based incident logging, automated triage checklists, and task management.
- 🏢 **Organizer Command Console**: Global throughput analytics, AI sentiment analysis, and live multi-lingual broadcasting.

---

## ⚡ Core Features

### 🎮 Holographic 3D Digital Twin
A fully procedural, highly optimized **Three.js** stadium running at 60FPS. 
- **Live Match Simulation**: 22 AI-driven players featuring flocking behaviors and physics right on the pitch.
- **Dynamic Heatmaps**: GitHub-style contribution graphs float above the stands, dynamically shifting from *Emerald (Clear)* to *Amber (Busy)* to *Red (Packed)* based on live crowd density.

### 🤖 Gemini AI Command Center
Powered by Google Generative AI, the system intelligently grounds its responses in live stadium telemetry.
- **Fan Copilot**: Answers localized questions (e.g., "Where is the nearest step-free exit?") safely and accurately.
- **Vision Triage**: Volunteers can upload photos of spills, fights, or broken seats. The AI analyzes the image, categorizes the severity, and writes an instant dispatch protocol.
- **Vibe Engine**: AI automatically interprets gate delays and heat metrics to generate live Fan Sentiment scores.

### 📡 Real-Time Live Match Feed
Through dynamic Google Search grounding simulation, the dashboard pulls the most recent completed or live match results, updating the scoreboard, team colors, and flags simultaneously across the 2D UI and the 3D HUD.

### 🛡️ API Resilience & Production Readiness
We built this to survive the real world.
- **10-Minute Caching**: Aggressive localStorage caching ensures the app operates smoothly without instantly draining API quotas.
- **Graceful Degradation**: If the API rate limit is reached, the UI elegantly catches the 429 error and seamlessly injects localized fallback mock data (like Brazil vs Germany) with an alert, ensuring the dashboard never crashes.
- **Manual Overrides**: Incident tracking and data refreshing can always be executed entirely manually.

---

## 🎨 Design Aesthetic

We completely abandoned generic components to build a hyper-premium, immersive UI:
- **EA Sports / Cyberpunk HUD**: Glassmorphic panels with extreme blur backdrops, neon glow highlights (`#ccff00` and `#10b981`), and tactical scanner line animations.
- **Data Visualization**: ApexCharts integration for beautiful dark-mode donut charts and area graphs, with dynamic sizing and overlapping text fixes to ensure pristine pixel-perfect rendering.
- **Micro-interactions**: Hover scaling, pulse animations on live data, and floating holograms.

---

## 🛠️ Tech Stack & Optimization

| Technology | Implementation |
| :--- | :--- |
| **Vue 3 + Composition API** | Modular, highly reactive component architecture. |
| **Tailwind CSS v4** | Custom theme variables, extensive drop-shadows, and complex gradients. |
| **Three.js** | Used `InstancedMesh` to render tens of thousands of fans and structures with just a single draw call. |
| **Google Generative AI** | Multi-turn chat, multimodal vision, and structured JSON generation. |
| **Vite + PWA** | Blistering fast HMR and a heavily optimized production build size. |

**Performance**: The entire 3D digital twin and application architecture bundle compiles perfectly in under 3 seconds, remaining exceptionally lightweight and compliant with all size limits.

---

## 🚀 Run it Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/shashankh3/omnipitch-2026.git
   cd omnipitch-2026
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch the Holo-Dashboard**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---
<div align="center">
  <i>Built with passion for the Future of Stadium Operations.</i>
</div>
