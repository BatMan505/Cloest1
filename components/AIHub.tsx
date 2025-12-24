
import React, { useState, useEffect } from 'react';
import { generateImage, generateStyleVideo, askStylistDeep, startLiveConsult, playAudioResponse, editImage, findLocalBoutiques, QuotaExceededError, ApiKeyError, getWaitTime } from '../services/geminiService';

const AIHub: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'chat' | 'gen' | 'video' | 'voice' | 'edit' | 'maps'>('chat');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Cooldown States
  const [proCooldown, setProCooldown] = useState(0);
  const [flashCooldown, setFlashCooldown] = useState(0);

  // Image Config
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');

  // Voice State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceSession, setVoiceSession] = useState<any>(null);
  const [transcriptions, setTranscriptions] = useState<{t: string, m: boolean}[]>([]);

  // Timer for throttles
  useEffect(() => {
    const timer = setInterval(() => {
      setProCooldown(getWaitTime('pro'));
      setFlashCooldown(getWaitTime('flash'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleError = (e: any) => {
    if (e instanceof QuotaExceededError) {
      alert("AI Quota Exceeded. Please wait a minute before trying again.");
    } else if (e instanceof ApiKeyError) {
      alert("API Key Issue. Please re-select your Pro key.");
      // @ts-ignore
      window.aistudio?.openSelectKey();
    } else {
      alert("The Style Lab is momentarily busy. Please try again.");
    }
  };

  const handleDeepChat = async () => {
    setLoading(true);
    try {
      const res = await askStylistDeep(prompt);
      setResult({ text: res });
      playAudioResponse(res.slice(0, 100));
    } catch (e) { handleError(e); }
    setLoading(false);
  };

  const handleGen = async () => {
    setLoading(true);
    try {
      const url = await generateImage(prompt, aspectRatio, imageSize);
      setResult(url);
    } catch (e) { handleError(e); }
    setLoading(false);
  };

  const handleMaps = async () => {
    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await findLocalBoutiques({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setResult(res);
        } catch (e) { handleError(e); }
        setLoading(false);
      }, () => {
        alert("Location required for Local Finder.");
        setLoading(false);
      });
    } catch (e) { 
      handleError(e);
      setLoading(false); 
    }
  };

  const handleVideo = async () => {
    setLoading(true);
    try {
      const url = await generateStyleVideo(prompt);
      setResult(url);
    } catch (e) { handleError(e); }
    setLoading(false);
  };

  const toggleVoice = async () => {
    if (isVoiceActive) {
      voiceSession?.stop();
      setIsVoiceActive(false);
      setVoiceSession(null);
    } else {
      setIsVoiceActive(true);
      try {
        const session = await startLiveConsult((t, m) => {
          setTranscriptions(prev => [...prev.slice(-3), { t, m }]);
        });
        setVoiceSession(session);
      } catch (e) {
        setIsVoiceActive(false);
        handleError(e);
      }
    }
  };

  const isProTool = ['chat', 'gen', 'video'].includes(activeTool);
  const activeCooldown = isProTool ? proCooldown : flashCooldown;

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-32">
      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar">
        <ToolTab active={activeTool === 'chat'} onClick={() => setActiveTool('chat')} label="Deep Chat" icon="🧠" />
        <ToolTab active={activeTool === 'gen'} onClick={() => setActiveTool('gen')} label="Studio" icon="✨" />
        <ToolTab active={activeTool === 'maps'} onClick={() => setActiveTool('maps')} label="Local" icon="📍" />
        <ToolTab active={activeTool === 'video'} onClick={() => setActiveTool('video')} label="Runway" icon="🎬" />
        <ToolTab active={activeTool === 'voice'} onClick={() => setActiveTool('voice')} label="Voice" icon="🎙️" />
      </div>

      <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-8 shadow-sm">
        {activeTool !== 'voice' && (
          <div className="space-y-6">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeTool === 'chat' ? "Get archival style advice..." : "Describe your vision..."}
              className="w-full bg-gray-50 rounded-2xl p-6 text-sm font-bold focus:ring-2 focus:ring-black outline-none h-32"
            />
            
            {activeTool === 'gen' && (
              <div className="grid grid-cols-2 gap-4">
                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="bg-gray-50 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none">
                  {['1:1', '3:4', '4:3', '9:16', '16:9'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="bg-gray-50 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none">
                  {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <button 
              onClick={activeTool === 'gen' ? handleGen : activeTool === 'chat' ? handleDeepChat : activeTool === 'video' ? handleVideo : handleMaps}
              disabled={loading || activeCooldown > 0 || (!prompt && activeTool !== 'maps')}
              className="w-full py-5 purple-gradient-btn text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-20 transition-all active:scale-95"
            >
              {loading ? 'AI Thinking...' : activeCooldown > 0 ? `Ready in ${activeCooldown}s` : `Start ${activeTool.toUpperCase()}`}
            </button>
            
            {activeCooldown > 0 && (
              <p className="text-[8px] font-black text-[#7000FF] uppercase text-center tracking-widest animate-pulse">
                Cooling down for Pro Tier stability
              </p>
            )}
          </div>
        )}

        {activeTool === 'voice' && (
          <div className="flex flex-col items-center py-6">
            <button onClick={toggleVoice} className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-xl transform transition-all active:scale-90 ${isVoiceActive ? 'bg-[#7000FF] text-white animate-pulse' : 'bg-gray-100'}`}>
              {isVoiceActive ? '⏹️' : '🎙️'}
            </button>
            <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Voice Assistant</p>
            <div className="mt-8 w-full space-y-2">
              {transcriptions.map((tr, i) => (
                <div key={i} className={`p-3 rounded-xl text-[10px] font-bold ${tr.m ? 'bg-purple-50 text-[#7000FF] self-end' : 'bg-gray-50 text-gray-400 self-start'}`}>{tr.t}</div>
              ))}
            </div>
          </div>
        )}

        {result && activeTool !== 'voice' && (
          <div className="mt-10 animate-in zoom-in duration-500">
             <div className="h-px bg-gray-100 mb-8" />
             {typeof result === 'string' ? (
               activeTool === 'video' ? (
                 <video src={result} controls className="w-full rounded-3xl shadow-2xl" />
               ) : (
                 <img src={result} className="w-full rounded-3xl shadow-2xl" alt="Output" />
               )
             ) : (
               <div className="space-y-4">
                 <p className="text-sm font-bold text-gray-700 leading-relaxed italic">{result.text}</p>
                 {result.places && (
                   <div className="flex flex-wrap gap-2">
                     {result.places.map((p: any, i: number) => (
                       <a key={i} href={p.maps?.uri} target="_blank" className="text-[8px] font-black text-[#7000FF] bg-purple-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-purple-100">
                         📍 {p.maps?.title || 'Boutique'}
                       </a>
                     ))}
                   </div>
                 )}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const ToolTab: React.FC<any> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex-shrink-0 px-6 py-4 rounded-3xl flex items-center gap-3 transition-all ${active ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default AIHub;
