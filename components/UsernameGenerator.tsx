import React, { useState } from 'react';
import { SMALL_CAPS_MAP, INVERTED_MAP, DECORATIONS, FONTS, GLITCH_CHARS } from '../constants';

interface GeneratedName {
  id: string;
  text: string;
  style: string;
  availability: 'unknown' | 'checking' | 'available' | 'taken';
}

const UsernameGenerator: React.FC = () => {
  const [baseName, setBaseName] = useState('User');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  
  // Effects
  const [useGlitch, setUseGlitch] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(1); // 1 = Low, 2 = Mid, 3 = High
  const [useIntertwined, setUseIntertwined] = useState(false);
  const [useUnderline, setUseUnderline] = useState(false);

  const [generatedList, setGeneratedList] = useState<GeneratedName[]>([]);

  // Generator Logic
  const generateVariants = () => {
    const variants: GeneratedName[] = [];
    const seed = Date.now();

    const fontStyles = [
      { id: 'normal', name: 'Normal', map: {} as Record<string, string> },
      { id: 'small_caps', name: 'Small Caps', map: SMALL_CAPS_MAP },
      { id: 'inverted', name: 'Inverted', map: INVERTED_MAP },
      { id: 'bubble', name: 'Circled / Bubble', map: FONTS.find(f => f.id === 'bubble')?.map || {} },
      { id: 'gothic', name: 'Gothic', map: FONTS.find(f => f.id === 'gothic')?.map || {} },
      { id: 'script', name: 'Script', map: FONTS.find(f => f.id === 'script')?.map || {} },
      { id: 'double_struck', name: 'Double Struck', map: FONTS.find(f => f.id === 'double_struck')?.map || {} },
    ];

    fontStyles.forEach((style, idx) => {
      let text = baseName;
      
      // 1. Font Mapping
      if (style.id === 'inverted') {
        text = text.split('').reverse().map(c => style.map[c] || c).join('');
      } else {
        text = text.split('').map(c => style.map[c] || c).join('');
      }

      // 2. Intertwined (Strikethrough)
      if (useIntertwined) {
        text = text.split('').join('\u0336') + '\u0336';
      }

      // 3. Underline
      if (useUnderline && !useIntertwined) {
         text = text.split('').join('\u0332') + '\u0332';
      }

      // 4. Glitch
      if (useGlitch) {
        text = text.split('').map(c => {
          if (c === ' ') return c;
          // Intensity determines how many combining chars per letter
          const count = Math.floor(Math.random() * glitchIntensity * 2) + 1;
          let g = '';
          for(let i=0; i<count; i++) g += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          return c + g;
        }).join('');
      }

      // 5. Decorations
      text = `${prefix}${text}${suffix}`;

      variants.push({
        id: `${style.id}-${seed}-${idx}`,
        text,
        style: style.name,
        availability: 'unknown'
      });
    });

    setGeneratedList(variants);
  };

  const checkAvailability = (id: string) => {
    setGeneratedList(prev => prev.map(item => 
      item.id === id ? { ...item, availability: 'checking' } : item
    ));

    // Simulate API delay and availability check
    setTimeout(() => {
      const isAvailable = Math.random() > 0.35; // 65% available chance
      setGeneratedList(prev => prev.map(item => 
        item.id === id ? { ...item, availability: isAvailable ? 'available' : 'taken' } : item
      ));
    }, 800 + Math.random() * 800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls Panel */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-terminal-paper p-5 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-terminal-accent font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Identity Config
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs text-terminal-muted font-mono uppercase">Base Username</label>
              <input 
                type="text" 
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-terminal-text focus:border-terminal-accent focus:outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-terminal-muted font-mono uppercase">Prefix</label>
                <select 
                  value={prefix} 
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none"
                >
                  <option value="">None</option>
                  {DECORATIONS.prefixes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-terminal-muted font-mono uppercase">Suffix</label>
                <select 
                  value={suffix} 
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none"
                >
                  <option value="">None</option>
                  {DECORATIONS.suffixes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-terminal-paper p-5 rounded-xl border border-slate-700 space-y-4">
             <h3 className="text-terminal-accent font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              FX Mixer
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-3 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useGlitch} 
                    onChange={(e) => setUseGlitch(e.target.checked)}
                    className="w-5 h-5 text-terminal-accent rounded focus:ring-terminal-accent bg-slate-900 border-slate-600"
                  />
                  <span className="font-medium">Glitch Effect</span>
                </label>
                
                {useGlitch && (
                  <div className="pl-8 pr-2">
                    <label className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Intensity</span>
                      <span>{glitchIntensity === 1 ? 'Low' : glitchIntensity === 2 ? 'Mid' : 'High'}</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      value={glitchIntensity} 
                      onChange={(e) => setGlitchIntensity(parseInt(e.target.value))}
                      className="w-full accent-terminal-accent h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors">
                <input 
                  type="checkbox" 
                  checked={useIntertwined} 
                  onChange={(e) => setUseIntertwined(e.target.checked)}
                  className="w-5 h-5 text-terminal-accent rounded focus:ring-terminal-accent bg-slate-900 border-slate-600"
                />
                <div className="flex flex-col">
                   <span className="font-medium">Intertwined</span>
                   <span className="text-xs text-slate-500">Strikethrough style</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors">
                <input 
                  type="checkbox" 
                  checked={useUnderline} 
                  onChange={(e) => setUseUnderline(e.target.checked)}
                  className="w-5 h-5 text-terminal-accent rounded focus:ring-terminal-accent bg-slate-900 border-slate-600"
                />
                <span className="font-medium">Underline</span>
              </label>
            </div>

            <button 
              onClick={generateVariants}
              className="w-full py-3 bg-terminal-accent text-terminal-bg font-bold rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
              Generate Variants
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="flex-1 bg-black rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h4 className="font-bold text-slate-300">Generated Results</h4>
            <span className="text-xs text-slate-500">{generatedList.length} variants</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {generatedList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                <p>Configure settings and hit Generate</p>
              </div>
            ) : (
              generatedList.map((item) => (
                <div key={item.id} className="group bg-terminal-paper border border-slate-700 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-center justify-between hover:border-terminal-accent transition-colors">
                   <div className="flex-1 text-center sm:text-left overflow-hidden w-full">
                     <div className="text-xs text-slate-500 mb-1">{item.style}</div>
                     <div className="text-xl md:text-2xl font-mono text-white break-all">{item.text}</div>
                   </div>

                   <div className="flex gap-3 items-center w-full sm:w-auto justify-center">
                      {/* Availability Checker */}
                      {item.availability === 'unknown' && (
                        <button 
                          onClick={() => checkAvailability(item.id)}
                          className="px-3 py-1.5 text-xs rounded bg-slate-800 text-slate-400 hover:bg-slate-700 whitespace-nowrap transition-colors"
                        >
                          Check Availability
                        </button>
                      )}
                      {item.availability === 'checking' && (
                        <span className="px-3 py-1.5 text-xs text-yellow-500 flex items-center gap-1">
                           <span className="animate-spin">↻</span> Checking...
                        </span>
                      )}
                      {item.availability === 'available' && (
                        <span className="px-3 py-1.5 text-xs text-terminal-accent bg-emerald-900/20 rounded flex items-center gap-1 font-bold animate-in zoom-in duration-200">
                           ✓ Available
                        </span>
                      )}
                      {item.availability === 'taken' && (
                        <span className="px-3 py-1.5 text-xs text-red-400 bg-red-900/20 rounded flex items-center gap-1 font-bold animate-in zoom-in duration-200">
                           ✕ Taken
                        </span>
                      )}

                      <button
                        onClick={() => copyToClipboard(item.text)}
                        className="p-2 bg-terminal-accent text-terminal-bg rounded hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/10"
                        title="Copy"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      </button>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameGenerator;
