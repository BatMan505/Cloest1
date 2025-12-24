
import React, { useState, useEffect, useCallback } from 'react';
import { ClothingItem, Outfit, Category, User } from './types';
import ClosetView from './components/ClosetView';
import OutfitBuilder from './components/OutfitBuilder';
import SuggestionsView from './components/SuggestionsView';
import ShopView from './components/ShopView';
import AIHub from './components/AIHub';
import UploadModal from './components/UploadModal';
import ReportModal from './components/ReportModal';
import AuthView from './components/AuthView';
import ProfileView from './components/ProfileView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'closet' | 'hub' | 'shop' | 'profile'>('closet');
  const [closetSubTab, setClosetSubTab] = useState<'Clothes' | 'Outfits' | 'Collections'>('Clothes');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [hasProKey, setHasProKey] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('closet_user');
    const savedItems = localStorage.getItem('closet_items');
    const savedOutfits = localStorage.getItem('closet_outfits');
    
    if (savedUser) try { setUser(JSON.parse(savedUser)); } catch (e) { console.error(e); }
    if (savedItems) try { setItems(JSON.parse(savedItems) || []); } catch (e) { console.error(e); }
    if (savedOutfits) try { setOutfits(JSON.parse(savedOutfits) || []); } catch (e) { console.error(e); }

    const checkKey = async () => {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasProKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasProKey(true);
  };

  useEffect(() => {
    if (user) localStorage.setItem('closet_user', JSON.stringify(user));
    else localStorage.removeItem('closet_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('closet_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('closet_outfits', JSON.stringify(outfits));
  }, [outfits]);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.clear();
    window.location.reload();
  }, []);

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (!user) {
    return (
      <div className="w-full max-w-[430px] h-screen bg-white">
        <AuthView onLogin={setUser} />
      </div>
    );
  }

  const handleAddItem = (newItem: ClothingItem) => {
    setItems(prev => [newItem, ...prev]);
    setActiveTab('closet');
    setClosetSubTab('Clothes');
  };

  const handleUpdateItem = (updatedItem: ClothingItem) => {
    setItems(prev => (prev || []).map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => (prev || []).filter(item => item.id !== id));
  };

  const handleDeleteOutfit = (id: string) => {
    setOutfits(prev => (prev || []).filter(outfit => outfit.id !== id));
  };

  const handleSaveOutfit = (newOutfit: Outfit) => {
    setOutfits(prev => [newOutfit, ...(prev || [])]);
    setIsCanvasOpen(false);
    setActiveTab('closet');
    setClosetSubTab('Outfits');
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-[430px] bg-white border-x border-gray-100 relative shadow-2xl overflow-hidden">
      <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white z-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter italic">
          {activeTab === 'closet' && 'Fits'}
          {activeTab === 'hub' && 'Lab'}
          {activeTab === 'shop' && 'Shop'}
          {activeTab === 'profile' && 'Me'}
        </h1>
        <div className="flex gap-4">
           {!hasProKey && (
             <button onClick={handleSelectKey} className="text-[8px] font-black uppercase text-white bg-[#7000FF] px-3 py-1.5 rounded-full shadow-lg">Activate Pro</button>
           )}
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="text-gray-400 p-2.5 hover:text-[#7000FF] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
        {activeTab === 'closet' && (
          <ClosetView 
            items={items} 
            outfits={outfits} 
            activeSubTab={closetSubTab}
            onSubTabChange={setClosetSubTab}
            onDeleteItem={handleDeleteItem}
            onDeleteOutfit={handleDeleteOutfit}
            onUpdateItem={handleUpdateItem}
          />
        )}
        {activeTab === 'hub' && <AIHub />}
        {activeTab === 'shop' && <ShopView items={items} />}
        {activeTab === 'profile' && (
          <ProfileView 
            user={user} 
            items={items} 
            outfits={outfits} 
            onLogout={handleLogout} 
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      {isActionMenuOpen && (
        <div className="absolute inset-0 z-40 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsActionMenuOpen(false)} />
          <div className="absolute bottom-32 left-8 right-8 bg-white rounded-[2.5rem] p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
             <ActionMenuItem 
               label="Add clothes" 
               icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
               onClick={() => { setIsUploadModalOpen(true); setIsActionMenuOpen(false); }}
             />
             <ActionMenuItem 
               label="Create outfit" 
               icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
               onClick={() => { setIsCanvasOpen(true); setIsActionMenuOpen(false); }}
             />
          </div>
        </div>
      )}

      <nav className="absolute bottom-8 left-6 right-6 h-20 bg-black/95 backdrop-blur-xl rounded-[2.5rem] px-2 flex justify-between items-center z-[35] shadow-2xl">
        <NavButton 
          active={activeTab === 'closet'} 
          onClick={() => setActiveTab('closet')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
          label="Fits"
        />
        <NavButton 
          active={activeTab === 'hub'} 
          onClick={() => setActiveTab('hub')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          label="AI Lab"
        />
        <button 
          onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transform transition-all active:scale-95 shadow-xl ${isActionMenuOpen ? 'bg-white text-black rotate-45' : 'bg-[#7000FF] text-white'}`}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M12 4v16m8-8H4" /></svg>
        </button>
        <NavButton 
          active={activeTab === 'shop'} 
          onClick={() => setActiveTab('shop')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          label="Shop"
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          label="Me"
        />
      </nav>

      {isCanvasOpen && <OutfitBuilder items={items} onSaveOutfit={handleSaveOutfit} onCancel={() => setIsCanvasOpen(false)} />}
      {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onAdd={handleAddItem} />}
      {isReportModalOpen && <ReportModal onClose={() => setIsReportModalOpen(false)} />}
    </div>
  );
};

const ActionMenuItem: React.FC<{ label: string, icon: React.ReactNode, onClick: () => void }> = ({ label, icon, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 rounded-2xl hover:bg-gray-50 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-[#7000FF] group-hover:text-white transition-all">{icon}</div>
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">{label}</span>
    </div>
    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
  </button>
);

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-[#7000FF] scale-105' : 'text-gray-500 hover:text-gray-400'}`}>
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
