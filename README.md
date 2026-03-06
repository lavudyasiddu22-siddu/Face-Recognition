# Premium Guest Face-Recognition Entry 🌍🔐

> **“AI-Powered Biometric Access Control for Premium Lounges”**

Premium Guest Face-Recognition Entry is an enterprise-grade, real-time biometric authentication SaaS built for deployment in premium airport lounges. It provides secure, automated access control using live facial recognition, active liveness detection, and encrypted biometric storage, all managed through a comprehensive cybersecurity dashboard.

---

## 🎯 Platform Purpose

Designed to simulate a real-world production deployment, this platform ensures rapid yet secure VIP member verification:
- **Live Face Recognition:** Instant authentication against registered members.
- **Active Liveness Detection:** Anti-spoofing challenges (e.g., blink, smile) to ensure physical presence.
- **Encrypted Biometric Storage:** We store computationally meaningless 128-dimensional embedding vectors, completely encrypted via simulated AES-256. Raw face images are never stored permanently.
- **Enterprise Audit Logging:** Real-time tracking of successful entries, spoof attempts, and manual overrides.
- **Consent Management:** Full compliance flows ensuring explicit user biometric consent.

## ✨ Core Features

*   🛡️ **Active Liveness Verification:** Requires real-time facial actions before identity matching. Shows verification latency and visual pipeline tracking.
*   🔒 **Zero-Knowledge Architecture Simulation:** Biometric data is stored only as encrypted embeddings.
*   📊 **Real-Time Audit Logs:** Filterable, searchable logs capturing timestamps, confidence scores, device IDs, and risk levels.
*   👨‍💼 **Manual Fallback:** Secure OTP-based manual override flow for edge-case hardware/biometric failures.
*   ✅ **Consent Records:** Administrative panel for managing and revoking user consent.
*   🎥 **Cinematic Live Entry Console:** A high-performance, polished front-end scanner with micro-animations and status indicators.

## 🏗 Architecture & Tech Stack

This project is built as a highly performant Single Page Application (SPA), utilizing the following:

- **Frontend Framework:** React 19 + Vite for optimal rendering and HMR.
- **Routing:** React Router DOM.
- **Animation Engine:** Framer Motion for cinematic UI transitions and micro-animations.
- **Face Recognition Engine:** `@vladmandic/face-api` for edge-based face detection and 128-d computing.
- **Styling:** Vanilla CSS with custom CSS variables, focusing on a dark cybersecurity aesthetic (Deep Navy, Cyan/Emerald glow, Glassmorphism).
- **Data Visualization:** Recharts for admin dashboard metrics.
- **Icons:** Lucide React.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/lavudyasiddu22-siddu/Face-Recognition.git
   ```
2. Navigate into the directory:
   ```bash
   cd Face-Recognition
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

*Note: The application requires camera permissions to function correctly (for the Live Entry and Registration scanning).*

## 🎨 UI/UX Philosophy

The interface is engineered to feel like a commercial biometric SaaS product ready for airport deployment. It eschews standard CRUD app aesthetics in favor of:
- **Dark Theme:** Deep navy/charcoal base.
- **Accents:** Cyan (for processing/informational) and Emerald (for success).
- **Glassmorphism:** Translucent panels with background blur.
- **Professional Typography:** Inter/JetBrains Mono.

## 📄 License
This project is open-source and available under the MIT License.
