
import React, { useState, useMemo, useEffect } from 'react';
import { SEPARATORS } from '../constants';

const SeparatorGenerator: React.FC = () => {
  const [length, setLength] = useState(15);
  const [selectedId, setSelectedId] = useState(SEPARATORS[0].id);
  
  // Customizable Parts
  const [customLeft, setCustomLeft] = useState('');
  const [customMid, setCustomMid] = useState('');
  const [customRight, setCustomRight] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addSpacing, setAddSpacing] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const selectedPattern = useMemo(() => 
    SEPARATORS.find(s => s.id === selectedId) || SEPARATORS[0], 
  [selectedId]);

  // Sync custom fields when pattern changes
  useEffect(() => {
      setCustomLeft(selectedPattern.left);
      setCustomMid(selectedPattern.mid);
      setCustomRight(selectedPattern.right);
      // Reset modifiers
      setAddSpacing(false);
      setIsMirrored(false);
  }, [selectedId, selectedPattern]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(SEPARATORS.map(s => s.category));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  // Filter patterns
  const filteredPatterns = useMemo(() => {
    return SEPARATORS.filter(sep => {
      const matchesCategory = selectedCategory === 'All' || sep.category === selectedCategory;
      const matchesSearch = sep.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  // Generate preview string for list items
  const getPreview = (sep: typeof SEPARATORS[0]) => {
      const mid = sep.repeat ? sep.mid.repeat(3) : sep.mid;
      return `${sep.left}${mid}${sep.right}`;
  };

  const output = useMemo(() => {
    // 1. Get Parts (Custom or Default)
    let left = customLeft;
    let mid = customMid;
    let right = customRight;

    // 2. Apply Spacing
    if (addSpacing && selectedPattern.repeat && mid) {
        mid = ` ${mid} `;
    }

    // 3. Mirror Logic
    if (isMirrored) {
        // Swap Left and Right
        const temp = left;
        left = right;
        right = temp;
        
        // Reverse Mid (basic string reverse)
        // Note: Complex unicode mirroring requires a mapping table, doing simple reverse here
        mid = mid.split('').reverse().join('');
        
        // Try to mirror typical directional chars
        const map: Record<string, string> = { '<': '>', '>': '<', '/': '\\', '\\': '/', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '«': '»', '»': '«' };
        mid = mid.split('').map(c => map[c] || c).join('');
        left = left.split('').map(c => map[c] || c).join('');
        right = right.split('').map(c => map[c] || c).join('');
    }

    // 4. Construct
    if (!selectedPattern.repeat) {
      // Fixed separators (One-Liners) ignore length
      return left + mid + right;
    }

    // Repeating patterns logic
    let repeated = '';
    if (mid.length > 0) {
        repeated = mid.repeat(length);
    }
    
    return left + repeated + right;
  }, [length, selectedPattern, customLeft, customMid, customRight, addSpacing, isMirrored]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectRandom = () => {
      const r = Math.floor(Math.random() * SEPARATORS.length);
      setSelectedId(SEPARATORS[r].id);
      setSelectedCategory('All'); 
  };

  return (
    <div className="flex flex-col h-full gap-4 min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0">
         
         {/* --- LEFT: LIBRARY --- */}
         <div className="w-full lg:w-96 flex flex-col gap-3 min-h-0 h-1/2 lg:h-full shrink-0">
            <div className="bg-terminal-paper p-3 rounded-xl border border-slate-700 flex flex-col gap-3 h-full overflow-hidden">
               
               {/* Search & Header */}
               <div className="shrink-0 space-y-3">
                   <div className="flex justify-between items-center">
                       <h3 className="text-terminal-accent font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/></svg>
                           Pattern Library
                       </h3>
                       <button 
                         onClick={selectRandom}
                         className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                         title="Pick Random Pattern"
                       >
                           🎲 Random
                       </button>
                   </div>
                   
                   <div className="relative">
                       <input 
                         type="text" 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="Search patterns..."
                         className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-terminal-accent focus:outline-none pl-9"
                       />
                       <svg className="absolute left-3 top-2.5 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                   </div>
               </div>

               {/* Categories */}
               <div className="flex gap-2 overflow-x-auto custom-scrollbar shrink-0 pb-1">
                   {categories.map(cat => (
                       <button
                           key={cat}
                           onClick={() => setSelectedCategory(cat)}
                           className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                               selectedCategory === cat
                               ? 'bg-terminal-accent text-terminal-bg border-terminal-accent'
                               : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                           }`}
                       >
                           {cat}
                       </button>
                   ))}
               </div>

               {/* List */}
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1">
                   {filteredPatterns.length === 0 ? (
                       <div className="text-center py-8 text-slate-500 text-sm">No patterns found.</div>
                   ) : (
                       filteredPatterns.map(sep => (
                         <button
                           key={sep.id}
                           onClick={() => setSelectedId(sep.id)}
                           className={`w-full text-left p-2 rounded-lg text-sm border transition-all group ${
                             selectedId === sep.id 
                             ? 'bg-terminal-accent/10 border-terminal-accent' 
                             : 'bg-transparent border-transparent hover:bg-slate-800'
                           }`}
                         >
                           <div className="flex justify-between items-center mb-1">
                               <span className={`text-xs font-bold ${selectedId === sep.id ? 'text-terminal-accent' : 'text-slate-400 group-hover:text-slate-200'}`}>{sep.name}</span>
                               {!sep.repeat && <span className="text-[9px] px-1 bg-slate-800 rounded text-slate-500">Fixed</span>}
                           </div>
                           <div className={`font-mono text-xs truncate opacity-80 ${selectedId === sep.id ? 'text-slate-100' : 'text-slate-500'}`}>
                              {getPreview(sep)}
                           </div>
                         </button>
                       ))
                   )}
               </div>
            </div>
         </div>

         {/* --- RIGHT: WORKBENCH --- */}
         <div className="flex-1 flex flex-col gap-4 min-h-0 h-1/2 lg:h-full">
            
            {/* Preview Card */}
            <div className="flex-1 bg-black rounded-xl border border-slate-800 flex flex-col relative group overflow-hidden shadow-2xl min-h-[200px]">
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-terminal-accent opacity-50"></div>
                
                {/* Copy Button */}
                <div className="absolute top-4 right-4 z-10">
                   <button 
                     onClick={copyToClipboard}
                     className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all transform active:scale-95 shadow-lg ${
                         copied ? 'bg-green-500 text-white' : 'bg-terminal-accent text-terminal-bg hover:bg-emerald-400'
                     }`}
                   >
                     {copied ? 'Copied!' : 'Copy'}
                   </button>
                </div>
                
                {/* Main Preview */}
                <div className="flex-1 overflow-auto custom-scrollbar flex items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 to-black">
                  <div className="text-center w-full">
                    <div className="font-mono text-emerald-400 text-lg md:text-2xl lg:text-3xl break-all leading-normal drop-shadow-[0_0_15px_rgba(16,185,129,0.2)] whitespace-pre-wrap">
                      {output}
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-mono">
                    <span>Length: {output.length} chars</span>
                    <span>{selectedPattern.repeat ? 'Repeating Pattern' : 'Fixed Art'}</span>
                </div>
            </div>

            {/* Config Panel */}
            <div className="bg-terminal-paper p-4 rounded-xl border border-slate-700 shrink-0 space-y-4">
               <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                   <h3 className="text-terminal-accent font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                       Constructor
                   </h3>
                   <span className="text-xs text-slate-500">{selectedPattern.name}</span>
               </div>
               
               {/* Pattern Parts Editing */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   <div className="space-y-1">
                       <label className="text-[10px] text-slate-500 font-bold uppercase">Left Cap</label>
                       <input 
                          type="text" 
                          value={customLeft}
                          onChange={(e) => setCustomLeft(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-center text-terminal-text focus:border-terminal-accent focus:outline-none font-mono"
                       />
                   </div>
                   <div className="space-y-1">
                       <label className="text-[10px] text-terminal-accent font-bold uppercase">Middle (Repeating)</label>
                       <input 
                          type="text" 
                          value={customMid}
                          onChange={(e) => setCustomMid(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-center text-white focus:border-terminal-accent focus:outline-none font-mono"
                       />
                   </div>
                   <div className="space-y-1">
                       <label className="text-[10px] text-slate-500 font-bold uppercase">Right Cap</label>
                       <input 
                          type="text" 
                          value={customRight}
                          onChange={(e) => setCustomRight(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-center text-terminal-text focus:border-terminal-accent focus:outline-none font-mono"
                       />
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                   {/* Length Slider */}
                   <div className={`space-y-2 transition-opacity ${!selectedPattern.repeat ? 'opacity-50 pointer-events-none' : ''}`}>
                       <div className="flex justify-between">
                           <label className="text-xs text-terminal-muted font-bold">Repetitions</label>
                           <span className="text-xs text-terminal-accent font-mono">{length}</span>
                       </div>
                       <input 
                          type="range" min="1" max="50" 
                          value={length}
                          onChange={(e) => setLength(parseInt(e.target.value))}
                          disabled={!selectedPattern.repeat}
                          className="w-full accent-terminal-accent h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                       />
                   </div>

                   {/* Toggles */}
                   <div className="flex items-center gap-4 justify-end">
                       <label className={`flex items-center gap-2 cursor-pointer ${!selectedPattern.repeat ? 'opacity-50 pointer-events-none' : ''}`}>
                           <input 
                              type="checkbox" 
                              checked={addSpacing}
                              onChange={(e) => setAddSpacing(e.target.checked)}
                              disabled={!selectedPattern.repeat}
                              className="w-4 h-4 text-terminal-accent rounded bg-slate-800 border-slate-600 focus:ring-offset-0 focus:ring-terminal-accent"
                           />
                           <span className="text-xs font-bold text-slate-300">Add Spacing</span>
                       </label>

                       <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                              type="checkbox" 
                              checked={isMirrored}
                              onChange={(e) => setIsMirrored(e.target.checked)}
                              className="w-4 h-4 text-terminal-accent rounded bg-slate-800 border-slate-600 focus:ring-offset-0 focus:ring-terminal-accent"
                           />
                           <span className="text-xs font-bold text-slate-300">Mirror / Flip</span>
                       </label>
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SeparatorGenerator;
