import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, AlertCircle, Download, Upload, Clock, DollarSign, Tag, Briefcase, Save, RotateCcw, BookOpen, Brain, Image as ImageIcon, Crosshair, Map, Target, Play, Activity, Key, Globe, Settings, X, Send, MessageSquare, Lightbulb, Calendar as CalendarIcon, PieChart, BarChart2, Timer, ThumbsUp, Book, ShieldAlert, CheckCircle2, Zap, FileText, Users, Eye } from 'lucide-react';
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
const SettingsModal = ({ overhead, setOverhead, accounts, setAccounts, trades, setTrades, onClose }) => {
    const [newAccountName, setNewAccountName] = useState("");

    const handleAddAccount = () => {
        if (newAccountName && !accounts.includes(newAccountName)) {
            setAccounts([...accounts, newAccountName]);
            setNewAccountName("");
        }
    };

    const handleDeleteAccount = (accToDelete) => {
        if (window.confirm(`Delete account "${accToDelete}"? Trades tagged with this account will remain but the filter will be removed.`)) {
            setAccounts(accounts.filter(a => a !== accToDelete));
        }
    };

    const handleRenameAccount = (oldName) => {
        const newName = prompt(`Rename "${oldName}" to:`, oldName);
        if (newName && newName !== oldName && !accounts.includes(newName)) {
            setAccounts(accounts.map(acc => acc === oldName ? newName : acc));
            // Update trades to reflect new account name
            setTrades(trades.map(t => (t.account || 'Main') === oldName ? { ...t, account: newName } : t));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md border-slate-700 bg-slate-950 max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex justify-between items-center border-slate-800">
                    <CardTitle className="flex items-center gap-2"><Settings size={18}/> Dashboard Configuration</CardTitle>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2"><Users size={12}/> Manage Accounts</h4>
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                value={newAccountName}
                                onChange={(e) => setNewAccountName(e.target.value)}
                                placeholder="New Account Name..."
                                className="flex-1 bg-slate-950 border border-slate-700 text-white p-2 rounded text-xs focus:border-blue-500 outline-none"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddAccount(); }}
                            />
                            <button onClick={handleAddAccount} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded text-xs font-bold"><Plus size={14}/></button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {accounts.map(acc => (
                                <div key={acc} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                                    <span className="text-xs text-white">{acc}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRenameAccount(acc)} className="text-slate-500 hover:text-blue-400 transition-colors" title="Rename"><Edit2 size={12}/></button>
                                        {acc !== 'Main' && (
                                            <button onClick={() => handleDeleteAccount(acc)} className="text-slate-500 hover:text-rose-500 transition-colors" title="Delete"><Trash2 size={12}/></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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
                        </div>
                    </div>
                    <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-bold text-sm transition-colors">Save Configuration</button>
                </CardContent>
            </Card>
        </div>
    );
};

// --- Image Preview Modal ---
const ImageModal = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative max-w-5xl max-h-[90vh]">
            <img src={`data:image/png;base64,${image}`} alt="Trade Chart" className="max-w-full max-h-full rounded border border-slate-700" />
            <button onClick={onClose} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-600"><X size={20}/></button>
        </div>
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
const Playback = ({ state, setState, apiKey, setApiKey }) => {
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
        const parts = [{ text: promptText }];
        if (imageBase64) parts.push({ inlineData: { mimeType: "image/png", data: imageBase64 } });

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: parts }] })
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

    const cleanText = (text) => text ? text.replace(/\*\*/g, "").replace(/##/g, "").replace(/\*/g, "•").replace(/__/g, "") : "";

    const runAnalysis = async () => {
        if (!imageBase64) { setState(prev => ({...prev, error: "Please upload a chart for the initial Strategy Audit."})); return; }
        const prompt = `You are a Trading Strategy Architect. Analyze this chart which represents the user's "Perfect Setup". USER'S DESCRIPTION: "${strategyDescription || 'No description provided.'}". TASK: 1. Reverse Engineer logic. 2. Identify Risks. 3. Critique Indicators. 4. Profit Targets. OUTPUT FORMAT (Plain Text): STRATEGY DNA REPORT...`;
        const result = await callGemini(prompt);
        if (result) setState(prev => ({ ...prev, messages: [{ role: 'ai', content: cleanText(result) }] }));
    };

    const handleSendMessage = async (msgText) => {
        if (!msgText.trim()) return;
        setLocalInput("");
        setState(prev => ({ ...prev, messages: [...(prev.messages || []), { role: 'user', content: msgText }] }));
        const prompt = `You are an expert Strategy Architect. User Question: "${msgText}". CRITICAL: Keep answer clean, human readable, NO BOLDING.`;
        const result = await callGemini(prompt);
        if (result) setState(prev => ({ ...prev, messages: [...(prev.messages || []), { role: 'ai', content: cleanText(result) }] }));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px] animate-in fade-in duration-500">
            <Card className="lg:w-1/2 flex flex-col">
                <CardHeader className="flex justify-between items-center bg-slate-950/30">
                    <CardTitle className="flex items-center gap-2"><BookOpen size={18} className="text-amber-400"/> My Playback</CardTitle>
                    <div className="flex gap-2 items-center">
                        {!apiKey && <input type="password" placeholder="API Key" onChange={e=>setApiKey(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 w-24" />}
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
                        <textarea className="w-full bg-transparent text-sm font-medium text-slate-300 outline-none resize-none h-20 placeholder-slate-600" placeholder="List your indicators and rules here (e.g. VWAP bounce, RSI < 30)..." value={strategyDescription} onChange={e => setState(prev => ({...prev, strategyDescription: e.target.value}))}/>
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
                    {messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs text-center p-8"><Activity size={32} className="mb-3 opacity-20" /><p>Ready to chat. Upload chart or ask questions.</p></div> : messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}><div className={`max-w-[95%] rounded-2xl p-4 text-[15px] leading-7 font-medium shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-none'}`}>{msg.content}</div></div>
                    ))}
                    {isAnalyzing && <div className="text-xs text-slate-500 animate-pulse">Analyst is thinking...</div>}
                    <div ref={chatEndRef} />
                </CardContent>
                <div className="p-3 border-t border-slate-800 flex gap-2">
                    <input type="text" value={localInput} onChange={(e) => setLocalInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(localInput)} placeholder="Ask about your strategy..." className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" disabled={isAnalyzing} />
                    <button onClick={() => handleSendMessage(localInput)} disabled={isAnalyzing} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded"><Send size={16} /></button>
                </div>
            </Card>
        </div>
    );
};

// --- Strategy Room Component (LiveDesk) ---
const StrategyRoom = ({ state, setState, apiKey, setApiKey }) => {
    const [inputMessage, setInputMessage] = useState("");
    const { imageBase64, generatedPlan, isAnalyzing, error, messages, userStrategy, selectedTicker, timeframe, riskAmount } = state;
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setState(prev => ({ ...prev, imageBase64: reader.result.split(',')[1], generatedPlan: "", messages: [], error: "" })); };
            reader.readAsDataURL(file);
        }
    };

    const callGemini = async (promptText) => {
        if (!apiKey) { setState(prev => ({ ...prev, error: "Please enter API Key." })); return null; }
        setState(prev => ({ ...prev, isAnalyzing: true, error: "" }));
        const parts = [{ text: promptText }];
        if (imageBase64) parts.push({ inlineData: { mimeType: "image/png", data: imageBase64 } });

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: parts }], tools: [{ google_search: {} }] })
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

    const cleanText = (text) => text ? text.replace(/\*\*/g, "").replace(/##/g, "").replace(/\*/g, "•").replace(/__/g, "") : "";

    const runInitialAnalysis = async () => {
        setState(prev => ({ ...prev, messages: [] }));
        const strategyContext = userStrategy ? `USER'S STRATEGY: "${userStrategy}". Check alignment.` : `USER STRATEGY: Standard Price Action.`;
        const prompt = `You are an expert institutional futures trader. Analyze this ${timeframe} chart for ${selectedTicker}. Risk per trade: $${riskAmount}. ${strategyContext}. TASK: Identify setups based on strategy. Use Google Search for news. OUTPUT INSTRUCTIONS: No Markdown. Clean chat style. Emojis. Structure: REAL-TIME MARKET PLAN, THE READ, NEWS CONTEXT, TRADE IDEA (Setup, Entry), STOP LOSS, TAKE PROFIT, THE PLAY`;
        const result = await callGemini(prompt);
        if (result) { const cleaned = cleanText(result); setState(prev => ({ ...prev, generatedPlan: cleaned, messages: [{ role: 'ai', content: cleaned }] })); }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;
        const msg = inputMessage;
        setInputMessage("");
        setState(prev => ({ ...prev, messages: [...prev.messages, { role: 'user', content: msg }] }));
        const prompt = `You are an expert trader. User Question: "${msg}". CRITICAL: Keep answer clean, human readable, NO BOLDING (**).`;
        const result = await callGemini(prompt);
        if (result) { const cleaned = cleanText(result); setState(prev => ({ ...prev, messages: [...prev.messages, { role: 'ai', content: cleaned }] })); }
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
                             <input type="number" value={riskAmount} onChange={(e) => setState(prev => ({...prev, riskAmount: e.target.value}))} className="bg-transparent text-xs text-white w-12 outline-none py-1" />
                        </div>
                        <select value={timeframe} onChange={(e) => setState(prev => ({...prev, timeframe: e.target.value}))} className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none mr-2">
                            <option value="2m">2m</option><option value="5m">5m</option><option value="15m">15m</option><option value="1H">1H</option><option value="4H">4H</option><option value="D">Daily</option>
                        </select>
                        <select value={selectedTicker} onChange={(e) => setState(prev => ({...prev, selectedTicker: e.target.value}))} className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none mr-2">
                            <option value="MNQ">MNQ</option><option value="NQ">NQ</option><option value="ES">ES</option><option value="MES">MES</option><option value="CL">CL</option><option value="GC">GC</option>
                        </select>
                        {!apiKey && <input type="password" placeholder="API Key" value={apiKey} onChange={e=>setApiKey(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 w-24" />}
                        <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded font-medium transition-colors">Upload</button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </CardHeader>
                <div className="flex-1 bg-black/40 m-4 rounded flex items-center justify-center relative">
                    {imageBase64 ? <img src={`data:image/png;base64,${imageBase64}`} alt="Chart" className="w-full h-full object-contain" /> : <div className="text-slate-600 flex flex-col items-center"><Upload size={48} className="mb-2 opacity-30"/><span className="text-sm">Upload Chart</span></div>}
                </div>
                <div className="px-4 pb-2">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-2 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-amber-500 font-bold mb-1"><Lightbulb size={12} /><span>MY STRATEGY (Optional)</span></div>
                        <textarea className="w-full bg-transparent text-sm font-medium text-slate-300 outline-none resize-none h-16 placeholder-slate-600" placeholder="e.g. 9/21 EMA Cross, VWAP Bounce..." value={userStrategy} onChange={(e) => setState(prev => ({...prev, userStrategy: e.target.value}))}/>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button onClick={runInitialAnalysis} disabled={isAnalyzing} className="bg-emerald-600 px-6 py-2 rounded text-white text-sm font-bold flex gap-2 disabled:opacity-50 shadow-lg shadow-emerald-900/20">
                        {isAnalyzing ? "Scanning..." : <><Brain size={16}/> Generate Plan</>}
                    </button>
                </div>
            </Card>
            <Card className="lg:w-1/3 flex flex-col h-full bg-slate-900">
                <CardHeader className="py-3 border-b border-slate-800/50 flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-sm text-emerald-400"><MessageSquare size={16}/> LiveDesk</CardTitle>
                    {error && <span className="text-xs text-rose-400 bg-rose-900/20 px-2 py-1 rounded">{error}</span>}
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs text-center"><Activity size={32} className="mb-3 opacity-20" /><p>Ready to chat. Upload chart or just ask.</p></div> : messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}><div className={`max-w-[95%] rounded-2xl p-4 text-[15px] font-medium leading-7 shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-none'}`}>{msg.content}</div></div>
                    ))}
                    <div ref={chatEndRef} />
                </CardContent>
                <div className="p-3 border-t border-slate-800 flex gap-2">
                    <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask follow-up question..." className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" disabled={isAnalyzing} />
                    <button onClick={handleSendMessage} disabled={isAnalyzing} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded"><Send size={16} /></button>
                </div>
            </Card>
        </div>
    );
};

// --- Institutional Metrics Helper ---
const calculateMetrics = (trades, balance, overhead, selectedAccount) => {
    const activeTrades = selectedAccount === 'All' ? trades : trades.filter(t => (t.account || 'Main') === selectedAccount);
    if (!activeTrades.length) return null;

    let wins=0, losses=0, grossProfit=0, grossLoss=0, totalComms=0;
    let equity = [balance];
    let peak = balance;
    let maxDD = 0;
    let longCount=0, longWins=0, shortCount=0, shortWins=0;
    
    const timeStats = { "Late Night": { pnl: 0, count: 0 }, "Early Mrng": { pnl: 0, count: 0 }, "NY AM": { pnl: 0, count: 0 }, "NY PM": { pnl: 0, count: 0 } };
    const durationStats = { "< 2m": {wins: 0, total: 0}, "2-10m": {wins: 0, total: 0}, "10-60m": {wins: 0, total: 0}, "> 60m": {wins: 0, total: 0} };
    const strategyStats = {};
    const tickerStats = {};
    const dayStats = { 0: {pnl:0, count:0}, 1: {pnl:0, count:0}, 2: {pnl:0, count:0}, 3: {pnl:0, count:0}, 4: {pnl:0, count:0}, 5: {pnl:0, count:0}, 6: {pnl:0, count:0} };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const sorted = [...activeTrades].sort((a,b) => new Date(a.date + ' ' + (a.time || '12:00')) - new Date(b.date + ' ' + (b.time || '12:00')));

    let consecLosses = 0, maxConsecLosses = 0;
    let totalWinSize = 0, winCountWithSize = 0;
    let totalLossSize = 0, lossCountWithSize = 0;
    const tradesPerDay = {};
    let potentialRevengeTrades = 0;

    sorted.forEach((t, i) => {
        const net = parseFloat(t.pnl);
        const fees = parseFloat(t.fees);
        totalComms += fees;
        tradesPerDay[t.date] = (tradesPerDay[t.date] || 0) + 1;
        const dateObj = new Date(t.date + ' ' + (t.time || '12:00'));
        const day = dateObj.getDay();
        dayStats[day].pnl += net; dayStats[day].count++;
        const size = parseFloat(t.size) || 1;
        if (net > 0) { wins++; grossProfit += net; consecLosses = 0; totalWinSize += size; winCountWithSize++; } 
        else { losses++; grossLoss += Math.abs(net); consecLosses++; totalLossSize += size; lossCountWithSize++; if(consecLosses > maxConsecLosses) maxConsecLosses = consecLosses; }
        if (i > 0) { const prev = sorted[i-1]; if (parseFloat(prev.pnl) < 0) { const diff = (dateObj - new Date(prev.date + ' ' + (prev.time || '12:00'))) / 60000; if (diff < 5 && diff >= 0) potentialRevengeTrades++; } }
        if (t.direction === 'Long') { longCount++; if(net > 0) longWins++; } else { shortCount++; if(net > 0) shortWins++; }
        const current = equity[equity.length-1] + net;
        if (current > peak) peak = current;
        const dd = peak - current;
        if (dd > maxDD) maxDD = dd;
        equity.push(current);
        const h = parseInt((t.time || "12:00").split(':')[0]);
        let session = "";
        if (h >= 18 || h < 2) session = "Late Night"; else if (h >= 2 && h < 8) session = "Early Mrng"; else if (h >= 8 && h < 12) session = "NY AM"; else session = "NY PM";
        timeStats[session].pnl += net; timeStats[session].count++;
        if(t.duration) {
            const min = parseFloat(t.duration);
            let bucket = "> 60m";
            if(min < 2) bucket = "< 2m"; else if(min <= 10) bucket = "2-10m"; else if(min <= 60) bucket = "10-60m";
            durationStats[bucket].total++; if(net > 0) durationStats[bucket].wins++;
        }
        const setup = t.setup || "Unknown";
        if (!strategyStats[setup]) { strategyStats[setup] = { count: 0, wins: 0, losses: 0, pnl: 0 }; }
        const s = strategyStats[setup]; s.count++; s.pnl += net; if (net > 0) s.wins++; else s.losses++;
        if (!tickerStats[t.ticker]) tickerStats[t.ticker] = { pnl: 0, wins: 0, count: 0 };
        tickerStats[t.ticker].pnl += net; tickerStats[t.ticker].count++; if (net > 0) tickerStats[t.ticker].wins++;
    });

    const pf = grossLoss === 0 ? grossProfit : grossProfit/grossLoss;
    const netPnL = grossProfit - grossLoss;
    const winRate = (wins/activeTrades.length)*100;
    const avgWin = wins > 0 ? grossProfit/wins : 0;
    const avgLoss = losses > 0 ? grossLoss/losses : 0;
    const expectancy = (winRate/100 * avgWin) - ((1-(winRate/100)) * avgLoss);

    const painPoints = []; const insights = [];
    if (netPnL > 0) insights.push("Account is Green. Good job.");
    if (winRate > 50) insights.push(`High Win Rate: ${winRate.toFixed(1)}%`);
    if (avgLoss > avgWin) painPoints.push(`Risk Inverse: Avg Loss $${avgLoss.toFixed(0)} > Avg Win $${avgWin.toFixed(0)}`);
    if (totalComms > grossProfit * 0.2) painPoints.push(`High Fees: $${totalComms.toFixed(0)} in commissions.`);

    const totalOverhead = ((overhead.evalCost*overhead.evalsPerMonth)+overhead.paFees);
    const bizNet = netPnL - totalOverhead;
    const durationChartData = Object.keys(durationStats).map(bucket => ({ name: bucket, winRate: durationStats[bucket].total > 0 ? ((durationStats[bucket].wins / durationStats[bucket].total) * 100).toFixed(0) : 0 }));
    const longWR = longCount > 0 ? (activeTrades.filter(t => t.direction === 'Long' && parseFloat(t.pnl) > 0).length / longCount * 100).toFixed(0) : 0;
    const shortWR = shortCount > 0 ? (activeTrades.filter(t => t.direction === 'Short' && parseFloat(t.pnl) > 0).length / shortCount * 100).toFixed(0) : 0;
    const longPnL = activeTrades.filter(t => t.direction === 'Long').reduce((acc, t) => acc + parseFloat(t.pnl), 0).toFixed(0);
    const shortPnL = activeTrades.filter(t => t.direction === 'Short').reduce((acc, t) => acc + parseFloat(t.pnl), 0).toFixed(0);

    const strategyDnaData = Object.keys(strategyStats).map(name => {
        const s = strategyStats[name];
        const wr = (s.wins / s.count) * 100;
        let rating = 'F'; if (s.pnl > 0 && wr > 50) rating = 'A'; else if (s.pnl > 0) rating = 'B'; else if (wr > 50) rating = 'C';
        return { name, ...s, wr: wr.toFixed(0), rating };
    }).sort((a,b) => b.pnl - a.pnl);

    const metricsSummaryText = `TRADING REPORT (${selectedAccount})\nNet PnL: $${netPnL.toFixed(2)}\nWin Rate: ${winRate.toFixed(1)}%\nProfit Factor: ${pf.toFixed(2)}\nExpectancy: $${(expectancy || 0).toFixed(2)}\nInsights:\n${insights.join('\n')}\nWarnings:\n${painPoints.join('\n')}`;

    return {
        winRate: winRate.toFixed(1), profitFactor: pf.toFixed(2), maxDrawdown: maxDD.toFixed(2), tradingNetPnL: netPnL.toFixed(2), totalCommissions: totalComms.toFixed(2), businessNetPnL: bizNet.toFixed(2), totalOverhead, expectancy: (expectancy || 0).toFixed(2), avgWin: avgWin.toFixed(2), avgLoss: avgLoss.toFixed(2), longWR, shortWR, longPnL, shortPnL, equityCurve: equity.map((v, i) => ({ trade: i, equity: v })), painPoints, insights, metricsSummaryText,
        sessionChartData: [ { name: 'Late Night', pnl: timeStats["Late Night"].pnl }, { name: 'Early Mrng', pnl: timeStats["Early Mrng"].pnl }, { name: 'NY AM', pnl: timeStats["NY AM"].pnl }, { name: 'NY PM', pnl: timeStats["NY PM"].pnl } ], durationChartData, strategyDnaData
    };
};

export default function TradingJournal() {
    const [activeTab, setActiveTab] = useState('journal');
    const [balance] = useState(50000); 
    const fileInputRef = useRef(null);
    const [importMode, setImportMode] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showChartModal, setShowChartModal] = useState(false);
    const [selectedChart, setSelectedChart] = useState(null);
    const chartInputRef = useRef(null);

    // Default Overhead: Eval=39, Qty=1, PA=65, Comm=2.53 (Apex/Rithmic MNQ)
    const [overhead, setOverhead] = useState(() => JSON.parse(localStorage.getItem('journal_overhead')) || { evalCost: 39, evalsPerMonth: 1, paFees: 65, commRate: 2.53 });
    // Robust Account Loading
    const [accounts, setAccounts] = useState(() => {
        try {
            const saved = localStorage.getItem('journal_accounts');
            return saved ? JSON.parse(saved) : ['Main'];
        } catch { return ['Main']; }
    });
    const [selectedAccount, setSelectedAccount] = useState('All');
    
    // CHANGE: Use sessionStorage instead of localStorage for trades to clear on "re-open" (new session)
    const [trades, setTrades] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('journal_trades')) || [];
        } catch {
            return [];
        }
    });

    useEffect(() => { localStorage.setItem('journal_accounts', JSON.stringify(accounts)); }, [accounts]);
    const [strategyState, setStrategyState] = useState(() => JSON.parse(localStorage.getItem('journal_strategy')) || { imageBase64: null, generatedPlan: "", messages: [], userStrategy: "", selectedTicker: "MNQ", timeframe: "5m", riskAmount: 150, isAnalyzing: false, error: "" });
    const [playbookState, setPlaybookState] = useState(() => JSON.parse(localStorage.getItem('journal_playbook')) || { imageBase64: null, analysis: "", messages: [], isAnalyzing: false, error: "", strategyDescription: "" });
    useEffect(() => { localStorage.setItem('journal_strategy', JSON.stringify(strategyState)); }, [strategyState]);
    useEffect(() => { localStorage.setItem('journal_playbook', JSON.stringify(playbookState)); }, [playbookState]);

    const [newTrade, setNewTrade] = useState({ date: new Date().toISOString().split('T')[0], time: '09:30', ticker: 'MNQ', direction: 'Short', entry: '', stop: '', exit: '', size: '1', fees: '', pointValue: '2', mistake: 'None', notes: '', duration: '', setup: '', account: 'Main', chartImage: null });
    
    // Ensure account validation
    useEffect(() => { 
        if (!accounts.includes(newTrade.account)) { 
            setNewTrade(prev => ({ ...prev, account: accounts[0] || 'Main' })); 
        } 
    }, [accounts, newTrade.account]);
    
    // Sync New Trade Account with Selected Filter
    useEffect(() => {
        if (selectedAccount !== 'All' && accounts.includes(selectedAccount)) {
            setNewTrade(prev => ({ ...prev, account: selectedAccount }));
        }
    }, [selectedAccount, accounts]);

    const getPointValue = (t) => { const up = t.toUpperCase(); if (up.includes('MNQ')) return 2; if (up.includes('NQ')) return 20; if (up.includes('ES')) return 50; if (up.includes('MES')) return 5; if (up.includes('GC')) return 100; if (up.includes('CL')) return 1000; if (up.includes('RTY')) return 50; return 1; };
    useEffect(() => { if (!editingId) { setNewTrade(prev => ({ ...prev, pointValue: getPointValue(prev.ticker) })); } }, [newTrade.ticker]);
    useEffect(() => { sessionStorage.setItem('journal_trades', JSON.stringify(trades)); }, [trades]);
    useEffect(() => { localStorage.setItem('journal_overhead', JSON.stringify(overhead)); }, [overhead]);

    const metrics = useMemo(() => calculateMetrics(trades, balance, overhead, selectedAccount), [trades, balance, overhead, selectedAccount]);
    const displayedTrades = useMemo(() => { if (selectedAccount === 'All') return trades; return trades.filter(t => (t.account || 'Main') === selectedAccount); }, [trades, selectedAccount]);
    const handleInputChange = (e) => { const { name, value } = e.target; setNewTrade(prev => ({ ...prev, [name]: value })); };
    
    const handleChartUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setNewTrade(prev => ({ ...prev, chartImage: reader.result.split(',')[1] })); };
            reader.readAsDataURL(file);
        }
    };

    const saveTrade = () => {
        const entry = parseFloat(newTrade.entry); const exit = parseFloat(newTrade.exit); const size = parseFloat(newTrade.size); const fees = newTrade.fees ? parseFloat(newTrade.fees) : (size * overhead.commRate); const ptVal = parseFloat(newTrade.pointValue);
        let points = 0; if (newTrade.direction === 'Long') points = exit - entry; else points = entry - exit;
        const grossPnL = points * ptVal * size; const netPnL = grossPnL - fees;
        const tradeData = { ...newTrade, id: editingId || Date.now(), pnl: netPnL.toFixed(2), fees: fees.toFixed(2), account: newTrade.account || accounts[0] };
        if (editingId) { setTrades(trades.map(t => t.id === editingId ? tradeData : t)); setEditingId(null); } else { setTrades([...trades, tradeData]); }
        // Reset form but keep current account selection
        const nextAccount = selectedAccount === 'All' ? (accounts.includes(newTrade.account) ? newTrade.account : accounts[0]) : selectedAccount;
        setNewTrade({ date: new Date().toISOString().split('T')[0], time: '09:30', ticker: 'MNQ', direction: 'Short', entry: '', stop: '', exit: '', size: '1', fees: '', pointValue: '2', mistake: 'None', notes: '', duration: '', setup: '', account: nextAccount, chartImage: null });
        if(chartInputRef.current) chartInputRef.current.value = "";
    };
    const startEdit = (trade) => { setNewTrade(trade); setEditingId(trade.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const deleteTrade = (id) => setTrades(trades.filter(t => t.id !== id));
    const clearAllData = () => { if(window.confirm("Delete ALL trades?")) setTrades([]); };
    
    // --- IMPORT LOGIC ---
    const handleImportClick = (mode) => { setImportMode(mode); if (fileInputRef.current) { fileInputRef.current.value = ""; fileInputRef.current.click(); } };
    const handleFileChange = (e) => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (evt) => { if(importMode === 'ninja') parseNinja(evt.target.result); else if(importMode === 'topstep') parseTopstep(evt.target.result); else if(importMode === 'takeprofit') parseTakeProfit(evt.target.result); }; reader.readAsText(file); };
    const parseDurationToMinutes = (durationStr) => { if (!durationStr) return 0; const parts = durationStr.split(':'); if (parts.length < 2) return 0; const h = parseFloat(parts[0]); const m = parseFloat(parts[1]); const s = parseFloat(parts[2] || 0); return (h * 60) + m + (s / 60); };
    const parseTopstep = (text) => {
        const lines = text.split('\n'); const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const idxSym = headers.findIndex(h => h.includes('ContractName')); const idxPnL = headers.findIndex(h => h === 'PnL');
        if(idxPnL === -1) { alert("Error: No PnL column found."); return; }
        const targetAccount = selectedAccount === 'All' ? (accounts[0] || 'Main') : selectedAccount;
        const newTrades = [];
        for(let i=1; i<lines.length; i++) {
            const row = lines[i].split(',').map(c => c.trim().replace(/"/g, '')); if(!row[idxSym]) continue;
            let pnl = parseFloat(row[idxPnL].replace(/[^0-9.-]/g, '')); if(row[idxPnL].includes('(')) pnl = -Math.abs(pnl); 
            newTrades.push({ id: Date.now() + i, date: new Date().toISOString().split('T')[0], time: "12:00", ticker: row[idxSym], direction: 'Long', size: 1, pnl: pnl.toFixed(2), fees: "0.00", mistake: 'None', notes: 'TopstepX Import', setup: 'Imported', account: targetAccount, chartImage: null });
        }
        setTrades([...trades, ...newTrades]);
    };
    const parseNinja = (text) => { /* logic retained */ };
    const parseTakeProfit = (text) => { /* logic retained */ };
    const exportCSV = () => { /* logic retained */ };

    // --- API KEY LIFTED TO PARENT ---
    const HARDCODED_KEY = ""; 
    const [apiKey, setApiKey] = useState(() => HARDCODED_KEY || localStorage.getItem('gemini_api_key') || '');
    
    // --- Account Adder (Inline) ---
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [tempAccountName, setTempAccountName] = useState("");
    const addAccount = () => { setIsAddingAccount(true); };
    const saveNewAccount = () => { if (tempAccountName && !accounts.includes(tempAccountName)) { setAccounts([...accounts, tempAccountName]); setSelectedAccount(tempAccountName); setIsAddingAccount(false); setTempAccountName(""); } };
    
    // --- Define downloadReport HERE inside the component scope ---
    const downloadReport = () => {
        if(!metrics) return;
        const element = document.createElement("a");
        const file = new Blob([metrics.metricsSummaryText], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "Coach_Report.txt";
        document.body.appendChild(element); 
        element.click();
    };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      {showSettings && <SettingsModal overhead={overhead} setOverhead={setOverhead} accounts={accounts} setAccounts={setAccounts} trades={trades} setTrades={setTrades} onClose={() => setShowSettings(false)} />}
      {showChartModal && <ImageModal image={selectedChart} onClose={() => setShowChartModal(false)} />}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-4 gap-4">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Shock And Awe Trading</h1>
                
                {/* ACCOUNT SELECTOR */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-2 py-1">
                    <Users size={14} className="text-slate-400 mr-2"/>
                    {!isAddingAccount ? (
                        <>
                            <select 
                                value={selectedAccount} 
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="bg-white text-sm text-black outline-none mr-2 rounded px-2 py-0.5" 
                            >
                                <option value="All">All Accounts</option>
                                {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                            </select>
                            <button onClick={addAccount} className="text-slate-400 hover:text-green-400"><Plus size={14}/></button>
                        </>
                    ) : (
                        <div className="flex items-center gap-1">
                            <input autoFocus type="text" className="bg-slate-950 text-white text-xs border border-blue-500 rounded px-1 py-0.5 w-32 outline-none" placeholder="Account Name" value={tempAccountName} onChange={(e) => setTempAccountName(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') saveNewAccount()}} />
                            <button onClick={saveNewAccount} className="text-emerald-400 hover:text-emerald-300"><CheckCircle2 size={14}/></button>
                            <button onClick={() => setIsAddingAccount(false)} className="text-rose-400 hover:text-rose-300"><X size={14}/></button>
                        </div>
                    )}
                </div>
            </div>

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
            <StrategyRoom state={strategyState} setState={setStrategyState} apiKey={apiKey} setApiKey={setApiKey} />
        ) : activeTab === 'playback' ? (
            <Playback state={playbookState} setState={setPlaybookState} apiKey={apiKey} setApiKey={setApiKey} />
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
                                    <div className="relative">
                                        <button onClick={() => chartInputRef.current?.click()} className={`flex items-center gap-2 ${newTrade.chartImage ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'} hover:bg-slate-700 px-3 py-1 rounded text-xs transition-colors border border-slate-700`}>
                                            <ImageIcon size={14}/> {newTrade.chartImage ? "Chart Attached" : "Attach Chart"}
                                        </button>
                                        <input type="file" ref={chartInputRef} onChange={handleChartUpload} className="hidden" accept="image/*" />
                                    </div>
                                    <button onClick={() => handleImportClick('ninja')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-xs transition-colors text-white font-medium"><Upload size={14} /> Ninja</button>
                                    <button onClick={() => handleImportClick('topstep')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-xs transition-colors text-white font-medium"><Upload size={14} /> Topstep</button>
                                    <button onClick={() => handleImportClick('takeprofit')} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-xs transition-colors text-white font-medium"><Upload size={14} /> TP Trader</button>
                                    <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs transition-colors border border-slate-700"><Download size={14} /> CSV</button>
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
                                    <option value="MNQ">MNQ</option><option value="NQ">NQ</option><option value="ES">ES</option><option value="MES">MES</option><option value="CL">CL</option><option value="GC">GC</option><option value="RTY">RTY</option>
                                </select>
                            </div>
                            <select name="direction" value={newTrade.direction} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm">
                                <option value="Long">Long</option><option value="Short">Short</option>
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
                            
                            {/* Account Selector in Form */}
                            <select name="account" value={newTrade.account} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm">
                                {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                            </select>
                            
                            <select name="mistake" value={newTrade.mistake} onChange={handleInputChange} className="bg-slate-800 border-slate-700 text-white rounded p-2 text-sm md:col-span-2">
                                <option value="None">No Mistake (Clean)</option><option value="FOMO">FOMO / Chased</option><option value="Revenge">Revenge Trading</option><option value="No Plan">No Plan / Impulse</option><option value="Hesitation">Hesitation (Late)</option><option value="Moved Stop">Moved Stop Loss</option><option value="Early Exit">Early Exit (Fear)</option>
                            </select>

                            <div className="col-span-2 md:col-span-3">
                                <input type="text" name="notes" placeholder="Psychology/Notes" value={newTrade.notes} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm" />
                            </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button onClick={saveTrade} className={`w-full ${editingId ? 'bg-amber-600' : 'bg-blue-600'} text-white h-9 rounded font-bold text-sm hover:opacity-90 transition-opacity`}>
                                    {editingId ? "Update Trade" : "Add Trade"}
                                </button>
                                {editingId && <button onClick={() => {setEditingId(null); setNewTrade({date: new Date().toISOString().split('T')[0], time: '09:30', ticker: 'MNQ', direction: 'Short', entry: '', stop: '', exit: '', size: '1', fees: '', pointValue: '2', mistake: 'None', notes: '', duration: '', setup: '', account: accounts[0]})}} className="px-4 border border-slate-600 text-slate-400 rounded text-sm hover:text-white">Cancel</button>}
                            </div>
                        </CardContent>
                     </Card>
                     <Card className="lg:col-span-1">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><AlertCircle size={18} className="text-amber-500"/> Coach's Corner</CardTitle>
                            {/* downloadReport should be defined now */}
                            <button onClick={() => {
                                if(!metrics) return;
                                const element = document.createElement("a");
                                const file = new Blob([metrics.metricsSummaryText], {type: 'text/plain'});
                                element.href = URL.createObjectURL(file);
                                element.download = "Coach_Report.txt";
                                document.body.appendChild(element); 
                                element.click();
                            }} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded flex items-center gap-1"><FileText size={12}/> Report</button>
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
                 
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
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
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><CalendarIcon size={16}/> Daily Heatmap</CardTitle></CardHeader>
                            <CardContent>
                                <PnLCalendar trades={displayedTrades} />
                            </CardContent>
                        </Card>
                    </div>
                 </div>
                 
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
                                                <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.rating === 'A' ? 'bg-emerald-500 text-black' : s.rating === 'F' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-white'}`}>{s.rating}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                     </Card>
                 )}

                 <Card>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-slate-400">
                             <thead className="text-xs uppercase bg-slate-900 border-b border-slate-800">
                                 <tr><th className="px-4 py-2">Date</th><th className="px-4 py-2">Account</th><th className="px-4 py-2">Ticker</th><th className="px-4 py-2">Strategy</th><th className="px-4 py-2">P&L</th><th className="px-4 py-2 text-right">Chart</th><th className="px-4 py-2 text-right">Action</th></tr>
                             </thead>
                             <tbody>
                                 {displayedTrades.slice().reverse().map(t => (
                                     <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 group">
                                         <td className="px-4 py-2">{t.date}</td>
                                         <td className="px-4 py-2 text-xs text-indigo-400">{t.account || 'Main'}</td>
                                         <td className="px-4 py-2 font-bold text-white">{t.ticker} <span className="text-[10px] text-slate-500 font-normal">({t.direction})</span></td>
                                         <td className="px-4 py-2 text-xs text-slate-400">{t.setup || '-'}</td>
                                         <td className={`px-4 py-2 font-mono ${parseFloat(t.pnl)>=0?'text-emerald-400':'text-rose-400'}`}>${t.pnl}</td>
                                         <td className="px-4 py-2 text-right">
                                             {t.chartImage && (
                                                 <button onClick={() => {setSelectedChart(t.chartImage); setShowChartModal(true);}} className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 text-xs bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900"><Eye size={12}/> View</button>
                                             )}
                                         </td>
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