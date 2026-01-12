import React, { useState } from 'react';
import { KAOMOJI_CATEGORIES } from '../constants';

const KaomojiLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(KAOMOJI_CATEGORIES[0].name);
  const [copiedKaomoji, setCopiedKaomoji] = useState<string | null>(null);

  const currentCategory = KAOMOJI_CATEGORIES.find(c => c.name === selectedCategory) || KAOMOJI_CATEGORIES[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKaomoji(text);
    setTimeout(() => setCopiedKaomoji(null), 1500);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Categories */}
      <div className="bg-terminal-paper p-4 rounded-xl border border-slate-700 flex gap-2 overflow-x-auto custom-scrollbar">
        {KAOMOJI_CATEGORIES.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.name
                ? 'bg-terminal-accent text-terminal-bg shadow-lg shadow-emerald-900/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 bg-black rounded-xl border border-slate-800 p-6 overflow-y-auto custom-scrollbar">
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentCategory.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleCopy(item)}
                className="group relative h-24 bg-terminal-paper border border-slate-700 rounded-lg flex items-center justify-center hover:border-terminal-accent transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="text-lg md:text-xl font-mono text-slate-200 group-hover:text-terminal-accent text-center px-2">
                  {item}
                </span>
                
                {copiedKaomoji === item && (
                  <div className="absolute inset-0 bg-terminal-accent rounded-lg flex items-center justify-center text-terminal-bg font-bold animate-in fade-in zoom-in duration-200">
                    Copied!
                  </div>
                )}
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-terminal-accent"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </div>
              </button>
            ))}
         </div>
      </div>
    </div>
  );
};

export default KaomojiLibrary;
