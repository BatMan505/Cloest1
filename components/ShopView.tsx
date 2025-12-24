
import React, { useState, useEffect, useMemo } from 'react';
import { ClothingItem, ShoppingRecommendation } from '../types';
import { getShoppingRecommendations } from '../services/geminiService';

interface ShopViewProps {
  items: ClothingItem[];
}

const LOADING_STAGES = [
  "Waiting for rate limit window...",
  "Scanning Wardrobe Patterns...",
  "Identifying Style Gaps...",
  "Searching Brand Matches...",
  "Finalizing Your Edit..."
];

const ShopView: React.FC<ShopViewProps> = ({ items }) => {
  const [recommendations, setRecommendations] = useState<ShoppingRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasKey(true);
    fetchRecommendations();
  };

  const fetchRecommendations = async () => {
    if (items.length < 3) return;
    setIsLoading(true);
    setError(null);
    setLoadingStage(0);
    
    const interval = setInterval(() => {
      setLoadingStage(prev => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
    }, 3000); // Slower loading to match throttled reality

    try {
      const recs = await getShoppingRecommendations(items);
      setRecommendations(recs);
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || "";
      if (msg.includes("quota") || msg.includes("429")) {
        setError("AI Quota Limit reached. Please wait 60 seconds before retrying.");
      } else {
        setError("AI Lab is momentarily busy. Please try again.");
      }
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 text-[#7000FF]">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h3 className="text-xl font-black italic mb-3">Pro Access Required</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-8 max-w-[250px]">
          Live search features require a paid Gemini API project key.
        </p>
        <button 
          onClick={handleSelectKey} 
          className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
        >
          Select Pro Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-6 text-[8px] font-black text-[#7000FF] uppercase tracking-widest border-b border-[#7000FF]"
        >
          View Billing Documentation
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 rounded-full border-[3px] border-gray-100 flex items-center justify-center relative mb-12">
          <div className="absolute inset-0 rounded-full border-t-[3px] border-[#7000FF] animate-spin" />
          <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h3 className="text-xl font-black italic mb-3">Styling Your Edit</h3>
        <p className="text-[10px] font-black text-[#7000FF] uppercase tracking-[0.3em]">{LOADING_STAGES[loadingStage]}</p>
      </div>
    );
  }

  if (error || items.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-relaxed mb-8">
          {error || "Add 3 pieces to unlock personal shopping analysis."}
        </p>
        <button onClick={fetchRecommendations} className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">Generate Report</button>
      </div>
    );
  }

  if (!recommendations) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      <div className="px-6 py-6 space-y-10">
        <section className="bg-[#7000FF] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <h2 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-4">Your Style DNA</h2>
          <p className="text-xl font-black text-white leading-snug italic mb-8">"{recommendations.wardrobeAnalysis}"</p>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Core Aesthetic</p>
              <p className="text-sm font-black text-white italic">{recommendations.styleProfile.coreAesthetic}</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] px-2">Investment Sugestions</h2>
          <div className="grid grid-cols-1 gap-4">
            {recommendations.suggestions.map((sug, i) => (
              <div key={i} className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-7 shadow-sm hover:border-[#7000FF] transition-colors">
                <h3 className="text-2xl font-black italic tracking-tight mb-3">{sug.itemType}</h3>
                <p className="text-xs font-bold text-gray-500 leading-relaxed mb-4">{sug.whyItFits}</p>
                <div className="bg-[#F8F8F8] p-4 rounded-xl border border-gray-100">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Stylist Hack</p>
                  <p className="text-[10px] font-bold text-gray-600 italic">"{sug.stylingIdea}"</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {recommendations.sources && (
          <section className="space-y-4 px-2 pt-6 border-t border-gray-100">
            <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Verified Sources</h2>
            <div className="flex flex-wrap gap-2">
              {recommendations.sources.map((source, i) => (
                <a key={i} href={source.web?.uri || source.maps?.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] font-black text-[#7000FF] bg-purple-50 px-3 py-1 rounded-lg border border-purple-100 uppercase tracking-widest">
                  {source.web?.title || "Search Results"}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ShopView;
