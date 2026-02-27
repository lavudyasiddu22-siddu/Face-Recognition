import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Shield, X, CheckCircle2, Camera, ArrowRight, Video, AlertTriangle, Trash2 } from 'lucide-react';
import { generateEmbedding, encryptEmbedding } from '../services/BiometricEngine';
import './Members.css';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form and Wizard State
    const [step, setStep] = useState(1);
    const [newMember, setNewMember] = useState({
        name: '',
        tier: 'Silver',
        phoneNumber: '',
        membershipNumber: '',
        expiryDate: ''
    });

    // Biometric State
    const [consentGiven, setConsentGiven] = useState(false);
    const [signature, setSignature] = useState('');
    const [registrationState, setRegistrationState] = useState('idle'); // idle, processing, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const videoRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    useEffect(() => {
        fetch('http://localhost:3001/api/members')
            .then(res => res.json())
            .then(data => setMembers(data))
            .catch(err => console.error(err));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this member's profile and biometric data?")) return;

        try {
            const res = await fetch(`http://localhost:3001/api/members/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setMembers(members.filter(m => m.id !== id));
            } else {
                alert("Failed to delete member.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Network error while deleting member.");
        }
    };

    // Camera Handlers
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
        } catch (err) {
            console.error("Camera access denied or failed", err);
            alert("Please allow camera access to complete biometric enrollment.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    };

    const proceedToScan = () => {
        setStep(2);
        startCamera();
    };

    const goBackToDetails = () => {
        stopCamera();
        setStep(1);
    };

    // Form Submission / Capture
    const captureAndEnroll = async () => {
        if (!consentGiven || !signature.trim() || !isCameraActive) return;

        setRegistrationState('processing');
        setErrorMessage('');

        try {
            // Extract the real 128D embedding FIRST while video is actively playing
            const rawEmbedding = await generateEmbedding(videoRef.current);

            // Pause the video feed to simulate a picture being taken
            if (videoRef.current) {
                videoRef.current.pause();
            }

            if (!rawEmbedding) {
                setRegistrationState('error');
                setErrorMessage("No face detected. Please ensure your face is clearly visible.");
                if (videoRef.current) videoRef.current.play(); // Resume video on error
                return;
            }

            // Simulate Edge AES Encryption before sending over network
            const encryptedEmbedding = encryptEmbedding(rawEmbedding);

            // API POST
            const res = await fetch('http://localhost:3001/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newMember.name,
                    tier: newMember.tier,
                    phone_number: newMember.phoneNumber,
                    membership_number: newMember.membershipNumber,
                    expiry_date: newMember.expiryDate,
                    embedding_ref: encryptedEmbedding,
                    consent_signature: signature,
                    consent_date: new Date().toISOString()
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${res.status}`);
            }

            const newRecord = await res.json();
            setMembers([...members, newRecord]);
            setRegistrationState('success');
            stopCamera();

        } catch (err) {
            console.error("Enrollment failed:", err);
            setRegistrationState('error');
            const errorMsg = err.message === 'Failed to fetch' || err.message.includes('NetworkError')
                ? "Network error: Ensure backend node server is running."
                : err.message || "System error during enrollment.";
            setErrorMessage(errorMsg);
            if (videoRef.current) videoRef.current.play();
        }
    };

    const closeModal = () => {
        stopCamera();
        setIsModalOpen(false);
        setStep(1);
        setRegistrationState('idle');
        setErrorMessage('');
        setConsentGiven(false);
        setSignature('');
        setNewMember({ name: '', tier: 'Silver', phoneNumber: '', membershipNumber: '', expiryDate: '' });
    };

    // Sub-renderers for Wizard Steps
    const renderStep1 = () => (
        <div className="modal-body form-grid">
            <div className="form-group col-span-2">
                <label>Full Name</label>
                <input type="text" className="modern-input" value={newMember.name}
                    onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
            </div>
            <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" className="modern-input" placeholder="+1 (555) 000-0000" value={newMember.phoneNumber}
                    onChange={e => setNewMember({ ...newMember, phoneNumber: e.target.value })} />
            </div>
            <div className="form-group">
                <label>Membership Tier</label>
                <select className="modern-select" value={newMember.tier}
                    onChange={e => setNewMember({ ...newMember, tier: e.target.value })}>
                    <option>Silver</option>
                    <option>Gold</option>
                    <option>Diamond</option>
                </select>
            </div>
            <div className="form-group">
                <label>Membership ID Number</label>
                <input type="text" className="modern-input" placeholder="e.g. PRM-59281" value={newMember.membershipNumber}
                    onChange={e => setNewMember({ ...newMember, membershipNumber: e.target.value })} />
            </div>
            <div className="form-group">
                <label>Expiry Date</label>
                <input type="date" className="modern-input" value={newMember.expiryDate}
                    onChange={e => setNewMember({ ...newMember, expiryDate: e.target.value })} />
            </div>

            <div className="consent-box col-span-2 mt-4">
                <h4><Shield size={16} /> Biometric Consent Required</h4>
                <div className="consent-scroll-area" style={{ maxHeight: '80px' }}>
                    <p>I consent to the collection and encrypted storage of my biometric facial data by Premium Guest OS for access control. My raw image will be discarded immediately after mathematical embedding generation.</p>
                </div>
                <label className="checkbox-label">
                    <input type="checkbox" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} />
                    <span>I acknowledge and agree to the biometric policy</span>
                </label>

                {consentGiven && (
                    <div className="signature-area mt-4">
                        <label>Digital Signature (Type Full Name)</label>
                        <input type="text" className="modern-input signature-input" placeholder="Sign here..."
                            value={signature} onChange={e => setSignature(e.target.value)} />
                    </div>
                )}
            </div>

            <div className="col-span-2 modal-actions">
                <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={proceedToScan}
                    disabled={!newMember.name || !newMember.phoneNumber || !newMember.membershipNumber || !consentGiven || !signature.trim()}>
                    Next: Biometric Capture <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="modal-body form-grid">
            <div className="webcam-container col-span-2">
                <div className="webcam-wrapper">
                    <video ref={videoRef} autoPlay playsInline muted className={`live-video ${registrationState === 'success' ? 'captured' : ''}`}></video>
                    {!isCameraActive && registrationState !== 'processing' && (
                        <div className="webcam-placeholder flex-center column">
                            <Video size={32} className="text-secondary mb-2" />
                            <span>Initializing Camera...</span>
                        </div>
                    )}
                </div>

                {registrationState === 'error' && (
                    <div className="mt-2 text-red text-center flex-center" style={{ gap: '8px' }}>
                        <AlertTriangle size={16} /> {errorMessage}
                    </div>
                )}

                <div className="flex-center mt-4">
                    <button
                        className="btn btn-primary btn-lg w-full flex-center justify-center gap-2"
                        onClick={captureAndEnroll}
                        disabled={!isCameraActive || registrationState === 'processing'}
                    >
                        <Camera size={20} />
                        {registrationState === 'processing' ? 'Processing & Enrolling...' : 'Capture Face & Enroll'}
                    </button>
                </div>
            </div>

            <div className="col-span-2 modal-actions">
                <button className="btn btn-outline" onClick={goBackToDetails} disabled={registrationState === 'processing'}>Back</button>
            </div>
        </div>
    );

    return (
        <div className="page-container members-page">
            <div className="header-actions">
                <h2>Members Directory</h2>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={18} /> Enroll New Member
                </button>
            </div>

            <div className="table-container glass-panel">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Member ID / Tier</th>
                            <th>Identity Info</th>
                            <th>Contact</th>
                            <th>Status / Expiry</th>
                            <th>Biometric Data</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(m => (
                            <tr key={m.id}>
                                <td>
                                    <div className="font-mono text-cyan">{m.id}</div>
                                    <span className={`badge tier-${m.tier.toLowerCase()} mt-1`}>{m.tier}</span>
                                </td>
                                <td>
                                    <div className="font-semibold">{m.name}</div>
                                    <div className="font-mono text-xs text-secondary">{m.membership_number}</div>
                                </td>
                                <td className="text-sm text-secondary">{m.phone_number || 'N/A'}</td>
                                <td>
                                    <div><span className={`badge ${m.active ? 'badge-success' : 'batch'}`}>{m.active ? 'Active' : 'Inactive'}</span></div>
                                    <div className="text-xs text-secondary mt-1">Exp: {m.expiry_date || 'N/A'}</div>
                                </td>
                                <td>
                                    <Shield size={16} className="text-emerald inline-icon" title="AES-256 Encrypted Profile" />
                                    <span className="text-sm">Secured</span>
                                </td>
                                <td className="text-right">
                                    <button
                                        className="btn btn-outline border-red text-red hover-bg-red"
                                        onClick={() => handleDelete(m.id)}
                                        title="Delete Member"
                                        style={{ padding: '6px' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel border-cyan">
                        <div className="modal-header">
                            <h3>{step === 1 ? 'Step 1: Member Details' : 'Step 2: Biometric Capture & Consent'}</h3>
                            <button className="icon-btn-small" onClick={closeModal}><X size={18} /></button>
                        </div>

                        {registrationState === 'success' ? (
                            <div className="enroll-success flex-center column">
                                <CheckCircle2 size={64} className="text-emerald mb-4" />
                                <h3>Enrollment Complete</h3>
                                <p>Member identity and encrypted biometrics stored securely.</p>
                                <button className="btn btn-primary mt-4" onClick={closeModal}>Exit to Directory</button>
                            </div>
                        ) : (
                            // Render Wizard Steps
                            step === 1 ? renderStep1() : renderStep2()
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;
