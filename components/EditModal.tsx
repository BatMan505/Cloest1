
import React, { useState } from 'react';
import { ClothingItem, Category } from '../types';
import { separateClothingItems } from '../services/geminiService';

interface EditModalProps {
  item: ClothingItem;
  onClose: () => void;
  onSave: (updatedItem: ClothingItem) => void;
  onSeparate?: (originalId: string, newItems: any[]) => void;
}

const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Outerwear', 'Dresses'];

const EditModal: React.FC<EditModalProps> = ({ item, onClose, onSave, onSeparate }) => {
  const [category, setCategory] = useState<Category>(item.category);
  const [color, setColor] = useState(item.color);
  const [tags, setTags] = useState(item.tags.join(', '));
  const [isSeparating, setIsSeparating] = useState(false);

  const handleSave = () => {
    const updatedItem: ClothingItem = {
      ...item,
      category,
      color,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    };
    onSave(updatedItem);
  };

  const handleSeparate = async () => {
    if (!onSeparate) return;
    setIsSeparating(true);
    try {
      const result = await separateClothingItems(item.imageUrl);
      if (result.items.length > 0) {
        onSeparate(item.id, result.items);
        onClose();
      } else {
        alert("AI couldn't find distinct pieces in this photo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error splitting items.");
    } finally {
      setIsSeparating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <h2 className="text-xl font-black italic mb-6 text-center text-gray-900 tracking-tight">Style Details</h2>
          
          <div className="aspect-square bg-[#F8F8F8] rounded-[2rem] mb-8 flex items-center justify-center border border-gray-100 relative group overflow-hidden">
            <img src={`data:image/png;base64,${item.imageUrl}`} className={`max-h-[80%] max-w-[80%] object-contain mix-blend-multiply transition-all ${isSeparating ? 'scale-110 opacity-30 grayscale blur-sm' : ''}`} alt="Item preview" />
            
            {isSeparating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                 <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-black">Splitting Layers...</p>
              </div>
            )}

            {!isSeparating && (
              <button 
                onClick={handleSeparate}
                className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                   <svg className="w-4 h-4 text-[#7000FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10V3L4 14h7v7l9-11h-7z" /></svg>
                   Split into Pieces
                </div>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#7000FF] font-black text-sm text-gray-900 italic appearance-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Color</label>
                  <input 
                    type="text" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Navy"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#7000FF] font-black text-sm text-gray-900 italic"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tags</label>
                  <input 
                    type="text" 
                    value={tags} 
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Linen"
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#7000FF] font-black text-sm text-gray-900 italic"
                  />
               </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              onClick={onClose}
              className="flex-1 py-4 px-4 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-4 px-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
