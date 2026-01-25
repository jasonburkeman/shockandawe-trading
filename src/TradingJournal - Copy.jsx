import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, AlertCircle, Download, Upload, Clock, DollarSign, Tag, Briefcase, Save, RotateCcw, BookOpen, Brain, Image as ImageIcon, Crosshair, Map, Target, Play, Activity, Key, Globe, Settings, X, Send, MessageSquare, Lightbulb, Calendar as CalendarIcon, PieChart, BarChart2, Timer, ThumbsUp, Book, ShieldAlert, CheckCircle2, Zap, FileText } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, Cell, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Card Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 border-b border-slate-800 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-slate-100 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

// --- Settings Modal ---
const SettingsModal = ({ overhead, setOverhead, onClose }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-950">
            <CardHeader className="flex justify-between items-center border-slate-800">
                <CardTitle className="flex items-center gap-2"><Settings size={18}/> Dashboard Configuration</CardTitle>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Business Overhead (Prop Fees)</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Monthly Eval Cost ($)</label>
                            <input type="number" value={overhead.evalCost} onChange={e=>setOverhead({...overhead, evalCost:e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-sm mt-1 focus:border-indigo-500 outline-none"/>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Active Accounts (Qty)</label>
                            <input type="number" value={overhead.evalsPerMonth} onChange={e=>setOverhead({...overhead, evalsPerMonth:e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-sm mt-1 focus:border-indigo-500 outline-none"/>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold">PA/Funded Fees ($)</label>
                            <input type="number" value={overhead.paFees} onChange={e=>setOverhead({...overhead, paFees:e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white p-2 rounded text-sm mt-1 focus:border-indigo-500 outline-none"/>
                        </div>
                    </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <h4 className="text-xs font-bold text-emerald-500 uppercase mb-2">Execution Settings</h4>
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Default Commission ($/Round Turn)</label>
                        <input type="number" value={overhead.commRate} onChange={e=>setOverhead({...overhead, commRate:e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded text-sm mt-1 focus:border-emerald-500 outline-none"/>
                        <p className="text-[10px] text-slate-500 mt-1">Defaults to $2.53 for Apex/Rithmic MNQ.</p>
                    </div>
                </div>

                <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-bold text-sm transition-colors">
                    Save Configuration
                </button>
            </CardContent>
        </Card>
    </div>
);

// --- Calendar Component ---
const PnLCalendar = ({ trades }) => {
    const dailyData = useMemo(() => {
        const map = {};
        trades.forEach(t => {
            const date = t.date;
            if (!map[date]) map[date] = 0;
            map[date] += parseFloat(t.pnl);
        });
        return map;
    }, [trades]);

    const today = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        days.push({ date: dateStr, pnl: dailyData[dateStr] || 0 });
    }

    return (
        <div className="grid grid-cols-5 md:grid-cols-7 gap-2">
            {days.map(d => (
                <div key={d.date} className={`p-2 rounded border text-center ${d.pnl > 0 ? 'bg-emerald-900/30 border-emerald-800' : d.pnl < 0 ? 'bg-rose-900/30 border-rose-800' : 'bg-slate-800 border-slate-700'}`}>
                    <div className="text-[10px] text-slate-500 mb-1">{d.date.slice(5)}</div>
                    <div className={`text-xs font-bold ${d.pnl > 0 ? 'text-emerald-400' : d.pnl < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                        {d.pnl === 0 ? '-' : `$${d.pnl.toFixed(0)}`}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Playback Component (Strategy Validator + Chat) ---
const Playback = ({ state, setState }) => {
    const HARDCODED_KEY = "AIzaSyC1cmu5ZIoLxOsSOpb8ws_i5Q42SMBfOs0"; 
    const [apiKey] = useState(() => HARDCODED_KEY || localStorage.getItem('gemini_api_key') || '');
    
    // Destructure state - SAFE DEFAULT for messages
    const { imageBase64, messages = [], isAnalyzing, error, strategyDescription } = state;
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const [localInput, setLocalInput] = useState("");

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setState(prev => ({
                    ...prev,
                    imageBase64: reader.result.split(',')[1],
                    messages: [], 
                    error: ""
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const callGemini = async (promptText) => {
        if (!apiKey) { setState(prev => ({...prev, error: "API Key Required"})); return null; }
        
        setState(prev => ({...prev, isAnalyzing: true, error: ""}));

        // Construct parts conditionally (allow chat without image)
        const parts = [{ text: promptText }];
        if (imageBase64) {
            parts.push({ inlineData: { mimeType: "image/png", data: imageBase64 } });
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: parts }]
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (err) {
            setState(prev => ({...prev, error: err.message}));
            return null;
        } finally {
            setState(prev => ({...prev, isAnalyzing: false}));
        }
    };

    const cleanText = (text) => {
        if (!text) return "";
        return text.replace(/\*\*/g, "").replace(/##/g, "").replace(/\*/g, "•").replace(/__/g, "");
    };

    const runAnalysis = async () => {
        if (!imageBase64) { setState(prev => ({...prev, error: "Please upload a chart for the initial Strategy Audit."})); return; }
        
        const prompt = `You are a Trading Strategy Architect. 
        Analyze this chart which represents the user's "Perfect Setup".
        
        USER'S DESCRIPTION: "${strategyDescription || 'No description provided.'}"
        
        YOUR TASK:
        1. Reverse Engineer the logic: What technical elements (indicators, price action) define this trade?
        2. Identifying Risks: Where does this specific setup usually fail? (e.g. choppy markets, news events).
        3. Critique: Are the user's indicators lagging? Is the R:R clear?
        4. Profit Targets: Determine the best exit strategy for this specific setup.
        
        OUTPUT FORMAT (Strictly Plain Text, NO Markdown, NO bolding):
        STRATEGY DNA REPORT
        
        [EMOJI] THE LOGIC
        (Explain how this strategy makes money)
        
        [EMOJI] THE MECHANICS
        (Break down the specific triggers you see in the image)
        
        [EMOJI] PROFIT TARGETS
        (Where should Take Profit be placed for this setup? e.g. 1:2 RR, Next Liquidity, etc.)

        [EMOJI] WEAKNESSES
        (When will this burn cash?)
        
        [EMOJI] OPTIMIZATION
        (One actionable tip to make it better)`;

        const result = await callGemini(prompt);
        if (result) {
             const cleaned = cleanText(result);
             setState(prev => ({ 
                 ...prev, 
                 messages: [{ role: 'ai', content: cleaned }] 
             }));
        }
    };

    const handleSendMessage = async (msgText) => {
        if (!msgText.trim()) return;
        setLocalInput("");
        
        // Use prev state to ensure we don't lose messages
        setState(prev => ({
            ...prev,
            messages: [...(prev.messages || []), { role: 'user', content: msgText }]
        }));

        const prompt = `You are an expert Strategy Architect. 
        User Question about their strategy chart: "${msgText}". 
        Be specific to the chart image and their defined rules. 
        CRITICAL: Keep answer clean, human readable, NO BOLDING (**), NO MARKDOWN headers.`;

        const result = await callGemini(prompt);
        if (result) {
            const cleaned = cleanText(result);
            setState(prev => ({
                ...prev,
                messages: [...(prev.messages || []), { role: 'ai', content: cleaned }]
            }));
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px] animate-in fade-in duration-500">
            <Card className="lg:w-1/2 flex flex-col">
                <CardHeader className="flex justify-between items-center bg-slate-950/30">
                    <CardTitle className="flex items-center gap-2"><BookOpen size={18} className="text-amber-400"/> My Playback</CardTitle>
                    <div className="flex gap-2">
                        <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-indigo-600 px-3 py-1 rounded text-white hover:bg-indigo-500 transition-colors">Upload Model Chart</button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                </CardHeader>
                <div className="flex-1 bg-black/40 m-4 rounded flex items-center justify-center relative min-h-[300px]">
                    {imageBase64 ? <img src={`data:image/png;base64,${imageBase64}`} className="w-full h-full object-contain" alt="Strategy"/> : <div className="text-center text-slate-600"><Upload size={48} className="mb-2 mx-auto opacity-30"/><p className="text-sm">Upload your "Perfect Setup" Chart</p></div>}
                </div>
                <div className="p-4 border-t border-slate-800 space-y-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded p-2">
                        <div className="text-xs text-amber-500 font-bold mb-1 flex items-center gap-2"><Lightbulb size={12}/> STRATEGY NOTES</div>
                        <textarea className="w-full bg-transparent text-xs text-slate-300 outline-none resize-none h-20" placeholder="List your indicators and rules here (e.g. VWAP bounce, RSI < 30)..." value={strategyDescription} onChange={e => setState(prev => ({...prev, strategyDescription: e.target.value}))}/>
                    </div>
                    <button onClick={runAnalysis} disabled={isAnalyzing || !imageBase64} className="w-full bg-amber-600 hover:bg-amber-500 py-2 rounded text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                        {isAnalyzing ? "Analyzing..." : <><Brain size={16}/> Analyze Strategy Logic</>}
                    </button>
                </div>
            </Card>

            <Card className="lg:w-1/2 flex flex-col bg-slate-900">
                <CardHeader className="py-3 border-b border-slate-800/50 flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-sm text-emerald-400"><ShieldAlert size={16}/> Strategy Audit & Chat</CardTitle>
                    {error && <span className="text-xs text-rose-400 bg-rose-900/20 px-2 py-1 rounded">{error}</span>}
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs text-center p-8">
                            <Activity size={32} className="mb-3 opacity-20" />
                            <p>Ready to chat. Upload chart for deep analysis<br/>or just ask general questions below.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[95%] rounded-2xl p-4 text-[15px] font-medium leading-7 shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                    {isAnalyzing && <div className="text-xs text-slate-500 animate-pulse">Analyst is thinking...</div>}
                    <div ref={chatEndRef} />
                </CardContent>

                <div className="p-3 border-t border-slate-800 flex gap-2">
                    <input 
                        type="text" 
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(localInput)}
                        placeholder="Ask about your strategy rules..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                        disabled={isAnalyzing}
                    />
                    <button onClick={() => handleSendMessage(localInput)} disabled={isAnalyzing} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded">
                        <Send size={16} />
                    </button>
                </div>
            </Card>
        </div>
    );
};

// --- Strategy Room Component ---
const StrategyRoom = ({ state, setState }) => {
    const HARDCODED_KEY = "AIzaSyC1cmu5ZIoLxOsSOpb8ws_i5Q42SMBfOs0"; 

    const [apiKey, setApiKey] = useState(() => HARDCODED_KEY || localStorage.getItem('gemini_api_key') || '');
    const [inputMessage, setInputMessage] = useState("");
    
    // Destructure state - removed analysisMode, review inputs
    const { imageBase64, generatedPlan, isAnalyzing, error, messages, userStrategy, selectedTicker, timeframe, riskAmount } = state;

    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!HARDCODED_KEY) localStorage.setItem('gemini_api_key', apiKey);
    }, [apiKey]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                setState(prev => ({
                    ...prev,
                    imageBase64: base64String,
                    generatedPlan: "",
                    messages: [],
                    error: ""
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const callGemini = async (promptText) => {
        const activeKey = HARDCODED_KEY || apiKey;
        if (!activeKey) { setState(prev => ({ ...prev, error: "Please enter API Key." })); return null; }
        
        setState(prev => ({ ...prev, isAnalyzing: true, error: "" }));

        // Construct parts conditionally
        const parts = [{ text: promptText }];
        if (imageBase64) {
            parts.push({ inlineData: { mimeType: "image/png", data: imageBase64 } });
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: parts }],
                    tools: [{ google_search: {} }]
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (err) {
            setState(prev => ({ ...prev, error: `Error: ${err.message}` }));
            return null;
        } finally {
            setState(prev => ({ ...prev, isAnalyzing: false }));
        }
    };

    const cleanText = (text) => {
        if (!text) return "";
        return text.replace(/\*\*/g, "").replace(/##/g, "").replace(/\*/g, "•").replace(/__/g, "");
    };

    const runInitialAnalysis = async () => {
        setState(prev => ({ ...prev, messages: [] }));

        // PLAN MODE: Forward Looking
        const strategyContext = userStrategy 
            ? `USER'S STRATEGY: "${userStrategy}". Check alignment.` 
            : `USER STRATEGY: Standard Price Action.`;

        const prompt = `You are an expert institutional futures trader. 
        Analyze this ${timeframe} chart for ${selectedTicker}. Risk per trade: $${riskAmount}.
        ${strategyContext}
        TASK: Identify specific trade setups based on the user's strategy (e.g. 9/21 EMA Cross, VWAP interactions) if present.
        Use Google Search for real-time news context.
        
        OUTPUT INSTRUCTIONS: No Markdown. Clean chat style. Emojis.
        
        Structure:
        REAL-TIME MARKET PLAN (${selectedTicker})
        🧠 THE READ (Bias & Narrative)
        🌍 NEWS CONTEXT (One sentence driver)
        💡 TRADE IDEA (Based on Strategy)
           - Setup: (e.g. 9/21 Cross / VWAP)
           - Entry Trigger:
        🛡️ STOP LOSS (Invalidation Level)
        🎯 TAKE PROFIT (Specific Targets)
        ⚡ THE PLAY (If/Then Execution)`;

        const result = await callGemini(prompt);
        if (result) {
            const cleaned = cleanText(result);
            setState(prev => ({ 
                ...prev, 
                generatedPlan: cleaned,
                messages: [{ role: 'ai', content: cleaned }] 
            }));
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;
        const msg = inputMessage;
        setInputMessage("");
        setState(prev => ({ ...prev, messages: [...prev.messages, { role: 'user', content: msg }] }));
        const prompt = `You are an expert trader. User Question: "${msg}". 
        CRITICAL: Keep answer clean, human readable, NO BOLDING (**), NO MARKDOWN headers.`;
        const result = await callGemini(prompt);
        if (result) {
            const cleaned = cleanText(result);
            setState(prev => ({ ...prev, messages: [...prev.messages, { role: 'ai', content: cleaned }] }));
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px] animate-in fade-in duration-500">
            {/* Left: Chart Upload */}
            <Card className="lg:w-2/3 h-full flex flex-col">
                <CardHeader className="flex justify-between items-center bg-slate-950/30">
                    <CardTitle className="flex items-center gap-2"><ImageIcon size={18} className="text-indigo-400"/> Chart Source</CardTitle>
                    <div className="flex gap-2 items-center">
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-2 mr-2">
                             <span className="text-[10px] text-slate-500 mr-2 uppercase font-bold">Risk $</span>
                             <input 
                                type="number" 
                                value={riskAmount} 
                                onChange={(e) => setState(prev => ({...prev, riskAmount: e.target.value}))} 
                                className="bg-transparent text-xs text-white w-12 outline-none py-1" 
                             />
                        </div>
                        <select 
                            value={timeframe} 
                            onChange={(e) => setState(prev => ({...prev, timeframe: e.target.value}))} 
                            className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none mr-2"
                        >
                            <option value="2m">2m</option>
                            <option value="5m">5m</option><option value="15m">15m</option><option value="1H">1H</option><option value="4H">4H</option><option value="D">Daily</option>
                        </select>
                        <select 
                            value={selectedTicker} 
                            onChange={(e) => setState(prev => ({...prev, selectedTicker: e.target.value}))} 
                            className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none mr-2"
                        >
                            <option value="MNQ">MNQ</option><option value="NQ">NQ</option><option value="ES">ES</option><option value="MES">MES</option><option value="CL">CL</option><option value="GC">GC</option>
                        </select>

                        {!HARDCODED_KEY && <input type="password" placeholder="API Key" value={apiKey} onChange={e=>setApiKey(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 w-24" />}
                        <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded font-medium transition-colors">Upload</button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </CardHeader>
                
                <div className="flex-1 bg-black/40 m-4 rounded flex items-center justify-center relative">
                    {imageBase64 ? 
                        <img src={`data:image/png;base64,${imageBase64}`} alt="Chart" className="w-full h-full object-contain" /> 
                        : 
                        <div className="text-slate-600 flex flex-col items-center"><Upload size={48} className="mb-2 opacity-30"/><span className="text-sm">Upload Chart</span></div>
                    }
                </div>

                {/* Pro Tips / Strategy Input */}
                <div className="px-4 pb-2">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-2 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-amber-500 font-bold mb-1">
                            <Lightbulb size={12} />
                            <span>MY STRATEGY (Optional)</span>
                        </div>
                        <textarea 
                            className="w-full bg-transparent text-xs text-slate-300 outline-none resize-none h-16 placeholder-slate-600"
                            placeholder="e.g. 9/21 EMA Cross, VWAP Bounce, or Break & Retest..."
                            value={userStrategy}
                            onChange={(e) => setState(prev => ({...prev, userStrategy: e.target.value}))}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button onClick={runInitialAnalysis} disabled={isAnalyzing || !imageBase64} className="bg-emerald-600 px-6 py-2 rounded text-white text-sm font-bold flex gap-2 disabled:opacity-50 shadow-lg shadow-emerald-900/20">
                        {isAnalyzing ? "Scanning..." : <><Brain size={16}/> Generate Plan</>}
                    </button>
                </div>
            </Card>

            {/* Right: Expert Chat & Plan */}
            <Card className="lg:w-1/3 flex flex-col h-full bg-slate-900">
                <CardHeader className="py-3 border-b border-slate-800/50 flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-sm text-emerald-400"><MessageSquare size={16}/> LiveDesk</CardTitle>
                    {error && <span className="text-xs text-rose-400 bg-rose-900/20 px-2 py-1 rounded">{error}</span>}
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs text-center">
                            <Activity size={32} className="mb-3 opacity-20" />
                            <p>Ready to chat. Upload chart or just ask.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[95%] rounded-2xl p-4 text-[15px] font-medium leading-7 shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </CardContent>

                <div className="p-3 border-t border-slate-800 flex gap-2">
                    <input 
                        type="text" 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask follow-up question..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                        disabled={isAnalyzing || messages.length === 0}
                    />
                    <button onClick={handleSendMessage} disabled={isAnalyzing || messages.length === 0} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded">
                        <Send size={16} />
                    </button>
                </div>
            </Card>
        </div>
    );
};

// --- Institutional Metrics Helper ---
const calculateMetrics = (trades, balance, overhead) => {
    if (!trades.length) return null;
    let wins=0, losses=0, grossProfit=0, grossLoss=0, totalComms=0;
    let equity = [balance];
    let peak = balance;
    let maxDD = 0;
    let longCount=0, longWins=0, shortCount=0, shortWins=0;
    
    // Time & Duration Buckets
    const timeStats = { 
        "Late Night": { pnl: 0, count: 0 }, 
        "Early Mrng": { pnl: 0, count: 0 }, 
        "NY AM": { pnl: 0, count: 0 },
        "NY PM": { pnl: 0, count: 0 }
    };
    const durationStats = { "< 2m": {wins: 0, total: 0}, "2-10m": {wins: 0, total: 0}, "10-60m": {wins: 0, total: 0}, "> 60m": {wins: 0, total: 0} };
    const strategyStats = {};
    const tickerStats = {};
    const dayStats = { 0: {pnl:0, count:0}, 1: {pnl:0, count:0}, 2: {pnl:0, count:0}, 3: {pnl:0, count:0}, 4: {pnl:0, count:0}, 5: {pnl:0, count:0}, 6: {pnl:0, count:0} };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const sorted = [...trades].sort((a,b) => new Date(a.date + ' ' + (a.time || '12:00')) - new Date(b.date + ' ' + (b.time || '12:00')));

    let consecLosses = 0, maxConsecLosses = 0;
    let totalWinDuration = 0, totalLossDuration = 0;
    let winCountWithDuration = 0, lossCountWithDuration = 0;
    let totalWinSize = 0, winCountWithSize = 0;
    let totalLossSize = 0, lossCountWithSize = 0;
    const tradesPerDay = {};
    let potentialRevengeTrades = 0;

    sorted.forEach((t, i) => {
        const net = parseFloat(t.pnl);
        const fees = parseFloat(t.fees);
        totalComms += fees;
        
        // Track Trades per Day
        tradesPerDay[t.date] = (tradesPerDay[t.date] || 0) + 1;

        // Day of Week
        const dateObj = new Date(t.date + ' ' + (t.time || '12:00'));
        const day = dateObj.getDay();
        dayStats[day].pnl += net;
        dayStats[day].count++;
        
        // Sizing Tracking
        const size = parseFloat(t.size) || 1;
        if (net > 0) { 
            wins++; 
            grossProfit += net; 
            consecLosses = 0;
            totalWinSize += size;
            winCountWithSize++;
            if(t.duration) {
                totalWinDuration += parseFloat(t.duration);
                winCountWithDuration++;
            }
        } 
        else { 
            losses++; 
            grossLoss += Math.abs(net); 
            consecLosses++;
            totalLossSize += size;
            lossCountWithSize++;
            if (consecLosses > maxConsecLosses) maxConsecLosses = consecLosses;
            if(t.duration) {
                totalLossDuration += parseFloat(t.duration);
                lossCountWithDuration++;
            }
        }

        // Revenge Check (Trade within 5 mins of a loss)
        if (i > 0) {
            const prev = sorted[i-1];
            const prevNet = parseFloat(prev.pnl);
            if (prevNet < 0) {
                const prevDateObj = new Date(prev.date + ' ' + (prev.time || '12:00'));
                const diffMs = dateObj - prevDateObj;
                const diffMins = diffMs / 60000;
                if (diffMins < 5 && diffMins >= 0) {
                    potentialRevengeTrades++;
                }
            }
        }

        if (t.direction === 'Long') { 
            longCount++; 
            if(net > 0) longWins++; 
        } else { 
            shortCount++; 
            if(net > 0) shortWins++; 
        }

        const current = equity[equity.length-1] + net;
        if (current > peak) peak = current;
        const dd = peak - current;
        if (dd > maxDD) maxDD = dd;
        equity.push(current);

        // Advanced Time Stats
        const h = parseInt((t.time || "12:00").split(':')[0]);
        let session = "";
        if (h >= 18 || h < 2) session = "Late Night";
        else if (h >= 2 && h < 8) session = "Early Mrng";
        else if (h >= 8 && h < 12) session = "NY AM";
        else session = "NY PM";

        timeStats[session].pnl += net;
        timeStats[session].count++;

        // Duration Stats
        if(t.duration) {
            const min = parseFloat(t.duration);
            let bucket = "> 60m";
            if(min < 2) bucket = "< 2m";
            else if(min <= 10) bucket = "2-10m";
            else if(min <= 60) bucket = "10-60m";
            
            durationStats[bucket].total++;
            if(net > 0) durationStats[bucket].wins++;
        }

        // Strategy Stats
        const setup = t.setup || "Unknown";
        if (!strategyStats[setup]) { strategyStats[setup] = { count: 0, wins: 0, losses: 0, pnl: 0 }; }
        const s = strategyStats[setup];
        s.count++; s.pnl += net; if (net > 0) s.wins++; else s.losses++;
        
        // Ticker Stats
        if (!tickerStats[t.ticker]) tickerStats[t.ticker] = { pnl: 0, wins: 0, count: 0 };
        tickerStats[t.ticker].pnl += net;
        tickerStats[t.ticker].count++;
        if (net > 0) tickerStats[t.ticker].wins++;
    });

    const pf = grossLoss === 0 ? grossProfit : grossProfit/grossLoss;
    const netPnL = grossProfit - grossLoss;
    const winRate = (wins/trades.length)*100;
    
    const avgWin = wins > 0 ? grossProfit/wins : 0;
    const avgLoss = losses > 0 ? grossLoss/losses : 0;
    const avgRR = avgLoss > 0 ? (avgWin/avgLoss) : avgWin;
    const expectancy = (winRate/100 * avgWin) - ((1-(winRate/100)) * avgLoss);

    // --- THE COACH'S BRAIN ---
    const painPoints = [];
    const insights = [];

    // 1. Time Leaks & Strengths
    let worstSession = null;
    let bestSession = null;
    
    Object.entries(timeStats).forEach(([name, stats]) => {
        if (!worstSession || stats.pnl < (worstSession?.pnl || 0)) worstSession = { name, ...stats };
        if (!bestSession || stats.pnl > (bestSession?.pnl || 0)) bestSession = { name, ...stats };
    });

    if (worstSession && worstSession.pnl < -100) {
        painPoints.push(`⏰ Time Leak: You bleed money in the ${worstSession.name} ($${worstSession.pnl.toFixed(0)}). Stop trading then.`);
    }
    if (bestSession && bestSession.pnl > 100) {
        insights.push(`🌅 Power Hour: You crush it in the ${bestSession.name} (+$${bestSession.pnl.toFixed(0)}). Scale up here.`);
    }

    // 2. Risk Management (Avg Win vs Loss)
    if (avgLoss > avgWin) {
        painPoints.push(`⚠️ Risk Inversion: Your Avg Loss ($${avgLoss.toFixed(0)}) is bigger than your Avg Win ($${avgWin.toFixed(0)}). Negative expectancy.`);
    } else if (avgWin > avgLoss * 1.5) {
        insights.push(`💎 Diamond Hands: Avg Win is ${avgRR.toFixed(1)}x your Avg Loss. Great discipline.`);
    }
    
    // Sizing Check
    const avgWinSize = winCountWithSize ? totalWinSize / winCountWithSize : 0;
    const avgLossSize = lossCountWithSize ? totalLossSize / lossCountWithSize : 0;
    if (avgLossSize > avgWinSize * 1.5) {
        painPoints.push(`⚖️ Sizing Bias: You trade bigger (${avgLossSize.toFixed(1)} lots) on losers than winners (${avgWinSize.toFixed(1)}).`);
    }

    // 3. Revenge / Tilt
    if (potentialRevengeTrades > 0) {
        painPoints.push(`😡 Revenge Alert: ${potentialRevengeTrades} trades taken <5m after a loss.`);
    }
    if (maxConsecLosses >= 3) {
        painPoints.push(`🛑 Tilt Alert: Streak of ${maxConsecLosses} losses. Walk away.`);
    }

    // 4. Holding Losers (Hope Mode)
    const avgWinDur = winCountWithDuration > 0 ? totalWinDuration / winCountWithDuration : 0;
    const avgLossDur = lossCountWithDuration > 0 ? totalLossDuration / lossCountWithDuration : 0;
    
    if (avgLossDur > avgWinDur * 1.5) {
        painPoints.push(`⏳ Hope Mode: Holding losers (${avgLossDur.toFixed(1)}m) longer than winners (${avgWinDur.toFixed(1)}m). Cut them fast.`);
    } else if (avgWinDur > avgLossDur * 2) {
        insights.push(`🦅 Patience Power: You let winners run (${avgWinDur.toFixed(1)}m) and cut losers fast (${avgLossDur.toFixed(1)}m).`);
    }

    // 5. Strategy-Specific Insights
    Object.entries(strategyStats).forEach(([name, stats]) => {
        if (stats.count >= 3) {
            if (stats.pnl > 300) insights.push(`🔥 Strategy King: "${name}" is printing (+$${stats.pnl.toFixed(0)}).`);
            if (stats.pnl < -200) painPoints.push(`🗑️ Strategy Alert: "${name}" is costing you (-$${Math.abs(stats.pnl).toFixed(0)}).`);
        }
    });
    
    // 6. Ticker Analysis
    Object.entries(tickerStats).forEach(([ticker, stats]) => {
        if (stats.pnl < -500) painPoints.push(`🛑 Toxic Ticker: ${ticker} is draining your account (-$${Math.abs(stats.pnl).toFixed(0)}).`);
        if (stats.pnl > 500) insights.push(`🦄 Golden Goose: ${ticker} is your best performer (+$${stats.pnl.toFixed(0)}).`);
    });
    
    // 7. Day of Week
    let bestDay = null, worstDay = null;
    Object.entries(dayStats).forEach(([day, stats]) => {
        if (stats.count > 0) {
             if (!bestDay || stats.pnl > bestDay.pnl) bestDay = { name: dayNames[day], ...stats };
             if (!worstDay || stats.pnl < worstDay.pnl) worstDay = { name: dayNames[day], ...stats };
        }
    });
    if (worstDay && worstDay.pnl < -200) painPoints.push(`📅 Bad Day: ${worstDay.name}s are your worst ($${worstDay.pnl.toFixed(0)}). Take them off?`);
    if (bestDay && bestDay.pnl > 200) insights.push(`📅 Money Day: You crush it on ${bestDay.name}s (+$${bestDay.pnl.toFixed(0)}).`);

    // 8. Overtrading
    const maxTradesInDay = Math.max(...Object.values(tradesPerDay));
    if (maxTradesInDay > 15) {
        painPoints.push(`🎰 Overtrading Alert: ${maxTradesInDay} trades in one day. Focus on quality.`);
    }

    // 9. Churning Check
    if (totalComms > (grossProfit * 0.2) && grossProfit > 0) {
        painPoints.push(`💸 Churning: Fees ($${totalComms.toFixed(0)}) ate >20% of profits.`);
    }

    // 10. Drawdown
    if(maxDD > 2000) painPoints.push(`🚨 Drawdown Alert: -$${maxDD.toFixed(2)}. Watch out.`);

    // 11. Overall Vibe
    if (netPnL > 0 && winRate > 50) insights.push(`🚀 Solid Performance: ${winRate.toFixed(0)}% WR and Green. Keep doing what you're doing.`);
    
    // 12. Directional Bias
    if (longCount > 3 && shortCount > 3) {
        const longWRVal = (longCount > 0) ? (longWins/longCount)*100 : 0;
        const shortWRVal = (shortCount > 0) ? (shortWins/shortCount)*100 : 0;
        
        if (longWRVal > shortWRVal + 20) insights.push(`📈 Long Specialist: You win way more often on Longs (${longWRVal.toFixed(0)}%) vs Shorts (${shortWRVal.toFixed(0)}%).`);
        if (shortWRVal > longWRVal + 20) insights.push(`📉 Short Specialist: You win way more often on Shorts (${shortWRVal.toFixed(0)}%) vs Longs (${longWRVal.toFixed(0)}%).`);
    }

    const totalOverhead = ((overhead.evalCost*overhead.evalsPerMonth)+overhead.paFees);
    const bizNet = netPnL - totalOverhead;

    // Prepare Duration Chart Data
    const durationChartData = Object.keys(durationStats).map(bucket => ({
        name: bucket,
        winRate: durationStats[bucket].total > 0 ? ((durationStats[bucket].wins / durationStats[bucket].total) * 100).toFixed(0) : 0
    }));

    // Long/Short Win Rates
    const longWR = longCount > 0 ? (trades.filter(t => t.direction === 'Long' && parseFloat(t.pnl) > 0).length / longCount * 100).toFixed(0) : 0;
    const shortWR = shortCount > 0 ? (trades.filter(t => t.direction === 'Short' && parseFloat(t.pnl) > 0).length / shortCount * 100).toFixed(0) : 0;
    const longPnL = trades.filter(t => t.direction === 'Long').reduce((acc, t) => acc + parseFloat(t.pnl), 0).toFixed(0);
    const shortPnL = trades.filter(t => t.direction === 'Short').reduce((acc, t) => acc + parseFloat(t.pnl), 0).toFixed(0);

    // Strategy DNA Data
    const strategyDnaData = Object.keys(strategyStats).map(name => {
        const s = strategyStats[name];
        const wr = (s.wins / s.count) * 100;
        let rating = 'F';
        if (s.pnl > 0 && wr > 50) rating = 'A';
        else if (s.pnl > 0) rating = 'B';
        else if (wr > 50) rating = 'C';
        
        return { name, ...s, wr: wr.toFixed(0), rating };
    }).sort((a,b) => b.pnl - a.pnl);
    
    // Prepare Data for File Export (Metrics Summary)
    const metricsSummaryText = `
    SHOCK AND AWE TRADING REPORT
    ----------------------------
    Net PnL: $${netPnL.toFixed(2)}
    Win Rate: ${winRate.toFixed(1)}%
    Profit Factor: ${pf.toFixed(2)}
    Expectancy: $${(expectancy || 0).toFixed(2)}
    
    COACH'S INSIGHTS:
    ${insights.map(i => `- ${i}`).join('\n')}
    
    WARNINGS:
    ${painPoints.map(p => `- ${p}`).join('\n')}
    `;

    return {
        winRate: winRate.toFixed(1),
        profitFactor: pf.toFixed(2),
        maxDrawdown: maxDD.toFixed(2),
        tradingNetPnL: netPnL.toFixed(2),
        totalCommissions: totalComms.toFixed(2),
        businessNetPnL: (netPnL - totalOverhead).toFixed(2),
        totalOverhead,
        expectancy: (expectancy || 0).toFixed(2),
        avgWin: avgWin.toFixed(2),
        avgLoss: avgLoss.toFixed(2),
        longWR,
        shortWR,
        longPnL,
        shortPnL,
        equityCurve: equity.map((v, i) => ({ trade: i, equity: v })),
        painPoints,
        insights,
        metricsSummaryText, // Exportable text
        sessionChartData: [
            { name: 'Late Night', pnl: timeStats["Late Night"].pnl },
            { name: 'Early Mrng', pnl: timeStats["Early Mrng"].pnl },
            { name: 'NY AM', pnl: timeStats["NY AM"].pnl },
            { name: 'NY PM', pnl: timeStats["NY PM"].pnl },
        ],
        durationChartData,
        strategyDnaData
    };
};

export default function TradingJournal() {
    const [activeTab, setActiveTab] = useState('journal');
    const [balance] = useState(50000); 
    const fileInputRef = useRef(null);
    const [importMode, setImportMode] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    // Default Overhead: Eval=39, Qty=1, PA=65, Comm=2.53 (Apex/Rithmic MNQ)
    const [overhead, setOverhead] = useState(() => JSON.parse(localStorage.getItem('journal_overhead')) || { evalCost: 39, evalsPerMonth: 1, paFees: 65, commRate: 2.53 });
    const [trades, setTrades] = useState(() => JSON.parse(localStorage.getItem('journal_trades')) || []);

    // --- LIFTED STATE FOR STRATEGY ROOM (Persists to LocalStorage) ---
    const [strategyState, setStrategyState] = useState(() => JSON.parse(localStorage.getItem('journal_strategy')) || {
        imageBase64: null,
        generatedPlan: "",
        messages: [],
        userStrategy: "",
        selectedTicker: "MNQ",
        timeframe: "5m",
        riskAmount: 150,
        isAnalyzing: false,
        error: ""
    });

    const [playbookState, setPlaybookState] = useState(() => JSON.parse(localStorage.getItem('journal_playbook')) || {
        imageBase64: null,
        analysis: "",
        messages: [], // Added chat history to Playbook
        isAnalyzing: false,
        error: "",
        strategyDescription: ""
    });

    useEffect(() => {
        localStorage.setItem('journal_strategy', JSON.stringify(strategyState));
    }, [strategyState]);

    useEffect(() => {
        localStorage.setItem('journal_playbook', JSON.stringify(playbookState));
    }, [playbookState]);

    const [newTrade, setNewTrade] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '09:30',
        ticker: 'MNQ',
        direction: 'Short',
        entry: '', stop: '', exit: '', size: '1', fees: '', pointValue: '2', mistake: 'None', notes: '', duration: '', setup: ''
    });

    const getPointValue = (t) => {
        const up = t.toUpperCase();
        if (up.includes('MNQ')) return 2; 
        if (up.includes('NQ')) return 20; 
        if (up.includes('ES')) return 50;
        if (up.includes('MES')) return 5;
        if (up.includes('GC')) return 100;
        if (up.includes('CL')) return 1000;
        if (up.includes('RTY')) return 50;
        return 1;
    };

    useEffect(() => {
        if (!editingId) {
            setNewTrade(prev => ({ ...prev, pointValue: getPointValue(prev.ticker) }));
        }
    }, [newTrade.ticker]);

    useEffect(() => { localStorage.setItem('journal_trades', JSON.stringify(trades)); }, [trades]);
    useEffect(() => { localStorage.setItem('journal_overhead', JSON.stringify(overhead)); }, [overhead]);

    const metrics = useMemo(() => calculateMetrics(trades, balance, overhead), [trades, balance, overhead]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTrade(prev => ({ ...prev, [name]: value }));
    };

    const saveTrade = () => {
        const entry = parseFloat(newTrade.entry);
        const exit = parseFloat(newTrade.exit);
        const size = parseFloat(newTrade.size);
        const fees = newTrade.fees ? parseFloat(newTrade.fees) : (size * overhead.commRate);
        const ptVal = parseFloat(newTrade.pointValue);
        
        let points = 0;
        if (newTrade.direction === 'Long') points = exit - entry;
        else points = entry - exit;

        const grossPnL = points * ptVal * size;
        const netPnL = grossPnL - fees;

        const tradeData = { 
            ...newTrade, 
            id: editingId || Date.now(), 
            pnl: netPnL.toFixed(2), 
            fees: fees.toFixed(2) 
        };

        if (editingId) {
            setTrades(trades.map(t => t.id === editingId ? tradeData : t));
            setEditingId(null);
        } else {
            setTrades([...trades, tradeData]);
        }

        setNewTrade({ 
            date: new Date().toISOString().split('T')[0], 
            time: '09:30', ticker: 'MNQ', direction: 'Short', entry: '', stop: '', exit: '', size: '1', fees: '', pointValue: '2', mistake: 'None', notes: '', duration: '', setup: '' 
        });
    };

    const startEdit = (trade) => {
        setNewTrade(trade);
        setEditingId(trade.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteTrade = (id) => setTrades(trades.filter(t => t.id !== id));
    const clearAllData = () => { if(window.confirm("Delete ALL trades?")) setTrades([]); };
    
    // --- IMPORT LOGIC ---
    const handleImportClick = (mode) => {
        setImportMode(mode);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        } else {
            console.error("File input ref not attached");
        }
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            if(importMode === 'ninja') parseNinja(evt.target.result);
            else parseTopstep(evt.target.result);
        };
        reader.readAsText(file);
        e.target.value = null; 
    };

    const parseDurationToMinutes = (durationStr) => {
        if (!durationStr) return 0;
        const parts = durationStr.split(':');
        if (parts.length < 2) return 0;
        const h = parseFloat(parts[0]);
        const m = parseFloat(parts[1]);
        const s = parseFloat(parts[2] || 0);
        return (h * 60) + m + (s / 60);
    };

    const parseTopstep = (text) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const idxSym = headers.findIndex(h => h.includes('ContractName') || h.includes('Symbol'));
        const idxPnL = headers.findIndex(h => h === 'PnL' || h.includes('Realized'));
        const idxFee = headers.findIndex(h => h.includes('Fees') || h.includes('Commission'));
        const idxType = headers.findIndex(h => h.includes('Type') || h.includes('Side'));
        const idxDate = headers.findIndex(h => h.includes('EnteredAt'));
        const idxSize = headers.findIndex(h => h.includes('Size') || h.includes('Qty'));
        const idxDur = headers.findIndex(h => h.includes('TradeDuration'));

        if(idxPnL === -1) { alert("Error: No PnL column found."); return; }

        const newTrades = [];
        for(let i=1; i<lines.length; i++) {
            const row = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
            if(!row[idxSym]) continue;
            let pnl = parseFloat(row[idxPnL].replace(/[^0-9.-]/g, ''));
            if(row[idxPnL].includes('(')) pnl = -Math.abs(pnl); 
            let fees = 0;
            if (idxFee !== -1 && row[idxFee]) fees = parseFloat(row[idxFee].replace(/[^0-9.-]/g, ''));
            const netPnL = pnl - fees;
            let dateStr = new Date().toISOString().split('T')[0];
            let timeStr = "12:00"; // Fallback
            
            if (idxDate !== -1 && row[idxDate]) {
                try { 
                    const d = new Date(row[idxDate]);
                    dateStr = d.toISOString().split('T')[0];
                    // Extract HH:MM
                    timeStr = d.toTimeString().split(' ')[0].substring(0, 5); 
                } catch(e){}
            }

            let dur = 0;
            if (idxDur !== -1 && row[idxDur]) {
                dur = parseDurationToMinutes(row[idxDur]);
            }

            newTrades.push({
                id: Date.now() + i,
                date: dateStr,
                time: timeStr,
                ticker: row[idxSym],
                direction: row[idxType] || 'Long',
                size: idxSize !== -1 ? row[idxSize] : '1',
                pnl: netPnL.toFixed(2),
                fees: fees.toFixed(2),
                mistake: 'None',
                notes: 'TopstepX Import',
                duration: dur.toFixed(1),
                setup: 'Imported'
            });
        }
        setTrades([...trades, ...newTrades]);
    };

    const parseNinja = (text) => { /* Reuse logic */
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const idxInstr = headers.findIndex(h => h.includes('Instrument'));
        const idxProfit = headers.findIndex(h => h.includes('Profit'));
        if(idxInstr === -1) return;
        const newTrades = [];
        for(let i=1; i<lines.length; i++) {
             const row = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
             if(!row[idxInstr]) continue;
             let pnl = parseFloat(row[idxProfit].replace(/[^0-9.]/g, ''));
             if(row[idxProfit].includes('(')) pnl = -Math.abs(pnl);
             newTrades.push({ id: Date.now()+i, date: new Date().toISOString().split('T')[0], time: "12:00", ticker: row[idxInstr], direction: 'Long', size: 1, pnl: pnl.toFixed(2), fees: "0.00", notes: "Ninja Import", setup: 'Imported' });
        }
        setTrades([...trades, ...newTrades]);
    };

    const exportCSV = () => { /* reuse */
        const headers = ["Date", "Ticker", "PnL", "Strategy", "Mistake", "Duration", "Fees"];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + trades.map(t => [t.date, t.ticker, t.pnl, t.setup, t.mistake, t.duration, t.fees].join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "journal.csv");
        document.body.appendChild(link);
        link.click();
    };
    
    // New Function: Download Coach Report
    const downloadReport = () => {
        if(!metrics) return;
        const element = document.createElement("a");
        const file = new Blob([metrics.metricsSummaryText], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "Coach_Report.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      {showSettings && <SettingsModal overhead={overhead} setOverhead={setOverhead} onClose={() => setShowSettings(false)} />}
      
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-bold text-white">Shock And Awe Trading</h1>
            <div className="flex items-center gap-4">
                 <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <Settings size={20} />
                 </button>
                 <button onClick={clearAllData} className="flex items-center gap-2 bg-rose-900/50 hover:bg-rose-900 text-rose-200 px-3 py-1 rounded text-xs border border-rose-800 transition-colors">
                    <RotateCcw size={14} /> Clear Data
                 </button>
                <div className="flex gap-2 bg-slate-900 p-1 rounded">
                    <button onClick={()=>setActiveTab('journal')} className={`px-4 py-2 rounded text-sm ${activeTab==='journal'?'bg-indigo-600 text-white':'text-slate-400'}`}>Journal</button>
                    <button onClick={()=>setActiveTab('livedesk')} className={`px-4 py-2 rounded text-sm ${activeTab==='livedesk'?'bg-indigo-600 text-white':'text-slate-400'}`}>LiveDesk</button>
                    <button onClick={()=>setActiveTab('playback')} className={`px-4 py-2 rounded text-sm ${activeTab==='playback'?'bg-indigo-600 text-white':'text-slate-400'}`}>Playback</button>
                </div>
            </div>
        </div>

        {activeTab === 'livedesk' ? (
            <StrategyRoom state={strategyState} setState={setStrategyState} />
        ) : activeTab === 'playback' ? (
            <Playback state={playbookState} setState={setPlaybookState} />
        ) : (
            <div className="space-y-6">
                 {/* This hidden input must be here for the Import buttons to find it via ref */}
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" style={{display: 'none'}} />
                 
                 {/* Metrics Row 1 */}
                 {metrics && (
                     <div className="grid grid-cols-5 gap-4">
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Net PnL</div><div className={`text-2xl font-mono ${metrics.tradingNetPnL>=0?'text-emerald-400':'text-rose-400'}`}>${metrics.tradingNetPnL}</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Win Rate</div><div className="text-2xl font-mono text-indigo-400">{metrics.winRate}%</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Expectancy</div><div className="text-2xl font-mono text-white">${metrics.expectancy}</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Profit Factor</div><div className="text-2xl font-mono text-blue-400">{metrics.profitFactor}</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Max Drawdown</div><div className="text-2xl font-mono text-rose-400">-${metrics.maxDrawdown}</div></CardContent></Card>
                     </div>
                 )}
                 
                 {/* Metrics Row 2 (Deep Dive) */}
                 {metrics && (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Avg Win</div><div className="text-lg font-mono text-emerald-400">${metrics.avgWin}</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Avg Loss</div><div className="text-lg font-mono text-rose-400">-${Math.abs(metrics.avgLoss)}</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Longs</div><div className="text-lg font-mono text-white">{metrics.longWR}% (${metrics.longPnL})</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Shorts</div><div className="text-lg font-mono text-white">{metrics.shortWR}% (${metrics.shortPnL})</div></CardContent></Card>
                     </div>
                 )}
                 
                 {/* NEW: Entry & Coach Row (TOP) */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     
                     <Card className="lg:col-span-2 border-indigo-500 border-2">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>{editingId ? "Edit Trade" : "New Trade Entry"}</CardTitle>
                                <div className="flex gap-2">
                                    <button onClick={() => handleImportClick('ninja')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-xs transition-colors text-white font-medium">
                                    <Upload size={14} /> Ninja
                                    </button>
                                    <button onClick={() => handleImportClick('topstep')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-xs transition-colors text-white font-medium">
                                    <Upload size={14} /> Topstep
                                    </button>
                                    <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs transition-colors border border-slate-700">
                                    <Download size={14} /> CSV
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div className="flex gap-2 col-span-1 md:col-span-2">
                                <input type="date" name="date" value={newTrade.date} onChange={handleInputChange} className="w-2/3 bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                                <input type="time" name="time" value={newTrade.time} onChange={handleInputChange} className="w-1/3 bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                            </div>
                            <div className="relative">
                                <select name="ticker" value={newTrade.ticker} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm appearance-none">
                                    <option value="MNQ">MNQ</option>
                                    <option value="NQ">NQ</option>
                                    <option value="ES">ES</option>
                                    <option value="MES">MES</option>
                                    <option value="CL">CL</option>
                                    <option value="GC">GC</option>
                                    <option value="RTY">RTY</option>
                                </select>
                            </div>
                            <select name="direction" value={newTrade.direction} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm">
                                <option value="Long">Long</option>
                                <option value="Short">Short</option>
                            </select>
                            <input type="text" name="setup" placeholder="Setup (e.g. Breakout)" value={newTrade.setup} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                            
                            <div className="relative">
                                <input type="number" name="duration" placeholder="Duration (min)" value={newTrade.duration} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm pl-2" />
                                <span className="absolute right-2 top-2 text-xs text-slate-500">min</span>
                            </div>

                            <input type="number" name="size" placeholder="Size" value={newTrade.size} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                            
                            <input type="number" name="entry" placeholder="Entry" value={newTrade.entry} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                            <input type="number" name="stop" placeholder="Stop" value={newTrade.stop} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                            <input type="number" name="exit" placeholder="Exit" value={newTrade.exit} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                            
                            <div className="relative">
                                <input type="number" name="pointValue" placeholder="Pt Val ($)" value={newTrade.pointValue} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm pl-2" />
                                <span className="absolute right-2 top-2 text-xs text-slate-500">$</span>
                            </div>

                            <input type="number" name="fees" placeholder="Fees (Auto)" value={newTrade.fees} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                            
                            <select name="mistake" value={newTrade.mistake} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm md:col-span-2">
                                <option value="None">No Mistake (Clean)</option>
                                <option value="FOMO">FOMO / Chased</option>
                                <option value="Revenge">Revenge Trading</option>
                                <option value="No Plan">No Plan / Impulse</option>
                                <option value="Hesitation">Hesitation (Late)</option>
                                <option value="Moved Stop">Moved Stop Loss</option>
                                <option value="Early Exit">Early Exit (Fear)</option>
                            </select>

                            <div className="col-span-2 md:col-span-4">
                                <input type="text" name="notes" placeholder="Psychology/Notes" value={newTrade.notes} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                            </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button onClick={saveTrade} className={`w-full ${editingId ? 'bg-amber-600' : 'bg-blue-600'} text-white h-9 rounded font-bold text-sm hover:opacity-90 transition-opacity`}>
                                    {editingId ? "Update Trade" : "Add Trade"}
                                </button>
                                {editingId && <button onClick={() => {setEditingId(null); setNewTrade({date: new Date().toISOString().split('T')[0], time: '09:30', ticker: 'MNQ', direction: 'Short', entry: '', stop: '', exit: '', size: '', fees: '', pointValue: '2', mistake: 'None', notes: '', duration: '', setup: ''})}} className="px-4 border border-slate-600 text-slate-400 rounded text-sm hover:text-white">Cancel</button>}
                            </div>
                        </CardContent>
                     </Card>

                     <Card className="lg:col-span-1">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><AlertCircle size={18} className="text-amber-500"/> Coach's Corner</CardTitle>
                            <button onClick={downloadReport} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded flex items-center gap-1"><FileText size={12}/> Report</button>
                        </CardHeader>
                        <CardContent>
                            {metrics?.insights.length > 0 && (
                                <ul className="space-y-2 mb-4">
                                    {metrics.insights.map((p,i) => <li key={i} className="text-xs p-2 bg-emerald-950/30 rounded text-emerald-200 border-l-2 border-emerald-500 flex gap-2"><ThumbsUp size={12}/> {p}</li>)}
                                </ul>
                            )}
                            {metrics?.painPoints.length > 0 ? (
                                <ul className="space-y-2">
                                    {metrics.painPoints.map((p,i) => <li key={i} className="text-xs p-2 bg-slate-950 rounded text-slate-300 border-l-2 border-amber-500 flex gap-2"><AlertCircle size={12}/> {p}</li>)}
                                </ul>
                            ) : <div className="text-xs text-slate-500">No critical alerts. Keep pushing.</div>}
                        </CardContent>
                     </Card>
                 </div>

                 {/* Charts & Calendar Grid */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Session Performance Chart */}
                         <Card>
                            <CardHeader><CardTitle className="text-sm">Session Performance (PnL)</CardTitle></CardHeader>
                            <CardContent className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={metrics?.sessionChartData || []}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                                        <Tooltip cursor={{fill: '#334155', opacity: 0.2}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} itemStyle={{ color: '#f8fafc' }} />
                                        <Bar dataKey="pnl">
                                            {metrics?.sessionChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Win Rate by Trade Duration */}
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2 text-sm items-center"><Timer size={16}/> Win Rate by Trade Duration</CardTitle></CardHeader>
                            <CardContent className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={metrics?.durationChartData || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                                        <YAxis stroke="#94a3b8" unit="%" />
                                        <Tooltip cursor={{fill: '#334155', opacity: 0.2}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} itemStyle={{ color: '#f8fafc' }} />
                                        <Bar dataKey="winRate" fill="#818cf8" radius={[4, 4, 0, 0]}>
                                            {metrics?.durationChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? '#10b981' : '#6366f1'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side: Calendar & Coach */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><CalendarIcon size={16}/> Daily Heatmap</CardTitle></CardHeader>
                            <CardContent>
                                <PnLCalendar trades={trades} />
                            </CardContent>
                        </Card>
                    </div>
                 </div>

                 {/* Strategy DNA Analysis */}
                 {metrics?.strategyDnaData.length > 0 && (
                     <Card>
                        <CardHeader><CardTitle className="flex gap-2"><PieChart size={16}/> Strategy DNA</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left text-slate-400">
                                    <thead className="uppercase bg-slate-900 border-b border-slate-800">
                                        <tr><th className="px-4 py-2">Strategy</th><th className="px-4 py-2">Trades</th><th className="px-4 py-2">Win %</th><th className="px-4 py-2">Net PnL</th><th className="px-4 py-2">Rating</th></tr>
                                    </thead>
                                    <tbody>
                                        {metrics.strategyDnaData.map((s, i) => (
                                            <tr key={i} className="border-b border-slate-800">
                                                <td className="px-4 py-2 font-bold text-white">{s.name}</td>
                                                <td className="px-4 py-2">{s.count}</td>
                                                <td className={`px-4 py-2 ${s.wr > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{s.wr}%</td>
                                                <td className={`px-4 py-2 ${s.pnl > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${s.pnl.toFixed(0)}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.rating === 'A' ? 'bg-emerald-500 text-black' : s.rating === 'F' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-white'}`}>{s.rating}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                     </Card>
                 )}

                 {/* Trade List */}
                 <Card>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-slate-400">
                             <thead className="text-xs uppercase bg-slate-900 border-b border-slate-800">
                                 <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Ticker</th><th className="px-4 py-2">Strategy</th><th className="px-4 py-2">P&L</th><th className="px-4 py-2 text-right">Action</th></tr>
                             </thead>
                             <tbody>
                                 {trades.slice().reverse().map(t => (
                                     <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 group">
                                         <td className="px-4 py-2">{t.date}</td>
                                         <td className="px-4 py-2 font-bold text-white">{t.ticker} <span className="text-[10px] text-slate-500 font-normal">({t.direction})</span></td>
                                         <td className="px-4 py-2 text-xs text-slate-400">{t.setup || '-'}</td>
                                         <td className={`px-4 py-2 font-mono ${parseFloat(t.pnl)>=0?'text-emerald-400':'text-rose-400'}`}>${t.pnl}</td>
                                         <td className="px-4 py-2 text-right flex justify-end gap-2">
                                            <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-indigo-400 transition-colors"><Edit2 size={14}/></button>
                                            <button onClick={()=>deleteTrade(t.id)} className="text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 </Card>
            </div>
        )}
      </div>
    </div>
  );
}