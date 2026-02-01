import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- 1. ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Crash:", error, errorInfo); }
  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-rose-500 font-mono">
        <div className="bg-slate-800 p-6 rounded border border-rose-900 w-full max-w-lg">
          <h2 className="text-xl font-bold mb-2 text-white">System Recovery</h2>
          <p className="text-sm mb-4 text-slate-400">Data integrity check failed. Resetting secure storage.</p>
          <div className="bg-black/50 p-2 rounded text-xs text-rose-300 mb-4 font-mono">{this.state.error?.toString()}</div>
          <button 
            onClick={() => { try { localStorage.clear(); } catch(e){} window.location.reload(); }} 
            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded text-sm font-bold w-full transition-colors"
          >
            Reset & Reload
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// --- 2. STORAGE ---
const safeStorage = {
  get: (key, fallback) => {
    try {
      if (typeof window === 'undefined') return fallback;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) { return fallback; }
  },
  set: (key, value) => {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
};

// --- 3. ICONS ---
const Icon = ({ d, children, size = 16, className = "", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {d && (Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />)}
    {children}
  </svg>
);

const Icons = {
  Plus: (p) => <Icon d={["M5 12h14", "M12 5v14"]} {...p} />,
  Trash2: (p) => <Icon d={["M3 6h18", "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"]} {...p}><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></Icon>,
  Edit2: (p) => <Icon d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" {...p} />,
  AlertCircle: (p) => <Icon d={["M12 8v4", "M12 16h.01"]} {...p}><circle cx="12" cy="12" r="10"/></Icon>,
  Download: (p) => <Icon d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]} {...p} />,
  Upload: (p) => <Icon d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"]} {...p} />,
  Settings: (p) => <Icon d={["M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"]} {...p}><circle cx="12" cy="12" r="3"/></Icon>,
  X: (p) => <Icon d={["M18 6 6 18", "m6 6 12 12"]} {...p} />,
  Users: (p) => <Icon d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M16 3.13a4 4 0 0 1 0 7.75", "M23 21v-2a4 4 0 0 0-3-3.87"]} {...p}><circle cx="9" cy="7" r="4"/></Icon>,
  Eye: (p) => <Icon d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"]} {...p}><circle cx="12" cy="12" r="3"/></Icon>,
  Image: (p) => <Icon d={["M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z", "M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z", "M21 15l-5-5L5 21"]} {...p} />,
  Calendar: (p) => <Icon d={["M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z", "M16 2v4", "M8 2v4", "M3 10h18"]} {...p} />,
  BookOpen: (p) => <Icon d={["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]} {...p} />,
  Brain: (p) => <Icon d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" {...p}><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></Icon>,
  Lightbulb: (p) => <Icon d={["M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5a6 6 0 0 0-11 0c0 1.5.5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5", "M9 18h6", "M10 22h4"]} {...p} />,
  MessageSquare: (p) => <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...p} />,
  ShieldAlert: (p) => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p}><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></Icon>,
  Activity: (p) => <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" {...p} />,
  Send: (p) => <Icon d={["M22 2L11 13", "M22 2l-7 20-4-9-9-4 20-7z"]} {...p} />,
  PieChart: (p) => <Icon d="M21.21 15.89A10 10 0 1 1 8 2.83" {...p}><path d="M22 12A10 10 0 0 0 12 2v10z"/></Icon>,
  Timer: (p) => <Icon d={["M10 2h4", "M12 14v-4", "M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"]} {...p} />,
  ThumbsUp: (p) => <Icon d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" {...p} />,
  FileText: (p) => <Icon d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"]} {...p} />,
  CheckCircle2: (p) => <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" {...p}><path d="M9 12l2 2 4-4"/></Icon>,
  Filter: (p) => <Icon d={["M22 3H2l8 9.46V19l4 2v-8.54L22 3z"]} {...p} />
};

// --- 4. CHARTS ---
const SimpleBarChart = ({ data, dataKey }) => {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-xs text-slate-500">No data</div>;
  const values = data.map(d => Number(d[dataKey]));
  const max = Math.max(...values.map(Math.abs)) || 1;
  return (
    <div className="w-full h-full flex items-end gap-1 p-2 border border-slate-700 bg-slate-800/30 rounded select-none">
      {data.map((d, i) => {
        const val = Number(d[dataKey]);
        const h = (Math.abs(val) / max) * 100;
        const color = d.winRate !== undefined ? (val >= 50 ? 'bg-emerald-500' : 'bg-rose-500') : (val >= 0 ? 'bg-emerald-500' : 'bg-rose-500');
        return (
          <div key={i} className="flex-1 h-full flex flex-col justify-end group relative">
            <div className={`w-full rounded-sm opacity-80 ${color}`} style={{height: `${Math.max(h, 2)}%`}} />
            <div className="text-[8px] text-center text-slate-500 truncate mt-1">{d.name}</div>
          </div>
        );
      })}
    </div>
  );
};

// --- 5. COMPONENTS ---
const Card = ({ children, className = "" }) => <div className={`bg-slate-900 border border-slate-800 rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = "" }) => <div className={`p-4 border-b border-slate-800 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-lg font-semibold text-slate-100 ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-4 ${className}`}>{children}</div>;

// --- 6. LOGIC ---
const parseRawDate = (dateStr) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const cleanStr = dateStr.trim();
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
};

const calculateMetrics = (trades, balance, overhead, selectedAccount, filterTicker, filterSetup) => {
    try {
        if (!trades || !Array.isArray(trades)) return null;
        
        const activeTrades = trades.filter(t => {
            const matchAccount = selectedAccount === 'All' || (t.account || 'Main') === selectedAccount;
            const matchTicker = filterTicker === 'All' || t.ticker === filterTicker;
            const matchSetup = filterSetup === 'All' || (t.setup || 'Unknown') === filterSetup;
            return matchAccount && matchTicker && matchSetup;
        });

        if (!activeTrades.length) return null;

        let wins=0, losses=0, grossProfit=0, grossLoss=0, equity=[balance], maxDD=0, peak=balance;
        const timeStats = { "Night": 0, "AM": 0, "PM": 0 };
        const durationStats = { "< 2m": {wins: 0, total: 0}, "2-10m": {wins: 0, total: 0}, "10-60m": {wins: 0, total: 0}, "> 60m": {wins: 0, total: 0} };
        const strategyStats = {};

        [...activeTrades].sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(t => {
            const net = parseFloat(t.pnl)||0;
            if(net>0) { wins++; grossProfit+=net; } else { losses++; grossLoss+=Math.abs(net); }
            
            const cur = equity[equity.length-1]+net;
            if(cur>peak) peak=cur; if((peak-cur)>maxDD) maxDD=peak-cur;
            equity.push(cur);

            const timeStr = t.time || "12:00";
            const h = parseInt(timeStr.split(':')[0]) || 12;
            if(h<8||h>=18) timeStats["Night"]+=net; else if(h<12) timeStats["AM"]+=net; else timeStats["PM"]+=net;

            const m = parseFloat(t.duration)||0;
            let b = "> 60m";
            if(m<2) b="< 2m"; else if(m<=10) b="2-10m"; else if(m<=60) b="10-60m";
            durationStats[b].total++; if(net>0) durationStats[b].wins++;

            const s = t.setup || "Unknown";
            if(!strategyStats[s]) strategyStats[s] = {count:0, wins:0, pnl:0};
            strategyStats[s].count++; strategyStats[s].pnl+=net; if(net>0) strategyStats[s].wins++;
        });

        const netPnL = grossProfit-grossLoss;
        const winRate = (wins/activeTrades.length)*100;
        const pf = grossLoss===0?grossProfit:grossProfit/grossLoss;
        const expectancy = (winRate/100 * (wins>0?grossProfit/wins:0)) - ((1-winRate/100)*(losses>0?grossLoss/losses:0));
        const avgWin = wins > 0 ? grossProfit/wins : 0;
        const avgLoss = losses > 0 ? grossLoss/losses : 0;

        const insights = []; const painPoints = [];
        if(netPnL>0) insights.push("Account Green");
        if(winRate>=50) insights.push(`High WR: ${winRate.toFixed(0)}%`);
        if(pf > 2.0) insights.push(`Strong PF: ${pf.toFixed(2)}`);
        if(avgWin > avgLoss * 1.5) insights.push("Winners > 1.5x Losers");
        
        if(insights.length === 0 && netPnL > -100) insights.push("Steady trading. Keep managing risk.");
        
        if(netPnL < 0) painPoints.push("Account Red");
        if(losses>0 && avgLoss > avgWin) painPoints.push("Avg Loss > Avg Win");
        if(maxDD > balance * 0.05) painPoints.push("Drawdown > 5%");
        
        if(painPoints.length === 0 && insights.length === 0) insights.push("No major alerts. Consistent execution.");

        return {
            netPnL: netPnL.toFixed(2), winRate: winRate.toFixed(1), profitFactor: pf.toFixed(2), maxDrawdown: maxDD.toFixed(2), expectancy: expectancy.toFixed(2),
            avgWin: avgWin.toFixed(2), avgLoss: avgLoss.toFixed(2),
            equityCurve: equity.map((e,i)=>({equity:e})),
            sessionChartData: Object.keys(timeStats).map(k=>({name:k, pnl:timeStats[k]})),
            durationChartData: Object.keys(durationStats).map(k=>({name:k, winRate: durationStats[k].total>0?(durationStats[k].wins/durationStats[k].total)*100:0})),
            strategyDnaData: Object.keys(strategyStats).map(k=>({name:k, ...strategyStats[k], wr:(strategyStats[k].wins/strategyStats[k].count*100).toFixed(0)})).sort((a,b)=>b.pnl-a.pnl),
            insights, painPoints, metricsSummaryText: `Net: ${netPnL.toFixed(2)}, WR: ${winRate.toFixed(1)}%`
        };
    } catch(e) {
        console.error("Metric Calc Error:", e);
        return null;
    }
};

const SettingsModal = ({ overhead, setOverhead, accounts, setAccounts, onClose }) => {
    const [newAcc, setNewAcc] = useState("");
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm p-4 bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white">Settings</h3><button onClick={onClose}><Icons.X/></button></div>
                <div className="mb-6 space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase">Risk Unit ($)</label>
                    <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white" value={overhead.riskUnit || 150} onChange={e=>setOverhead({...overhead, riskUnit: e.target.value})} />
                </div>
                <div className="mb-2"><h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Accounts</h4></div>
                <div className="flex gap-2 mb-4">
                    <input className="bg-slate-900 border border-slate-700 text-white text-sm rounded px-2 py-1 flex-1" value={newAcc} onChange={e=>setNewAcc(e.target.value)} placeholder="New Account"/>
                    <button onClick={()=>{if(newAcc&&!accounts.includes(newAcc)){setAccounts([...accounts,newAcc]);setNewAcc("")}}} className="bg-indigo-600 text-white px-3 rounded"><Icons.Plus/></button>
                </div>
                <div className="space-y-2 max-h-48 overflow-auto">{accounts.map(a=><div key={a} className="flex justify-between bg-slate-900 p-2 rounded border border-slate-800 text-sm text-slate-300">{a}{a!=='Main'&&<button onClick={()=>setAccounts(accounts.filter(acc=>acc!==a))} className="text-rose-500"><Icons.Trash2/></button>}</div>)}</div>
            </Card>
        </div>
    );
};

const ImageModal = ({ image, onClose }) => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative max-w-5xl max-h-[90vh]">
            <img src={`data:image/png;base64,${image}`} className="max-w-full max-h-full rounded border border-slate-700" />
            <button onClick={onClose} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-600"><Icons.X/></button>
        </div>
    </div>
);

const PnLCalendar = ({ trades }) => {
    const dailyData = useMemo(() => {
        const map = {};
        trades.forEach(t => { if(!map[t.date]) map[t.date]=0; map[t.date]+=parseFloat(t.pnl); });
        return map;
    }, [trades]);
    const days = Array.from({length: 28}, (_, i) => {
        const d = new Date(); d.setDate(new Date().getDate() - (27 - i)); return d.toISOString().split('T')[0];
    });
    return (
        <div className="grid grid-cols-7 gap-2">
            {days.map(d => {
                const pnl = dailyData[d] || 0;
                return (
                    <div key={d} className={`p-1 rounded border text-center ${pnl>0?'bg-emerald-900/30 border-emerald-800':pnl<0?'bg-rose-900/30 border-rose-800':'bg-slate-800 border-slate-700'}`}>
                        <div className="text-[8px] text-slate-500">{d.slice(5)}</div>
                        <div className={`text-[10px] font-bold ${pnl>0?'text-emerald-400':pnl<0?'text-rose-400':'text-slate-600'}`}>{pnl===0?'-':Math.abs(pnl)>999?(pnl/1000).toFixed(1)+'k':pnl.toFixed(0)}</div>
                    </div>
                );
            })}
        </div>
    );
};

// --- COACH WIDGET ---
const CoachWidget = ({ metrics, apiKey, setApiKey }) => {
    const [mode, setMode] = useState('report'); 
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [imageBase64, setImageBase64] = useState(null);
    const fileRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, mode]);

    const handleSend = async () => {
        if (!input.trim() && !imageBase64) return;
        if (!apiKey) { setMessages(p => [...p, {role: 'ai', content: 'Please enter your API Key in Settings to chat.'}]); return; }
        
        const userMsg = { role: 'user', content: input, image: imageBase64 };
        setMessages(p => [...p, userMsg]);
        setInput('');
        setImageBase64(null);
        setIsThinking(true);

        try {
            const promptText = input || "Analyze this image. If it is a price chart, identify the trend, key support/resistance levels, and any visible candlestick patterns. If it is a P&L or trade list, calculate the metrics and spot any trading errors.";
            const parts = [{ text: promptText }];
            if (userMsg.image) parts.push({ inlineData: { mimeType: "image/png", data: userMsg.image } });
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts }] })
            });
            const data = await response.json();
            if(data.error) throw new Error(data.error.message);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't analyze that. Try again.";
            setMessages(p => [...p, { role: 'ai', content: text }]);
        } catch (e) {
            setMessages(p => [...p, { role: 'ai', content: `Error: ${e.message}` }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageBase64(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    setImageBase64(event.target.result.split(',')[1]);
                };
                reader.readAsDataURL(blob);
                e.preventDefault();
                break;
            }
        }
    };

    return (
        <Card className="lg:col-span-1 flex flex-col h-[300px]">
            <CardHeader className="flex items-center justify-between py-3 bg-slate-950/30">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <Icons.AlertCircle size={16} className="text-amber-500"/> 
                    {mode === 'report' ? "Coach's Report" : "Coach Chat"}
                </CardTitle>
                <div className="flex gap-2">
                    <button onClick={() => setMode(mode === 'report' ? 'chat' : 'report')} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors">
                        {mode === 'report' ? 'Chat' : 'Report'}
                    </button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 relative">
                {mode === 'report' ? (
                    <div className="p-4 space-y-4">
                        {metrics?.insights.length > 0 && (
                            <div className="bg-emerald-950/20 rounded p-2 border border-emerald-900/30">
                                <div className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Strength</div>
                                <ul className="space-y-1">
                                    {metrics.insights.map((p,i) => <li key={i} className="text-xs text-emerald-200 flex gap-2 items-start"><Icons.ThumbsUp size={12} className="mt-0.5 shrink-0"/> <span>{p}</span></li>)}
                                </ul>
                            </div>
                        )}
                        {metrics?.painPoints.length > 0 ? (
                            <div className="bg-rose-950/20 rounded p-2 border border-rose-900/30">
                                <div className="text-[10px] text-rose-500 font-bold uppercase mb-1">Focus Area</div>
                                <ul className="space-y-1">
                                    {metrics.painPoints.map((p,i) => <li key={i} className="text-xs text-rose-200 flex gap-2 items-start"><Icons.AlertCircle size={12} className="mt-0.5 shrink-0"/> <span>{p}</span></li>)}
                                </ul>
                            </div>
                        ) : <div className="text-xs text-slate-500 text-center italic p-4">No critical alerts. Keep consistent.</div>}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.length === 0 && <div className="text-center text-xs text-slate-500 mt-4">Upload a chart or ask me anything!</div>}
                            {messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {m.image && <img src={`data:image/png;base64,${m.image}`} className="w-20 h-auto rounded mb-1 border border-slate-700"/>}
                                    <div className={`max-w-[90%] rounded-lg p-2 text-xs ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{m.content}</div>
                                </div>
                            ))}
                            {isThinking && <div className="text-xs text-slate-500 animate-pulse">Thinking...</div>}
                            <div ref={chatEndRef}></div>
                        </div>
                        <div className="p-2 border-t border-slate-800 flex gap-2 bg-slate-900">
                            <button onClick={() => fileRef.current?.click()} className={`p-2 rounded hover:bg-slate-800 ${imageBase64 ? 'text-emerald-400' : 'text-slate-400'}`}><Icons.Image size={16}/></button>
                            <input ref={fileRef} type="file" className="hidden" onChange={handleImage} accept="image/*" />
                            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} onPaste={handlePaste} className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 text-xs text-white outline-none" placeholder="Message..." />
                            <button onClick={handleSend} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-500"><Icons.Send size={14}/></button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// --- STRATEGY ROOM ---
const StrategyRoom = ({ state, setState, apiKey, setApiKey }) => {
    const [inputMessage, setInputMessage] = useState("");
    const { imageBase64, messages, userStrategy, selectedTicker, timeframe, riskAmount } = state;
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
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: parts }] }) 
            });
            const data = await response.json();
            if(data.error) throw new Error(data.error.message);
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (err) {
            setState(prev => ({ ...prev, error: `Error: ${err.message}` }));
            return null;
        } finally {
            setState(prev => ({ ...prev, isAnalyzing: false }));
        }
    };

    const runInitialAnalysis = async () => {
        setState(prev => ({ ...prev, messages: [] }));
        const strategyContext = userStrategy ? `USER'S STRATEGY: "${userStrategy}". Check alignment.` : `USER STRATEGY: Standard Price Action.`;
        const prompt = `You are an expert institutional futures trader. Analyze the uploaded ${selectedTicker} (${timeframe}) chart image. 
        TASK:
        1. READ THE CHART: Identify the immediate trend, key Support/Resistance levels, and market structure.
        2. CALCULATE: Estimate the Risk/Reward ratio for a potential setup visible now.
        3. PLAN: Create a trade plan based on the "${userStrategy || 'Price Action'}" strategy.
        4. EXECUTION: Entry price, Stop Loss (based on $${riskAmount} risk), and Take Profit targets.
        OUTPUT: A structured, professional trading plan.`;
        
        const result = await callGemini(prompt);
        if (result) { setState(prev => ({ ...prev, generatedPlan: result, messages: [{ role: 'ai', content: result }] })); }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;
        const msg = inputMessage;
        setInputMessage("");
        setState(prev => ({ ...prev, messages: [...prev.messages, { role: 'user', content: msg }] }));
        const result = await callGemini(msg);
        if (result) { setState(prev => ({ ...prev, messages: [...prev.messages, { role: 'ai', content: result }] })); }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    setState(prev => ({ ...prev, imageBase64: event.target.result.split(',')[1] }));
                };
                reader.readAsDataURL(blob);
                e.preventDefault();
                break;
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px] animate-in fade-in duration-500">
            <Card className="lg:w-2/3 h-full flex flex-col">
                <CardHeader className="flex justify-between items-center bg-slate-950/30">
                    <CardTitle className="flex items-center gap-2"><Icons.Image size={18} className="text-indigo-400"/> Chart Source</CardTitle>
                    <div className="flex gap-2 items-center">
                        {!apiKey && <input type="password" placeholder="API Key" value={apiKey} onChange={e=>setApiKey(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 w-24" />}
                        <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded font-medium transition-colors">Upload</button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </CardHeader>
                <div className="flex-1 bg-black/40 m-4 rounded flex items-center justify-center relative">
                    {imageBase64 ? <img src={`data:image/png;base64,${imageBase64}`} alt="Chart" className="w-full h-full object-contain" /> : <div className="text-slate-600 flex flex-col items-center"><Icons.Upload size={48} className="mb-2 opacity-30"/><span className="text-sm">Upload Chart</span></div>}
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                    <button onClick={runInitialAnalysis} disabled={!imageBase64 || state.isAnalyzing} className="bg-emerald-600 px-6 py-2 rounded text-white text-sm font-bold flex gap-2 disabled:opacity-50">
                        {state.isAnalyzing ? "Analyzing..." : <><Icons.Brain size={16}/> Generate Plan</>}
                    </button>
                </div>
            </Card>
            <Card className="lg:w-1/3 flex flex-col h-full bg-slate-900">
                <CardHeader className="py-3 border-b border-slate-800/50 flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-sm text-emerald-400"><Icons.MessageSquare size={16}/> LiveDesk</CardTitle>
                    {state.error && <span className="text-xs text-rose-400 bg-rose-900/20 px-2 py-1 rounded">{state.error}</span>}
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs text-center"><Icons.Activity size={32} className="mb-3 opacity-20" /><p>Ready to chat.</p></div> : messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}><div className={`max-w-[95%] rounded-2xl p-4 text-[15px] font-medium leading-7 shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-none'}`}>{msg.content}</div></div>
                    ))}
                    <div ref={chatEndRef} />
                </CardContent>
                <div className="p-3 border-t border-slate-800 flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-white p-2"><Icons.Image size={16}/></button>
                    <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} onPaste={handlePaste} placeholder="Ask follow-up question..." className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                    <button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded"><Icons.Send size={16} /></button>
                </div>
            </Card>
        </div>
    );
};

// --- PLAYBACK COMPONENT ---
const Playback = ({ state, setState, apiKey, setApiKey }) => {
    const { imageBase64, messages } = state;
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const [localInput, setLocalInput] = useState("");

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setState(prev => ({ ...prev, imageBase64: reader.result.split(',')[1], messages: [] })); };
            reader.readAsDataURL(file);
        }
    };

    const callGemini = async (promptText) => {
        if (!apiKey) { setState(prev => ({...prev, error: "API Key Required"})); return null; }
        
        setState(prev => ({...prev, isAnalyzing: true, error: ""}));
        const parts = [{ text: promptText }];
        if (imageBase64) parts.push({ inlineData: { mimeType: "image/png", data: imageBase64 } });
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: parts }] })
            });
            const data = await response.json();
            if(data.error) throw new Error(data.error.message);
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (err) {
            setState(prev => ({...prev, error: err.message})); 
            return null; 
        } finally {
            setState(prev => ({...prev, isAnalyzing: false}));
        }
    };

    const runAnalysis = async () => {
        if (!imageBase64) { setState(prev => ({...prev, error: "Please upload a chart."})); return; }
        const prompt = `You are a Trading Strategy Architect. Analyze this chart image which represents the user's "Perfect Setup". 
        USER CONTEXT: "${state.strategyDescription || 'No description provided.'}".
        TASK:
        1. REVERSE ENGINEER: Visually identify the indicators and candle patterns that triggered this trade.
        2. ANALYZE LOGIC: Explain *why* this setup worked based on price action.
        3. CALCULATE: Estimate the R-Multiple (Risk:Reward) shown in the move.
        4. RULES: Define 3 strict rules to replicate this setup.
        OUTPUT: A Strategy DNA Report.`;
        
        const result = await callGemini(prompt);
        if (result) setState(prev => ({ ...prev, messages: [{ role: 'ai', content: result }] }));
    };

    const handleSendMessage = async (msgText) => {
        if (!msgText.trim()) return;
        setLocalInput("");
        setState(prev => ({ ...prev, messages: [...(prev.messages || []), { role: 'user', content: msgText }] }));
        const result = await callGemini(msgText);
        if (result) setState(prev => ({ ...prev, messages: [...(prev.messages || []), { role: 'ai', content: result }] }));
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    setState(prev => ({ ...prev, imageBase64: event.target.result.split(',')[1] }));
                };
                reader.readAsDataURL(blob);
                e.preventDefault();
                break;
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px] animate-in fade-in duration-500">
            <Card className="lg:w-1/2 flex flex-col">
                <CardHeader className="flex justify-between items-center bg-slate-950/30">
                    <CardTitle className="flex items-center gap-2"><Icons.BookOpen size={18} className="text-amber-400"/> My Playback</CardTitle>
                    <div className="flex gap-2 items-center">
                        {!apiKey && <input type="password" placeholder="API Key" onChange={e=>setApiKey(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 w-24" />}
                        <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-indigo-600 px-3 py-1 rounded text-white hover:bg-indigo-500 transition-colors">Upload Model Chart</button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                </CardHeader>
                <div className="flex-1 bg-black/40 m-4 rounded flex items-center justify-center relative min-h-[300px]">
                    {imageBase64 ? <img src={`data:image/png;base64,${imageBase64}`} className="w-full h-full object-contain" alt="Strategy"/> : <div className="text-center text-slate-600"><Icons.Upload size={48} className="mb-2 mx-auto opacity-30"/><p className="text-sm">Upload your "Perfect Setup" Chart</p></div>}
                </div>
                <div className="p-4 border-t border-slate-800 space-y-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded p-2">
                        <div className="text-xs text-amber-500 font-bold mb-1 flex items-center gap-2"><Icons.Lightbulb size={12}/> STRATEGY NOTES</div>
                        <textarea className="w-full bg-transparent text-sm font-medium text-slate-300 outline-none resize-none h-20 placeholder-slate-600" placeholder="List your indicators and rules here (e.g. VWAP bounce, RSI < 30)..." value={state.strategyDescription} onChange={e => setState(prev => ({...prev, strategyDescription: e.target.value}))}/>
                    </div>
                    <button onClick={runAnalysis} disabled={!imageBase64 || state.isAnalyzing} className="w-full bg-amber-600 hover:bg-amber-500 py-2 rounded text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                        {state.isAnalyzing ? "Analyzing..." : <><Icons.Brain size={16}/> Analyze Strategy Logic</>}
                    </button>
                </div>
            </Card>
            <Card className="lg:w-1/2 flex flex-col bg-slate-900">
                <CardHeader className="py-3 border-b border-slate-800/50 flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-sm text-emerald-400"><Icons.ShieldAlert size={16}/> Strategy Audit & Chat</CardTitle>
                    {state.error && <span className="text-xs text-rose-400 bg-rose-900/20 px-2 py-1 rounded">{state.error}</span>}
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs text-center p-8"><Icons.Activity size={32} className="mb-3 opacity-20" /><p>Ready to chat. Upload chart or ask questions.</p></div> : messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}><div className={`max-w-[95%] rounded-2xl p-4 text-[15px] leading-7 font-medium shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-none'}`}>{msg.content}</div></div>
                    ))}
                    {state.isAnalyzing && <div className="text-xs text-slate-500 animate-pulse">Analyst is thinking...</div>}
                    <div ref={chatEndRef} />
                </CardContent>
                <div className="p-3 border-t border-slate-800 flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-white p-2"><Icons.Image size={16}/></button>
                    <input type="text" value={localInput} onChange={(e) => setLocalInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(localInput)} onPaste={handlePaste} placeholder="Ask about your strategy..." className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                    <button onClick={() => handleSendMessage(localInput)} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded"><Icons.Send size={16} /></button>
                </div>
            </Card>
        </div>
    );
};

// --- MAIN APP ---
const App = () => {
    const [activeTab, setActiveTab] = useState('journal');
    const [balance] = useState(50000); 
    const [showSettings, setShowSettings] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showChartModal, setShowChartModal] = useState(false);
    const [selectedChart, setSelectedChart] = useState(null);
    const fileInputRef = useRef(null);
    const chartInputRef = useRef(null);

    const [overhead, setOverhead] = useState(()=>safeStorage.get('journal_overhead', {evalCost:39, commRate:2.53, riskUnit: 150}));
    const [accounts, setAccounts] = useState(()=>safeStorage.get('journal_accounts', ['Main']));
    const [selectedAccount, setSelectedAccount] = useState('All');
    
    const [filterTicker, setFilterTicker] = useState('All');
    const [filterSetup, setFilterSetup] = useState('All');
    
    const [trades, setTrades] = useState(() => safeStorage.get('journal_trades', []));
    const [apiKey, setApiKey] = useState(()=>safeStorage.get('gemini_key', ''));
    
    const [strategyState, setStrategyState] = useState({imageBase64:null, messages:[], isAnalyzing:false, userStrategy:"", selectedTicker:"MNQ", timeframe:"5m", riskAmount:150});
    const [playbookState, setPlaybookState] = useState({imageBase64:null, messages:[], isAnalyzing:false, strategyDescription: ""});

    const initialTrade = { date: new Date().toISOString().split('T')[0], time: '09:30', ticker: 'MNQ', direction: 'Long', entry: '', exit: '', size: '1', pnl: '', account: 'Main', notes: '', chartImage: null };
    const [newTrade, setNewTrade] = useState(initialTrade);

    useEffect(() => { safeStorage.set('journal_trades', trades); }, [trades]);
    useEffect(() => { safeStorage.set('journal_accounts', accounts); }, [accounts]);
    useEffect(() => { safeStorage.set('gemini_key', apiKey); }, [apiKey]);
    useEffect(() => { safeStorage.set('journal_overhead', overhead); }, [overhead]);

    const metrics = useMemo(() => calculateMetrics(trades, balance, overhead, selectedAccount, filterTicker, filterSetup), [trades, balance, overhead, selectedAccount, filterTicker, filterSetup]);
    
    const displayedTrades = useMemo(() => {
        return trades.filter(t => {
            const matchAccount = selectedAccount === 'All' || (t.account || 'Main') === selectedAccount;
            const matchTicker = filterTicker === 'All' || t.ticker === filterTicker;
            const matchSetup = filterSetup === 'All' || (t.setup || 'Unknown') === filterSetup;
            return matchAccount && matchTicker && matchSetup;
        });
    }, [trades, selectedAccount, filterTicker, filterSetup]);

    const uniqueTickers = useMemo(() => ['All', ...new Set(trades.map(t => t.ticker).filter(Boolean))].sort(), [trades]);
    const uniqueSetups = useMemo(() => ['All', ...new Set(trades.map(t => t.setup || 'Unknown').filter(Boolean))].sort(), [trades]);

    const handleChartUpload = (e) => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => setNewTrade(p => ({...p, chartImage: reader.result.split(',')[1]}));
            reader.readAsDataURL(file);
        }
    };

    const saveTrade = () => {
        let pnl = parseFloat(newTrade.pnl);
        if(isNaN(pnl) && newTrade.entry && newTrade.exit) {
            const diff = newTrade.direction === 'Long' ? newTrade.exit - newTrade.entry : newTrade.entry - newTrade.exit;
            pnl = diff * (newTrade.ticker === 'MNQ' ? 2 : 20) * newTrade.size;
        }
        const trade = { ...newTrade, id: editingId || Date.now(), pnl: (pnl||0).toFixed(2), account: newTrade.account || accounts[0] };
        if(editingId) { setTrades(trades.map(t=>t.id===editingId?trade:t)); setEditingId(null); }
        else { setTrades([...trades, trade]); }
        setNewTrade({...initialTrade, account: newTrade.account});
    };

    const deleteTrade = (id) => { setTrades(trades.filter(t=>t.id!==id)); };
    const startEdit = (t) => { setNewTrade(t); setEditingId(t.id); };
    const clearAllData = () => { setTrades([]); };
    
    // --- SMART IMPORT LOGIC ---
    const handleImportClick = () => { if (fileInputRef.current) { fileInputRef.current.value = ""; fileInputRef.current.click(); } };
    
    const handleFileChange = (e) => { 
        const file = e.target.files[0]; 
        if(!file) return; 
        const reader = new FileReader(); 
        reader.onload = (evt) => { parseImportData(evt.target.result); }; 
        reader.readAsText(file); 
    };
    
    const splitCSV = (str) => {
        const res = [];
        let current = '';
        let inQuote = false;
        for(let char of str) {
            if(char === '"') { inQuote = !inQuote; continue; }
            if(char === ',' && !inQuote) { res.push(current.trim()); current = ''; }
            else { current += char; }
        }
        res.push(current.trim());
        return res;
    };

    const parseImportData = (text) => {
        try {
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length < 2) return;

            const headers = splitCSV(lines[0]).map(h => h.replace(/"/g, '').trim());
            
            // DETECT FORMAT
            if (headers.includes('Instrument') && headers.includes('Market pos.')) {
                 parseNinjaTrader(lines, headers);
            } else if (headers.includes('Open Time') && headers.includes('Close Time')) {
                 parseTradingView(lines, headers);
            } else if (headers.includes('ContractName') || headers.includes('PnL') || headers.includes('P&L')) {
                 parseTopstep(lines, headers);
            } else {
                 alert("Unknown CSV format. Please ensure headers match NinjaTrader, TradingView, or Topstep exports.");
            }
        } catch(e) { console.error("Import Error", e); }
    };

    const parseNinjaTrader = (lines, headers) => {
        const newTrades = [];
        const targetAccount = selectedAccount === 'All' ? (accounts[0] || 'Main') : selectedAccount;
        
        const idxInstr = headers.indexOf('Instrument');
        const idxPos = headers.indexOf('Market pos.');
        const idxQty = headers.indexOf('Qty');
        const idxEntryPrice = headers.indexOf('Entry price');
        const idxExitPrice = headers.indexOf('Exit price');
        const idxEntryTime = headers.indexOf('Entry time');
        const idxProfit = headers.indexOf('Profit') > -1 ? headers.indexOf('Profit') : headers.indexOf('P/L');
        
        for(let i=1; i<lines.length; i++) {
            const row = splitCSV(lines[i]);
            if(row.length < headers.length) continue;

            const pnlRaw = row[idxProfit] || '0';
            const pnl = parseFloat(pnlRaw.replace(/[$,\s]/g, ''));
            const dateStr = parseRawDate(row[idxEntryTime]);
            const timeStr = row[idxEntryTime] ? new Date(row[idxEntryTime]).toTimeString().slice(0,5) : "12:00";

            newTrades.push({
                id: Date.now() + i,
                date: dateStr,
                time: timeStr,
                ticker: row[idxInstr],
                direction: row[idxPos],
                size: row[idxQty] || 1,
                entry: row[idxEntryPrice],
                exit: row[idxExitPrice],
                pnl: pnl.toFixed(2),
                fees: "0.00",
                mistake: 'None',
                notes: 'NinjaTrader Import',
                setup: 'Imported',
                account: targetAccount,
                chartImage: null
            });
        }
        if (newTrades.length > 0) setTrades(prev => [...prev, ...newTrades]);
    };

    const parseTradingView = (lines, headers) => {
        const newTrades = [];
        const targetAccount = selectedAccount === 'All' ? (accounts[0] || 'Main') : selectedAccount;

        const idxSym = headers.indexOf('Symbol');
        const idxSide = headers.indexOf('Side');
        const idxOpenTime = headers.indexOf('Open Time');
        const idxEntryPrice = headers.indexOf('Entry Price');
        const idxExitPrice = headers.indexOf('Exit Price');
        const idxProfit = headers.indexOf('Profit') > -1 ? headers.indexOf('Profit') : headers.indexOf('Net Profit');

        for(let i=1; i<lines.length; i++) {
            const row = splitCSV(lines[i]);
            if(row.length < headers.length) continue;

            const pnlRaw = row[idxProfit] || '0';
            const pnl = parseFloat(pnlRaw.replace(/[$,\s]/g, ''));
            const dateStr = parseRawDate(row[idxOpenTime]);
            const timeStr = row[idxOpenTime] ? new Date(row[idxOpenTime]).toTimeString().slice(0,5) : "12:00";

            newTrades.push({
                id: Date.now() + i,
                date: dateStr,
                time: timeStr,
                ticker: row[idxSym],
                direction: row[idxSide],
                size: 1, 
                entry: row[idxEntryPrice],
                exit: row[idxExitPrice],
                pnl: pnl.toFixed(2),
                fees: "0.00",
                mistake: 'None',
                notes: 'TradingView Import',
                setup: 'Imported',
                account: targetAccount,
                chartImage: null
            });
        }
        if (newTrades.length > 0) setTrades(prev => [...prev, ...newTrades]);
    };

    const parseTopstep = (lines, headers) => {
        const newTrades = [];
        const targetAccount = selectedAccount === 'All' ? (accounts[0] || 'Main') : selectedAccount;
        
        const idxPnL = headers.findIndex(h => h === 'PnL' || h === 'Profit/Loss' || h === 'P&L' || h.includes('PnL'));
        const idxDate = headers.findIndex(h => h.includes('Date') || h.includes('Time')); 
        const idxSym = headers.findIndex(h => h.includes('Contract') || h.includes('Symbol') || h.includes('Instrument'));
        const idxSide = headers.findIndex(h => h.includes('Side') || h.includes('Direction'));

        for(let i=1; i<lines.length; i++) {
            const row = splitCSV(lines[i]);
            if(row.length < headers.length || !row[idxPnL]) continue;

            let pnlRaw = row[idxPnL].replace(/[$,\s]/g, ''); 
            let pnl = parseFloat(pnlRaw.replace(/[\(\)]/g, '')); 
            if(row[idxPnL].includes('(') || row[idxPnL].includes('-')) {
                 if (pnl > 0) pnl = -pnl; 
            }

            let dateStr = parseRawDate(row[idxDate]);
            let timeStr = "12:00";
            if (idxDate !== -1 && row[idxDate]) {
                const d = new Date(row[idxDate]);
                if (!isNaN(d.getTime())) timeStr = d.toTimeString().slice(0,5);
            }

            const ticker = idxSym !== -1 ? row[idxSym] : 'UNK';
            const dir = idxSide !== -1 ? row[idxSide] : (pnl >= 0 ? 'Long' : 'Short'); 

            newTrades.push({
                id: Date.now() + i,
                date: dateStr,
                time: timeStr,
                ticker: ticker,
                direction: dir,
                size: 1,
                pnl: pnl.toFixed(2),
                fees: "0.00",
                mistake: 'None',
                notes: 'Topstep Import',
                setup: 'Imported',
                account: targetAccount,
                chartImage: null
            });
        }
        if (newTrades.length > 0) setTrades(prev => [...prev, ...newTrades]);
    };

    const exportCSV = () => {
        const headers = ["Date", "Time", "Ticker", "Direction", "Entry", "Exit", "PnL", "Account"];
        const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...trades.map(t => [t.date, t.time, t.ticker, t.direction, t.entry, t.exit, t.pnl, t.account].join(","))].join("\n");
        const link = document.createElement("a"); link.setAttribute("href", encodeURI(csv)); link.setAttribute("download", "journal_export.csv"); document.body.appendChild(link); link.click();
    };

    const handleInputChange = (e) => { const { name, value } = e.target; setNewTrade(prev => ({ ...prev, [name]: value })); };
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [tempAccountName, setTempAccountName] = useState("");
    const addAccount = () => { setIsAddingAccount(true); };
    const saveNewAccount = () => { if (tempAccountName && !accounts.includes(tempAccountName)) { setAccounts([...accounts, tempAccountName]); setSelectedAccount(tempAccountName); setIsAddingAccount(false); setTempAccountName(""); } };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      {showSettings && <SettingsModal overhead={overhead} setOverhead={setOverhead} accounts={accounts} setAccounts={setAccounts} onClose={() => setShowSettings(false)} />}
      {showChartModal && <ImageModal image={selectedChart} onClose={() => setShowChartModal(false)} />}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-4 gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                    <Icons.Activity size={24} className="text-white"/>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Shock And Awe <span className="text-indigo-500">2.1</span></h1>
                
                {/* ACCOUNT SELECTOR */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-2 py-1">
                    <Icons.Users size={14} className="text-slate-400 mr-2"/>
                    {!isAddingAccount ? (
                        <>
                            <select 
                                value={selectedAccount} 
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="bg-transparent text-sm text-white outline-none mr-2 rounded px-2 py-0.5" 
                            >
                                <option value="All" className="bg-slate-900">All Accounts</option>
                                {accounts.map(acc => <option key={acc} value={acc} className="bg-slate-900">{acc}</option>)}
                            </select>
                            <button onClick={addAccount} className="text-slate-400 hover:text-green-400"><Icons.Plus size={14}/></button>
                        </>
                    ) : (
                        <div className="flex items-center gap-1">
                            <input autoFocus type="text" className="bg-slate-950 text-white text-xs border border-blue-500 rounded px-1 py-0.5 w-32 outline-none" placeholder="Account Name" value={tempAccountName} onChange={(e) => setTempAccountName(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') saveNewAccount()}} />
                            <button onClick={saveNewAccount} className="text-emerald-400 hover:text-emerald-300"><Icons.CheckCircle2 size={14}/></button>
                            <button onClick={() => setIsAddingAccount(false)} className="text-rose-400 hover:text-rose-300"><Icons.X size={14}/></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                 <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <Icons.Settings size={20} />
                 </button>
                 <button onClick={clearAllData} className="flex items-center gap-2 bg-rose-900/50 hover:bg-rose-900 text-rose-200 px-3 py-1 rounded text-xs border border-rose-800 transition-colors">
                    <Icons.Trash2 size={14} /> Clear
                 </button>
                <div className="flex gap-2 bg-slate-900 p-1 rounded border border-slate-800">
                    <button onClick={()=>setActiveTab('journal')} className={`px-4 py-2 rounded text-sm font-medium transition-all ${activeTab==='journal'?'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20':'text-slate-400 hover:text-white'}`}>Journal</button>
                    <button onClick={()=>setActiveTab('livedesk')} className={`px-4 py-2 rounded text-sm font-medium transition-all ${activeTab==='livedesk'?'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20':'text-slate-400 hover:text-white'}`}>LiveDesk</button>
                    <button onClick={()=>setActiveTab('playback')} className={`px-4 py-2 rounded text-sm font-medium transition-all ${activeTab==='playback'?'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20':'text-slate-400 hover:text-white'}`}>Playback</button>
                </div>
            </div>
        </div>

        {activeTab === 'livedesk' ? (
            <StrategyRoom state={strategyState} setState={setStrategyState} apiKey={apiKey} setApiKey={setApiKey} />
        ) : activeTab === 'playback' ? (
            <Playback state={playbookState} setState={setPlaybookState} apiKey={apiKey} setApiKey={setApiKey} />
        ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" style={{display: 'none'}} />
                 
                 {metrics && (
                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                         <Card className={`relative overflow-hidden ${parseFloat(metrics.netPnL) >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                             <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] rounded-full ${parseFloat(metrics.netPnL) >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}></div>
                             <CardContent className="pt-4 relative z-10">
                                 <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Net PnL</div>
                                 <div className={`text-2xl font-mono font-bold mt-1 ${parseFloat(metrics.netPnL)>=0?'text-emerald-400':'text-rose-400'}`}>${metrics.netPnL}</div>
                             </CardContent>
                         </Card>
                         <Card className="border-indigo-500/20">
                             <CardContent className="pt-4">
                                 <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Win Rate</div>
                                 <div className="text-2xl font-mono font-bold mt-1 text-indigo-400">{metrics.winRate}%</div>
                             </CardContent>
                         </Card>
                         <Card>
                             <CardContent className="pt-4">
                                 <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Expectancy</div>
                                 <div className="text-2xl font-mono font-bold mt-1 text-white">${metrics.expectancy}</div>
                             </CardContent>
                         </Card>
                         <Card>
                             <CardContent className="pt-4">
                                 <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Profit Factor</div>
                                 <div className="text-2xl font-mono font-bold mt-1 text-blue-400">{metrics.profitFactor}</div>
                             </CardContent>
                         </Card>
                         <Card>
                             <CardContent className="pt-4">
                                 <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Drawdown</div>
                                 <div className="text-2xl font-mono font-bold mt-1 text-rose-400">-${metrics.maxDrawdown}</div>
                             </CardContent>
                         </Card>
                     </div>
                 )}
                 
                 {metrics && (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Avg Win</div><div className="text-lg font-mono text-emerald-400">${metrics.avgWin}</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Avg Loss</div><div className="text-lg font-mono text-rose-400">-${Math.abs(metrics.avgLoss)}</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Global Risk Unit</div><div className="text-lg font-mono text-white">${overhead.riskUnit}</div></CardContent></Card>
                         <Card><CardContent className="pt-4"><div className="text-xs text-slate-400">Trade Count</div><div className="text-lg font-mono text-white">{displayedTrades.length}</div></CardContent></Card>
                     </div>
                 )}
                 
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <Card className="lg:col-span-2 border-indigo-500/50 border-2 shadow-indigo-900/10">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>{editingId ? "Edit Trade" : "New Trade Entry"}</CardTitle>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <button onClick={() => chartInputRef.current?.click()} className={`flex items-center gap-2 ${newTrade.chartImage ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'} hover:bg-slate-700 px-3 py-1 rounded text-xs transition-colors border border-slate-700`}>
                                            <Icons.Image size={14}/> {newTrade.chartImage ? "Chart Attached" : "Attach Chart"}
                                        </button>
                                        <input type="file" ref={chartInputRef} onChange={handleChartUpload} className="hidden" accept="image/*" />
                                    </div>
                                    <button onClick={() => handleImportClick()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-xs transition-colors text-white font-medium"><Icons.Upload size={14} /> Import CSV</button>
                                    <button onClick={exportCSV} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs transition-colors border border-slate-700"><Icons.Download size={14} /> CSV</button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                <div className="flex gap-2 col-span-1 md:col-span-2">
                                    <div className="w-2/3">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Date</label>
                                        <input type="date" name="date" value={newTrade.date} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                                    </div>
                                    <div className="w-1/3">
                                        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Time</label>
                                        <input type="time" name="time" value={newTrade.time} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Ticker</label>
                                    <select name="ticker" value={newTrade.ticker} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm appearance-none focus:border-indigo-500 focus:outline-none transition-colors">
                                        <option value="MNQ">MNQ</option>
                                        <option value="NQ">NQ</option>
                                        <option value="ES">ES</option>
                                        <option value="MES">MES</option>
                                        <option value="CL">CL</option>
                                        <option value="GC">GC</option>
                                        <option value="RTY">RTY</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Direction</label>
                                    <select name="direction" value={newTrade.direction} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors">
                                        <option value="Long">Long</option>
                                        <option value="Short">Short</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Strategy / Setup</label>
                                    <input type="text" name="setup" placeholder="Setup" value={newTrade.setup} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                                </div>
                                
                                <div className="relative">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Duration (Mins)</label>
                                    <input type="number" name="duration" placeholder="Min" value={newTrade.duration} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm pl-2 focus:border-indigo-500 focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Position Size</label>
                                    <input type="number" name="size" placeholder="Size" value={newTrade.size} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Entry Price</label>
                                    <input type="number" name="entry" placeholder="Entry" value={newTrade.entry} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Stop Loss</label>
                                    <input type="number" name="stop" placeholder="Stop" value={newTrade.stop} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Exit Price</label>
                                    <input type="number" name="exit" placeholder="Exit" value={newTrade.exit} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                                </div>
                                
                                <div className="relative">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Pt Value ($)</label>
                                    <input type="number" name="pointValue" placeholder="Pt Val" value={newTrade.pointValue} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm pl-2 focus:border-indigo-500 focus:outline-none transition-colors" />
                                    <span className="absolute right-2 top-8 text-xs text-slate-500">$</span>
                                </div>

                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Commissions</label>
                                    <input type="number" name="fees" placeholder="Fees" value={newTrade.fees} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                                </div>
                                
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Account</label>
                                    <select name="account" value={newTrade.account} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors">
                                        {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                                    </select>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Execution Error</label>
                                    <select name="mistake" value={newTrade.mistake} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors">
                                        <option value="None">No Mistake (Clean)</option><option value="FOMO">FOMO / Chased</option><option value="Revenge">Revenge Trading</option><option value="No Plan">No Plan / Impulse</option><option value="Hesitation">Hesitation (Late)</option><option value="Moved Stop">Moved Stop Loss</option><option value="Early Exit">Early Exit (Fear)</option>
                                    </select>
                                </div>

                                <div className="col-span-2 md:col-span-3">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Trade Notes</label>
                                    <input type="text" name="notes" placeholder="Psychology/Notes" value={newTrade.notes} onChange={handleInputChange} className="w-full bg-slate-800 border-slate-700 text-white rounded p-2 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button onClick={saveTrade} className={`w-full ${editingId ? 'bg-amber-600' : 'bg-blue-600'} text-white h-9 rounded font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-900/20`}>
                                    {editingId ? "Update Trade" : "Add Trade"}
                                </button>
                                {editingId && <button onClick={() => {setEditingId(null); setNewTrade({date: new Date().toISOString().split('T')[0], time: '09:30', ticker: 'MNQ', direction: 'Short', entry: '', stop: '', exit: '', size: '1', fees: '', pointValue: '2', mistake: 'None', notes: '', duration: '', setup: '', account: accounts[0]})}} className="px-4 border border-slate-600 text-slate-400 rounded text-sm hover:text-white">Cancel</button>}
                            </div>
                        </CardContent>
                     </Card>
                     <CoachWidget metrics={metrics} apiKey={apiKey} setApiKey={setApiKey} />
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                         <Card>
                            <CardHeader><CardTitle className="text-sm">Session Performance (PnL)</CardTitle></CardHeader>
                            <CardContent className="h-32">
                                <SimpleBarChart data={metrics?.sessionChartData} dataKey="pnl"/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2 text-sm items-center"><Icons.Timer size={16}/> Win Rate by Trade Duration</CardTitle></CardHeader>
                            <CardContent className="h-48">
                                <SimpleBarChart data={metrics?.durationChartData} dataKey="winRate"/>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><Icons.Calendar size={16}/> Daily Heatmap</CardTitle></CardHeader>
                            <CardContent>
                                <PnLCalendar trades={displayedTrades} />
                            </CardContent>
                        </Card>
                    </div>
                 </div>
                 
                 {metrics?.strategyDnaData.length > 0 && (
                     <Card>
                        <CardHeader><CardTitle className="flex gap-2"><Icons.PieChart size={16}/> Strategy DNA</CardTitle></CardHeader>
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
                     <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                         <div className="flex gap-4">
                             <div className="flex items-center gap-2">
                                <Icons.Filter size={14} className="text-slate-500"/>
                                <select value={filterTicker} onChange={(e) => setFilterTicker(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none">
                                    {uniqueTickers.map(t => <option key={t} value={t}>{t === 'All' ? 'All Tickers' : t}</option>)}
                                </select>
                             </div>
                             <div className="flex items-center gap-2">
                                <select value={filterSetup} onChange={(e) => setFilterSetup(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none">
                                    {uniqueSetups.map(s => <option key={s} value={s}>{s === 'All' ? 'All Setups' : s}</option>)}
                                </select>
                             </div>
                         </div>
                         <div className="text-xs text-slate-500">{displayedTrades.length} Trades Found</div>
                     </div>
                     <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left text-slate-400">
                             <thead className="text-xs uppercase bg-slate-900 border-b border-slate-800">
                                 <tr>
                                     <th className="px-4 py-2">Date</th>
                                     <th className="px-4 py-2">Account</th>
                                     <th className="px-4 py-2">Ticker</th>
                                     <th className="px-4 py-2">Strategy</th>
                                     <th className="px-4 py-2">R-Mult</th>
                                     <th className="px-4 py-2">P&L</th>
                                     <th className="px-4 py-2 text-right">Chart</th>
                                     <th className="px-4 py-2 text-right">Action</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {displayedTrades.slice().reverse().map(t => {
                                     const pnl = parseFloat(t.pnl);
                                     const risk = overhead.riskUnit || 1;
                                     const rMultiple = (pnl / risk).toFixed(2);
                                     
                                     return (
                                     <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 group">
                                         <td className="px-4 py-2">{t.date}</td>
                                         <td className="px-4 py-2 text-xs text-indigo-400">{t.account || 'Main'}</td>
                                         <td className="px-4 py-2 font-bold text-white">{t.ticker} <span className="text-[10px] text-slate-500 font-normal">({t.direction})</span></td>
                                         <td className="px-4 py-2 text-xs text-slate-400">{t.setup || '-'}</td>
                                         <td className="px-4 py-2">
                                             <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${rMultiple >= 2 ? 'bg-emerald-500 text-black' : rMultiple > 0 ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'}`}>
                                                 {rMultiple}R
                                             </span>
                                         </td>
                                         <td className={`px-4 py-2 font-mono ${pnl>=0?'text-emerald-400':'text-rose-400'}`}>${t.pnl}</td>
                                         <td className="px-4 py-2 text-right">
                                             {t.chartImage && (
                                                 <button onClick={() => {setSelectedChart(t.chartImage); setShowChartModal(true);}} className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 text-xs bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900"><Icons.Eye size={12}/> View</button>
                                             )}
                                         </td>
                                         <td className="px-4 py-2 text-right flex justify-end gap-2">
                                            <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-indigo-400 transition-colors"><Icons.Edit2 size={14}/></button>
                                            <button onClick={()=>deleteTrade(t.id)} className="text-slate-500 hover:text-rose-500 transition-colors"><Icons.Trash2 size={14}/></button>
                                         </td>
                                     </tr>
                                 )})}
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

// --- MOUNT ---
export default function WrappedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}