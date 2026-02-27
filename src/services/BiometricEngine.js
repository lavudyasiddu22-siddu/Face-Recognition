// src/services/BiometricEngine.js
import * as faceapi from '@vladmandic/face-api';

/**
 * Enterprise Biometric Engine using @vladmandic/face-api
 * Handles loading ML models, extracting 128D embeddings, and simulated AES encryption.
 */

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return true;

  try {
    const MODEL_URL = '/models';

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    modelsLoaded = true;
    console.log("Biometric AI Models Loaded successfully");
    return true;
  } catch (err) {
    console.error("Failed to load biometric models:", err);
    return false;
  }
};

// Generates a real 128-dimensional embedding vector from a face scan using the webcam video element
export const generateEmbedding = async (videoElement) => {
  if (!modelsLoaded) await loadModels();

  try {
    const detection = await faceapi.detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error("No face detected in the frame.");
    }

    // faceapi returns a Float32Array. We convert it to a standard array for JSON serialization
    const embeddingArray = Array.from(detection.descriptor);
    return embeddingArray;
  } catch (err) {
    console.warn("Face Extraction Error:", err);
    return null;
  }
};

// Simulates AES-256 encryption on an embedding
export const encryptEmbedding = (embeddingData, key = 'SYSTEM_AES_KEY') => {
  const serialized = JSON.stringify(embeddingData);
  const fakeCiphertext = btoa(serialized + "_" + key + "_" + Date.now()).replace(/=/g, '');
  return `enc_aes256_${fakeCiphertext}`; // Note: In a real system, the actual ciphertext is sent to the DB
};

export const LIVENESS_CHALLENGES = [
  "Blink twice",
  "Turn head left",
  "Turn head right",
  "Smile"
];

// Active liveness detection simulates client-side heuristics
export const verifyLiveness = async (threshold = 85) => {
  return new Promise((resolve) => {
    const latency = Math.floor(Math.random() * 800) + 400; // 400-1200ms
    setTimeout(() => {
      const confidence = Math.floor(Math.random() * 25) + 75; // 75-100%
      const success = confidence >= threshold;

      resolve({
        success,
        confidence,
        latencyMs: latency,
        riskLevel: success ? 'LOW' : 'HIGH'
      });
    }, latency);
  });
};

// Communicates with API to verify identity against the encrypted database
export const matchBiometrics = async (liveEmbedding, livenessPassed) => {
  try {
    const start = Date.now();
    const res = await fetch('http://localhost:3001/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveEmbedding, livenessPassed })
    });

    if (!res.ok) {
      return { matched: false, matchConfidence: 0, member: null, latencyMs: Date.now() - start };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Biometric Engine Verification Error:", err);
    return { matched: false, matchConfidence: 0, member: null, latencyMs: 0 };
  }
};
