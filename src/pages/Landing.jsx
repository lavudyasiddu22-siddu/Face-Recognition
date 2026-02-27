import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, UserPlus, Activity, Bot } from 'lucide-react';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="landing-logo">
                    <ScanFace size={28} className="text-cyan" />
                    <span>PREMIUM GUEST</span>
                </div>
                <div className="landing-links">
                    <a href="#about">About</a>
                    <a href="#privacy">Privacy</a>
                    <a href="#faqs">FAQ's</a>
                    <a href="#news">News</a>
                    <a href="#locations">Locations</a>
                    <a href="#career">Career</a>
                    <a href="#contact">Contact Us</a>
                </div>
                <button className="landing-demo-btn" onClick={() => navigate('/dashboard')}>
                    Live Demo
                </button>
            </nav>

            <main className="landing-hero">
                <div className="hero-content">
                    <h1>Welcome to Premium Guest. <br /> Re-imagining Airport Experiences.</h1>
                    <p>
                        Our Privacy Preserving and secure technology using the concept of Self Sovereign Identity enables faster, swifter and hassle-free journeys within airports.
                    </p>
                    <button className="hero-cta" onClick={() => navigate('/dashboard')}>
                        Access Dashboard Demo
                    </button>
                </div>
                <div className="hero-glow"></div>
            </main>

            <section className="landing-how-it-works">
                <div className="how-it-works-header">
                    <h2><span>System Architecture:</span> How It Works</h2>
                    <p>A completely frictionless, privacy-preserving biometric flow for premium guests.</p>
                </div>

                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-icon">
                            <UserPlus size={36} />
                        </div>
                        <h3>1. Secure Enrollment</h3>
                        <p>Members register their details and capture a fast, one-time volumetric face scan. The raw image is instantly destroyed and converted to a secure AES-256 encrypted mathematical embedding ensuring maximum privacy.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-icon">
                            <ScanFace size={36} />
                        </div>
                        <h3>2. Live Edge Verification</h3>
                        <p>At the physical terminal, the system detects approaching guests and performs a sub-second Euclidean distance match against the active member database, granting seamless hands-free access.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-icon">
                            <Activity size={36} />
                        </div>
                        <h3>3. Real-time Telemetry</h3>
                        <p>All access decisions, liveliness checks, and system alerts are streamed securely to the central Command Dashboard for live monitoring and tamper-evident audit logging.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-icon">
                            <Bot size={36} />
                        </div>
                        <h3>4. AI Assistant Querying</h3>
                        <p>Engage with the integrated Premium Guest AI to instantly summarize logs, query active memberships, and retrieve contextual system analytics using natural language prompts.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
