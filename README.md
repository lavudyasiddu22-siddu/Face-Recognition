# Premium Guest Face-Recognition Entry System

A modern, full-stack web application designed for real-time facial recognition and biometric access control. This system provides a seamless and secure entry experience for premium guests, utilizing live webcam feeds and Euclidean distance matching against enrolled 128D face embeddings.

## Key Features

*   **Real-Time Biometric Verification:** Uses `@vladmandic/face-api.js` to extract 128D facial descriptors directly in the browser and matches them against securely stored embeddings in under 350ms.
*   **Member Enrollment Interface:** Streamlined admin dashboard to capture guest biometrics, assign membership tiers, and manage profiles.
*   **Live Entry Kiosk:** A dedicated, continuously scanning UI that automatically detects faces and triggers the verification process without manual interaction.
*   **Comprehensive Audit Logging:** Tracks all entry attempts, confidence scores, risk levels, and overrides for security auditing.
*   **Integrated AI Assistant:** Built-in AI chat interface to assist administrators with security policies, system configuration, and data queries.
*   **Modern React UI:** Built with Vite, React Router, Framer Motion for smooth animations, and Recharts for dynamic dashboard analytics.

## Technology Stack

*   **Frontend:** React 19, Vite, React Router, Tailwind CSS (via pure CSS modules), Framer Motion, Recharts, Lucide Icons.
*   **Machine Learning:** `face-api.js` (SSD Mobilenet v1, Face Landmark 68, Face Recognition Net).
*   **Backend:** Node.js, Express.
*   **Database:** SQLite (local persistence).

## Project Structure

*   **/src**: Contains all React frontend code (Components, Pages, Services, Styles).
*   **/server**: Contains the Node.js Express backend and SQLite database file.
*   **/public/models**: Houses the pre-trained `face-api.js` models required for local client-side inference.

## Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/lavudyasiddu22-siddu/Face-Recognition.git
    cd Face-Recognition
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```

### Running the Application Locally

You need to run both the frontend development server and the backend API server concurrently.

1.  **Start the Backend Server (Terminal 1):**
    ```bash
    cd server
    node index.js
    ```
    *The server will start on port `3001`.*

2.  **Start the Vite Frontend (Terminal 2):**
    ```bash
    npm run dev
    ```
    *The frontend will typically be available at `http://localhost:5173`.*

## Simulated Capabilities
*Note: This project is currently configured as a high-fidelity prototype. The backend simulates network latency and performs heuristic encryption/decryption of biometric data for demonstration purposes.*

---
*Developed for advanced security and access control demonstrations.*
