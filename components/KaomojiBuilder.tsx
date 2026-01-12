import React, { useState, useMemo } from 'react';
import { KAOMOJI_COMPONENTS } from '../constants';

type KaomojiPart = 'base' | 'eyes' | 'mouth' | 'arms' | 'accessory';

const KaomojiBuilder: React.FC = () => {
  // State for selected indices
  const [base, setBase] = useState(0);
  const [eye, setEye] = useState(0);
  const [mouth, setMouth] = useState(3);
  const [arm, setArm] = useState(0);
  const [accessory, setAccessory] = useState(0);
  
  // UI State
  const [activeTab, setActiveTab] = useState<KaomojiPart>('base');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [manualOverride, setManualOverride] = useState<string | null>(null);

  // Components Data
  const { BASES, EYES, MOUTHS, ARMS, ACCESSORIES } = KAOMOJI_COMPONENTS;

  // Construct the string
  const constructedKaomoji = useMemo(() => {
    const b = BASES[base] || BASES[0];
    const e = EYES[eye] || EYES[0];
    const m = MOUTHS[mouth] || MOUTHS[0];
    const a = ARMS[arm] || ARMS[0];
    const acc = ACCESSORIES[accessory] || ACCESSORIES[0];

    const face = `${b.left}${e.left}${m.text}${e.right}${b.right}`;
    const withArms = `${a.left}${face}${a.right}`;
    const result = `${acc.left}${withArms}${acc.right}`;
    
    return result;
  }, [base, eye, mouth, arm, accessory, BASES, EYES, MOUTHS, ARMS, ACCESSORIES]);

  // Handle final output (either constructed or manually edited)
  const currentOutput = manualOverride !== null ? manualOverride : constructedKaomoji;

  // Update history only when "Random" is used or specific actions, not every click
  const addToHistory = (k: string) => {
    setHistory(prev => {
        const newHist = [k, ...prev.filter(i => i !== k)].slice(0, 20);
        return newHist;
    });
  };

  const handleSelection = (type: KaomojiPart, index: number) => {
      setManualOverride(null); // Reset manual edit on part change
      switch(type) {
          case 'base': setBase(index); break;
          case 'eyes': setEye(index); break;
          case 'mouth': setMouth(index); break;
          case 'arms': setArm(index); break;
          case 'accessory': setAccessory(index); break;
      }
  };

  const randomize = (type?: 'happy' | 'love' | 'neutral' | 'sad' | 'angry') => {
    setManualOverride(null);
    const r = (arr: any[]) => Math.floor(Math.random() * arr.length);
    
    let newBase = base, newEye = eye, newMouth = mouth, newArm = arm, newAcc = 0;

    if (!type) {
        newBase = r(BASES);
        newEye = r(EYES);
        newMouth = r(MOUTHS);
        newArm = r(ARMS);
        newAcc = r(ACCESSORIES);
    } else {
        newBase = r(BASES);
        newAcc = 0;
        switch(type) {
            case 'happy':
                newEye = EYES.findIndex(e => e.left === '^' || e.left === '•') || 0;
                newMouth = MOUTHS.findIndex(m => m.text === '‿' || m.text === '∀') || 3;
                newArm = r([0, 0, 1, 4]);
                break;
            case 'love':
                newEye = EYES.findIndex(e => e.left === '♥') || 0;
                newMouth = MOUTHS.findIndex(m => m.text === 'ε' || m.text === '‿') || 6;
                newAcc = ACCESSORIES.findIndex(a => a.left === '♥') || 0;
                break;
            case 'sad':
                newEye = EYES.findIndex(e => e.left === 'T' || e.left === '´' || e.left === 'ò') || 3;
                newMouth = MOUTHS.findIndex(m => m.text === '_' || m.text === '.') || 0;
                newArm = 0;
                break;
            case 'angry':
                newEye = EYES.findIndex(e => e.left === 'ಠ' || e.left === '≧') || 6;
                newMouth = MOUTHS.findIndex(m => m.text === '皿' || m.text === 'Д') || 12;
                newArm = r([2, 7]);
                break;
            case 'neutral':
                newEye = EYES.findIndex(e => e.left === '•' || e.left === '─') || 0;
                newMouth = MOUTHS.findIndex(m => m.text === '_' || m.text === '.') || 0;
                newArm = 0;
                break;
        }
    }

    setBase(newBase);
    setEye(newEye);
    setMouth(newMouth);
    setArm(newArm);
    setAccessory(newAcc);

    // Reconstruct for history (since state update is async, we simulate it here for history)
    const b = BASES[newBase] || BASES[0];
    const e = EYES[newEye] || EYES[0];
    const m = MOUTHS[newMouth] || MOUTHS[0];
    const a = ARMS[newArm] || ARMS[0];
    const acc = ACCESSORIES[newAcc] || ACCESSORIES[0];
    const face = `${b.left}${e.left}${m.text}${e.right}${b.right}`;
    const withArms = `${a.left}${face}${a.right}`;
    const res = `${acc.left}${withArms}${acc.right}`;
    addToHistory(res);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentOutput);
    setCopied(true);
    addToHistory(currentOutput);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Helpers
  const renderTabBtn = (id: KaomojiPart, label: string, icon: React.ReactNode) => (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex-none snap-start ${
            activeTab === id 
            ? 'border-terminal-accent text-terminal-accent bg-slate-800/50' 
            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
        }`}
      >
          {icon}
          <span>{label}</span>
      </button>
  );

  return (
    <div className="flex flex-col h-full gap-4 min-h-0">
      
      {/* --- UPPER SECTION (Editor + Preview) --- */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        
        {/* --- LEFT/BOTTOM (Editor) --- */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0 order-2 lg:order-1">
            
            {/* Header / Tabs */}
            <div className="bg-terminal-paper rounded-xl border border-slate-700 w-full shrink-0">
                <div className="flex overflow-x-auto custom-scrollbar w-full snap-x">
                    {renderTabBtn('base', 'Face', <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>)}
                    {renderTabBtn('eyes', 'Eyes', <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/></svg>)}
                    {renderTabBtn('mouth', 'Mouth', <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>)}
                    {renderTabBtn('arms', 'Arms', <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12h2"/><path d="M3 12h2"/></svg>)}
                    {renderTabBtn('accessory', 'Extras', <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                </div>
            </div>

            {/* Selection Grid */}
            <div className="flex-1 bg-terminal-paper rounded-xl border border-slate-700 p-4 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {activeTab === 'base' && BASES.map((item, i) => (
                        <PartButton key={i} active={base === i} onClick={() => handleSelection('base', i)} label={`${item.left}  ${item.right}`} />
                    ))}
                    {activeTab === 'eyes' && EYES.map((item, i) => (
                        <PartButton key={i} active={eye === i} onClick={() => handleSelection('eyes', i)} label={`${item.left}  ${item.right}`} />
                    ))}
                    {activeTab === 'mouth' && MOUTHS.map((item, i) => (
                        <PartButton key={i} active={mouth === i} onClick={() => handleSelection('mouth', i)} label={item.text} />
                    ))}
                    {activeTab === 'arms' && ARMS.map((item, i) => (
                        <PartButton key={i} active={arm === i} onClick={() => handleSelection('arms', i)} label={item.left ? `${item.left} .. ${item.right}` : 'None'} />
                    ))}
                    {activeTab === 'accessory' && ACCESSORIES.map((item, i) => (
                        <PartButton key={i} active={accessory === i} onClick={() => handleSelection('accessory', i)} label={item.left ? `${item.left} .. ${item.right}` : 'None'} />
                    ))}
                </div>
            </div>

        </div>

        {/* --- RIGHT/TOP (Preview) --- */}
        <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 order-1 lg:order-2">
            
            {/* Compact Preview Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col shrink-0">
                {/* Result Display */}
                <div className="h-20 bg-slate-50 flex items-center justify-center px-4 relative border-b border-slate-100">
                    <input 
                        type="text"
                        value={currentOutput}
                        onChange={(e) => setManualOverride(e.target.value)}
                        className="w-full text-center text-2xl md:text-3xl font-mono text-slate-800 bg-transparent outline-none"
                    />
                    {manualOverride !== null && (
                         <span className="absolute top-1 right-2 text-[9px] text-slate-400 uppercase font-bold tracking-wider">Edited</span>
                    )}
                </div>
                
                {/* Actions */}
                <div className="p-3 bg-white flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button 
                            onClick={handleCopy}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                copied 
                                ? 'bg-green-500 text-white shadow-green-200' 
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200'
                            }`}
                        >
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button onClick={() => randomize()} className="px-4 py-2 rounded-lg bg-terminal-accent/10 text-terminal-accent font-bold hover:bg-terminal-accent hover:text-white transition-colors" title="Randomize">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        </button>
                        <button onClick={() => { setManualOverride(null); setBase(0); setEye(0); setMouth(0); setArm(0); setAccessory(0); }} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors" title="Reset">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        </button>
                    </div>
                </div>

                {/* Compact Moods */}
                <div className="px-3 pb-3 bg-white flex gap-2 overflow-x-auto custom-scrollbar">
                    <MoodBtn label="Happy" icon="😊" onClick={() => randomize('happy')} />
                    <MoodBtn label="Sad" icon="😢" onClick={() => randomize('sad')} />
                    <MoodBtn label="Angry" icon="😡" onClick={() => randomize('angry')} />
                    <MoodBtn label="Love" icon="😍" onClick={() => randomize('love')} />
                    <MoodBtn label="Zen" icon="😐" onClick={() => randomize('neutral')} />
                </div>
            </div>

        </div>
      </div>

      {/* --- BOTTOM SECTION (History) --- */}
      <div className="h-40 bg-terminal-paper rounded-xl border border-slate-700 flex flex-col shrink-0 order-3">
          <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800/30">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">History</h4>
              {history.length > 0 && (
                  <button onClick={() => setHistory([])} className="text-[10px] text-red-400 hover:text-red-300">Clear</button>
              )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {history.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                      No recent creations
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {history.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setManualOverride(item); }}
                            className="text-left p-2 rounded bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-mono text-xs border border-transparent hover:border-slate-600 transition-all flex justify-between group"
                        >
                            <span className="truncate">{item}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-terminal-accent self-center">LOAD</span>
                        </button>
                    ))}
                  </div>
              )}
          </div>
      </div>

    </div>
  );
};

const PartButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`h-12 rounded-lg border-2 transition-all font-mono text-sm flex items-center justify-center ${
            active
            ? 'bg-terminal-accent text-terminal-bg border-terminal-accent font-bold shadow-md'
            : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700 hover:border-slate-600'
        }`}
    >
        {label}
    </button>
);

const MoodBtn = ({ label, icon, onClick }: { label: string, icon: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex-none flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors">
        <span>{icon}</span> {label}
    </button>
);

export default KaomojiBuilder;