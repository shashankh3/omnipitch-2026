# OmniPitch 2026 - FIFA World Cup Smart Stadium Assistant 🏟️

Welcome to **OmniPitch 2026**, a GenAI-enabled stadium management solution built for the FIFA World Cup 2026. This platform uses the Google Gemini API (`gemini-2.5-flash`) combined with real-time simulated telemetry to create an unprecedented, interactive Fan Dashboard.

## 🌟 Key Features

1. **Holographic 3D Digital Twin**: A fully procedural Three.js stadium featuring a live simulated football match (22 players with flocking and physics), dynamic glowing stands, glassmorphic UI, and ACES filmic lighting.
2. **AI Stadium Copilot**: A highly-responsive chat assistant that provides hyper-localized safety, navigation, and accessibility support strictly grounded in the live stadium telemetry. 
3. **Live Capacity Heatmaps**: Floating AR "Jumbotron" screens above each stand render dynamic, GitHub-style contribution graphs that change color (Green -> Amber -> Red) based on live crowd density.
4. **Smart Gate Intelligence**: Holographic gate arches track throughput in real-time, displaying estimated wait times. The dashboard automatically calculates and recommends the fastest entry gate.
5. **Dynamic Heat Safety**: The system monitors WBGT (Wet Bulb Globe Temperature) and immediately broadcasts safety alerts if temperatures reach dangerous levels.

## 🚀 Tech Stack
- **Framework**: Vue 3 + Vite
- **Styling**: Tailwind CSS v4 (Glassmorphism & Cyberpunk aesthetic)
- **3D Engine**: Three.js (Procedural InstancedMesh for performance)
- **AI**: Google Generative AI SDK (`gemini-2.5-flash`)
- **State Management**: Pinia (Simulating live IoT Telemetry)

## 📦 Size Limit Compliance
This entire highly-optimized procedural architecture and digital twin runs perfectly at **~2.48 MB**, well under the 10 MB hackathon requirement limit.

## 🛠️ Local Setup
1. Clone the repository
2. Run `npm install`
3. Create a `.env` file and add your Gemini API Key: `VITE_GEMINI_API_KEY=your_key`
4. Run `npm run dev` to launch the Holo-Dashboard

> **Note**: This is a submission for the AI Stadium Operations Hackathon Challenge.
