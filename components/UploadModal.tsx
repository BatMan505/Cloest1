
import React, { useState, useRef } from 'react';
import { analyzeClothingImage, cleanImageBackground, separateClothingItems } from '../services/geminiService';
import { ClothingItem, Category } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onAdd: (item: ClothingItem) => void;
}

const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Outerwear', 'Dresses'];

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onAdd }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'batch-review' | 'edit-batch-item'>('upload');
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [cleanedImage, setCleanedImage] = useState<string | null>(null);
  const [batchItems, setBatchItems] = useState<any[]>([]);
  const [editingBatchIndex, setEditingBatchIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<'cleaning' | 'analyzing' | 'separating' | 'cooldown'>('cleaning');
  
  const [category, setCategory] = useState<Category>('Tops');
  const [color, setColor] = useState('');
  const [tags, setTags] = useState('');
  const [season, setSeason] = useState<string[]>([]);
  const [occasion, setOccasion] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage((reader.result as string).split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startProcessing = async () => {
    if (!originalImage) return;
    setStep('processing');
    
    try {
      if (isMultiMode) {
        setStatus('separating');
        const results = await separateClothingItems(originalImage);
        setBatchItems(results.items || []);
        setStep('batch-review');
      } else {
        setStatus('cleaning');
        const cleanB64 = await cleanImageBackground(originalImage);
        
        setStatus('cooldown');
        // The service automatically handles the 12s gap, but UI should reflect it
        
        setStatus('analyzing');
        const analysis = await analyzeClothingImage(originalImage);
        
        setCleanedImage(cleanB64);
        setCategory(analysis.category || 'Tops');
        setColor(analysis.color || '');
        setTags(analysis.tags?.join(', ') || '');
        setSeason(analysis.season || []);
        setOccasion(analysis.occasion || []);
        setStep('review');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.message?.toLowerCase() || "";
      if (msg.includes("quota") || msg.includes("429")) {
        alert("Daily style limit reached. Please wait a minute before analyzing more pieces.");
      } else {
        alert("Style lab encountered an error. Please try again.");
      }
      setStep('upload');
    }
  };

  const handleFinalAdd = () => {
    if (!cleanedImage) return;
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      imageUrl: cleanedImage,
      category,
      color,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      season,
      occasion,
      createdAt: Date.now()
    };
    onAdd(newItem);
    onClose();
  };

  const handleBatchAdd = () => {
    batchItems.forEach((item, index) => {
      const newItem: ClothingItem = {
        id: (Date.now() + index).toString(),
        imageUrl: item.image,
        category: item.category || 'Tops',
        color: item.color || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        season: Array.isArray(item.season) ? item.season : [],
        occasion: Array.isArray(item.occasion) ? item.occasion : [],
        createdAt: Date.now()
      };
      onAdd(newItem);
    });
    onClose();
  };

  const openItemEditor = (index: number) => {
    setEditingBatchIndex(index);
    const item = batchItems[index];
    setCategory(item.category || 'Tops');
    setColor(item.color || '');
    setTags(Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''));
    setSeason(item.season || []);
    setOccasion(item.occasion || []);
    setStep('edit-batch-item');
  };

  const saveEditedBatchItem = () => {
    if (editingBatchIndex === null) return;
    const updated = [...batchItems];
    updated[editingBatchIndex] = {
      ...updated[editingBatchIndex],
      category,
      color,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      season,
      occasion
    };
    setBatchItems(updated);
    setStep('batch-review');
    setEditingBatchIndex(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[430px] h-[95vh] sm:h-auto sm:max-h-[90vh] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
        
        {step === 'upload' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-8 pb-4 flex justify-between items-center bg-white">
              <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <h2 className="text-lg font-black tracking-tight text-gray-900">Add Clothes</h2>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-4 hide-scrollbar">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[350px] bg-gray-50 rounded-[2.5rem] mb-6 flex flex-col items-center justify-center cursor-pointer border border-gray-100 overflow-hidden group relative shadow-inner"
              >
                {originalImage ? (
                  <img src={`data:image/png;base64,${originalImage}`} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/5 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                    </div>
                    <h3 className="text-xl font-black italic mb-2">Import Photo</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Gallery or Camera</p>
                  </div>
                )}
              </div>

              <div 
                className="flex items-center justify-between bg-gray-50 p-6 rounded-[2rem] border border-transparent hover:border-purple-200 transition-colors cursor-pointer group mb-4" 
                onClick={() => setIsMultiMode(!isMultiMode)}
              >
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Multi-Piece Scan</span>
                    <span className="text-[9px] font-bold text-gray-400 group-hover:text-gray-500 transition-colors">Respects rate limits (slow & steady)</span>
                 </div>
                 <div className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${isMultiMode ? 'bg-[#7000FF]' : 'bg-gray-200'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isMultiMode ? 'left-7' : 'left-1'}`} />
                 </div>
              </div>
            </div>

            <div className="px-8 pb-10 pt-4 bg-white border-t border-gray-50">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button onClick={startProcessing} disabled={!originalImage} className="w-full py-5 purple-gradient-btn text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-purple-200 disabled:opacity-30 transition-all active:scale-[0.98]">Analyze Piece</button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-8 h-full flex flex-col items-center justify-center flex-1 bg-white animate-in fade-in duration-500">
            <div className="w-full aspect-[3/4] max-w-[300px] bg-gray-50 rounded-[3rem] relative flex items-center justify-center mb-12 overflow-hidden border border-gray-100 shadow-2xl">
              <img src={`data:image/png;base64,${originalImage}`} className="w-full h-full object-cover opacity-60 grayscale" alt="Processing" />
              <div className="scanner-line" style={{ animationDuration: '1.5s' }} />
            </div>
            
            <div className="text-center">
              <h3 className="text-3xl font-black italic mb-3 tracking-tighter">AI is Styling...</h3>
              <p className="text-[10px] font-black text-[#7000FF] uppercase tracking-[0.4em] animate-pulse">
                {status === 'separating' ? 'DETECTION IN PROGRESS' : status === 'cooldown' ? 'COOLING DOWN (RATE LIMIT)' : status === 'cleaning' ? 'REMOVING BACKDROP' : 'FINAL STYLE REPORT'}
              </p>
              <p className="text-[8px] font-bold text-gray-300 mt-4 uppercase tracking-widest">Processing sequentially (12s gap per step) for stability</p>
            </div>
          </div>
        )}

        {(step === 'review' || step === 'edit-batch-item') && (
          <div className="p-8 flex-1 flex flex-col hide-scrollbar overflow-y-auto">
             <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur z-10 py-2">
              <button onClick={() => step === 'review' ? setStep('upload') : setStep('batch-review')} className="p-2 -ml-2 text-gray-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <h2 className="text-lg font-black tracking-tight">{step === 'review' ? 'Style Report' : 'Edit Piece'}</h2>
              <button onClick={step === 'review' ? handleFinalAdd : saveEditedBatchItem} className="text-[#7000FF] font-black text-xs uppercase tracking-widest px-4 py-2 bg-purple-50 rounded-full transition-all active:scale-95">{step === 'review' ? 'Add Piece' : 'Save Piece'}</button>
            </div>
            
            <div className="aspect-square bg-[#F8F8F8] rounded-[3.5rem] mb-10 flex items-center justify-center p-12 border border-gray-100 shadow-inner overflow-hidden">
              <img src={`data:image/png;base64,${step === 'review' ? cleanedImage : batchItems[editingBatchIndex!]?.image}`} className="max-h-full max-w-full object-contain mix-blend-multiply" alt="Current" />
            </div>

            <div className="space-y-1">
              <DetailField label="Category" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}>
                  <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-transparent font-black text-gray-900 focus:ring-0 p-0 text-sm italic outline-none cursor-pointer">
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
              </DetailField>
              <DetailField label="Color Palette" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}>
                  <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-full bg-transparent font-black text-gray-900 focus:ring-0 p-0 text-sm italic outline-none" placeholder="Enter color..." />
              </DetailField>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailField: React.FC<{ label: string, icon: React.ReactNode, children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="flex items-center gap-5 py-6 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/50 px-3 rounded-2xl">
    <span className="w-12 h-12 rounded-[1.25rem] bg-[#F8F8F8] flex items-center justify-center text-[#7000FF] shadow-sm border border-gray-100 shrink-0">{icon}</span>
    <div className="flex-1 overflow-hidden">
      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5">{label}</p>
      {children}
    </div>
  </div>
);

export default UploadModal;
