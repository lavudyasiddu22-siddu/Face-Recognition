import React from 'react';
import { motion } from 'framer-motion';
import { Camera, BrainCircuit, ShieldAlert, Fingerprint, Database, Terminal } from 'lucide-react';
import './Architecture.css';

const Architecture = () => {
    return (
        <div className="page-container arch-page">
            <div className="arch-header">
                <h2>System Architecture Diagram</h2>
                <p className="text-muted">Real-time data flow for Biometric Authentication Pipeline</p>
            </div>

            <div className="arch-diagram glass-panel">
                <div className="arch-container">

                    {/* Edge Devices */}
                    <div className="arch-tier edge-tier">
                        <h3 className="tier-title">Edge Input</h3>
                        <Node icon={<Camera size={24} />} title="Terminal Camera" desc="Live Video Feed" delay={0} />
                    </div>

                    <Path d="M 160 100 L 250 100" delay={0.5} />

                    {/* AI Processing Layer */}
                    <div className="arch-tier ai-tier">
                        <h3 className="tier-title text-cyan">AI Processing Layer</h3>
                        <div className="node-group">
                            <Node icon={<BrainCircuit size={24} />} title="Face Detection" desc="Bounding Box & Alignment" delay={1} />
                            <Path d="M 450 60 L 520 60" delay={1.5} />
                            <Node icon={<ShieldAlert size={24} />} title="Active Liveness" desc="Spoof Prevention" delay={2} />
                            <Path d="M 450 140 L 520 140" delay={2.5} />
                            <Node icon={<Fingerprint size={24} />} title="Embedding Extractor" desc="128-d Vector Gen" delay={3} />
                        </div>
                    </div>

                    <Path d="M 720 100 L 800 100" delay={3.5} />

                    {/* Secure Backend */}
                    <div className="arch-tier secure-tier">
                        <h3 className="tier-title text-emerald">Secure Backend</h3>
                        <div className="node-group-vertical">
                            <Node icon={<Database size={24} />} title="Encrypted Storage" desc="AES-256 Embeddings" delay={4} color="emerald" />
                            <Path d="M 900 130 L 900 180" delay={4.5} vertical />
                            <Node icon={<Terminal size={24} />} title="Audit Logger" desc="Event Streaming" delay={5} color="emerald" />
                        </div>
                    </div>

                </div>

                <div className="arch-legend">
                    <div className="legend-item"><span className="legend-dot status-active pulse-cyan"></span> Active Data Stream</div>
                    <div className="legend-item"><span className="legend-dot bg-emerald"></span> Secure Enclave</div>
                    <div className="legend-item"><span className="legend-dot bg-red"></span> Deny / Drop Path</div>
                </div>
            </div>
        </div>
    );
};

const Node = ({ icon, title, desc, delay, color = 'cyan' }) => (
    <motion.div
        className={`arch-node border-${color}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5 }}
    >
        <div className={`node-icon text-${color} bg-${color}-subtle`}>{icon}</div>
        <div className="node-info">
            <h4>{title}</h4>
            <p>{desc}</p>
        </div>
    </motion.div>
);

const Path = ({ d, delay, vertical = false }) => (
    <div className="arch-path-container">
        <svg className={`arch-path ${vertical ? 'vertical' : ''}`} width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
            <motion.path
                d={d}
                stroke="var(--accent-cyan)"
                strokeWidth="2"
                strokeDasharray="4 4"
                fill="transparent"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay, duration: 1, ease: 'easeInOut' }}
            />
            <motion.circle
                r="3"
                fill="var(--accent-cyan)"
                initial={{ offsetDistance: "0%", opacity: 0 }}
                animate={{ offsetDistance: "100%", opacity: 1 }}
                transition={{ delay: delay + 0.5, duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ offsetPath: `path('${d}')` }}
            />
        </svg>
    </div>
);

export default Architecture;
