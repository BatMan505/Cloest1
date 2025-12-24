
import React, { useState } from 'react';
import { ClothingItem, Outfit, Occasion } from '../types';
import { suggestOutfits } from '../services/geminiService';

interface SuggestionsViewProps {
  items: ClothingItem[];
  onSaveOutfit: (outfit: Outfit) => void;
}

const SuggestionsView: React.FC<SuggestionsViewProps> = ({ items, onSaveOutfit }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedOutfits, setSuggestedOutfits] = useState<string[][]>([]);

  const handleGenerate = async () => {
    if (!prompt || items.length < 2) return;
    setIsGenerating(true);
    try {
      const results = await suggestOutfits(items, prompt);
      setSuggestedOutfits(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSuggested = (ids: string[]) => {
    // Determine the closest predefined occasion or default to 'Other'
    const lowerPrompt = prompt.toLowerCase();
    let determinedOccasion: Occasion = 'Other';
    
    if (lowerPrompt.includes('work') || lowerPrompt.includes('office') || lowerPrompt.includes('meeting')) {
      determinedOccasion = 'Work';
    } else if (lowerPrompt.includes('party') || lowerPrompt.includes('night') || lowerPrompt.includes('club')) {
      determinedOccasion = 'Night Out';
    } else if (lowerPrompt.includes('gym') || lowerPrompt.includes('workout') || lowerPrompt.includes('sport')) {
      determinedOccasion = 'Gym';
    } else if (lowerPrompt.includes('date') || lowerPrompt.includes('romantic')) {
      determinedOccasion = 'Date Night';
    } else if (lowerPrompt.includes('casual') || lowerPrompt.includes('home') || lowerPrompt.includes('walk')) {
      determinedOccasion = 'Casual';
    } else if (lowerPrompt.includes('wedding') || lowerPrompt.includes('gala') || lowerPrompt.includes('formal')) {
      determinedOccasion = 'Formal';
    } else if (lowerPrompt.includes('home') || lowerPrompt.includes('sleep') || lowerPrompt.includes('lounge')) {
      determinedOccasion = 'Lounge';
    }

    const newOutfit: Outfit = {
      id: Date.now().toString(),
      name: `AI suggestion for ${prompt}`,
      itemIds: ids,
      occasion: determinedOccasion,
      createdAt: Date.now()
    };
    onSaveOutfit(newOutfit);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">AI Stylist</h2>
        <p className="text-sm text-gray-500">Ask ClosetAI to put together an outfit for any event using your existing wardrobe.</p>
      </div>

      <div className="relative">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A rainy day at the office..."
          className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black placeholder:text-gray-400 font-medium"
        />
        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="absolute right-2 top-2 bottom-2 bg-black text-white px-6 rounded-xl text-xs font-bold uppercase tracking-widest disabled:bg-gray-200 transition-colors"
        >
          {isGenerating ? 'Curating...' : 'Curate'}
        </button>
      </div>

      {isGenerating && (
        <div className="space-y-4">
          {[1,2].map(n => (
            <div key={n} className="bg-gray-50 h-40 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      <div className="space-y-6">
        {suggestedOutfits.map((ids, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in zoom-in duration-300" style={{ animationDelay: `${idx * 150}ms` }}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Look {idx + 1}</span>
              <button 
                onClick={() => handleSaveSuggested(ids)}
                className="text-xs font-bold text-black border-b border-black"
              >
                Save this look
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar">
              {ids.map(id => {
                const item = items.find(i => i.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-2xl p-2 flex items-center justify-center">
                    <img src={`data:image/png;base64,${item.imageUrl}`} className="max-h-full max-w-full object-contain" alt="Suggestion part" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {suggestedOutfits.length === 0 && !isGenerating && (
          <div className="text-center py-10 opacity-40">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <p className="text-sm italic">"The perfect outfit is waiting in your closet."</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsView;
