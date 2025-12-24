
import React, { useState } from 'react';
import { ReportType } from '../types';

interface ReportModalProps {
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose }) => {
  const [type, setType] = useState<ReportType>('AI Mistake');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    // In a real app, this would be sent to a backend
    console.log('Report submitted:', { type, description, timestamp: Date.now() });
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          {!isSubmitted ? (
            <>
              <h2 className="text-2xl font-black italic mb-2">Support & Feedback</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">Report an issue or suggest a feature</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {(['Bug', 'AI Mistake', 'Feature Suggestion', 'Other'] as ReportType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                          type === t ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-400 border-transparent hover:border-gray-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us what happened..."
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#7000FF] font-medium text-sm h-32 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-[#7000FF] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-black italic mb-2">Received!</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Our style team is on it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
