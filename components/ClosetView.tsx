
import React, { useState, useMemo } from 'react';
import { ClothingItem, Outfit } from '../types';
import EditModal from './EditModal';

interface ClosetViewProps {
  items: ClothingItem[];
  outfits: Outfit[];
  activeSubTab?: 'Clothes' | 'Outfits' | 'Collections';
  onSubTabChange?: (tab: 'Clothes' | 'Outfits' | 'Collections') => void;
  onDeleteItem: (id: string) => void;
  onDeleteOutfit?: (id: string) => void;
  onUpdateItem: (item: ClothingItem) => void;
}

const SEASONS = ['All', 'Spring', 'Summer', 'Fall', 'Winter'];

const ClosetView: React.FC<ClosetViewProps> = ({ 
  items = [], 
  outfits = [], 
  activeSubTab = 'Clothes', 
  onSubTabChange, 
  onDeleteItem, 
  onDeleteOutfit,
  onUpdateItem 
}) => {
  const [itemToEdit, setItemToEdit] = useState<ClothingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);
  const [outfitToDelete, setOutfitToDelete] = useState<Outfit | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [showOnlyTemplates, setShowOnlyTemplates] = useState(false);

  const confirmDelete = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const confirmDeleteOutfit = () => {
    if (outfitToDelete && onDeleteOutfit) {
      onDeleteOutfit(outfitToDelete.id);
      setOutfitToDelete(null);
    }
  };

  const handleTabClick = (tab: 'Clothes' | 'Outfits' | 'Collections') => {
    if (onSubTabChange) onSubTabChange(tab);
  };

  const filteredItems = useMemo(() => {
    if (selectedSeason === 'All') return items;
    return items.filter(item => item.season && item.season.includes(selectedSeason));
  }, [items, selectedSeason]);

  const filteredOutfits = useMemo(() => {
    if (showOnlyTemplates) return (outfits || []).filter(o => o.isTemplate);
    return outfits || [];
  }, [outfits, showOnlyTemplates]);

  return (
    <div className="animate-in fade-in duration-700">
      {/* Tab Switcher */}
      <div className="px-6 flex gap-8 border-b border-gray-50 mb-6 sticky top-0 bg-white z-20 pt-2">
        {['Clothes', 'Outfits', 'Collections'].map((tab) => (
          <button 
            key={tab}
            onClick={() => handleTabClick(tab as any)}
            className={`pb-4 text-sm font-black transition-all relative ${activeSubTab === tab ? 'text-black' : 'text-gray-300'}`}
          >
            {tab}
            {activeSubTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" />}
          </button>
        ))}
      </div>

      {activeSubTab === 'Clothes' && (
        <>
          {/* Season Filter Bar */}
          <div className="px-6 mb-6 flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {SEASONS.map(season => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedSeason === season 
                    ? 'bg-black text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-400 hover:text-gray-600'
                }`}
              >
                {season}
              </button>
            ))}
          </div>

          {filteredItems && filteredItems.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 px-6 pb-32">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className="group relative bg-[#F8F8F8] rounded-2xl p-3 flex items-center justify-center aspect-square transition-all hover:bg-white hover:shadow-xl hover:scale-[1.02] border border-transparent hover:border-gray-100 overflow-hidden"
                >
                  <img 
                    src={`data:image/png;base64,${item.imageUrl}`} 
                    alt={item.category} 
                    className="max-h-[90%] max-w-[90%] object-contain mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => setItemToEdit(item)} className="p-2 bg-white rounded-full text-black shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => setItemToDelete(item)} className="p-2 bg-white rounded-full text-red-500 shadow-lg hover:animate-bounce">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 px-12 text-center text-gray-300">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
               </div>
               <h3 className="text-sm font-black uppercase tracking-widest mb-2">
                 {selectedSeason === 'All' ? 'Wardrobe is empty' : `No ${selectedSeason} pieces`}
               </h3>
               <p className="text-[10px] font-bold leading-relaxed">
                 {selectedSeason === 'All' 
                   ? 'Import pieces to start building outfits on the canvas.' 
                   : `Try scanning more clothes to fill your ${selectedSeason.toLowerCase()} edit.`}
               </p>
            </div>
          )}
        </>
      )}

      {activeSubTab === 'Outfits' && (
        <div className="px-6 space-y-4 pb-32">
          {/* Template Toggle */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">My Looks</h3>
            <button 
              onClick={() => setShowOnlyTemplates(!showOnlyTemplates)}
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${showOnlyTemplates ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
            >
              Templates {showOnlyTemplates ? 'On' : 'Off'}
            </button>
          </div>

          {filteredOutfits && filteredOutfits.length > 0 ? filteredOutfits.map(outfit => (
            <div 
              key={outfit.id} 
              className={`bg-gray-50 rounded-[2.5rem] p-6 hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-gray-100 relative group overflow-hidden`} 
              style={{ 
                background: outfit.background,
                backgroundImage: outfit.backgroundImage ? `url(data:image/png;base64,${outfit.backgroundImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-xl font-black italic text-gray-900 drop-shadow-sm">{outfit.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {outfit.stickers?.map((s, i) => <span key={i} className="text-sm drop-shadow-md">{s}</span>)}
                    {outfit.isTemplate && <span className="text-[8px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded-full">Template</span>}
                  </div>
                </div>
                <button 
                  onClick={() => setOutfitToDelete(outfit)}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <div className="flex -space-x-4 relative z-10">
                {(outfit.itemIds || []).slice(0, 4).map((id, idx) => {
                  const item = (items || []).find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl p-2 border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-105" style={{ zIndex: 4 - idx }}>
                      <img src={`data:image/png;base64,${item.imageUrl}`} alt="piece" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    </div>
                  );
                })}
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-32 px-12 text-center text-gray-300">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               </div>
               <h3 className="text-sm font-black uppercase tracking-widest mb-2">
                 {showOnlyTemplates ? 'No templates saved' : 'No outfits created'}
               </h3>
               <p className="text-[10px] font-bold leading-relaxed">
                 {showOnlyTemplates ? 'Save your favorite look structures as templates to reuse them.' : 'Head over to the styling canvas to create your first look.'}
               </p>
            </div>
          )}
        </div>
      )}

      {/* Item Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-lg animate-in fade-in duration-300" onClick={() => setItemToDelete(null)} />
          <div className="relative bg-white w-full max-w-[320px] rounded-[3.5rem] shadow-2xl p-10 animate-in zoom-in duration-300 text-center">
            <div className="w-32 h-32 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-inner overflow-hidden">
               <img src={`data:image/png;base64,${itemToDelete.imageUrl}`} className="max-h-[80%] max-w-[80%] object-contain mix-blend-multiply" alt="preview" />
            </div>
            <h3 className="text-2xl font-black italic mb-3 text-gray-900 tracking-tight">Remove Piece?</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed mb-10">This will permanently erase this {itemToDelete.category.toLowerCase()} from your wardrobe.</p>
            <div className="space-y-3">
              <button 
                onClick={confirmDelete} 
                className="w-full py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Permanently Delete
              </button>
              <button 
                onClick={() => setItemToDelete(null)} 
                className="w-full py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outfit Delete Confirmation Modal */}
      {outfitToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-lg animate-in fade-in duration-300" onClick={() => setOutfitToDelete(null)} />
          <div className="relative bg-white w-full max-w-[320px] rounded-[3.5rem] shadow-2xl p-10 animate-in zoom-in duration-300 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-2xl font-black italic mb-3 text-gray-900 tracking-tight">Delete Look?</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed mb-10">"{outfitToDelete.name}" will be removed. Your clothes will remain safe.</p>
            <div className="space-y-3">
              <button 
                onClick={confirmDeleteOutfit} 
                className="w-full py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Delete Outfit
              </button>
              <button 
                onClick={() => setOutfitToDelete(null)} 
                className="w-full py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                Keep Look
              </button>
            </div>
          </div>
        </div>
      )}

      {itemToEdit && (
        <EditModal 
          item={itemToEdit} 
          onClose={() => setItemToEdit(null)} 
          onSave={(updated) => { onUpdateItem(updated); setItemToEdit(null); }} 
        />
      )}
    </div>
  );
};

export default ClosetView;
