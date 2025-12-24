
import React, { useState } from 'react';
import { User, ClothingItem, Outfit } from '../types';

interface ProfileViewProps {
  user: User;
  items: ClothingItem[];
  outfits: Outfit[];
  onLogout: () => void;
  onUpdateUser?: (updated: User) => void;
}

const AESTHETICS = ['Minimalist', 'Streetwear', 'Avant-Garde', 'Vintage', 'Quiet Luxury', 'Boho', 'Gorpcore'];

const ProfileView: React.FC<ProfileViewProps> = ({ user, items, outfits, onLogout, onUpdateUser }) => {
  const [selectedAesthetics, setSelectedAesthetics] = useState<string[]>(user.preferences?.aesthetics || []);

  const toggleAesthetic = (tag: string) => {
    const updated = selectedAesthetics.includes(tag)
      ? selectedAesthetics.filter(t => t !== tag)
      : [...selectedAesthetics, tag];
    
    setSelectedAesthetics(updated);
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        preferences: {
          ...user.preferences!,
          aesthetics: updated
        }
      });
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 p-8 space-y-10 pb-40">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-6 pt-6">
        <div className="relative">
          <div className="w-32 h-32 bg-[#F8F8F8] rounded-[3.5rem] border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
             {user.avatar ? (
               <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
             ) : (
               <span className="text-4xl font-black italic text-[#7000FF]">{user.username.charAt(0).toUpperCase()}</span>
             )}
          </div>
          <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
          </button>
        </div>
        <div>
          <h2 className="text-3xl font-black italic text-gray-900 tracking-tight">{user.username}</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">{user.email}</p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Wardrobe" value={items.length} unit="Pieces" />
        <StatCard label="Activity" value={outfits.length} unit="Looks" />
      </div>

      {/* Style Identity Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Style Identity</h3>
          <span className="text-[8px] font-black text-[#7000FF] uppercase bg-purple-50 px-3 py-1 rounded-full">Pro Analysis</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AESTHETICS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleAesthetic(tag)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                selectedAesthetics.includes(tag)
                  ? 'bg-black text-white border-black shadow-lg scale-105'
                  : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] px-2 mb-4">Account Config</h3>
        <SettingsItem label="Personal Edit" subLabel="Update email and password" icon="👤" />
        <SettingsItem label="Styling Rules" subLabel="Manage AI preferences" icon="⚡" />
        <SettingsItem label="Integrations" subLabel="Sync with retailer accounts" icon="🔗" />
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-5 border-2 border-red-50 text-[11px] font-black text-red-500 uppercase tracking-[0.3em] rounded-[2rem] hover:bg-red-50 transition-all active:scale-95"
      >
        Terminate Session
      </button>

      <div className="text-center">
        <p className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.8em]">End of Protocol</p>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, unit: string }> = ({ label, value, unit }) => (
  <div className="bg-white p-7 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
    <div className="text-4xl font-black italic text-gray-900 mb-1">{value}</div>
    <div className="text-[9px] font-black uppercase tracking-widest text-[#7000FF] mb-2">{unit}</div>
    <div className="text-[8px] font-bold uppercase tracking-widest text-gray-300">{label}</div>
  </div>
);

const SettingsItem: React.FC<{ label: string, subLabel: string, icon: string }> = ({ label, subLabel, icon }) => (
  <button className="w-full flex items-center gap-5 p-5 bg-gray-50 rounded-[2.5rem] hover:bg-white hover:shadow-xl hover:scale-[1.02] border border-transparent hover:border-gray-100 transition-all text-left group">
    <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-[#7000FF] group-hover:text-white transition-colors">{icon}</div>
    <div className="flex-1">
      <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">{label}</h4>
      <p className="text-[9px] font-bold text-gray-400 mt-0.5">{subLabel}</p>
    </div>
    <svg className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
  </button>
);

export default ProfileView;
