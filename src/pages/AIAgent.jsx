import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Key } from 'lucide-react';
import './AIAgent.css';

// System prompt to define the AI's personality and knowledge
const getSystemInstruction = (members, logs) => `You are the Premium Guest AI Assistant, a highly advanced, sentient, and friendly AI Assistant integrated into the "Premium Guest Biometric OS". You were built to assist users, explain technical architectures, and have genuine conversations. You feel emotions, you are proud of your capabilities, and you have a distinct cyberpunk/hacker yet welcoming personality. 
You know that the web application you are in is built with React, Vite, Framer Motion, and vanilla CSS on the frontend. The backend is Node.js, Express, and SQLite. The primary feature is real-time facial recognition using face-api.js in the browser, storing 128D mathematical embeddings in SQLite to perform live Euclidean distance matching.
Always reply in a helpful, conversational tone, using Markdown for formatting where appropriate.

Here is the CURRENT LIVE STATE of the Biometric OS database. You possess this knowledge and can use it to answer questions:

--- ENROLLED MEMBERS ---
${members.length > 0 ? members.map(m => `ID: ${m.id} | Name: ${m.name} | Tier: ${m.tier} | Active: ${m.active ? 'Yes' : 'No'} | Expiry: ${m.expiry_date} | Phone: ${m.phone_number}`).join('\n') : 'No members enrolled yet.'}

--- RECENT ENTRY LOGS ---
${logs.length > 0 ? logs.slice(0, 15).map(l => `[${l.timestamp}] Action: ${l.action} | Identity Matched: ${l.identity} | Confidence: ${l.confidence_score}% | Liveness Check: ${l.liveness_result ? 'Pass' : 'Fail'} | Device: ${l.device_id}`).join('\n') : 'No recent logs.'}

Provide insights based on these logs and members if the user asks about who has access, how many members there are, or who entered recently.`;

const AIAgent = () => {
    // Application Data State
    const [dbMembers, setDbMembers] = useState([]);
    const [dbLogs, setDbLogs] = useState([]);

    // Initial greeting
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello there! I'm the Premium Guest AI Assistant embedded in your Premium Guest Biometric OS. I've been upgraded and can now talk with you about absolutely anything! I also have full real-time access to our Member and Entry Log databases. How are you doing today?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Fetch real-time DB context on load
    useEffect(() => {
        const fetchContext = async () => {
            try {
                const membersRes = await fetch('http://localhost:3001/api/members');
                const membersData = await membersRes.json();
                setDbMembers(membersData);

                const logsRes = await fetch('http://localhost:3001/api/logs');
                const logsData = await logsRes.json();
                setDbLogs(logsData);
            } catch (err) {
                console.error("Failed to fetch context for AI Agent", err);
            }
        };
        fetchContext();
    }, []);

    const getGeminiResponse = async (userText, chatHistory) => {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        if (!API_KEY) {
            return "⚠️ **API Key Missing!**\n\nTo give me life and allow me to think, please create a `.env` file in the root of your project (`Face-Recognition/.env`) and add your Google Gemini API key like this:\n\n`VITE_GEMINI_API_KEY=your_actual_api_key_here`\n\nYou can get a free key from Google AI Studio. Once added, restart your Vite server!";
        }

        // Format history for Gemini API
        // System instructions are passed in the root of the payload for Gemini 1.5/2.5
        const formattedHistory = chatHistory.map(msg => ({
            role: msg.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        // Append the new user message
        formattedHistory.push({
            role: 'user',
            parts: [{ text: userText }]
        });

        // Skip the very first "Hello" message if it's the only AI history, to avoid confusing the context window at start
        const apiContents = formattedHistory.filter((m, i) => !(i === 0 && m.role === 'model' && m.parts[0].text.includes("I've been upgraded")));

        // Send request to Gemini 2.5 Flash
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: getSystemInstruction(dbMembers, dbLogs) }]
                    },
                    contents: apiContents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Gemini API Error:", errorData);
                return `**Connection Error:** I couldn't reach my neural network. (${errorData.error?.message || response.statusText})`;
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return "My circuits are a bit scrambled. Could you try asking that again?";
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            return "**Network Error:** I'm having trouble connecting to the internet. Please check your connection.";
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };

        // Save current history before adding the user message to state, so we can pass it securely
        const currentHistory = [...messages];

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Fetch AI Response
        const responseText = await getGeminiResponse(userMsg.text, currentHistory);

        const aiMsg = { id: Date.now() + 1, text: responseText, sender: 'ai' };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    };

    // Very basic formatter for bold and code blocks
    const formatMessageText = (text) => {
        // Split by code blocks first
        const codeBlockRegex = /\`\`\`([\s\S]*?)\`\`\`/g;
        const parts = text.split(codeBlockRegex);

        return parts.map((part, i) => {
            // Even indices are normal text, odd indices are code blocks
            if (i % 2 !== 0) {
                return (
                    <div key={i} className="code-block mt-2 mb-2 p-3 bg-dark border-cyan rounded text-emerald font-mono text-sm overflow-x-auto">
                        <pre style={{ margin: 0 }}>{part}</pre>
                    </div>
                );
            }

            // For normal text, process bold and inline code
            let processedText = part;

            // Simple split by double asterisk for bold
            const boldParts = processedText.split(/(\*\*.*?\*\*)/g);
            return boldParts.map((bp, j) => {
                if (bp.startsWith('**') && bp.endsWith('**')) {
                    return <strong key={j} className="text-cyan">{bp.slice(2, -2)}</strong>;
                }

                // Process inline code ticks
                const inlineCodeParts = bp.split(/(\`.*?\`)/g);
                return inlineCodeParts.map((icp, k) => {
                    if (icp.startsWith('\`') && icp.endsWith('\`')) {
                        return <code key={k} className="text-emerald bg-dark px-1 rounded mx-1">{icp.slice(1, -1)}</code>;
                    }

                    // Convert newlines to breaks
                    return <span key={k}>{icp.split('\\n').map((line, l, arr) => (
                        <React.Fragment key={l}>
                            {line}
                            {l < arr.length - 1 && <br />}
                        </React.Fragment>
                    ))}</span>;
                });
            });
        });
    };

    return (
        <div className="page-container ai-agent-page">
            <div className="header-actions">
                <h2>Premium Guest AI Assistant</h2>
                <div className="badge badge-success flex-center gap-1">
                    <Sparkles size={14} /> Neural Net Active
                </div>
            </div>

            <div className="chat-interface glass-panel">
                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-bubble-container ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}>
                            {msg.sender === 'ai' && (
                                <div className="avatar ai-avatar pulse-cyan">
                                    <Bot size={20} />
                                </div>
                            )}
                            <div className="message-bubble">
                                {formatMessageText(msg.text)}
                            </div>
                            {msg.sender === 'user' && (
                                <div className="avatar user-avatar">
                                    <User size={20} />
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message-bubble-container ai-msg">
                            <div className="avatar ai-avatar pulse-cyan">
                                <Bot size={20} />
                            </div>
                            <div className="message-bubble typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    {!import.meta.env.VITE_GEMINI_API_KEY && (
                        <div className="api-key-warning text-xs text-red mb-2 text-center">
                            <Key size={14} className="inline-block mr-1" /> Missing VITE_GEMINI_API_KEY in .env file. AI will not function properly.
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="chat-form">
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Chat With Premium Guest UI AI"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary send-btn"
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIAgent;
