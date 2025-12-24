
import React, { useState } from 'react';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'welcome' | 'signin' | 'signup';

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email,
      username: username || email.split('@')[0],
      joinedAt: Date.now(),
      preferences: {
        aesthetics: ['Minimalist'],
        favoriteColors: ['Black', 'White']
      }
    };
    onLogin(mockUser);
  };

  const handleSocialLogin = (platform: string) => {
    const mockUser: User = {
      id: `user_${platform.toLowerCase()}_${Math.random().toString(36).substr(2, 9)}`,
      email: `${platform.toLowerCase()}@example.com`,
      username: `${platform} User`,
      joinedAt: Date.now(),
      preferences: {
        aesthetics: ['Streetwear'],
        favoriteColors: ['Neutral']
      }
    };
    onLogin(mockUser);
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col bg-white px-10 pt-20 pb-12 animate-in fade-in duration-1000">
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-12 animate-in slide-in-from-bottom duration-700 delay-150">
            <h1 className="text-6xl font-black italic tracking-tighter text-black mb-6 leading-none">
              Closet<span className="text-[#7000FF]">AI</span>
            </h1>
            <p className="text-xl font-bold text-gray-900 leading-tight mb-2">Your intentional wardrobe journey starts here.</p>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Digital Styling Protocol v1.5</p>
          </div>

          <div className="space-y-4 animate-in slide-in-from-bottom duration-700 delay-300">
            <div className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
              <span className="text-2xl mt-1">🧠</span>
              <div>
                <h3 className="text-sm font-black italic">AI Stylist</h3>
                <p className="text-[10px] font-bold text-gray-500 leading-relaxed">Deep analysis of your style DNA using Gemini Pro.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
              <span className="text-2xl mt-1">✨</span>
              <div>
                <h3 className="text-sm font-black italic">Visual Canvas</h3>
                <p className="text-[10px] font-bold text-gray-500 leading-relaxed">Create and save professional-grade outfit templates.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 animate-in slide-in-from-bottom duration-700 delay-500">
          <button 
            onClick={() => setStep('signup')}
            className="w-full py-5 bg-black text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
          >
            Get Started
          </button>
          <button 
            onClick={() => setStep('signin')}
            className="w-full py-5 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]"
          >
            I have an account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white px-10 pt-20 pb-12 animate-in fade-in duration-500 overflow-y-auto hide-scrollbar">
      <div className="mb-12">
        <button onClick={() => setStep('welcome')} className="mb-8 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-4xl font-black italic tracking-tighter text-black mb-3">
          {step === 'signin' ? 'Sign In' : 'Join'}
        </h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] leading-relaxed">
          {step === 'signin' ? 'Enter your style vault.' : 'Configure your styling identity.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 'signup' && (
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-2">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-purple-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-0 outline-none transition-all shadow-inner"
              placeholder="StyleEnthusiast"
            />
          </div>
        )}
        
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-purple-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-0 outline-none transition-all shadow-inner"
            placeholder="hello@closetai.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-2">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-purple-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-0 outline-none transition-all shadow-inner"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit"
          className="w-full py-5 purple-gradient-btn text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-purple-100 mt-6 active:scale-[0.98] transition-all"
        >
          {step === 'signin' ? 'Unlock Closet' : 'Create Identity'}
        </button>
      </form>

      <div className="my-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Connect With</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleSocialLogin('Google')}
          className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 active:scale-95 transition-all group"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Google</span>
        </button>

        <button 
          onClick={() => handleSocialLogin('Facebook')}
          className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 active:scale-95 transition-all group"
        >
          <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Facebook</span>
        </button>
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={() => setStep(step === 'signin' ? 'signup' : 'signin')}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7000FF] border-b-2 border-transparent hover:border-purple-100 transition-all"
        >
          {step === 'signin' ? "Need an identity? Join" : "Already styling? Sign In"}
        </button>
      </div>
    </div>
  );
};

export default AuthView;
