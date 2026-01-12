import React, { useState, useMemo } from 'react';
import { COMBINING_CHARS } from '../constants';

// Predefined borders/wings
const BORDERS = [
  { l: '', r: '' }, // None
  { l: '꧁', r: '꧂' },
  { l: '★', r: '★' },
  { l: '【', r: '】' },
  { l: '『', r: '』' },
  { l: '«', r: '»' },
  { l: '✧', r: '✧' },
  { l: '░', r: '░' },
  { l: '✿', r: '✿' },
  { l: '(', r: ')' },
  { l: '[', r: ']' },
  { l: '{', r: '}' },
  { l: '༺', r: '༻' },
  { l: 'ღ', r: 'ღ' },
  { l: '•', r: '•' },
  { l: '→', r: '←' },
  { l: '⚡', r: '⚡' },
  { l: '☠', r: '☠' },
  { l: 'x', r: 'x' },
  { l: '//', r: '//' },
  { l: '★·.·´¯`·.·', r: '·.·´¯`·.·★' },
];

const TextDecorator: React.FC = () => {
  const [inputText, setInputText] = useState('Decoration');
  
  // Tabs: 'borders' | 'effects' | 'accents'
  const [activeTab, setActiveTab] = useState<'borders' | 'effects' | 'accents'>('borders');

  // Accents State
  const [selectedTop, setSelectedTop] = useState<string[]>([]);
  const [selectedMid, setSelectedMid] = useState<string[]>([]);
  const [selectedBot, setSelectedBot] = useState<string[]>([]);
  
  // Borders State
  const [selectedBorderIndex, setSelectedBorderIndex] = useState(0);

  // Effects State
  const [spacing, setSpacing] = useState(0);
  const [isReversed, setIsReversed] = useState(false);
  const [casing, setCasing] = useState<'none' | 'upper' | 'lower' | 'capital'>('none');
  const [doubleText, setDoubleText] = useState(false);

  const toggleChar = (char: string, type: 'top' | 'mid' | 'bot') => {
    const setter = type === 'top' ? setSelectedTop : type === 'mid' ? setSelectedMid : setSelectedBot;
    const current = type === 'top' ? selectedTop : type === 'mid' ? selectedMid : selectedBot;

    if (current.includes(char)) {
      setter(current.filter(c => c !== char));
    } else {
      setter([...current, char]);
    }
  };

  const output = useMemo(() => {
    let text = inputText;

    // 1. Casing
    if (casing === 'upper') text = text.toUpperCase();
    if (casing === 'lower') text = text.toLowerCase();
    if (casing === 'capital') text = text.replace(/\b\w/g, c => c.toUpperCase());

    // 2. Reverse
    if (isReversed) text = text.split('').reverse().join('');

    // 3. Double Text
    if (doubleText) text = text.split('').map(c => c + c).join('');

    // 4. Apply Accents (Combining Chars)
    const combinedTop = selectedTop.join('');
    const combinedMid = selectedMid.join('');
    const combinedBot = selectedBot.join('');
    
    let decoratedChars = text.split('').map(char => {
        if(char === ' ') return char;
        return char + combinedMid + combinedTop + combinedBot;
    });

    // 5. Spacing
    let result = decoratedChars.join(' '.repeat(spacing));
    if (spacing > 0 && result.length > 0) {
        // Optionnel: ajouter de l'espace sur les bords ou pas ? 
    }

    // 6. Borders
    const border = BORDERS[selectedBorderIndex];
    if (border.l || border.r) {
        const space = spacing > 0 ? ' '.repeat(spacing) : ' ';
        result = `${border.l}${space}${result}${space}${border.r}`;
    }

    return result;

  }, [inputText, selectedTop, selectedMid, selectedBot, spacing, casing, isReversed, doubleText, selectedBorderIndex]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const resetAll = () => {
      setSelectedTop([]);
      setSelectedMid([]);
      setSelectedBot([]);
      setSpacing(0);
      setIsReversed(false);
      setCasing('none');
      setDoubleText(false);
      setSelectedBorderIndex(0);
  };

  return (
    <div className="flex flex-col h-full gap-4 min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full min-h-0">
        
        {/* --- RIGHT COLUMN (Preview) --- 
            Mobile: Order 1 (Top), Fixed Height
            Desktop: Order 2 (Right), Full Height
        */}
        <div className="w-full lg:w-1/2 flex flex-col shrink-0 h-48 lg:h-full order-1 lg:order-2">
            <div className="flex-1 bg-black rounded-xl border border-slate-800 flex flex-col relative group overflow-hidden shadow-2xl min-h-0">
                
                {/* Floating Action */}
                <div className="absolute top-4 right-4 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                   <button 
                     onClick={copyToClipboard}
                     className="bg-terminal-accent text-terminal-bg px-4 py-1.5 lg:px-6 lg:py-2 rounded-lg font-bold text-xs lg:text-sm hover:bg-emerald-400 flex items-center gap-2 shadow-lg transform active:scale-95 transition-all"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                     Copy
                   </button>
                </div>
                
                {/* Visual Preview */}
                <div className="p-4 lg:p-8 overflow-auto custom-scrollbar flex items-center justify-center flex-1 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
                   <p className="font-mono text-emerald-400 text-xl lg:text-2xl xl:text-4xl text-center break-all leading-relaxed max-w-full drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                       {output || <span className="opacity-30">Preview</span>}
                   </p>
                </div>

                {/* Footer Info */}
                <div className="p-2 lg:p-3 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-[10px] lg:text-xs font-mono text-slate-500">
                    <span>{output.length} chars</span>
                    <span className="opacity-50">UTF-8 Encoded</span>
                </div>
            </div>
        </div>

        {/* --- LEFT COLUMN: CONTROLS --- 
            Mobile: Order 2 (Bottom), Flex Grow
            Desktop: Order 1 (Left), Flex Grow
        */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 min-h-0 order-2 lg:order-1 flex-1 overflow-hidden">
            
            {/* Input Box */}
            <div className="bg-terminal-paper p-3 lg:p-4 rounded-xl border border-slate-700 shrink-0">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-terminal-accent font-bold text-xs lg:text-sm uppercase tracking-wider flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Source Text
                    </h3>
                    <button onClick={() => setInputText('')} className="text-[10px] text-slate-500 hover:text-red-400">Clear</button>
                </div>
                <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base lg:text-lg text-terminal-text focus:outline-none focus:border-terminal-accent font-sans"
                    placeholder="Type here..."
                />
            </div>

            {/* Main Tabs Control */}
            <div className="bg-terminal-paper p-3 lg:p-4 rounded-xl border border-slate-700 flex-1 flex flex-col min-h-0 overflow-hidden">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                    <div className="flex bg-slate-900 rounded-lg p-1 gap-1 overflow-x-auto">
                        <button onClick={() => setActiveTab('borders')} className={`px-3 lg:px-4 py-1.5 text-[10px] lg:text-xs font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === 'borders' ? 'bg-terminal-accent text-terminal-bg' : 'text-slate-400 hover:text-white'}`}>Borders</button>
                        <button onClick={() => setActiveTab('effects')} className={`px-3 lg:px-4 py-1.5 text-[10px] lg:text-xs font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === 'effects' ? 'bg-terminal-accent text-terminal-bg' : 'text-slate-400 hover:text-white'}`}>Effects</button>
                        <button onClick={() => setActiveTab('accents')} className={`px-3 lg:px-4 py-1.5 text-[10px] lg:text-xs font-bold rounded-md transition-colors whitespace-nowrap ${activeTab === 'accents' ? 'bg-terminal-accent text-terminal-bg' : 'text-slate-400 hover:text-white'}`}>Accents</button>
                    </div>
                    <button onClick={resetAll} className="text-[10px] lg:text-xs text-slate-500 hover:text-white flex items-center gap-1 shrink-0 ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1">
                    
                    {/* TAB: BORDERS */}
                    {activeTab === 'borders' && (
                        <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                            {BORDERS.map((border, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedBorderIndex(i)}
                                    className={`p-3 rounded-lg border text-xs lg:text-sm font-mono flex justify-center items-center transition-all ${
                                        selectedBorderIndex === i
                                        ? 'bg-terminal-accent/10 border-terminal-accent text-terminal-accent shadow-sm'
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-500'
                                    }`}
                                >
                                    {border.l ? `${border.l} text ${border.r}` : 'No Border'}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* TAB: EFFECTS */}
                    {activeTab === 'effects' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
                            
                            {/* Spacing Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs text-terminal-muted font-bold uppercase">Letter Spacing</label>
                                    <span className="text-xs text-terminal-accent">{spacing}px</span>
                                </div>
                                <input 
                                    type="range" min="0" max="10" 
                                    value={spacing}
                                    onChange={(e) => setSpacing(parseInt(e.target.value))}
                                    className="w-full accent-terminal-accent h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <p className="text-[10px] text-slate-500">Adds spaces between each character (Vaporwave style).</p>
                            </div>

                            {/* Casing */}
                            <div className="space-y-2">
                                <label className="text-xs text-terminal-muted font-bold uppercase">Text Case</label>
                                <div className="grid grid-cols-4 gap-2">
                                    <button onClick={() => setCasing('none')} className={`py-2 rounded text-xs border ${casing === 'none' ? 'bg-terminal-accent text-terminal-bg border-terminal-accent font-bold' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>Normal</button>
                                    <button onClick={() => setCasing('upper')} className={`py-2 rounded text-xs border ${casing === 'upper' ? 'bg-terminal-accent text-terminal-bg border-terminal-accent font-bold' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>UPPER</button>
                                    <button onClick={() => setCasing('lower')} className={`py-2 rounded text-xs border ${casing === 'lower' ? 'bg-terminal-accent text-terminal-bg border-terminal-accent font-bold' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>lower</button>
                                    <button onClick={() => setCasing('capital')} className={`py-2 rounded text-xs border ${casing === 'capital' ? 'bg-terminal-accent text-terminal-bg border-terminal-accent font-bold' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>Abc</button>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-2">
                                <label className="text-xs text-terminal-muted font-bold uppercase">Transforms</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setIsReversed(!isReversed)}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all text-xs lg:text-sm ${isReversed ? 'bg-terminal-accent/20 border-terminal-accent text-terminal-accent' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12H20"/><path d="M4 12L8 8"/><path d="M4 12L8 16"/></svg>
                                        Reverse Text
                                    </button>
                                    <button 
                                        onClick={() => setDoubleText(!doubleText)}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all text-xs lg:text-sm ${doubleText ? 'bg-terminal-accent/20 border-terminal-accent text-terminal-accent' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                                    >
                                        <span>AA</span>
                                        Double Chars
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: ACCENTS (Zalgo-like) */}
                    {activeTab === 'accents' && (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                             <div className="mb-4">
                                 <p className="text-xs text-slate-400 mb-2">Click to toggle marks above, middle, or below characters.</p>
                                 <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                     <h4 className="text-[10px] text-terminal-accent font-bold uppercase mb-2">Top Marks</h4>
                                     <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 mb-4">
                                        {COMBINING_CHARS.TOP.slice(0, 16).map((char, i) => (
                                            <button key={i} onClick={() => toggleChar(char, 'top')} className={`h-8 rounded text-lg flex items-center justify-center transition-colors ${selectedTop.includes(char) ? 'bg-terminal-accent text-terminal-bg' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>◌{char}</button>
                                        ))}
                                     </div>

                                     <h4 className="text-[10px] text-terminal-accent font-bold uppercase mb-2">Middle Marks</h4>
                                     <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 mb-4">
                                        {COMBINING_CHARS.MID.map((char, i) => (
                                            <button key={i} onClick={() => toggleChar(char, 'mid')} className={`h-8 rounded text-lg flex items-center justify-center transition-colors ${selectedMid.includes(char) ? 'bg-terminal-accent text-terminal-bg' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>◌{char}</button>
                                        ))}
                                     </div>

                                     <h4 className="text-[10px] text-terminal-accent font-bold uppercase mb-2">Bottom Marks</h4>
                                     <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
                                        {COMBINING_CHARS.BOTTOM.slice(0, 16).map((char, i) => (
                                            <button key={i} onClick={() => toggleChar(char, 'bot')} className={`h-8 rounded text-lg flex items-center justify-center transition-colors ${selectedBot.includes(char) ? 'bg-terminal-accent text-terminal-bg' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>◌{char}</button>
                                        ))}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}

                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TextDecorator;