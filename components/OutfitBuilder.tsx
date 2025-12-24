
import React, { useState, useMemo, useRef } from 'react';
import { ClothingItem, Outfit, Category } from '../types';

interface OutfitBuilderProps {
  items: ClothingItem[];
  onSaveOutfit: (outfit: Outfit) => void;
  onCancel: () => void;
}

const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Outerwear', 'Dresses'];

// Extended Backgrounds with patterns using CSS gradients
const BACKGROUNDS = [
  { id: 'neutral', value: '#F8F8F8', label: 'Canvas', style: {} },
  { id: 'grid', value: '#FFFFFF', label: 'Grid', style: { backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 0)', backgroundSize: '24px 24px' } },
  { id: 'dots', value: '#7000FF', label: 'Polka', style: { backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 2px, transparent 0)', backgroundSize: '16px 16px' } },
  { id: 'stripes', value: '#EBE0FF', label: 'Diagonal', style: { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)' } },
  { id: 'rose', value: '#FFE6F2', label: 'Rose', style: {} },
  { id: 'onyx', value: '#111111', label: 'Onyx', style: {} },
];

const STICKER_PACKS = [
  { name: 'Vibe', icons: ['✨', '⚡', '🌟', '💫', '🔥', '🌈', '🦋'] },
  { name: 'Mood', icons: ['💅', '🧸', '🕶️', '👜', '🤳', '🖤', '🤍'] },
  { name: 'Detail', icons: ['🎀', '💎', '⌚', '🧣', '👟', '☁️', '🌊'] },
];

const OutfitBuilder: React.FC<OutfitBuilderProps> = ({ items, onSaveOutfit, onCancel }) => {
  const [activeSubMenu, setActiveSubMenu] = useState<'wardrobe' | 'stickers' | 'background' | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<Category, string | null>>({
    Tops: null,
    Bottoms: null,
    Shoes: null,
    Accessories: null,
    Outerwear: null,
    Dresses: null
  });
  
  const [drawerCategory, setDrawerCategory] = useState<Category | 'All'>('All');
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [stickers, setStickers] = useState<string[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const bgInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    if (drawerCategory === 'All') return items;
    return items.filter(i => i.category === drawerCategory);
  }, [items, drawerCategory]);

  const handleToggleItem = (category: Category, id: string) => {
    setSelectedIds(prev => ({
      ...prev,
      [category]: prev[category] === id ? null : id
    }));
  };

  const handleSave = (isTemplate: boolean = false) => {
    const ids = Object.values(selectedIds).filter(Boolean) as string[];
    if (ids.length === 0) {
      alert("Please select at least one item for your outfit.");
      return;
    }
    
    onSaveOutfit({
      id: Date.now().toString(),
      name: outfitName || (isTemplate ? 'Style Template' : 'New Look'),
      itemIds: ids,
      occasion: 'Casual',
      createdAt: Date.now(),
      background: background.value,
      backgroundImage: backgroundImage || undefined,
      stickers,
      isTemplate
    });
  };

  const addSticker = (icon: string) => {
    setStickers(prev => [...prev.slice(-10), icon]);
  };

  const clearStickers = () => setStickers([]);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setBackgroundImage(base64);
        setBackground({ id: 'custom', value: 'transparent', label: 'Custom', style: {} });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-[40] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-50">
        <button onClick={onCancel} className="p-2 -ml-2 text-black">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => handleSave(true)} 
            className="bg-gray-100 text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all"
          >
            Save Template
          </button>
          <button 
            onClick={() => handleSave(false)} 
            className="bg-[#7000FF] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            Save <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </header>

      {/* Canvas Area */}
      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-500" 
        style={{ 
          backgroundColor: background.value, 
          ...background.style,
          backgroundImage: backgroundImage ? `url(data:image/png;base64,${backgroundImage})` : background.style.backgroundImage,
          backgroundSize: backgroundImage ? 'cover' : background.style.backgroundSize,
          backgroundPosition: 'center'
        }}
      >
        <div className="relative w-full h-[80%] flex items-center justify-center">
          {/* Layered Items Rendering */}
          <div className="relative w-full h-full flex flex-col items-center justify-center space-y-[-20px]">
             {/* Layer Rendering Logic with Labels */}
             {/* Z-Index Hierarchy: 10:Bottoms -> 20:Shoes -> 30:Tops/Dresses -> 40:Outerwear -> 50:Accessories */}
             <CanvasPiece 
              item={items.find(i => i.id === selectedIds.Accessories)} 
              layer={5} 
              className="z-50 h-32 mb-4" 
             />
             
             <div className="relative w-full flex justify-center h-48">
               <CanvasPiece 
                item={items.find(i => i.id === selectedIds.Tops || i.id === selectedIds.Dresses)} 
                layer={3} 
                className="z-30 h-full absolute" 
               />
               <CanvasPiece 
                item={items.find(i => i.id === selectedIds.Outerwear)} 
                layer={4} 
                className="z-40 h-full absolute opacity-95" 
               />
             </div>

             {!selectedIds.Dresses && (
               <CanvasPiece 
                item={items.find(i => i.id === selectedIds.Bottoms)} 
                layer={1} 
                className="z-10 h-64 -mt-10" 
               />
             )}

             <CanvasPiece 
              item={items.find(i => i.id === selectedIds.Shoes)} 
              layer={2} 
              className="z-20 h-20 -mt-8" 
             />
          </div>

          {/* Stickers */}
          <div className="absolute inset-0 pointer-events-none">
            {stickers.map((s, i) => (
              <div 
                key={i} 
                className="absolute text-5xl animate-in zoom-in drop-shadow-lg" 
                style={{ 
                    top: `${15 + (i % 5) * 15}%`, 
                    left: i < 5 ? `${10 + i * 5}%` : undefined,
                    right: i >= 5 ? `${10 + (i-5) * 5}%` : undefined,
                    transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (i * 10)}deg)`
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Sub-Menu Area */}
      {activeSubMenu && (
        <div className="bg-white px-6 py-4 animate-in slide-in-from-bottom border-t border-gray-50 max-h-56 overflow-y-auto hide-scrollbar shadow-inner">
            {activeSubMenu === 'background' && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Backdrop Style</span>
                        <div className="flex gap-4">
                          <input type="file" ref={bgInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
                          <button onClick={() => bgInputRef.current?.click()} className="text-[10px] font-black uppercase text-[#7000FF] border-b-2 border-[#7000FF]">Upload Image</button>
                          <button onClick={() => setActiveSubMenu(null)} className="text-[10px] font-black uppercase text-gray-900">Done</button>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                        {BACKGROUNDS.map(bg => (
                            <button 
                                key={bg.id} 
                                onClick={() => { setBackground(bg); setBackgroundImage(null); }}
                                className={`flex-shrink-0 flex flex-col items-center gap-2 group`}
                            >
                                <div 
                                    className={`w-12 h-12 rounded-2xl border-2 transition-all shadow-sm ${background.id === bg.id && !backgroundImage ? 'border-black scale-110 shadow-md' : 'border-transparent'}`}
                                    style={{ backgroundColor: bg.value, ...bg.style }}
                                />
                                <span className={`text-[8px] font-black uppercase tracking-widest ${background.id === bg.id ? 'text-black' : 'text-gray-400'}`}>{bg.label}</span>
                            </button>
                        ))}
                        {backgroundImage && (
                          <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-2xl border-2 border-black scale-110 shadow-md overflow-hidden">
                              <img src={`data:image/png;base64,${backgroundImage}`} className="w-full h-full object-cover" alt="Custom" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-black">Custom</span>
                          </div>
                        )}
                    </div>
                </div>
            )}

            {activeSubMenu === 'stickers' && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Add Spark</span>
                        <div className="flex gap-3">
                            <button onClick={clearStickers} className="text-[10px] font-black uppercase text-red-500">Clear</button>
                            <button onClick={() => setActiveSubMenu(null)} className="text-[10px] font-black uppercase text-gray-900">Done</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {STICKER_PACKS.map(pack => (
                            <div key={pack.name} className="flex gap-3 overflow-x-auto hide-scrollbar">
                                {pack.icons.map(icon => (
                                    <button 
                                        key={icon} 
                                        onClick={() => addSticker(icon)}
                                        className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-2xl hover:bg-gray-100 active:scale-90 transition-all"
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Main Control Bar */}
      <div className="bg-white border-t border-gray-100 p-6 pb-12 z-50 shadow-2xl">
        <div className="flex justify-between items-center gap-4">
          <ControlBtn 
            label="Wardrobe" 
            active={isDrawerOpen}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>} 
            onClick={() => { setActiveSubMenu(null); setIsDrawerOpen(true); }} 
          />
          <ControlBtn 
            label="Stickers" 
            active={activeSubMenu === 'stickers'}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
            onClick={() => { setActiveSubMenu(activeSubMenu === 'stickers' ? null : 'stickers'); setIsDrawerOpen(false); }} 
          />
          <ControlBtn 
            label="Backdrop" 
            active={activeSubMenu === 'background'}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} 
            onClick={() => { setActiveSubMenu(activeSubMenu === 'background' ? null : 'background'); setIsDrawerOpen(false); }}
          />
          <ControlBtn 
            label="Template" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" /></svg>} 
            onClick={() => { setOutfitName('Style Template #'+Math.floor(Math.random()*1000)); }} 
          />
        </div>
        
        <input 
          type="text" 
          placeholder="Name this look..."
          value={outfitName}
          onChange={(e) => setOutfitName(e.target.value)}
          className="w-full mt-6 bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-black outline-none placeholder:text-gray-300 shadow-inner"
        />
      </div>

      {/* Clothes Selection Drawer */}
      <ClothesDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        items={items}
        selectedIds={selectedIds}
        drawerCategory={drawerCategory}
        setDrawerCategory={setDrawerCategory}
        handleToggleItem={handleToggleItem}
        filteredItems={filteredItems}
      />
    </div>
  );
};

// Extracted Sub-components for Cleanliness
const ClothesDrawer: React.FC<any> = ({ isOpen, onClose, items, selectedIds, drawerCategory, setDrawerCategory, handleToggleItem, filteredItems }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[60] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-[3rem] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
             <div className="p-8 pb-4 flex flex-col gap-6">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" onClick={onClose} />
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black italic">My Wardrobe</h3>
                  <button onClick={onClose} className="bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Done</button>
                </div>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {['All', ...CATEGORIES].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setDrawerCategory(cat as any)}
                      className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${drawerCategory === cat ? 'bg-[#7000FF] text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
             </div>
             <div className="flex-1 overflow-y-auto px-8 pb-32 hide-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                   {filteredItems.map(item => (
                     <div 
                      key={item.id} 
                      onClick={() => handleToggleItem(item.category, item.id)}
                      className={`relative bg-[#F8F8F8] rounded-3xl p-5 aspect-square flex items-center justify-center border-2 transition-all group ${selectedIds[item.category] === item.id ? 'border-[#7000FF] bg-white shadow-xl' : 'border-transparent'}`}
                     >
                       <img src={`data:image/png;base64,${item.imageUrl}`} className="max-h-full max-w-full object-contain mix-blend-multiply" alt="Piece" />
                       <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedIds[item.category] === item.id ? 'bg-[#7000FF] border-[#7000FF]' : 'bg-white/50 border-gray-100'}`}>
                         {selectedIds[item.category] === item.id && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                       </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
    );
};

const CanvasPiece: React.FC<{ item?: ClothingItem, className?: string, layer: number }> = ({ item, className, layer }) => {
  if (!item) return null;
  return (
    <div className={`flex items-center justify-center animate-in zoom-in duration-500 group/item relative ${className}`}>
      <img src={`data:image/png;base64,${item.imageUrl}`} className="max-h-full max-w-full object-contain drop-shadow-2xl" alt="Look Part" />
      
      {/* Visual Layer Indicator (Outline & Label) */}
      <div className="absolute inset-0 border-2 border-[#7000FF] border-dashed rounded-3xl opacity-0 group-hover/item:opacity-40 transition-opacity pointer-events-none" />
      <div className="absolute -top-2 -right-2 bg-black text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-lg">
        {layer}
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-1 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm pointer-events-none">
        <span className="text-[7px] font-black uppercase tracking-widest text-gray-500 whitespace-nowrap">{item.category}</span>
      </div>
    </div>
  );
};

const ControlBtn: React.FC<{ label: string, icon: React.ReactNode, onClick: () => void, active?: boolean }> = ({ label, icon, onClick, active }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-[1.5rem] border transition-all active:scale-95 shadow-sm ${active ? 'bg-black text-white border-black scale-105 shadow-md' : 'bg-white border-gray-50 text-gray-400 hover:text-black hover:border-gray-200'}`}
  >
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default OutfitBuilder;
