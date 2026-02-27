import React, { useState, useEffect, useRef } from 'react';
import { Camera, Maximize, Minimize, AlertTriangle, CheckCircle2, XCircle, ShieldHalf, Activity } from 'lucide-react';
import { LIVENESS_CHALLENGES, verifyLiveness, matchBiometrics, generateEmbedding } from '../services/BiometricEngine';
import { logEvent } from '../services/AuditLogger';
import { motion, AnimatePresence } from 'framer-motion';
import './LiveEntry.css';

const LiveEntry = () => {
    const [pipelineState, setPipelineState] = useState('idle'); // idle -> detecting -> matching -> success|denied|manual
    const [resultData, setResultData] = useState(null);
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [latency, setLatency] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // We don't start the camera on mount anymore.
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            stopCamera();
        };
    }, []);

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
    };

    const startScan = async () => {
        setPipelineState('detecting');
        setResultData(null);
        setLatency(0);

        // 1. Start the camera explicitly for this scan
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Wait for the video to actually start playing
                await new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play().then(resolve).catch(resolve);
                    };
                });
            }
        } catch (err) {
            console.error("Camera access denied or failed:", err);

            if (err.name === 'NotAllowedError') {
                setPipelineState('camera_blocked');
            } else if (err.name === 'NotFoundError') {
                alert("NO CAMERA FOUND: Your device does not have a webcam plugged in or available.");
                setPipelineState('idle');
            } else if (err.name === 'NotReadableError') {
                alert("CAMERA IN USE: Another application or browser tab is currently using your webcam. Please close it.");
                setPipelineState('idle');
            } else {
                alert(`CAMERA ERROR: ${err.name} - ${err.message}`);
                setPipelineState('idle');
            }
            return;
        }

        // 2. Wait 1.5 seconds for the camera exposure to adjust and user to pose
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Face Detection
        const dtStart = Date.now();
        let faceEmbedding = null;
        try {
            faceEmbedding = await generateEmbedding(videoRef.current);
        } catch (err) {
            console.error("Face detection error:", err);
        }

        const detectionLatency = Date.now() - dtStart;
        setLatency(prev => prev + detectionLatency);

        // 4. Turn off the camera IMMEDIATELY after capture
        stopCamera();

        if (!faceEmbedding) {
            handleSpoof({ confidence: 0, reason: "No face detected in the frame. Please look at the camera." });
            return;
        }

        setPipelineState('matching');

        // 5. Match Identity
        const matchResult = await matchBiometrics(faceEmbedding, true);
        setLatency(prev => prev + matchResult.latencyMs);

        if (matchResult.matched) {
            handleSuccess(matchResult);
        } else {
            handleDenial(matchResult);
        }
    };

    const handleSpoof = (livenessData) => {
        setPipelineState('denied');
        setResultData({ reason: livenessData.reason, confidence: livenessData.confidence });
        logEvent({
            action: 'SPOOF_ATTEMPT',
            confidenceScore: livenessData.confidence,
            livenessResult: false,
            riskLevel: 'HIGH'
        });
    };

    const handleSuccess = (matchData) => {
        setPipelineState('success');
        setResultData({ member: matchData.member, confidence: matchData.matchConfidence });
        logEvent({
            action: 'ACCESS_GRANTED',
            identity: matchData.member.id,
            confidenceScore: matchData.matchConfidence,
            livenessResult: true, // Auto-passed
            riskLevel: 'LOW'
        });
    };

    const handleDenial = (matchData) => {
        setPipelineState('denied');
        let reason = 'Identity Not Matched. Face unknown.';
        if (matchData.reason) reason = matchData.reason;

        setResultData({ reason, confidence: matchData.matchConfidence });
        logEvent({
            action: 'ACCESS_DENIED',
            confidenceScore: matchData.matchConfidence,
            livenessResult: true,
            riskLevel: 'MEDIUM'
        });
    };

    const PipelineStep = ({ status, label }) => {
        const colors = {
            waiting: 'var(--text-muted)',
            active: 'var(--accent-cyan)',
            done: 'var(--accent-emerald)',
            error: 'var(--accent-red)'
        };

        const isError = status === 'error';
        const isDone = status === 'done';
        const isActive = status === 'active';

        return (
            <div className="pipeline-step">
                <div
                    className="step-indicator"
                    style={{
                        borderColor: colors[status],
                        backgroundColor: isDone || isError ? colors[status] : 'transparent',
                        boxShadow: isActive ? `0 0 10px ${colors[status]}` : 'none'
                    }}
                >
                    {isDone && <CheckCircle2 size={14} color="#000" />}
                    {isError && <XCircle size={14} color="#000" />}
                </div>
                <span style={{ color: colors[status], fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </div>
        );
    };

    const getStatus = (stepName) => {
        const order = ['idle', 'detecting', 'matching'];
        if (pipelineState === 'success') return 'done';
        if (pipelineState === 'denied') {
            if (stepName === 'detecting' && (resultData?.reason.includes('Spoof') || resultData?.reason.includes('face'))) return 'error';
            if (stepName === 'matching' && resultData?.reason.includes('Identity')) return 'error';
            const currentIndex = order.indexOf('matching');
            const stepIndex = order.indexOf(stepName);
            if (stepIndex < currentIndex) return 'done';
            return 'waiting';
        }

        if (pipelineState === 'manual') return 'waiting';

        const currentIndex = order.indexOf(pipelineState);
        const stepIndex = order.indexOf(stepName);

        if (stepIndex < currentIndex) return 'done';
        if (stepIndex === currentIndex) return 'active';
        return 'waiting';
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current?.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="page-container live-entry-page">
            <div className="live-entry-header">
                <h2>Live Verification Console</h2>
                <div className="latency-badge glass-panel">
                    <Activity size={16} className="text-cyan" />
                    <span>Pipeline Latency: {latency > 0 ? `${latency}ms` : '--'}</span>
                </div>
            </div>

            <div className="live-entry-grid">
                <div className="camera-section glass-panel" ref={containerRef}>
                    <div className="camera-header">
                        <span>TERMINAL-A4-FR</span>
                        <button onClick={toggleFullScreen} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', outline: 'none' }}>
                            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                    </div>

                    <div className="camera-viewport">
                        {/* The actual video feed */}
                        <video
                            ref={videoRef}
                            autoPlay={true}
                            playsInline={true}
                            muted={true}
                            className={`video-feed ${pipelineState !== 'idle' ? 'scanning' : ''}`}
                        ></video>

                        {/* Overlay UI */}
                        <AnimatePresence>
                            {pipelineState !== 'idle' && (
                                <motion.div
                                    className="camera-overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="bounding-box">
                                        <div className="corner top-left"></div>
                                        <div className="corner top-right"></div>
                                        <div className="corner bottom-left"></div>
                                        <div className="corner bottom-right"></div>

                                        {pipelineState === 'detecting' && (
                                            <div className="scan-line"></div>
                                        )}
                                    </div>

                                    {pipelineState === 'success' && (
                                        <motion.div
                                            className="result-overlay success-overlay"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                        >
                                            <ShieldHalf size={48} className="text-emerald mb-2" />
                                            <h2>ACCESS GRANTED</h2>
                                            <p>Welcome, {resultData?.member?.name}</p>
                                            <span className="confidence-text">{resultData?.confidence}% AI Match Confidence</span>
                                        </motion.div>
                                    )}

                                    {pipelineState === 'denied' && (
                                        <motion.div
                                            className="result-overlay error-overlay"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                        >
                                            <AlertTriangle size={48} className="text-red mb-2" />
                                            <h2>ACCESS DENIED</h2>
                                            <p>{resultData?.reason}</p>
                                            <button className="btn btn-outline mt-4" onClick={() => setPipelineState('manual')}>
                                                Switch to Manual Mode
                                            </button>
                                        </motion.div>
                                    )}
                                    {pipelineState === 'camera_blocked' && (
                                        <motion.div
                                            className="result-overlay"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', padding: '2rem', textAlign: 'center', border: '2px solid var(--accent-red)' }}
                                        >
                                            <AlertTriangle size={56} className="text-red mb-4" />
                                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>BROWSER CAMERA BLOCKED</h2>
                                            <div style={{ textAlign: 'left', display: 'inline-block', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                                <p className="mb-2"><strong>1.</strong> Look at the URL bar at the very top of your screen.</p>
                                                <p className="mb-2"><strong>2.</strong> Click the small icon to the left of <code>localhost</code> (🔒 or 📷).</p>
                                                <p className="mb-2"><strong>3.</strong> Find <strong>Camera</strong> and change it to <strong>Allow</strong>.</p>
                                                <p className="mb-4"><strong>4.</strong> Click the button below to refresh the page.</p>
                                            </div>
                                            <br />
                                            <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>
                                                I Have Allowed It (Refresh Page)
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {(pipelineState === 'idle' || pipelineState === 'success' || pipelineState === 'denied') && (
                            <div className="camera-controls" style={{ zIndex: 100, position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                                <button className="btn btn-primary" onClick={startScan} disabled={pipelineState === 'detecting' || pipelineState === 'matching'}>
                                    <Camera size={18} />
                                    Initiate Scan
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pipeline-section">
                    <div className="glass-panel pipeline-card">
                        <h3>Verification Pipeline</h3>
                        <div className="pipeline-steps">
                            <PipelineStep status={getStatus('detecting')} label="Face Detected" />
                            <div className="pipeline-connector"></div>
                            <PipelineStep status={getStatus('matching')} label="Identity Matched" />
                            <div className="pipeline-connector"></div>
                            <PipelineStep status={getStatus('matching') === 'done' || pipelineState === 'success' || pipelineState === 'denied' ? (pipelineState === 'success' ? 'done' : (pipelineState === 'denied' ? 'error' : 'waiting')) : 'waiting'} label="Access Decision" />
                        </div>
                    </div>

                    {pipelineState === 'manual' && (
                        <motion.div
                            className="glass-panel manual-override-panel border-cyan"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3>Manual Override Mode</h3>
                            <p className="text-muted text-sm mb-4">Security verification required for override.</p>

                            <div className="form-group">
                                <label>Staff ID</label>
                                <input type="text" placeholder="STAFF-XXXX" className="modern-input" />
                            </div>
                            <div className="form-group">
                                <label>Member ID</label>
                                <input type="text" placeholder="VIP-XXXX" className="modern-input" />
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <select className="modern-select">
                                    <option>Hardware Failure</option>
                                    <option>Medical Exemption</option>
                                    <option>System Offline</option>
                                    <option>False Rejection By ML Model</option>
                                </select>
                            </div>

                            <div className="btn-group mt-4">
                                <button className="btn btn-primary w-full" onClick={() => {
                                    logEvent({ action: 'MANUAL_OVERRIDE', overrideReason: 'Hardware Failure', manualOverride: true, riskLevel: 'HIGH' });
                                    setPipelineState('success');
                                }}>Authorize Entry</button>
                                <button className="btn btn-outline w-full" onClick={() => setPipelineState('idle')}>Cancel</button>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LiveEntry;
